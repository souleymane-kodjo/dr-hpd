# 🏥 HPD Hospitalisation - Backend API

Backend Express.js avec PostgreSQL pour l'application de gestion hospitalière HPD.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL (local ou Render)
- npm ou yarn

### Installation

```bash
# Installation des dépendances
npm install

# Vérification de la configuration
node check-config.js

# Test de connexion DB
node test-db.js

# Démarrage du serveur
npm start
```

## ⚙️ Configuration

Créez un fichier `.env` avec :

```env
# Base de données PostgreSQL
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password

# Application
NODE_ENV=production
PORT=3001
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173
```

## 📊 API Endpoints

### 🔐 Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/verify-otp` - Vérification OTP
- `POST /api/auth/resend-otp` - Renvoi OTP

### 👤 Patients
- `GET /api/patients` - Liste des patients (pagination + recherche)
- `GET /api/patients/:id` - Détails d'un patient
- `POST /api/patients` - Créer un patient

### 🛏️ Lits
- `GET /api/lits` - Liste des lits (filtres par service/statut)

### 🏥 Hospitalisations
- `GET /api/hospitalisations` - Liste des hospitalisations
- `POST /api/hospitalisations` - Nouvelle hospitalisation

### 📊 Dashboard
- `GET /api/dashboard/stats` - Statistiques complètes

### 🔔 Notifications
- `GET /api/notifications` - Notifications utilisateur
- `PATCH /api/notifications/:id/read` - Marquer comme lu

### 🛠️ Utilitaires
- `GET /api/health` - Santé de l'API
- `GET /api/db-info` - Informations DB (admin uniquement)

## 🗄️ Structure de la Base de Données

### Tables Principales
- **users** - Utilisateurs du système
- **patients** - Informations des patients
- **lits** - Gestion des lits
- **hospitalisations** - Séjours des patients
- **notifications** - Système de notifications

## 🔐 Sécurité

- **JWT** avec expiration 24h
- **bcryptjs** pour les mots de passe
- **Helmet** pour la sécurité HTTP
- **CORS** configuré
- **Validation** des données
- **Transactions** PostgreSQL

## 👥 Comptes de Test

Créés automatiquement au démarrage :

| Username | Password | Rôle |
|----------|----------|------|
| admin | admin123 | Administrateur |
| dr.diallo | admin123 | Médecin |
| infirmier1 | admin123 | Infirmier |
| receptionist | admin123 | Réceptionniste |

## 🔧 Scripts Utiles

```bash
# Vérification configuration
node check-config.js

# Test connexion DB
node test-db.js

# Démarrage avec logs
npm run dev

# Production
npm start
```

## 📝 Logs

Le serveur affiche :
- ✅ Connexions réussies
- ❌ Erreurs détaillées
- 🔐 Authentifications
- 📊 Requêtes importantes

## 🐛 Dépannage

### Erreur de connexion DB
1. Vérifiez les variables d'environnement
2. Testez avec `node test-db.js`
3. Vérifiez que PostgreSQL est accessible

### Erreur de modules
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur CORS
Vérifiez `FRONTEND_URL` dans `.env`

## 🚀 Déploiement

### Render/Railway
1. Configurez les variables d'environnement
2. Activez SSL pour PostgreSQL
3. Déployez depuis GitHub

### Variables d'environnement requises
- `DATABASE_URL` ou variables individuelles DB
- `JWT_SECRET`
- `FRONTEND_URL`
- `NODE_ENV=production`

## 📞 Support

Pour toute question technique, contactez l'équipe de développement HPD.

---

**HPD Hospitalisation** - Système de gestion moderne pour l'Hôpital Principal de Dakar
