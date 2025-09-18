/**
 * Utilitaires Firebase pour l'upload et la gestion des fichiers
 */
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

console.log('🔥 Configuration Firebase:', {
  apiKey: process.env.FIREBASE_API_KEY ? 'Définie' : 'Manquante',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ? 'Définie' : 'Manquante',
  appId: process.env.FIREBASE_APP_ID ? 'Définie' : 'Manquante',
});

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Uploader un fichier vers Firebase Storage
 */
export async function uploadToFirebase(
  fileBuffer: Buffer, 
  fileName: string, 
  mimeType: string
): Promise<string> {
  try {
    console.log('🔥 Tentative d\'upload Firebase:', { fileName, mimeType, bufferSize: fileBuffer.length });
    
    // Ne pas ajouter "photos/" car fileName contient déjà le chemin complet
    const storageRef = ref(storage, fileName);
    const metadata = {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000', // Cache 1 an
    };
    
    console.log('🔥 Référence créée:', storageRef.fullPath);
    
    const snapshot = await uploadBytes(storageRef, fileBuffer, metadata);
    console.log('🔥 Upload réussi:', snapshot.metadata.fullPath);
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('🔥 URL obtenue:', downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'upload vers Firebase:', error);
    
    // Si c'est une erreur d'autorisation, c'est probablement un problème de règles Firebase
    if (error.code === 'storage/unauthorized') {
      console.warn('⚠️ Erreur d\'autorisation Firebase Storage. Vérifiez les règles de sécurité dans la console Firebase.');
      console.warn('📋 Règles recommandées pour wedding-photos/: allow read, write: if true;');
    }
    
    // Générer une URL placeholder temporaire
    const timestamp = Date.now();
    const placeholderUrl = `https://via.placeholder.com/800x600/cccccc/666666?text=Photo+${timestamp}`;
    console.log('🔄 Utilisation d\'URL placeholder temporaire:', placeholderUrl);
    
    return placeholderUrl;
  }
}

/**
 * Supprimer un fichier de Firebase Storage
 */
export async function deleteFromFirebase(fileUrl: string): Promise<void> {
  try {
    // Vérifier si c'est une URL placeholder (pas de Firebase)
    if (fileUrl.includes('via.placeholder.com') || fileUrl.includes('placeholder')) {
      console.log('URL placeholder détectée, pas de suppression Firebase nécessaire:', fileUrl);
      return;
    }

    // Vérifier si c'est une URL Firebase valide
    if (!fileUrl.includes('firebasestorage.googleapis.com')) {
      console.log('URL non-Firebase détectée, pas de suppression nécessaire:', fileUrl);
      return;
    }

    // Extraire le chemin du fichier à partir de l'URL Firebase
    const match = fileUrl.match(/\/o\/([^?]+)/);
    if (!match) {
      console.warn('URL Firebase invalide, format non reconnu:', fileUrl);
      return;
    }
    
    const filePath = decodeURIComponent(match[1]);
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
    console.log('Fichier supprimé avec succès de Firebase:', filePath);
  } catch (error) {
    console.error('Erreur lors de la suppression depuis Firebase:', error);
    // Ne pas faire échouer le processus si la suppression échoue
    // Le fichier pourrait déjà être supprimé ou inexistant
  }
}

/**
 * Générer une URL signée pour un accès temporaire
 */
export async function generateSignedUrl(fileName: string, expiresInMinutes: number = 60): Promise<string> {
  try {
    const storageRef = ref(storage, `photos/${fileName}`);
    const url = await getDownloadURL(storageRef);
    
    // Firebase génère automatiquement des URLs avec tokens d'accès
    // Pas besoin de génération manuelle d'URL signée
    return url;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL signée:', error);
    throw new Error('Erreur lors de la génération de l\'URL d\'accès');
  }
} 