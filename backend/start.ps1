# Script de démarrage HPD Backend pour Windows
Write-Host "🚀 Démarrage du serveur HPD Hospitalisation..." -ForegroundColor Green

# Vérification des dépendances
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur installation dépendances" -ForegroundColor Red
        exit 1
    }
}

# Test de la connexion DB
Write-Host "🔧 Test de la connexion base de données..." -ForegroundColor Blue
node test-db.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connexion DB OK - Démarrage du serveur..." -ForegroundColor Green
    node server.js
} else {
    Write-Host "❌ Erreur de connexion DB - Vérifiez votre configuration" -ForegroundColor Red
    Write-Host "🔍 Vérifiez le fichier .env" -ForegroundColor Yellow
    exit 1
}
