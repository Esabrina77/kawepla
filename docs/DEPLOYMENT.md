# 🚀 Guide de Déploiement & Mise à jour (Kawepla)

Ce projet utilise une architecture **Build Local + Registre Distant (Docker Hub)** pour décharger ton VPS (Serveur Distant) de toute la lourdeur des compilations Javascript/Next.js.

---

## 💻 1. Compiler les Modifications (PC Windows - Local)

Puisque ton serveur VPS a des ressources restreintes, **on compile toujours tes images sur ton ordinateur** pour les pousser sur Docker Hub.

### 🔵 1.1 - Mettre à jour le Frontend (Next.js)

Assure-toi que ton fichier **`.env` local** contient bien l'URL de ton de API de production :
`NEXT_PUBLIC_API_URL=https://kawepla-api.kaporelo.com`

Ouvre ton terminal Windows (**PowerShell**) et lance :

```powershell
# 1. Déplacements vers le dossier frontend (Optionnel si tu es déjà à la racine)
# 2. Construit l'image locale
docker build -t kawepla-frontend ./frontend

# 3. Tag l'image pour Docker Hub
docker tag kawepla-frontend:latest esabrina77/kawepla-frontend:latest

# 4. Envoie l'image
docker push esabrina77/kawepla-frontend:latest
```

---

### 🟠 1.2 - Mettre à jour le Backend (Node.js / Prisma)

Si tu modifies du code dans le Backend (routes, controllers, models) :

```powershell
# 1. Construit l'image Backend locale
docker build -t kawepla-backend ./backend

# 2. Tag l'image pour Docker Hub
docker tag kawepla-backend:latest esabrina77/kawepla-backend:latest

# 3. Envoie l'image
docker push esabrina77/kawepla-backend:latest
```

---

## 🌍 2. Télécharger & Lancer sur le Serveur (VPS)

Une fois tes images envoyées sur Docker Hub, il ne reste plus qu'un clic sur la console de ton serveur distant.

### 📥 Étape 1 : Mettre à jour les fichiers de configuration

Sur ton serveur distant, va dans le dossier `repos/kawepla/` et récupère les éventuelles modif de `docker-compose.yml` :

```bash
git pull origin main
```

### 🚢 Étape 2 : Relancer les Services

Tape simplement la commande correspondante au service que tu as modifié :

- **Pour mettre à jour le Frontend :**

  ```bash
  sudo docker compose pull frontend
  sudo docker compose up -d frontend
  ```

- **Pour mettre à jour le Backend :**

  ```bash
  sudo docker compose pull backend
  sudo docker compose up -d backend
  ```

- **Pour mettre à jour TOUT d'un coup :**

  ```bash
  sudo docker compose pull
  sudo docker compose up -d
  ```

---

## 🗄️ 3. Opérations Base de Données (PostgreSQL)

### 📥 Restaurer un Backup (Dump Binaire)

Pour injecter ton **Dump Custom Format** :

```bash
cat backup-16032026.sql | sudo docker exec -i kawepla-db pg_restore -U weduser -d wedding_invitations -O -x
```

### 🔄 Si tu modifies ton Schema Prisma :

Lorsque tu modifies `schema.prisma` dans ton backend, tu dois le builder localement (Prisma-generate se fait dans le code compile). Il va s'inclure dans l'image Backend automatiquement lors du builder setup !

---

### 🔍 Commandes Utiles de diagnostic :

- **Voir les Logs en direct** : `sudo docker compose logs -f`
- **Entrer dans PostgreSQL** : `sudo docker exec -it kawepla-db psql -U weduser -d wedding_invitations`

---

## 💡 4. Pièges à éviter (Variables d'environnement & Docker)

Le transfert de variables d'environnement entre ton PC et ton serveur de production peut créer des bugs silencieux. Voici les deux règles d'or :

### ❌ Règle 1 : PAS de guillements `""` dans ton `.env` de production
Quand tu utilises l'option `--env-file` (ou un fichier `docker-compose`) avec Docker :
*   **Mauvais** : `VAPID_SUBJECT="mailto:kawepla@gmail.com"`
*   **Bon** : `VAPID_SUBJECT=mailto:kawepla@gmail.com`

> ⚠️ **Pourquoi ?** Docker n'enlève pas les guillemets ! Il va passer `"l'adresse"` entière avec les symboles `"` à ton application Node.js, ce qui fera **crasher** ton serveur (Notification Vapid, Stripe, etc.).

### 🏗️ Règle 2 : Build Time (Frontend) vs Run Time (Backend)

*   **Le Frontend (Next.js)** : Les variables `NEXT_PUBLIC_...` sont **cuites** 🧱 dans le code **au moment où tu tapes `docker build`**. S'il y a un `localhost` dans ton `.env` de PC pendant le build, le site en prod affichera du `localhost` !
*   **Le Backend (NodeJs)** : Il lit ses variables **en temps réel** sur le serveur. Pour qu'il les trouve, tu dois toujours lier ton fichier :
    *   **docker run** : `docker run -d --env-file .env ...`
    *   **docker compose** : Ajouter `env_file: .env` sous ton service de backend.

---

_Document mis à jour le 19 Mars 2026 pour Sabrina Kawepla._
