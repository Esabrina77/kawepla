/**
 * Service WebSocket pour la messagerie en temps réel
 */
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { MessageService } from './messageService';

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
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

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
      console.log(`Utilisateur connecté: ${authSocket.userId}`);
      
      // Enregistrer la connexion
      this.connectedUsers.set(authSocket.userId, authSocket.id);

      // Rejoindre les salles appropriées
      this.joinUserRooms(authSocket);

      // Gestionnaires d'événements
      authSocket.on('send_message', (data) => this.handleSendMessage(authSocket, data));
      authSocket.on('join_conversation', (data) => this.handleJoinConversation(authSocket, data));
      authSocket.on('leave_conversation', (data) => this.handleLeaveConversation(authSocket, data));
      authSocket.on('typing_start', (data) => this.handleTypingStart(authSocket, data));
      authSocket.on('typing_stop', (data) => this.handleTypingStop(authSocket, data));
      authSocket.on('mark_as_read', (data) => this.handleMarkAsRead(authSocket, data));

      // Déconnexion
      authSocket.on('disconnect', () => {
        console.log(`Utilisateur déconnecté: ${authSocket.userId}`);
        this.connectedUsers.delete(authSocket.userId);
      });
    });
  }

  /**
   * Rejoindre les salles appropriées selon le rôle
   */
  private async joinUserRooms(socket: AuthenticatedSocket): Promise<void> {
    if (socket.userRole === 'ADMIN') {
      // Les admins rejoignent une salle globale pour recevoir toutes les notifications
      socket.join('admin_notifications');
    } else {
      // Les clients rejoignent leur conversation personnelle
      const conversation = await prisma.conversation.findFirst({
        where: { userId: socket.userId, status: 'ACTIVE' }
      });
      
      if (conversation) {
        socket.join(`conversation_${conversation.id}`);
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
      console.error('Erreur envoi message:', error);
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
      console.error('Erreur marquage lu:', error);
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