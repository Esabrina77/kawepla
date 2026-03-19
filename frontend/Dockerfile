# Phase 1 : Construction (Builder)
FROM node:20-slim AS builder
WORKDIR /app

# Copie des fichiers de package
COPY package.json package-lock.json ./

# Configuration de tolérance aux coupures réseau (Timeouts & Retries)
RUN npm config set fetch-retry-maxtimeout 1200000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retries 10

# Installer toutes les dépendances (beaucoup moins lourd que npm ci sur petit serveur)
RUN npm install --no-audit --no-fund

# Les variables d'environnement sont lues directement depuis le fichier .env copié
# Copie du code (excluant .env.local grâce au .dockerignore)
COPY . .

# Construction du projet Next.js
RUN npm run build


# Phase 2 : Exécution (Runner)
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Force Next.js à écouter sur le bon port en standalone
ENV PORT=3012

# Récupérer les assets statiques indispensables
COPY --from=builder /app/public ./public

# Récupérer le serveur autonome généré (contient uniquement node_modules strict nécessaire)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Next.js démarre sur le port spécifié
EXPOSE 3012

CMD ["node", "server.js"]
