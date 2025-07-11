#!/bin/bash
echo "🚀 Démarrage du serveur HPD Hospitalisation..."
echo "📋 Vérification des dépendances..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

echo "🔧 Test de la connexion base de données..."
node test-db.js

if [ $? -eq 0 ]; then
    echo "✅ Connexion DB OK - Démarrage du serveur..."
    node server.js
else
    echo "❌ Erreur de connexion DB - Arrêt du processus"
    exit 1
fi
