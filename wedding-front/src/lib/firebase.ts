// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

// Fonction pour uploader un fichier vers Firebase Storage
export async function uploadToFirebase(file: File, fileName: string, type?: 'provider-profile' | 'provider-portfolio' | 'provider-services'): Promise<string> {
  try {
    let path = fileName;
    
    // Déterminer le chemin selon le type
    if (type === 'provider-profile') {
      path = `provider-profile/${fileName}`;
    } else if (type === 'provider-portfolio') {
      path = `provider-portfolio/${fileName}`;
    } else if (type === 'provider-services') {
      path = `provider-services/${fileName}`;
    }
    
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Erreur lors de l\'upload vers Firebase:', error);
    throw error;
  }
}

// Fonction pour supprimer un fichier de Firebase Storage
export async function deleteFromFirebase(fileUrl: string): Promise<void> {
  try {
    const match = fileUrl.match(/\/o\/([^?]+)/);
    if (!match) throw new Error('URL Firebase invalide');
    const filePath = decodeURIComponent(match[1]);
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Erreur lors de la suppression depuis Firebase:', error);
    throw error;
  }
} 