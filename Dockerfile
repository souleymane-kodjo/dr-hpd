# Dockerfile pour l'application HPD Hospitalisation

# ===== STAGE 1: Build de l'application React =====
# Utilisation d'une image Node.js légère (Alpine) pour le build
FROM node:20-alpine as builder

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# Copie des fichiers de définition des dépendances
# Fait en premier pour utiliser le cache de Docker si les dépendances ne changent pas
COPY package*.json ./

# Installation des dépendances avec 'npm ci' (plus rapide et déterministe pour la CI/CD)
# Nettoyage du cache pour réduire la taille de la couche
RUN npm ci && npm cache clean --force

# Copie du reste du code source de l'application
COPY . .

# Lancement du script de build de production (crée le dossier /dist)
RUN npm run build


# ===== STAGE 2: Service de production avec Nginx =====
# Utilisation d'une image Nginx légère pour servir les fichiers statiques
FROM nginx:alpine

# Copie de notre configuration Nginx personnalisée (crucial pour les SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Suppression de la configuration Nginx par défaut
RUN rm /etc/nginx/nginx.conf

# Copie des fichiers de l'application buildés depuis le stage "builder"
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposition du port 80 pour accepter le trafic HTTP
EXPOSE 80

# Commande pour démarrer Nginx en mode "foreground" quand le conteneur se lance
CMD ["nginx", "-g", "daemon off;"]