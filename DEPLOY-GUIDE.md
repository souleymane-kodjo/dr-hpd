# 🚀 Guide de Déploiement HPD Hospitalisation

## Vue d'ensemble de l'architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │   Database      │
│   (Netlify)     │───▶│   (Railway)      │───▶│  (PostgreSQL)   │
│   React + Vite  │    │   Express.js     │    │   (Neon/PG)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Prérequis

- [x] Compte GitHub (pour le code source)
- [ ] Compte Netlify (frontend)
- [ ] Compte Railway/Render/Fly.io (backend)
- [ ] Compte Neon.tech ou ElephantSQL (base de données PostgreSQL)

## 🗄️ Étape 1 : Déployer la base de données PostgreSQL

### Option A : Neon.tech (Recommandé - Gratuit)

1. **Créer un compte sur [Neon.tech](https://neon.tech)**
2. **Créer un nouveau projet** : `hpd-hospitalisation`
3. **Récupérer la connection string** :
   ```
   postgresql://username:password@host:5432/database?sslmode=require
   ```
4. **Initialiser les tables** (voir script SQL ci-dessous)

### Option B : ElephantSQL

1. **Créer un compte sur [ElephantSQL](https://elephantsql.com)**
2. **Créer une nouvelle instance** (plan gratuit : Tiny Turtle)
3. **Récupérer l'URL de connexion**

### Script d'initialisation de la BDD

```sql
-- Tables principales (voir backend/server-new.js pour le script complet)
-- Ce script sera exécuté automatiquement au démarrage du backend
```

## 🖥️ Étape 2 : Déployer le backend sur Railway

### 2.1 Préparer Railway

1. **Créer un compte sur [Railway](https://railway.app)**
2. **Connecter votre repository GitHub**
3. **Créer un nouveau projet** depuis GitHub

### 2.2 Configuration des variables d'environnement

Dans Railway, aller dans **Variables** et ajouter :

```bash
NODE_ENV=production
PORT=3001
DB_HOST=votre-host-neon.neon.tech
DB_PORT=5432
DB_NAME=votre-database-name
DB_USER=votre-username
DB_PASSWORD=votre-password
JWT_SECRET=votre-secret-jwt-super-securise-minimum-32-caracteres
CORS_ORIGIN=https://votre-app.netlify.app
```

### 2.3 Configuration Railway

Créer `railway.json` dans le dossier `backend/` :

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server-new.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2.4 Alternative : Render.com

Si vous préférez Render :

```yaml
# render.yaml
services:
  - type: web
    name: hpd-backend
    env: node
    startCommand: node server-new.js
    buildCommand: npm install
    envVars:
      - key: NODE_ENV
        value: production
```

## 🌐 Étape 3 : Déployer le frontend sur Netlify

### 3.1 Configuration des variables d'environnement

1. **Dans Netlify, aller dans Site Settings > Environment Variables**
2. **Ajouter** :

```bash
VITE_API_URL=https://votre-backend.railway.app/api
VITE_APP_NAME=HPD Hospitalisation
VITE_NODE_ENV=production
```

### 3.2 Méthode A : Déploiement Git (Automatique)

1. **Push le code sur GitHub** :
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connecter le repository sur Netlify** :
   - Sites > Add new site > Import from Git
   - Sélectionner votre repository GitHub
   - Configuration automatique via `netlify.toml`

### 3.3 Méthode B : Déploiement Manuel (Drag & Drop)

1. **Build local** :
   ```bash
   npm run build
   ```

2. **Drag & Drop** :
   - Glisser le dossier `dist/` sur netlify.com
   - Ajouter les variables d'environnement manuellement

## 🔧 Étape 4 : Configuration frontend pour l'API

### 4.1 Mise à jour du client Axios

Le fichier `src/api/axiosClient.tsx` doit être configuré pour l'API déployée :

```typescript
// Sera mis à jour automatiquement avec VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

### 4.2 Configuration des interceptors

Mise à jour des interceptors pour gérer l'authentification JWT avec l'API réelle.

## ✅ Étape 5 : Tests et validation

### 5.1 Tests backend

1. **Vérifier la santé de l'API** :
   ```
   GET https://votre-backend.railway.app/api/health
   ```

2. **Tester l'authentification** :
   ```
   POST https://votre-backend.railway.app/api/auth/login
   ```

### 5.2 Tests frontend

1. **Vérifier le build** : `npm run build`
2. **Tester localement** : `npm run preview`
3. **Vérifier en production** : https://votre-app.netlify.app

### 5.3 Tests d'intégration

- [ ] Connexion/déconnexion
- [ ] CRUD des patients
- [ ] Gestion des hospitalisations
- [ ] Dashboard et statistiques
- [ ] Notifications en temps réel

## 🚨 Troubleshooting

### Erreurs communes

1. **CORS Error** :
   - Vérifier `CORS_ORIGIN` dans les variables Railway
   - S'assurer que l'URL Netlify est correcte

2. **Database Connection Error** :
   - Vérifier les credentials PostgreSQL
   - S'assurer que SSL est activé pour Neon

3. **Build Errors** :
   - Vérifier les types TypeScript
   - S'assurer que toutes les dépendances sont installées

## 📊 Monitoring et logs

### Railway
- Dashboard > Metrics pour les performances
- Dashboard > Logs pour le debugging

### Netlify
- Site Overview > Functions (logs)
- Site Overview > Deploy logs

## 🔄 CI/CD et mises à jour

### Automatic deploys
- **Frontend** : Auto-deploy on git push (via Netlify)
- **Backend** : Auto-deploy on git push (via Railway)

### Manuel deploys
```bash
# Frontend
npm run deploy

# Backend (push to main branch)
git push origin main
```

## 📚 Ressources

- [Netlify Docs](https://docs.netlify.com)
- [Railway Docs](https://docs.railway.app)
- [Neon Docs](https://neon.tech/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 🎯 URLs finales

- **Frontend** : https://hpd-hospitalisation.netlify.app
- **Backend API** : https://hpd-backend.railway.app
- **Database** : Neon PostgreSQL
- **Monitoring** : Railway Dashboard + Netlify Analytics
