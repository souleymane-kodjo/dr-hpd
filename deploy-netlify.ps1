# Déploiement Netlify HPD Hospitalisation
# Script PowerShell pour déploiement automatique

Write-Host "🚀 Déploiement HPD Hospitalisation sur Netlify" -ForegroundColor Green

# Vérification des prérequis
Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

if (!(Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé" -ForegroundColor Red
    exit 1
}

if (!(Test-Path "netlify.toml")) {
    Write-Host "❌ Erreur: netlify.toml non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prérequis validés" -ForegroundColor Green

# Installation des dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dépendances installées" -ForegroundColor Green

# Build de production
Write-Host "🔨 Build de production..." -ForegroundColor Yellow
npm run build:skip-tsc

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build réussi" -ForegroundColor Green

# Vérification du dossier dist
if (!(Test-Path "dist")) {
    Write-Host "❌ Erreur: dossier dist non créé" -ForegroundColor Red
    exit 1
}

$distSize = (Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum
$distSizeMB = [math]::Round($distSize / 1MB, 2)

Write-Host "📊 Taille du build: $distSizeMB MB" -ForegroundColor Cyan

# Affichage des fichiers générés
Write-Host "📁 Fichiers générés:" -ForegroundColor Cyan
Get-ChildItem dist\assets | Format-Table Name, @{Name="Size (KB)"; Expression={[math]::Round($_.Length / 1KB, 2)}}

Write-Host ""
Write-Host "🎉 Build prêt pour Netlify !" -ForegroundColor Green
Write-Host "📂 Dossier à déployer: dist/" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Allez sur netlify.com" -ForegroundColor White
Write-Host "2. Glissez-déposez le dossier dist/ ou connectez votre Git" -ForegroundColor White
Write-Host "3. Configurez les variables d'environnement:" -ForegroundColor White
Write-Host "   - VITE_API_URL=https://votre-backend.railway.app/api" -ForegroundColor Gray
Write-Host "4. Testez votre application déployée" -ForegroundColor White
Write-Host ""
Write-Host "📖 Guide détaillé: DEPLOY-NETLIFY-QUICK.md" -ForegroundColor Yellow
