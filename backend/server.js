// ========================================
// HPD HOSPITALISATION - BACKEND API
// Configuration complète Express.js + PostgreSQL
// ========================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// CONFIGURATION POSTGRESQL
// ========================================
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hpd_hospitalisation',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion à la base de données
pool.on('connect', () => {
  console.log('✅ Connexion PostgreSQL établie');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
});

// ========================================
// MIDDLEWARES
// ========================================
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// MIDDLEWARE D'AUTHENTIFICATION JWT
// ========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token d\'authentification requis'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'hpd_secret_key_2024', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
    req.user = user;
    next();
  });
};

// ========================================
// INITIALISATION DE LA BASE DE DONNÉES
// ========================================
const initializeDatabase = async () => {
  try {
    // Création des tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        phone VARCHAR(20),
        address TEXT,
        date_of_birth DATE,
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        otp_code VARCHAR(6),
        otp_expires_at TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        date_naissance DATE NOT NULL,
        sexe VARCHAR(1) CHECK (sexe IN ('M', 'F')) NOT NULL,
        telephone VARCHAR(20),
        adresse TEXT,
        email VARCHAR(255),
        numero_dossier VARCHAR(50) UNIQUE,
        profession VARCHAR(100),
        situation_matrimoniale VARCHAR(50),
        personne_contact VARCHAR(200),
        telephone_contact VARCHAR(20),
        allergies TEXT,
        antecedents_medicaux TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS lits (
        id SERIAL PRIMARY KEY,
        numero VARCHAR(20) UNIQUE NOT NULL,
        service VARCHAR(100) NOT NULL,
        chambre VARCHAR(50),
        type_lit VARCHAR(50) DEFAULT 'standard',
        statut VARCHAR(20) DEFAULT 'libre' CHECK (statut IN ('libre', 'occupe', 'maintenance', 'reserve')),
        prix_par_jour DECIMAL(10,2),
        equipements TEXT[],
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hospitalisations (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        lit_id INTEGER REFERENCES lits(id) ON DELETE SET NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        date_admission DATE NOT NULL,
        date_sortie_prevue DATE,
        date_sortie_effective DATE,
        motif_admission TEXT NOT NULL,
        diagnostic TEXT,
        traitement TEXT,
        statut VARCHAR(50) DEFAULT 'En cours' CHECK (statut IN ('En cours', 'Sortie prévue', 'Sortie effectuée', 'Annulée')),
        type_hospitalisation VARCHAR(50) DEFAULT 'programmée',
        medecin_responsable VARCHAR(200),
        observations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        titre VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        action_url VARCHAR(500),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );
    `);

    // Index pour améliorer les performances
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_patients_numero_dossier ON patients(numero_dossier);
      CREATE INDEX IF NOT EXISTS idx_hospitalisations_patient_id ON hospitalisations(patient_id);
      CREATE INDEX IF NOT EXISTS idx_hospitalisations_lit_id ON hospitalisations(lit_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `);

    console.log('✅ Base de données initialisée avec succès');

    // Insertion des données de test
    await insertSampleData();

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  }
};

