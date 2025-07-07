/**
 * Utilitaire pour l'upload de fichiers sur AWS S3.
 * À compléter avec la configuration AWS et la logique d'upload.
 */
import AWS from 'aws-sdk';

// Configuration AWS
const s3 = new AWS.S3({
  accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
  secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || '',
  region: process.env['AWS_REGION'] || ''
});

const BUCKET_NAME = process.env['AWS_S3_BUCKET'] || '';

export class S3Service {
  /**
   * Upload un fichier sur S3.
   * @param file - Fichier à uploader (Buffer ou Stream)
   * @param filename - Nom du fichier
   * @returns URL du fichier uploadé
   */
  static async uploadFile(file: Buffer | NodeJS.ReadableStream, filename: string): Promise<string> {
    if (!BUCKET_NAME) {
      throw new Error('AWS_S3_BUCKET non défini');
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: `uploads/${Date.now()}-${filename}`,
      Body: file,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  }

  /**
   * Supprimer un fichier de S3.
   * @param url - URL du fichier à supprimer
   */
  static async deleteFile(url: string): Promise<void> {
    if (!BUCKET_NAME) {
      throw new Error('AWS_S3_BUCKET non défini');
    }

    // Extraire la clé du fichier de l'URL
    const key = url.split(`${BUCKET_NAME}/`)[1];
    if (!key) {
      throw new Error('URL S3 invalide');
    }
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
  }
} 