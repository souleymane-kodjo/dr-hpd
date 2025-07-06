-- Script d'initialisation de la base de données HPD Hospital
-- Ce script sera exécuté automatiquement lors du premier démarrage de PostgreSQL

-- Création de la base de données et des extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des patients
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_patient VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nom_complet VARCHAR(200) GENERATED ALWAYS AS (prenom || ' ' || nom) STORED,
    date_naissance DATE NOT NULL,
    age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(date_naissance))) STORED,
    sexe CHAR(1) CHECK (sexe IN ('M', 'F')) NOT NULL,
    telephone VARCHAR(20),
    adresse TEXT,
    email VARCHAR(255),
    contact_urgence VARCHAR(255),
    statut VARCHAR(50) DEFAULT 'Ambulatoire',
    diagnostic_actuel TEXT,
    specialite VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des dossiers médicaux
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('consultation', 'hospitalisation', 'examen', 'traitement', 'chirurgie', 'diagnostic')) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    doctor VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    results TEXT,
    notes TEXT,
    severity VARCHAR(20) CHECK (severity IN ('critique', 'élevée', 'modérée', 'faible')),
    attachments TEXT[], -- Array de noms de fichiers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des hospitalisations
CREATE TABLE IF NOT EXISTS hospitalisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    chambre VARCHAR(20),
    service VARCHAR(100) NOT NULL,
    date_entree TIMESTAMP WITH TIME ZONE NOT NULL,
    date_sortie TIMESTAMP WITH TIME ZONE,
    motif TEXT NOT NULL,
    diagnostic TEXT,
    medecin_responsable VARCHAR(255) NOT NULL,
    statut VARCHAR(50) DEFAULT 'En cours',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_patients_nom_complet ON patients USING gin(nom_complet gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patients_numero ON patients(numero_patient);
CREATE INDEX IF NOT EXISTS idx_patients_statut ON patients(statut);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(date);
CREATE INDEX IF NOT EXISTS idx_hospitalisations_patient ON hospitalisations(patient_id);
CREATE INDEX IF NOT EXISTS idx_hospitalisations_statut ON hospitalisations(statut);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospitalisations_updated_at BEFORE UPDATE ON hospitalisations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données de test
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@hpd.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'System', 'admin'),
('doctor@hpd.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Jean', 'Dupont', 'doctor'),
('nurse@hpd.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie', 'Martin', 'nurse')
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (numero_patient, nom, prenom, date_naissance, sexe, telephone, statut, diagnostic_actuel, specialite) VALUES
('PAT001', 'Dubois', 'Pierre', '1980-05-15', 'M', '01.23.45.67.89', 'Hospitalisé', 'Pneumonie', 'Pneumologie'),
('PAT002', 'Martin', 'Sophie', '1992-03-22', 'F', '01.98.76.54.32', 'Ambulatoire', 'Contrôle routine', 'Médecine générale'),
('PAT003', 'Rousseau', 'Jean', '1975-11-08', 'M', '01.45.67.89.12', 'Sortie', 'Chirurgie appendice', 'Chirurgie'),
('PAT004', 'Leroy', 'Claire', '1988-07-30', 'F', '01.34.56.78.90', 'Hospitalisé', 'Fracture fémur', 'Orthopédie'),
('PAT005', 'Bernard', 'Michel', '1965-12-12', 'M', '01.56.78.90.12', 'Ambulatoire', 'Hypertension', 'Cardiologie')
ON CONFLICT (numero_patient) DO NOTHING;
