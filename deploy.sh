#!/bin/bash

# Script de déploiement automatisé pour HPD Hospitalisation
# Usage: ./deploy.sh [frontend|backend|all]

set -e

echo "🚀 HPD Hospitalisation - Script de déploiement"
echo "================================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier git
    if ! command -v git &> /dev/null; then
        log_error "git n'est pas installé"
        exit 1
    fi
    
    log_success "Prérequis vérifiés ✓"
}

# Build et test du frontend
deploy_frontend() {
    log_info "🌐 Déploiement du frontend..."
    
    # Installation des dépendances
    log_info "Installation des dépendances frontend..."
    npm install
    
    # Build
    log_info "Build du frontend..."
    npm run build
    
    # Test du build
    log_info "Test du build..."
    if [ -d "dist" ]; then
        log_success "Build frontend réussi ✓"
        log_info "Taille du build: $(du -sh dist | cut -f1)"
    else
        log_error "Erreur lors du build frontend"
        exit 1
    fi
    
    # Instructions pour Netlify
    echo ""
    log_info "📋 Instructions pour Netlify:"
    echo "1. Glissez le dossier 'dist/' sur netlify.com"
    echo "2. Ou connectez votre repository GitHub"
    echo "3. Configurez les variables d'environnement:"
    echo "   - VITE_API_URL=https://votre-backend.railway.app/api"
    echo "   - VITE_APP_NAME=HPD Hospitalisation"
    echo "   - VITE_NODE_ENV=production"
}

# Préparation du backend
deploy_backend() {
    log_info "🖥️ Préparation du backend..."
    
    cd backend
    
    # Installation des dépendances
    log_info "Installation des dépendances backend..."
    npm install
    
    # Test de la syntaxe
    log_info "Vérification de la syntaxe..."
    node -c server-new.js
    
    log_success "Backend préparé ✓"
    
    cd ..
    
    # Instructions pour Railway
    echo ""
    log_info "📋 Instructions pour Railway:"
    echo "1. Connectez votre repository GitHub sur railway.app"
    echo "2. Sélectionnez le dossier 'backend/'"
    echo "3. Configurez les variables d'environnement:"
    echo "   - NODE_ENV=production"
    echo "   - DB_HOST=votre-neon-host"
    echo "   - DB_NAME=votre-database"
    echo "   - DB_USER=votre-username"
    echo "   - DB_PASSWORD=votre-password"
    echo "   - JWT_SECRET=votre-secret-securise"
    echo "   - CORS_ORIGIN=https://votre-app.netlify.app"
}

# Préparation complète
deploy_all() {
    log_info "🎯 Déploiement complet (frontend + backend)..."
    
    deploy_backend
    echo ""
    deploy_frontend
    
    echo ""
    log_success "🎉 Déploiement préparé avec succès!"
    echo ""
    log_info "📚 Prochaines étapes:"
    echo "1. Déployez la base de données sur Neon.tech"
    echo "2. Déployez le backend sur Railway"
    echo "3. Déployez le frontend sur Netlify"
    echo "4. Testez l'intégration complète"
    echo ""
    log_info "📖 Consultez DEPLOY-GUIDE.md pour les détails"
}

# Nettoyage
cleanup() {
    log_info "🧹 Nettoyage..."
    
    # Supprimer node_modules si demandé
    read -p "Supprimer les node_modules? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf node_modules
        rm -rf backend/node_modules
        log_success "node_modules supprimés"
    fi
}

# Menu principal
case "${1:-all}" in
    "frontend"|"front"|"f")
        check_prerequisites
        deploy_frontend
        ;;
    "backend"|"back"|"b")
        check_prerequisites
        deploy_backend
        ;;
    "all"|"both"|"a")
        check_prerequisites
        deploy_all
        ;;
    "clean"|"cleanup"|"c")
        cleanup
        ;;
    "help"|"h"|"-h"|"--help")
        echo "Usage: $0 [frontend|backend|all|clean|help]"
        echo ""
        echo "Options:"
        echo "  frontend, front, f    Préparer le frontend uniquement"
        echo "  backend, back, b      Préparer le backend uniquement"
        echo "  all, both, a          Préparer frontend et backend (défaut)"
        echo "  clean, cleanup, c     Nettoyer les fichiers temporaires"
        echo "  help, h               Afficher cette aide"
        ;;
    *)
        log_error "Option invalide: $1"
        echo "Utilisez '$0 help' pour voir les options disponibles"
        exit 1
        ;;
esac