// ========================================
// INSERTION DE DONNÉES DE TEST
// ========================================
const insertSampleData = async () => {
  try {
    // Vérifier si des utilisateurs existent déjà
    const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers.rows[0].count) > 0) {
      console.log('📊 Données de test déjà présentes');
      return;
    }

    // Créer des utilisateurs de test
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await pool.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, role, phone, is_verified)
      VALUES
        ('admin', 'admin@hpd.sn', $1, 'Administrateur', 'HPD', 'admin', '+221-77-123-4567', true),
        ('dr.diallo', 'diallo@hpd.sn', $1, 'Moussa', 'Diallo', 'doctor', '+221-77-234-5678', true),
        ('infirmier1', 'infirmier@hpd.sn', $1, 'Fatou', 'Ndiaye', 'nurse', '+221-77-345-6789', true),
        ('receptionist', 'accueil@hpd.sn', $1, 'Aminata', 'Sow', 'receptionist', '+221-77-456-7890', true)
    `, [hashedPassword]);

    // Créer des lits de test
    await pool.query(`
      INSERT INTO lits (numero, service, chambre, type_lit, statut, prix_par_jour, equipements)
      VALUES
        ('101-A', 'Dermatologie', 'CH101', 'standard', 'libre', 25000.00, ARRAY['climatisation', 'television', 'salle_de_bain']),
        ('101-B', 'Dermatologie', 'CH101', 'standard', 'libre', 25000.00, ARRAY['climatisation', 'television']),
        ('102-A', 'Dermatologie', 'CH102', 'vip', 'libre', 45000.00, ARRAY['climatisation', 'television', 'salle_de_bain', 'refrigerateur']),
        ('201-A', 'Rhumatologie', 'CH201', 'standard', 'libre', 25000.00, ARRAY['climatisation', 'television']),
        ('201-B', 'Rhumatologie', 'CH201', 'standard', 'occupe', 25000.00, ARRAY['climatisation', 'television']),
        ('202-A', 'Rhumatologie', 'CH202', 'vip', 'libre', 45000.00, ARRAY['climatisation', 'television', 'salle_de_bain', 'refrigerateur'])
    `);

    // Créer des patients de test
    await pool.query(`
      INSERT INTO patients (nom, prenom, date_naissance, sexe, telephone, adresse, email, numero_dossier, profession)
      VALUES
        ('Diop', 'Mamadou', '1985-03-15', 'M', '+221-77-111-2222', 'Dakar, Senegal', 'mamadou.diop@email.com', 'HPD2024001', 'Enseignant'),
        ('Fall', 'Aissatou', '1990-07-22', 'F', '+221-77-333-4444', 'Thies, Senegal', 'aissatou.fall@email.com', 'HPD2024002', 'Commercante'),
        ('Niang', 'Ibrahima', '1978-12-10', 'M', '+221-77-555-6666', 'Saint-Louis, Senegal', 'ibrahima.niang@email.com', 'HPD2024003', 'Chauffeur'),
        ('Sarr', 'Marieme', '1995-05-18', 'F', '+221-77-777-8888', 'Kaolack, Senegal', 'marieme.sarr@email.com', 'HPD2024004', 'Etudiante')
    `);

    console.log('✅ Données de test insérées avec succès');

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données de test:', error);
  }
};

// ========================================
// ROUTES D'AUTHENTIFICATION
// ========================================

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom d\'utilisateur et mot de passe requis'
      });
    }

    // Rechercher l'utilisateur
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const user = userResult.rows[0];

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Générer un code OTP (simulation)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Sauvegarder l'OTP
    await pool.query(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3',
      [otpCode, otpExpires, user.id]
    );

    // Générer le token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'hpd_secret_key_2024',
      { expiresIn: '24h' }
    );

    // Retourner les informations utilisateur (sans le mot de passe)
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      phone: user.phone,
      isVerified: user.is_verified
    };

    console.log(`🔐 Connexion réussie pour ${username} - OTP: ${otpCode}`);

    res.json({
      success: true,
      message: 'Connexion réussie. Vérifiez votre OTP.',
      user: userInfo,
      token,
      otpRequired: true,
      otpCode // En production, envoyer par SMS/Email
    });

  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Route de vérification OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Nom d\'utilisateur et code OTP requis'
      });
    }

    // Vérifier l'OTP
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND otp_code = $2 AND otp_expires_at > NOW()',
      [username, otp]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Code OTP invalide ou expiré'
      });
    }

    const user = userResult.rows[0];

    // Supprimer l'OTP et mettre à jour la dernière connexion
    await pool.query(
      'UPDATE users SET otp_code = NULL, otp_expires_at = NULL, last_login = NOW(), is_verified = true WHERE id = $1',
      [user.id]
    );

    console.log(`✅ OTP vérifié pour ${username}`);

    res.json({
      success: true,
      message: 'OTP vérifié avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur de vérification OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Route de renvoi d'OTP
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Nom d\'utilisateur requis'
      });
    }

    // Générer un nouveau code OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Mettre à jour l'OTP
    const result = await pool.query(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE username = $3 AND is_active = true RETURNING id',
      [otpCode, otpExpires, username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    console.log(`📱 Nouveau OTP pour ${username}: ${otpCode}`);

    res.json({
      success: true,
      message: 'Nouveau code OTP envoyé',
      otpCode // En production, envoyer par SMS/Email
    });

  } catch (error) {
    console.error('❌ Erreur de renvoi OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// ========================================
// ROUTES PATIENTS
// ========================================

// Obtenir tous les patients
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*,
        COUNT(h.id) as total_hospitalisations,
        MAX(h.date_admission) as derniere_admission
      FROM patients p
      LEFT JOIN hospitalisations h ON p.id = h.patient_id
    `;

    let queryParams = [];

    if (search) {
      query += ` WHERE (p.nom ILIKE $1 OR p.prenom ILIKE $1 OR p.numero_dossier ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Compter le total pour la pagination
    let countQuery = 'SELECT COUNT(*) FROM patients p';
    let countParams = [];

    if (search) {
      countQuery += ` WHERE (p.nom ILIKE $1 OR p.prenom ILIKE $1 OR p.numero_dossier ILIKE $1)`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: (page * limit) < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération patients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des patients'
    });
  }
});

// Obtenir un patient par ID
app.get('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT p.*,
        COUNT(h.id) as total_hospitalisations,
        MAX(h.date_admission) as derniere_admission,
        JSON_AGG(
          CASE WHEN h.id IS NOT NULL THEN
            JSON_BUILD_OBJECT(
              'id', h.id,
              'date_admission', h.date_admission,
              'date_sortie_prevue', h.date_sortie_prevue,
              'date_sortie_effective', h.date_sortie_effective,
              'motif_admission', h.motif_admission,
              'statut', h.statut,
              'lit_numero', l.numero,
              'lit_service', l.service
            )
          END
        ) FILTER (WHERE h.id IS NOT NULL) as hospitalisations
      FROM patients p
      LEFT JOIN hospitalisations h ON p.id = h.patient_id
      LEFT JOIN lits l ON h.lit_id = l.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erreur récupération patient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du patient'
    });
  }
});

// Créer un nouveau patient
app.post('/api/patients', authenticateToken, async (req, res) => {
  try {
    const {
      nom, prenom, date_naissance, sexe, telephone, adresse, email,
      profession, situation_matrimoniale, personne_contact, telephone_contact,
      allergies, antecedents_medicaux
    } = req.body;

    // Validation des champs requis
    if (!nom || !prenom || !date_naissance || !sexe) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom, prénom, date de naissance et sexe sont requis'
      });
    }

    // Générer un numéro de dossier unique
    const year = new Date().getFullYear();
    const countResult = await pool.query('SELECT COUNT(*) + 1 as next_number FROM patients WHERE EXTRACT(YEAR FROM created_at) = $1', [year]);
    const nextNumber = countResult.rows[0].next_number.toString().padStart(3, '0');
    const numeroDossier = `HPD${year}${nextNumber}`;

    const result = await pool.query(`
      INSERT INTO patients (
        nom, prenom, date_naissance, sexe, telephone, adresse, email, numero_dossier,
        profession, situation_matrimoniale, personne_contact, telephone_contact,
        allergies, antecedents_medicaux
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      nom, prenom, date_naissance, sexe, telephone, adresse, email, numeroDossier,
      profession, situation_matrimoniale, personne_contact, telephone_contact,
      allergies, antecedents_medicaux
    ]);

    console.log(`👤 Nouveau patient créé: ${nom} ${prenom} - ${numeroDossier}`);

    res.status(201).json({
      success: true,
      message: 'Patient créé avec succès',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erreur création patient:', error);

    if (error.code === '23505') { // Violation de contrainte unique
      return res.status(409).json({
        success: false,
        message: 'Un patient avec ces informations existe déjà'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du patient'
    });
  }
});

