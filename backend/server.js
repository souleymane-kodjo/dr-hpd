// Backend Server pour l'application HPD Hospitalisation
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
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

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Routes API

// Auth routes
app.post('/api/auth/login', (req, res) => {
  // Mock login - À remplacer par une vraie authentification
  const { email, password } = req.body;
  
  if (email === 'admin@hpd.com' && password === 'admin123') {
    res.json({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'admin@hpd.com',
        firstName: 'Admin',
        lastName: 'System',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ message: 'Identifiants invalides' });
  }
});

// Patients routes
app.get('/api/patients', (req, res) => {
  // Mock data - À remplacer par des vraies données de la DB
  const patients = [
    {
      id: '1',
      numeroPatient: 'PAT001',
      nomComplet: 'Pierre Dubois',
      age: 43,
      sexe: 'M',
      statut: 'Hospitalisé',
      diagnosticActuel: 'Pneumonie',
      specialite: 'Pneumologie'
    },
    {
      id: '2',
      numeroPatient: 'PAT002',
      nomComplet: 'Sophie Martin',
      age: 31,
      sexe: 'F',
      statut: 'Ambulatoire',
      diagnosticActuel: 'Contrôle routine',
      specialite: 'Médecine générale'
    }
  ];
  res.json(patients);
});

app.get('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  // Mock patient detail
  const patient = {
    id,
    numeroPatient: 'PAT001',
    nomComplet: 'Pierre Dubois',
    age: 43,
    sexe: 'M',
    statut: 'Hospitalisé',
    diagnosticActuel: 'Pneumonie',
    specialite: 'Pneumologie',
    telephone: '01.23.45.67.89',
    email: 'pierre.dubois@email.com'
  };
  res.json(patient);
});

// KPIs routes
app.get('/api/dashboard/kpis', (req, res) => {
  const kpis = [
    {
      id: 'total-patients',
      title: 'Total Patients',
      value: 1247,
      trend: 5.2,
      icon: 'users'
    },
    {
      id: 'hospitalized',
      title: 'Hospitalisés',
      value: 89,
      trend: -2.1,
      icon: 'bed'
    },
    {
      id: 'consultations',
      title: 'Consultations',
      value: 156,
      trend: 8.7,
      icon: 'clipboard'
    },
    {
      id: 'emergencies',
      title: 'Urgences',
      value: 23,
      trend: 12.3,
      icon: 'alert'
    }
  ];
  res.json(kpis);
});

// Medical records routes
app.get('/api/patients/:patientId/medical-records', (req, res) => {
  const { patientId } = req.params;
  const records = [
    {
      id: '1',
      patientId,
      title: 'Consultation de contrôle',
      type: 'consultation',
      date: '2024-01-15T10:30:00Z',
      doctor: 'Dr. Jean Dupont',
      specialty: 'Cardiologie',
      description: 'Consultation de routine pour suivi cardiaque',
      results: 'Paramètres normaux',
      severity: 'faible'
    }
  ];
  res.json(records);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route non trouvée',
    path: req.path
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur HPD Backend démarré sur le port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
