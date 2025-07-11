# 🚀 Déploiement HPD Hospitalisation - Guide Pas à Pas

## ✅ Statut actuel
- ✅ Frontend : Build réussi (1.17 MB total)
- ✅ Backend : Prêt pour déploiement (Express.js + PostgreSQL)
- ✅ Configuration Netlify : Prête

## 🎯 Plan de déploiement

### Étape 1 : Base de données PostgreSQL (5 minutes)

1. **Créer un compte sur [Neon.tech](https://neon.tech)** (gratuit)
2. **Créer un nouveau projet** : "hpd-hospitalisation"
3. **Récupérer l'URL de connexion** :
   ```
   postgresql://username:password@host:5432/database?sslmode=require
   ```
4. **Garder ces informations** pour l'étape suivante

### Étape 2 : Backend sur Railway (10 minutes)

1. **Créer un compte sur [Railway](https://railway.app)**
2. **Nouveau projet depuis GitHub** :
   - Connecter votre repository
   - Sélectionner le dossier `backend/`
3. **Variables d'environnement** dans Railway :
   ```
   NODE_ENV=production
   DB_HOST=votre-host-neon
   DB_PORT=5432
   DB_NAME=votre-database-name
   DB_USER=votre-username
   DB_PASSWORD=votre-password
   JWT_SECRET=mon-super-secret-jwt-tres-securise-32-caracteres
   CORS_ORIGIN=*
   ```
4. **Déployer** et récupérer l'URL : `https://votre-backend.railway.app`

### Étape 3 : Frontend sur Netlify (5 minutes)

#### Option A : Drag & Drop (Plus rapide)

1. **Exécuter** :
   ```powershell
   cd c:\Users\soule\hpd-hospitalisation
   npm run build:skip-tsc
   ```

2. **Sur [Netlify](https://netlify.com)** :
   - Glisser le dossier `dist/` sur la zone de drop
   - Site déployé instantanément !

3. **Variables d'environnement** dans Netlify :
   - Site Settings > Environment Variables
   ```
   VITE_API_URL=https://votre-backend.railway.app/api
   VITE_APP_NAME=HPD Hospitalisation
   VITE_NODE_ENV=production
   ```

4. **Redéployer** après avoir ajouté les variables
   git push
   ```

2. **Connecter à Netlify** :
   - Allez sur [app.netlify.com](https://app.netlify.com)
   - "New site from Git"
   - Choisissez votre repository
   - Configuration :
     - Build command: `npm run build`
     - Publish directory: `dist`

## ✅ Fichiers de configuration inclus

- ✅ `netlify.toml` : Configuration automatique
- ✅ `.env.netlify` : Variables d'environnement
- ✅ Redirections React Router configurées
- ✅ Headers de sécurité inclus

## 🎯 URL de test

Une fois déployé, votre application sera accessible à :
`https://nom-unique.netlify.app`

## 📱 Features incluses

- ✅ Page de connexion responsive
- ✅ Navigation React Router
- ✅ Interface Material-UI
- ✅ Gestion d'état Zustand
- ✅ Optimisation automatique Netlify
