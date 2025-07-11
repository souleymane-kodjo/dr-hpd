require('dotenv').config();

console.log('🔧 VÉRIFICATION CONFIGURATION HPD BACKEND');
console.log('=' .repeat(50));

// Vérification des variables d'environnement
const requiredVars = [
    'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
    'JWT_SECRET', 'FRONTEND_URL'
];

console.log('📋 Variables d\'environnement:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET') 
        ? '***' 
        : (value || 'NON DÉFINIE');
    console.log(`${status} ${varName}: ${displayValue}`);
});

console.log('\n🔌 Configuration PostgreSQL:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`SSL: ${process.env.DB_HOST && process.env.DB_HOST.includes('render.com') ? 'Activé' : 'Désactivé'}`);

console.log('\n🌐 Configuration serveur:');
console.log(`Port: ${process.env.PORT || 5000}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);

// Vérification des dépendances
console.log('\n📦 Vérification des dépendances:');
const dependencies = ['express', 'cors', 'helmet', 'pg', 'jsonwebtoken', 'bcryptjs'];
dependencies.forEach(dep => {
    try {
        require(dep);
        console.log(`✅ ${dep}`);
    } catch (error) {
        console.log(`❌ ${dep} - NON INSTALLÉ`);
    }
});

console.log('\n' + '=' .repeat(50));
console.log('Utilisez "node test-db.js" pour tester la connexion DB');
console.log('Utilisez "npm start" pour démarrer le serveur');
