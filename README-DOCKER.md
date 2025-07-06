# Documentation de Déploiement - HPD Hospitalisation

## 🐳 Déploiement avec Docker

Cette application est containerisée avec Docker et Docker Compose pour faciliter le déploiement.

### Prérequis

- Docker Engine 20.10+
- Docker Compose v2.0+
- 4GB RAM minimum
- 10GB d'espace disque

### Structure des conteneurs

- **frontend**: Application React avec Nginx
- **backend**: API Node.js/Express
- **database**: PostgreSQL 15
- **redis**: Cache Redis
- **pgadmin**: Interface d'administration DB (dev seulement)

## 🚀 Démarrage rapide

### 1. Cloner et configurer

```bash
git clone <repository-url>
cd hpd-hospitalisation

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos paramètres
```

### 2. Construire et démarrer

```bash
# Démarrer tous les services
docker-compose up -d

# Ou en mode développement avec pgAdmin
docker-compose --profile dev up -d

# Voir les logs
docker-compose logs -f
```

### 3. Vérifier le déploiement

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/health
- **pgAdmin** (dev): http://localhost:5050

## 📋 Commandes utiles

### Gestion des conteneurs

```bash
# Arrêter tous les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart frontend

# Voir le statut
docker-compose ps

# Voir les logs d'un service
docker-compose logs -f backend
```

### Gestion des données

```bash
# Sauvegarder la base de données
docker-compose exec database pg_dump -U hpd_user hpd_hospital > backup.sql

# Restaurer la base de données
docker-compose exec -T database psql -U hpd_user hpd_hospital < backup.sql

# Accéder à la base de données
docker-compose exec database psql -U hpd_user hpd_hospital
```

### Mise à jour

```bash
# Reconstruire les images
docker-compose build --no-cache

# Mettre à jour et redémarrer
docker-compose up -d --build
```

## 🔧 Configuration

### Variables d'environnement importantes

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `NODE_ENV` | Environnement | `production` |
| `DATABASE_URL` | URL de connexion PostgreSQL | Voir .env.example |
| `JWT_SECRET` | Clé secrète JWT | **À changer en production** |
| `CORS_ORIGIN` | Origine autorisée CORS | `http://localhost:3000` |

### Ports utilisés

| Service | Port interne | Port externe | Description |
|---------|--------------|--------------|-------------|
| Frontend | 80 | 3000 | Application React |
| Backend | 3001 | 3001 | API REST |
| Database | 5432 | 5432 | PostgreSQL |
| Redis | 6379 | 6379 | Cache Redis |
| pgAdmin | 80 | 5050 | Administration DB |

## 🔒 Sécurité

### En production

1. **Changez toutes les mots de passe par défaut**
2. **Générez une clé JWT sécurisée**
3. **Configurez HTTPS** (avec un reverse proxy)
4. **Limitez l'accès aux ports** (firewall)
5. **Activez les sauvegardes automatiques**

### Recommandations

```bash
# Générer une clé JWT sécurisée
openssl rand -base64 64

# Utiliser des mots de passe forts
openssl rand -base64 32
```

## 🚨 Résolution de problèmes

### Erreurs communes

**Port déjà utilisé**
```bash
# Voir les processus utilisant le port
netstat -tulpn | grep :3000
# Arrêter le processus ou changer le port
```

**Problème de permissions**
```bash
# Donner les bonnes permissions
sudo chown -R $USER:$USER .
```

**Base de données non initialisée**
```bash
# Supprimer et recréer le volume
docker-compose down -v
docker-compose up -d
```

### Logs et debugging

```bash
# Logs détaillés
docker-compose logs -f --tail=100

# Accéder au conteneur
docker-compose exec frontend sh
docker-compose exec backend sh

# Inspecter un conteneur
docker inspect hpd-frontend
```

## 📊 Monitoring

### Health checks

- Frontend: `curl http://localhost:3000`
- Backend: `curl http://localhost:3001/api/health`
- Database: `docker-compose exec database pg_isready`

### Métriques

```bash
# Utilisation des ressources
docker stats

# Espace disque des volumes
docker system df
```

## 🔄 Déploiement en production

### Avec reverse proxy (recommandé)

```nginx
# /etc/nginx/sites-available/hpd
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Variables d'environnement production

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db.example.com:5432/hpd
JWT_SECRET=your-very-secure-jwt-secret-key
CORS_ORIGIN=https://your-domain.com
```

## 📞 Support

En cas de problème:

1. Vérifiez les logs: `docker-compose logs -f`
2. Consultez la documentation Docker
3. Vérifiez les issues GitHub du projet
4. Contactez l'équipe de développement
