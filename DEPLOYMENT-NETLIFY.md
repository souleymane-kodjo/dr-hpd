# 🚀 Guide de Déploiement Netlify - HPD Hospitalisation

## 📋 Prérequis

1. **Compte Netlify** : Créez un compte sur [netlify.com](https://netlify.com)
2. **Repository Git** : Votre code doit être sur GitHub, GitLab ou Bitbucket
3. **Node.js 20+** : Version supportée par Netlify

## 🔧 Méthodes de Déploiement

### Méthode 1 : Déploiement automatique depuis Git (Recommandée)

1. **Connecter votre repository** :
   - Allez sur [app.netlify.com](https://app.netlify.com)
   - Cliquez sur "New site from Git"
   - Choisissez votre provider Git (GitHub/GitLab/Bitbucket)
   - Sélectionnez le repository `hpd-hospitalisation`

2. **Configuration de build** :
   ```
   Build command: npm run build
   Publish directory: dist
   Node version: 20
   ```

3. **Variables d'environnement** (optionnel) :
   - Allez dans Site settings > Environment variables
   - Ajoutez vos variables depuis `.env.netlify`

### Méthode 2 : Déploiement manuel avec Netlify CLI

1. **Installer Netlify CLI** :
   ```bash
   npm install -g netlify-cli
   ```

2. **Login et initialisation** :
   ```bash
   netlify login
   netlify init
   ```

3. **Build et déploiement** :
   ```bash
   npm run build
   netlify deploy --prod
   ```

### Méthode 3 : Drag & Drop (Simple)

1. **Build local** :
   ```bash
   npm run build
   ```

2. **Upload manuel** :
   - Allez sur [app.netlify.com](https://app.netlify.com)
   - Faites glisser le dossier `dist` sur la zone de drop

## ⚙️ Configuration Post-Déploiement

### 1. Domaine personnalisé (optionnel)
- Site settings > Domain management
- Ajouter votre domaine personnalisé

### 2. HTTPS
- Automatiquement activé par Netlify
- Certificat SSL Let's Encrypt gratuit

### 3. Fonctions Netlify (si backend)
- Créer un dossier `netlify/functions`
- Déployer vos fonctions serverless

### 4. Variables d'environnement
```
VITE_API_BASE_URL=https://votre-api.com
VITE_APP_URL=https://votre-site.netlify.app
```

## 🔍 Vérifications Post-Déploiement

- [ ] ✅ Site accessible à l'URL fournie
- [ ] ✅ Routes React Router fonctionnelles
- [ ] ✅ Images et assets chargés
- [ ] ✅ Formulaire de connexion fonctionnel
- [ ] ✅ Navigation entre les pages
- [ ] ✅ Responsive design sur mobile

## 🚨 Dépannage

### Erreur 404 sur les routes
- Vérifiez que `netlify.toml` contient la redirection `/*` -> `/index.html`

### Build échoue
```bash
# Nettoyer et rebuilder
rm -rf node_modules dist
npm install
npm run build
```

### Images ne se chargent pas
- Vérifiez que les images sont dans `public/images/`
- Utilisez des chemins absolus : `/images/logo.png`

## 📊 Optimisations

### Performance
- Compression automatique par Netlify
- CDN global inclus
- Cache configuré dans `netlify.toml`

### Monitoring
- Analytics Netlify (optionnel)
- Logs de déploiement accessible
- Notifications d'erreur par email

## 🔗 Liens utiles

- [Documentation Netlify](https://docs.netlify.com/)
- [Netlify CLI](https://cli.netlify.com/)
- [Support Netlify](https://www.netlify.com/support/)

---

## 🎯 Commandes rapides

```bash
# Build local
npm run build

# Preview local
npm run preview

# Déploiement (si CLI installé)
npm run deploy

# Vérifier le build
npm run lint
```
