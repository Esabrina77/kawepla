/**
 * Service WebSocket pour la messagerie en temps réel
 */
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { MessageService } from './messageService';
import { ProviderConversationService } from './providerConversationService';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: string;
}

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3012", // Port du frontend Next.js
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["authorization", "content-type"]
      },
      transports: ['websocket', 'polling'], // Autoriser websocket et polling
      allowEIO3: true, // Compatibilité avec les anciennes versions
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    console.log(`🔌 Socket.IO configuré avec CORS pour: ${process.env.FRONTEND_URL || "http://localhost:3012"}`);

    this.setupAuthentication();
    this.setupEventHandlers();
  }

  /**
   * Configuration de l'authentification WebSocket
   */
  private setupAuthentication(): void {
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token manquant'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
        
        // Vérifier que l'utilisateur existe - utiliser 'id' au lieu de 'userId'
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, role: true, isActive: true }
        });

        if (!user || !user.isActive) {
          return next(new Error('Utilisateur non valide'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        // console.log(`[SocketService] Auth successful: ${user.id} (${user.role})`);
        next();
      } catch (error) {
        console.error('Erreur authentification WebSocket:', error);
        next(new Error('Token invalide'));
      }
    });
  }

  /**
   * Configuration des gestionnaires d'événements
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      // console.log(`Utilisateur connecté: ${authSocket.userId}`);
      
      // Enregistrer la connexion
      this.connectedUsers.set(authSocket.userId, authSocket.id);

      // Rejoindre les salles appropriées
      this.joinUserRooms(authSocket);

      // Gestionnaires d'événements (client-admin)
      authSocket.on('send_message', (data) => this.handleSendMessage(authSocket, data));
      authSocket.on('join_conversation', (data) => this.handleJoinConversation(authSocket, data));
      authSocket.on('leave_conversation', (data) => this.handleLeaveConversation(authSocket, data));
      authSocket.on('typing_start', (data) => this.handleTypingStart(authSocket, data));
      authSocket.on('typing_stop', (data) => this.handleTypingStop(authSocket, data));
      authSocket.on('mark_as_read', (data) => this.handleMarkAsRead(authSocket, data));

      // Gestionnaires d'événements (client-provider)
      authSocket.on('send_provider_message', (data) => this.handleSendProviderMessage(authSocket, data));
      authSocket.on('join_provider_conversation', (data) => this.handleJoinProviderConversation(authSocket, data));
      authSocket.on('leave_provider_conversation', (data) => this.handleLeaveProviderConversation(authSocket, data));
      authSocket.on('provider_typing_start', (data) => this.handleProviderTypingStart(authSocket, data));
      authSocket.on('provider_typing_stop', (data) => this.handleProviderTypingStop(authSocket, data));
      authSocket.on('mark_provider_messages_as_read', (data) => this.handleMarkProviderMessagesAsRead(authSocket, data));

      // Déconnexion
      authSocket.on('disconnect', () => {
        // console.log(`Utilisateur déconnecté: ${authSocket.userId}`);
        this.connectedUsers.delete(authSocket.userId);
      });
    });
  }

  /**
   * Rejoindre les salles appropriées selon le rôle
   */
  private async joinUserRooms(socket: AuthenticatedSocket): Promise<void> {
    // Tous les utilisateurs rejoignent leur salle personnelle pour les notifications
    socket.join(`user_${socket.userId}`);
    // console.log(`🔔 Utilisateur ${socket.userId} a rejoint sa salle personnelle: user_${socket.userId}`);
    
    if (socket.userRole === 'ADMIN') {
      // Les admins rejoignent une salle globale pour recevoir toutes les notifications
      socket.join('admin_notifications');
    } else if (socket.userRole === 'CLIENT') {
      // Les clients rejoignent leur conversation personnelle (client-admin)
      const conversation = await prisma.conversation.findFirst({
        where: { userId: socket.userId, status: 'ACTIVE' }
      });
      
      if (conversation) {
        socket.join(`conversation_${conversation.id}`);
      }

      // Les clients rejoignent aussi leurs ProviderConversations
      const providerConversations = await prisma.providerConversation.findMany({
        where: { clientId: socket.userId, status: 'ACTIVE' }
      });
      
      // console.log(`🔔 [SocketService] Client ${socket.userId} rejoint ${providerConversations.length} ProviderConversations`);
      providerConversations.forEach(conv => {
        socket.join(`provider_conversation_${conv.id}`);
        // console.log(`✅ [SocketService] Client ${socket.userId} a rejoint provider_conversation_${conv.id}`);
      });
    } else if (socket.userRole === 'PROVIDER') {
      // Les providers rejoignent leurs ProviderConversations
      const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: socket.userId }
      });
      
      if (providerProfile) {
        const providerConversations = await prisma.providerConversation.findMany({
          where: { providerId: providerProfile.id, status: 'ACTIVE' }
        });
        
        // console.log(`🔔 [SocketService] Provider ${socket.userId} (profileId: ${providerProfile.id}) rejoint ${providerConversations.length} ProviderConversations`);
        providerConversations.forEach(conv => {
          socket.join(`provider_conversation_${conv.id}`);
          // console.log(`✅ [SocketService] Provider ${socket.userId} a rejoint provider_conversation_${conv.id}`);
        });
      }
    }
  }

  /**
   * Gestionnaire d'envoi de message
   */
  private async handleSendMessage(socket: AuthenticatedSocket, data: any): Promise<void> {
    try {
      const { conversationId, content, messageType = 'TEXT' } = data;

      if (!content || content.trim().length === 0) {
        socket.emit('error', { message: 'Contenu du message requis' });
        return;
      }

      // Envoyer le message via le service
      const message = await MessageService.sendMessage(
        conversationId,
        socket.userId,
        content.trim(),
        messageType
      );

      // Diffuser le message à tous les participants de la conversation
      this.io.to(`conversation_${conversationId}`).emit('new_message', {
        message,
        conversationId
      });

      // Notifier les admins si le message vient d'un client
      if (socket.userRole !== 'ADMIN') {
        this.io.to('admin_notifications').emit('new_client_message', {
          message,
          conversationId
        });
      }

      // Confirmer l'envoi à l'expéditeur
      socket.emit('message_sent', { message });

    } catch (error) {
      console.error(`[SocketService] Error send_message (user ${socket.userId}, conv ${data.conversationId}):`, error);
      socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
    }
  }

  /**
   * Rejoindre une conversation
   */
  private handleJoinConversation(socket: AuthenticatedSocket, data: any): void {
    const { conversationId } = data;
    socket.join(`conversation_${conversationId}`);
    socket.emit('joined_conversation', { conversationId });
  }

  /**
   * Quitter une conversation
   */
  private handleLeaveConversation(socket: AuthenticatedSocket, data: any): void {
    const { conversationId } = data;
    socket.leave(`conversation_${conversationId}`);
    socket.emit('left_conversation', { conversationId });
  }

  /**
   * Gestionnaire de début de frappe
   */
  private handleTypingStart(socket: AuthenticatedSocket, data: any): void {
    const { conversationId } = data;
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      conversationId,
      isTyping: true
    });
  }

  /**
   * Gestionnaire de fin de frappe
   */
  private handleTypingStop(socket: AuthenticatedSocket, data: any): void {
    const { conversationId } = data;
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      conversationId,
      isTyping: false
    });
  }

  /**
   * Marquer les messages comme lus
   */
  private async handleMarkAsRead(socket: AuthenticatedSocket, data: any): Promise<void> {
    try {
      const { conversationId } = data;
      
      await MessageService.markMessagesAsRead(conversationId, socket.userId);
      
      // Notifier les autres participants
      socket.to(`conversation_${conversationId}`).emit('messages_read', {
        userId: socket.userId,
        conversationId
      });

    } catch (error) {
      console.error(`[SocketService] Error mark_as_read (user ${socket.userId}, conv ${data.conversationId}):`, error);
      socket.emit('error', { message: 'Erreur lors du marquage comme lu' });
    }
  }

  /**
   * Envoyer une notification à un utilisateur spécifique
   */
  public sendNotificationToUser(userId: string, event: string, data: any): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /**
   * Diffuser à tous les admins connectés
   */
  public broadcastToAdmins(event: string, data: any): void {
    this.io.to('admin_notifications').emit(event, data);
  }

  /**
   * Obtenir les utilisateurs connectés
   */
  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Vérifier si un utilisateur est connecté
   */
  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Gestionnaire d'envoi de message Provider
   * NOTE: Cette méthode ne doit PAS créer le message en base car il est déjà créé via REST.
   * Le socket ne sert qu'à la diffusion en temps réel, pas à la création.
   * Si un message arrive ici, c'est une erreur de configuration côté client.
   */
  private async handleSendProviderMessage(socket: AuthenticatedSocket, data: any): Promise<void> {
    console.warn('⚠️ [SocketService] handleSendProviderMessage appelé - les messages doivent être envoyés via REST uniquement');
    socket.emit('error', { 
      message: 'Les messages doivent être envoyés via l\'API REST. Le socket ne sert qu\'à la réception en temps réel.' 
    });
  }

  /**
   * Rejoindre une conversation Provider
   */
  private handleJoinProviderConversation(socket: AuthenticatedSocket, data: any): void {
    const { conversationId } = data;
    if (!conversationId) {
      socket.emit('error', { message: 'ConversationId requis' });
      return;
    }
    socket.join(`provider_conversation_${conversationId}`);
    // console.log(`✅ Utilisateur ${socket.userId} a rejoint provider_conversation_${conversationId}`);
    socket.emit('joined_provider_conversation', { conversationId });
  }

  /**
   * Quitter une conversation Provider
   */
  private handleLeaveProviderConversation(socket: AuthenticatedSocket, data: any): void {
    const { conversationId } = data;
    socket.leave(`provider_conversation_${conversationId}`);
    socket.emit('left_provider_conversation', { conversationId });
  }

  /**
   * Gestionnaire de début de frappe Provider
   */
  private handleProviderTypingStart(socket: AuthenticatedSocket, data: any): void {
    const { conversationId } = data;
    socket.to(`provider_conversation_${conversationId}`).emit('provider_user_typing', {
      userId: socket.userId,
      conversationId,
      isTyping: true
    });
  }

  /**
   * Gestionnaire de fin de frappe Provider
   */
  private handleProviderTypingStop(socket: AuthenticatedSocket, data: any): void {
    const { conversationId } = data;
    socket.to(`provider_conversation_${conversationId}`).emit('provider_user_typing', {
      userId: socket.userId,
      conversationId,
      isTyping: false
    });
  }

  /**
   * Marquer les messages Provider comme lus
   */
  private async handleMarkProviderMessagesAsRead(socket: AuthenticatedSocket, data: any): Promise<void> {
    try {
      const { conversationId } = data;
      
      await ProviderConversationService.markAsRead(conversationId, socket.userId);
      
      // Notifier les autres participants
      socket.to(`provider_conversation_${conversationId}`).emit('provider_messages_read', {
        userId: socket.userId,
        conversationId
      });

    } catch (error) {
      console.error('Erreur marquage lu provider:', error);
      socket.emit('error', { message: 'Erreur lors du marquage comme lu' });
    }
  }

  /**
   * Obtenir l'instance Socket.IO (pour les notifications)
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Instance globale du service Socket
let socketService: SocketService;

export const initializeSocketService = (server: HTTPServer): SocketService => {
  socketService = new SocketService(server);
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('SocketService non initialisé');
  }
  return socketService;
}; 