// ========================================
// ROUTES LITS
// ========================================

// Obtenir tous les lits
app.get('/api/lits', authenticateToken, async (req, res) => {
  try {
    const { service, statut } = req.query;

    let query = `
      SELECT l.*,
        CASE WHEN h.id IS NOT NULL THEN
          JSON_BUILD_OBJECT(
            'patient_nom', p.nom,
            'patient_prenom', p.prenom,
            'date_admission', h.date_admission,
            'hospitalisation_id', h.id
          )
        END as occupation_actuelle
      FROM lits l
      LEFT JOIN hospitalisations h ON l.id = h.lit_id AND h.statut = 'En cours'
      LEFT JOIN patients p ON h.patient_id = p.id
    `;

    const conditions = [];
    const params = [];

    if (service) {
      conditions.push(`l.service = $${params.length + 1}`);
      params.push(service);
    }

    if (statut) {
      conditions.push(`l.statut = $${params.length + 1}`);
      params.push(statut);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY l.service, l.numero`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Erreur récupération lits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des lits'
    });
  }
});

// ========================================
// ROUTES HOSPITALISATIONS
// ========================================

// Obtenir toutes les hospitalisations
app.get('/api/hospitalisations', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, statut, service } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT h.*,
        p.nom as patient_nom,
        p.prenom as patient_prenom,
        p.numero_dossier,
        l.numero as lit_numero,
        l.service as lit_service,
        l.chambre as lit_chambre,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM hospitalisations h
      JOIN patients p ON h.patient_id = p.id
      LEFT JOIN lits l ON h.lit_id = l.id
      LEFT JOIN users u ON h.user_id = u.id
    `;

    const conditions = [];
    const params = [];

    if (statut) {
      conditions.push(`h.statut = $${params.length + 1}`);
      params.push(statut);
    }

    if (service) {
      conditions.push(`l.service = $${params.length + 1}`);
      params.push(service);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY h.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Compter le total
    let countQuery = `
      SELECT COUNT(*)
      FROM hospitalisations h
      LEFT JOIN lits l ON h.lit_id = l.id
    `;

    let countParams = [];
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
      if (statut) countParams.push(statut);
      if (service) countParams.push(service);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: (page * limit) < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération hospitalisations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des hospitalisations'
    });
  }
});

