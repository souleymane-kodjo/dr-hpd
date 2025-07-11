# Script simple de déploiement PowerShell pour HPD Hospitalisation
param(
    [string]$Target = "frontend"
)

Write-Host "🚀 HPD Hospitalisation - Déploiement Frontend" -ForegroundColor Blue

Write-Host "[INFO] Vérification des prérequis..." -ForegroundColor Cyan

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "[SUCCESS] Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js n'est pas installé" -ForegroundColor Red
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm --version
    Write-Host "[SUCCESS] npm détecté: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm n'est pas installé" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Installation des dépendances..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Build du frontend..." -ForegroundColor Cyan
npm run build:skip-tsc

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Erreur lors du build" -ForegroundColor Red
    exit 1
}

if (Test-Path "dist") {
    Write-Host "[SUCCESS] Build réussi !" -ForegroundColor Green
    $size = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "[INFO] Taille du build: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "[ERROR] Le dossier 'dist' n'a pas été créé" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ BUILD TERMINÉ AVEC SUCCÈS !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "1. Ouvrir https://netlify.com dans votre navigateur" -ForegroundColor White
Write-Host "2. Glisser le dossier 'dist' sur la zone de drop" -ForegroundColor White
Write-Host "3. Site déployé instantanément !" -ForegroundColor White
Write-Host ""
Write-Host "📖 Guide détaillé: DEPLOY-QUICK.md" -ForegroundColor Cyan
