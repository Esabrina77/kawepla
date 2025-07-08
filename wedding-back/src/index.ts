import dotenv from 'dotenv';

// Chargement des variables d'environnement (.env) EN PREMIER
dotenv.config();

import app from './app';

// Définition du port d'écoute (par défaut 3001)
const PORT = process.env['PORT'] ? Number(process.env['PORT']) : 3001;

/**
 * Lancement du serveur Express
 * Le serveur écoute sur le port défini et affiche un message de confirmation.
 */
app.listen(PORT, () => {
  // Affichage d'un message dans la console au démarrage
  console.log(`🚀 Serveur API KaWePla lancé sur http://localhost:${PORT}/api`);
}); 