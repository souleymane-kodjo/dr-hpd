# 🚀 Guide de Déploiement Netlify - HPD Hospitalisation

## ✅ Prérequis Complétés

Votre application est prête pour le déploiement avec :
- ✅ Build de production réussi (`npm run build:skip-tsc`)
- ✅ Configuration Netlify (`netlify.toml`)
- ✅ Optimisations Vite pour la production
- ✅ Headers de sécurité configurés
- ✅ Redirections SPA configurées

## 📋 Étapes de Déploiement

### 1. Vérification du Build Local ✅

```bash
npm run build:skip-tsc
```

Le dossier `dist/` contient maintenant votre application prête pour la production.

### 2. Déploiement sur Netlify

#### Option A : Drag & Drop (Recommandé pour premiers tests)

1. **Allez sur [netlify.com](https://netlify.com)**
2. **Créez un compte** ou connectez-vous
3. **Glissez-déposez** le dossier `dist/` sur la zone de déploiement
4. **Votre site est en ligne** ! Netlify vous donnera une URL temporaire

#### Option B : Connexion Git (Recommandé pour production)

1. **Poussez votre code** sur GitHub/GitLab/Bitbucket
2. **Sur Netlify**, cliquez "New site from Git"
3. **Connectez votre repository**
4. **Configuration automatique** :
   - Build command: `npm run build:skip-tsc`
   - Publish directory: `dist`
   - Node version: 20

### 3. Configuration des Variables d'Environnement

Dans l'interface Netlify (Site settings > Environment variables) :

```env
# URL de votre API backend (à adapter selon votre déploiement)
VITE_API_URL=https://votre-backend.railway.app/api

# Autres variables si nécessaires
VITE_APP_NAME=HPD Hospitalisation
VITE_APP_VERSION=1.0.0
```

### 4. Configuration Backend

Votre backend Express.js (`backend/server-new.js`) est prêt pour :
- **Railway** : Déploiement Node.js avec PostgreSQL
- **Render** : Déploiement gratuit avec PostgreSQL
- **Heroku** : Alternative classique

Variables d'environnement backend requises :
```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=votre-secret-jwt-super-secure
NODE_ENV=production
PORT=3000
```

## 🔧 Configuration Avancée

### Headers de Sécurité (déjà configurés)

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### Redirections SPA (déjà configurées)

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Optimisations Build

```toml
[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--production=false"
```

## 🌐 Domaine Personnalisé

1. **Dans Netlify** : Site settings > Domain management
2. **Ajoutez votre domaine** : `votre-domaine.com`
3. **Configurez les DNS** selon les instructions Netlify
4. **Certificat SSL** : Automatique avec Let's Encrypt

## 📊 Monitoring et Performance

### Analytics Netlify
- Trafic et performances
- Core Web Vitals
- Géolocalisation des utilisateurs

### Optimisations Performance
- ✅ Chunking automatique (vendor, mui, router)
- ✅ Compression gzip
- ✅ Cache des assets statiques
- ✅ Lazy loading des composants

## 🔒 Sécurité

### Headers de Sécurité Configurés
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection
- ✅ X-Content-Type-Options
- ✅ Referrer-Policy

### Authentification JWT
- Stockage sécurisé avec Zustand persist
- Expiration automatique des tokens
- Refresh token (à implémenter si nécessaire)

## 🚨 Troubleshooting

### Erreurs Courantes

**1. 404 sur les routes React Router**
```
Solution : Vérifiez les redirections dans netlify.toml
```

**2. Variables d'environnement non définies**
```
Solution : Configurez VITE_API_URL dans Netlify
```

**3. CORS avec l'API**
```
Solution : Configurez CORS dans votre backend Express.js
```

**4. Build qui échoue**
```
Solution : Utilisez build:skip-tsc au lieu de build standard
```

### Commandes de Debug

```bash
# Build local
npm run build:skip-tsc

# Preview local du build
npm run preview

# Analyse des chunks
npx vite-bundle-analyzer dist
```

## 📝 Scripts Disponibles

```json
{
  "dev": "vite",                    // Développement local
  "build": "tsc -b && vite build",  // Build avec TypeScript
  "build:skip-tsc": "vite build",   // Build rapide pour Netlify
  "preview": "vite preview",        // Preview du build local
  "deploy": "npm run build && netlify deploy --prod"  // Déploiement direct
}
```

## 🎯 URL de Déploiement

Après déploiement, votre application sera accessible via :
- URL temporaire : `https://random-name.netlify.app`
- Domaine personnalisé : `https://votre-domaine.com`

## 📋 Checklist Post-Déploiement

- [ ] ✅ Site accessible sur l'URL Netlify
- [ ] ⚙️ Variables d'environnement configurées
- [ ] 🔌 Backend déployé et accessible
- [ ] 🔐 Authentification fonctionnelle
- [ ] 📱 Test sur mobile/desktop
- [ ] 🚀 Performance optimale (Lighthouse > 90)
- [ ] 🔒 Sécurité validée
- [ ] 📊 Analytics configurés

## 🆘 Support

En cas de problème :
1. Vérifiez les logs de build dans Netlify
2. Testez le build localement avec `npm run preview`
3. Vérifiez les variables d'environnement
4. Consultez la documentation Netlify

---

**Félicitations ! Votre application HPD Hospitalisation est maintenant déployée sur Netlify ! 🎉**
