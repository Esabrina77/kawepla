# Phase 1 : Construction (Builder)
FROM node:20-slim AS builder
WORKDIR /app

# Installation des paquets nécessaires pour certaines dépendances si besoin
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copie des fichiers de package
COPY package.json package-lock.json ./

# Copier Prisma (nécessaire pour le postinstall qui génère le client Prisma)
COPY prisma ./prisma/

# Configuration de tolérance aux coupures réseau (Timeouts & Retries)
RUN npm config set fetch-retry-maxtimeout 1200000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retries 10

# Installer toutes les dépendances (beaucoup moins lourd que npm ci sur petit serveur)
RUN npm install --no-audit --no-fund

# Copier le reste du code
COPY . .

# Générer le client Prisma explicitement au cas où
RUN npx prisma generate

# Compiler le projet TypeScript
RUN npm run build


# Phase 2 : Exécution (Runner)
FROM node:20-slim AS runner
WORKDIR /app

# Ajout du certificat/openssl requis par Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
# Éviter que Prisma cherche un .env lors de la génération
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Copier les fichiers package
COPY package.json package-lock.json ./

# Copier le dossier Prisma pour que Prisma Client soit à jour
COPY prisma ./prisma/

# Installer uniquement les dépendances de production (moins lourd à compiler)
RUN npm install --omit=dev --no-audit --no-fund

# Copier le dossier dist et les clients générés du builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3013

CMD ["npm", "run", "start"]
