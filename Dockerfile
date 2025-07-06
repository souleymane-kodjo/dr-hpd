# Dockerfile pour l'application HPD Hospitalisation
# Image de base Node.js
FROM node:18-alpine as builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (y compris devDependencies pour le build)
RUN npm ci && npm cache clean --force

# Copier le code source
COPY . .

# Construire l'application pour la production
RUN npm run build

# Stage de production avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers build depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
