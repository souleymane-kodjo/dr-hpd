# 🚀 Déploiement Netlify - Instructions Rapides

## Option 1 : Drag & Drop (Plus Simple)

1. **Build l'application** :
   ```bash
   npm run build
   ```

2. **Aller sur Netlify** :
   - Ouvrez [app.netlify.com](https://app.netlify.com)
   - Faites glisser le dossier `dist` sur la zone de drop
   - Votre site sera en ligne en quelques secondes !

## Option 2 : Depuis Git (Automatique)

1. **Push votre code sur GitHub** :
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
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
