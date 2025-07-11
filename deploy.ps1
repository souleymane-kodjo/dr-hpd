# Script de déploiement PowerShell pour HPD Hospitalisation
# Usage: .\deploy.ps1 [frontend|backend|all]

param(
    [string]$Target = "all"
)

Write-Host "🚀 HPD Hospitalisation - Script de déploiement" -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Info "Vérification des prérequis..."
    
    # Vérifier Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js détecté: $nodeVersion"
    } catch {
        Write-Error "Node.js n'est pas installé ou n'est pas dans le PATH"
        exit 1
    }
    
    # Vérifier npm
    try {
        $npmVersion = npm --version
        Write-Success "npm détecté: $npmVersion"
    } catch {
        Write-Error "npm n'est pas installé ou n'est pas dans le PATH"
        exit 1
    }
    
    # Vérifier git
    try {
        $gitVersion = git --version
        Write-Success "git détecté: $gitVersion"
    } catch {
        Write-Warning "git n'est pas détecté (optionnel pour le build)"
    }
    
    Write-Success "Prérequis vérifiés ✓"
}

function Deploy-Frontend {
    Write-Info "🌐 Déploiement du frontend..."
    
    # Installation des dépendances
    Write-Info "Installation des dépendances frontend..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Erreur lors de l'installation des dépendances"
        exit 1
    }
    
    # Build
    Write-Info "Build du frontend..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Erreur lors du build frontend"
        exit 1
    }
    
    # Test du build
    if (Test-Path "dist") {
        Write-Success "Build frontend réussi ✓"
        $size = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Info "Taille du build: $([math]::Round($size, 2)) MB"
    } else {
        Write-Error "Le dossier 'dist' n'a pas été créé"
        exit 1
    }
    
    # Instructions pour Netlify
    Write-Host ""
    Write-Info "📋 Instructions pour Netlify:"
    Write-Host "1. Glissez le dossier 'dist/' sur netlify.com" -ForegroundColor White
    Write-Host "2. Ou connectez votre repository GitHub" -ForegroundColor White
    Write-Host "3. Configurez les variables d'environnement:" -ForegroundColor White
    Write-Host "   - VITE_API_URL=https://votre-backend.railway.app/api" -ForegroundColor Gray
    Write-Host "   - VITE_APP_NAME=HPD Hospitalisation" -ForegroundColor Gray
    Write-Host "   - VITE_NODE_ENV=production" -ForegroundColor Gray
}

function Deploy-Backend {
    Write-Info "🖥️ Préparation du backend..."
    
    Set-Location "backend"
    
    # Installation des dépendances
    Write-Info "Installation des dépendances backend..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Erreur lors de l'installation des dépendances backend"
        Set-Location ".."
        exit 1
    }
    
    # Test de la syntaxe
    Write-Info "Vérification de la syntaxe..."
    node -c server-new.js
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Erreur de syntaxe dans server-new.js"
        Set-Location ".."
        exit 1
    }
    
    Write-Success "Backend préparé ✓"
    Set-Location ".."
    
    # Instructions pour Railway
    Write-Host ""
    Write-Info "📋 Instructions pour Railway:"
    Write-Host "1. Connectez votre repository GitHub sur railway.app" -ForegroundColor White
    Write-Host "2. Sélectionnez le dossier 'backend/'" -ForegroundColor White
    Write-Host "3. Configurez les variables d'environnement:" -ForegroundColor White
    Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
    Write-Host "   - DB_HOST=votre-neon-host" -ForegroundColor Gray
    Write-Host "   - DB_NAME=votre-database" -ForegroundColor Gray
    Write-Host "   - DB_USER=votre-username" -ForegroundColor Gray
    Write-Host "   - DB_PASSWORD=votre-password" -ForegroundColor Gray
    Write-Host "   - JWT_SECRET=votre-secret-securise" -ForegroundColor Gray
    Write-Host "   - CORS_ORIGIN=https://votre-app.netlify.app" -ForegroundColor Gray
}

function Deploy-All {
    Write-Info "🎯 Déploiement complet (frontend + backend)..."
    
    Deploy-Backend
    Write-Host ""
    Deploy-Frontend
    
    Write-Host ""
    Write-Success "🎉 Déploiement préparé avec succès!"
    Write-Host ""
    Write-Info "📚 Prochaines étapes:"
    Write-Host "1. Déployez la base de données sur Neon.tech" -ForegroundColor White
    Write-Host "2. Déployez le backend sur Railway" -ForegroundColor White
    Write-Host "3. Déployez le frontend sur Netlify" -ForegroundColor White
    Write-Host "4. Testez l'intégration complète" -ForegroundColor White
    Write-Host ""
    Write-Info "📖 Consultez DEPLOY-GUIDE.md pour les détails"
}

function Show-Help {
    Write-Host "Usage: .\deploy.ps1 [frontend|backend|all]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  frontend, front, f    Préparer le frontend uniquement" -ForegroundColor Gray
    Write-Host "  backend, back, b      Préparer le backend uniquement" -ForegroundColor Gray
    Write-Host "  all, both, a          Préparer frontend et backend (défaut)" -ForegroundColor Gray
    Write-Host "  help, h               Afficher cette aide" -ForegroundColor Gray
}

# Menu principal
switch ($Target.ToLower()) {
    { $_ -in @("frontend", "front", "f") } {
        Test-Prerequisites
        Deploy-Frontend
    }
    { $_ -in @("backend", "back", "b") } {
        Test-Prerequisites
        Deploy-Backend
    }
    { $_ -in @("all", "both", "a") } {
        Test-Prerequisites
        Deploy-All
    }
    { $_ -in @("help", "h", "-h", "--help") } {
        Show-Help
    }
    default {
        Write-Error "Option invalide: $Target"
        Write-Host "Utilisez '.\deploy.ps1 help' pour voir les options disponibles" -ForegroundColor Yellow
        exit 1
    }
}