// Créer une nouvelle hospitalisation
app.post('/api/hospitalisations', authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      patient_id, lit_id, date_admission, date_sortie_prevue,
      motif_admission, diagnostic, traitement, type_hospitalisation,
      medecin_responsable, observations
    } = req.body;

    // Validation
    if (!patient_id || !date_admission || !motif_admission) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Patient, date d\'admission et motif sont requis'
      });
    }

    // Vérifier que le lit est libre (si spécifié)
    if (lit_id) {
      const litCheck = await client.query(
        'SELECT statut FROM lits WHERE id = $1',
        [lit_id]
      );

      if (litCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Lit non trouvé'
        });
      }

      if (litCheck.rows[0].statut !== 'libre') {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: 'Le lit sélectionné n\'est pas disponible'
        });
      }

      // Marquer le lit comme occupé
      await client.query(
        'UPDATE lits SET statut = $1 WHERE id = $2',
        ['occupe', lit_id]
      );
    }

    // Créer l'hospitalisation
    const result = await client.query(`
      INSERT INTO hospitalisations (
        patient_id, lit_id, user_id, date_admission, date_sortie_prevue,
        motif_admission, diagnostic, traitement, type_hospitalisation,
        medecin_responsable, observations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      patient_id, lit_id, req.user.userId, date_admission, date_sortie_prevue,
      motif_admission, diagnostic, traitement, type_hospitalisation,
      medecin_responsable, observations
    ]);

    await client.query('COMMIT');

    console.log(`🏥 Nouvelle hospitalisation créée pour patient ID: ${patient_id}`);

    res.status(201).json({
      success: true,
      message: 'Hospitalisation créée avec succès',
      data: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur création hospitalisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'hospitalisation'
    });
  } finally {
    client.release();
  }
});

// ========================================
// ROUTES DASHBOARD
// ========================================

// Statistiques du dashboard
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Statistiques principales
    const [
      totalPatients,
      totalHospitalisations,
      hospitalisationsActives,
      litsDisponibles,
      litsOccupes
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM patients'),
      pool.query('SELECT COUNT(*) FROM hospitalisations'),
      pool.query('SELECT COUNT(*) FROM hospitalisations WHERE statut = $1', ['En cours']),
      pool.query('SELECT COUNT(*) FROM lits WHERE statut = $1', ['libre']),
      pool.query('SELECT COUNT(*) FROM lits WHERE statut = $1', ['occupe'])
    ]);

    // Hospitalisations par service
    const hospitalisationsParService = await pool.query(`
      SELECT l.service, COUNT(h.id) as count
      FROM hospitalisations h
      JOIN lits l ON h.lit_id = l.id
      WHERE h.statut = 'En cours'
      GROUP BY l.service
      ORDER BY count DESC
    `);

    // Évolution des hospitalisations (7 derniers jours)
    const evolutionHospitalisations = await pool.query(`
      SELECT
        DATE(date_admission) as date,
        COUNT(*) as admissions
      FROM hospitalisations
      WHERE date_admission >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(date_admission)
      ORDER BY date
    `);

    res.json({
      success: true,
      data: {
        totaux: {
          patients: parseInt(totalPatients.rows[0].count),
          hospitalisations: parseInt(totalHospitalisations.rows[0].count),
          hospitalisations_actives: parseInt(hospitalisationsActives.rows[0].count),
          lits_disponibles: parseInt(litsDisponibles.rows[0].count),
          lits_occupes: parseInt(litsOccupes.rows[0].count)
        },
        hospitalisations_par_service: hospitalisationsParService.rows,
        evolution_admissions: evolutionHospitalisations.rows
      }
    });

  } catch (error) {
    console.error('❌ Erreur statistiques dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// ========================================
// ROUTES NOTIFICATIONS
// ========================================

// Obtenir les notifications d'un utilisateur
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, is_read } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT * FROM notifications
      WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
    `;
    const params = [req.user.userId];

    if (is_read !== undefined) {
      query += ` AND is_read = $${params.length + 1}`;
      params.push(is_read === 'true');
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Compter les non lues
    const unreadCount = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND (expires_at IS NULL OR expires_at > NOW())',
      [req.user.userId]
    );

    res.json({
      success: true,
      data: result.rows,
      unread_count: parseInt(unreadCount.rows[0].count)
    });

  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications'
    });
  }
});

