# Deploiement Netlify HPD Hospitalisation
# Script PowerShell pour deploiement automatique

Write-Host "Deploiement HPD Hospitalisation sur Netlify" -ForegroundColor Green

# Verification des prerequis
Write-Host "Verification des prerequis..." -ForegroundColor Yellow

if (!(Test-Path "package.json")) {
    Write-Host "Erreur: package.json non trouve" -ForegroundColor Red
    exit 1
}

if (!(Test-Path "netlify.toml")) {
    Write-Host "Erreur: netlify.toml non trouve" -ForegroundColor Red
    exit 1
}

Write-Host "Prerequis valides" -ForegroundColor Green

# Build de production
Write-Host "Build de production..." -ForegroundColor Yellow
npm run build:skip-tsc

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du build" -ForegroundColor Red
    exit 1
}

Write-Host "Build reussi" -ForegroundColor Green

# Verification du dossier dist
if (!(Test-Path "dist")) {
    Write-Host "Erreur: dossier dist non cree" -ForegroundColor Red
    exit 1
}

$distSize = (Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum
$distSizeMB = [math]::Round($distSize / 1MB, 2)

Write-Host "Taille du build: $distSizeMB MB" -ForegroundColor Cyan

# Affichage des fichiers generes
Write-Host "Fichiers generes:" -ForegroundColor Cyan
Get-ChildItem dist\assets | Format-Table Name, @{Name="Size (KB)"; Expression={[math]::Round($_.Length / 1KB, 2)}}

Write-Host ""
Write-Host "Build pret pour Netlify !" -ForegroundColor Green
Write-Host "Dossier a deployer: dist/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "1. Allez sur netlify.com" -ForegroundColor White
Write-Host "2. Glissez-deposez le dossier dist/ ou connectez votre Git" -ForegroundColor White
Write-Host "3. Configurez les variables d'environnement" -ForegroundColor White
Write-Host "   - VITE_API_URL=https://votre-backend.railway.app/api" -ForegroundColor Gray
Write-Host "4. Testez votre application deployee" -ForegroundColor White
Write-Host ""
Write-Host "Guide detaille: DEPLOY-NETLIFY-QUICK.md" -ForegroundColor Yellow
