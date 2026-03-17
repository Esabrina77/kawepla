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

# Définition des Build Args pour injecter les variables NEXT_PUBLIC_ de manière sécurisée
# sans les stocker dans le code source de l'image (satisfait "aucune donnée doit leak")
ARG NEXT_PUBLIC_API_URL
ARG VAPID_PUBLIC_KEY
ARG STRIPE_PUBLIC_KEY
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID

# Assignation en variables d'environnement à la construction (Build Time)
# Indispensable pour Next.js (les variables NEXT_PUBLIC_ sont intégrées au bundle JS à ce moment)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV VAPID_PUBLIC_KEY=$VAPID_PUBLIC_KEY
ENV STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

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
