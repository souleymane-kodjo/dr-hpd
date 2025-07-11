const { Pool } = require('pg');
require('dotenv').config();

// Test de connexion PostgreSQL
const testConnection = async () => {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }, // Force SSL pour Render
  });

  try {
    console.log('🔄 Test de connexion PostgreSQL...');
    console.log(`📡 Host: ${process.env.DB_HOST}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME}`);
    console.log(`👤 User: ${process.env.DB_USER}`);
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('✅ Connexion PostgreSQL réussie !');
    console.log(`⏰ Heure serveur: ${result.rows[0].current_time}`);
    console.log(`🐘 Version PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]}`);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL:', error.message);
    process.exit(1);
  }
};

testConnection();