// Marquer une notification comme lue
app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Notification marquée comme lue',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la notification'
    });
  }
});

// ========================================
// ROUTES UTILITAIRES
// ========================================

// Route de santé de l'API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API HPD Hospitalisation opérationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route d'information sur la base de données
app.get('/api/db-info', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const [
      usersCount,
      patientsCount,
      litsCount,
      hospitalisationsCount,
      notificationsCount
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM patients'),
      pool.query('SELECT COUNT(*) FROM lits'),
      pool.query('SELECT COUNT(*) FROM hospitalisations'),
      pool.query('SELECT COUNT(*) FROM notifications')
    ]);

    res.json({
      success: true,
      data: {
        tables: {
          users: parseInt(usersCount.rows[0].count),
          patients: parseInt(patientsCount.rows[0].count),
          lits: parseInt(litsCount.rows[0].count),
          hospitalisations: parseInt(hospitalisationsCount.rows[0].count),
          notifications: parseInt(notificationsCount.rows[0].count)
        },
        database_status: 'Connected',
        last_check: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur information DB:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations de la base de données'
    });
  }
});

// ========================================
// GESTION DES ERREURS 404
// ========================================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// ========================================
// GESTION DES ERREURS GLOBALES
// ========================================
app.use((error, req, res, next) => {
  console.error('❌ Erreur globale:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================
const startServer = async () => {
  try {
    // Initialiser la base de données
    await initializeDatabase();

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log('🚀 =================================');
      console.log(`🏥 HPD HOSPITALISATION - API SERVER`);
      console.log('🚀 =================================');
      console.log(`📡 Serveur démarré sur le port ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🔧 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Base de données: PostgreSQL`);
      console.log('🚀 =================================');
    });

  } catch (error) {
    console.error('❌ Erreur de démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur en cours...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur en cours...');
  await pool.end();
  process.exit(0);
});

// Démarrer le serveur
startServer();

module.exports = app;
