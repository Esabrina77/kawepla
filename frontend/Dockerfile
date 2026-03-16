# Phase 1 : Construction (Builder)
FROM node:20-slim AS builder
WORKDIR /app

# Copie des fichiers de package
COPY package.json package-lock.json ./

# Installer toutes les dépendances (y compris typescript, etc.) pour le build
RUN npm ci

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

# Copie des fichiers de package
COPY package.json package-lock.json ./

# Installer uniquement les dépendances de production
RUN npm ci --omit=dev

# Copier les fichiers générés du builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json /app/next.config.* ./

# Next.js démarre sur le port spécifié (dans ton package.json front : 3012)
EXPOSE 3012

CMD ["npm", "run", "start"]
