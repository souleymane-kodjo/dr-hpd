// src/types/index.ts
export interface User {
  id: string;
  nom: string;
  email: string;
  roles: string[];
  matricule: string;
  photoUrl?: string; // URL de la photo de profil (optionnel)
}
export interface Patient {
  id: string;
  nomComplet: string;
  name: string; // Nom complet du patient (alias de nomComplet)
  age: number;
  admissionDate: string; // Date d'admission au format ISO ou YYYY-MM-DD
  specialty: string; // Spécialité médicale
  bedNumber?: number; // Numéro de lit (optionnel)
  // Ajout de nouveaux champs pour le dossier médical
  sexe: 'M' | 'F';
  diagnosticActuel: string;
  statut: 'Hospitalisé' | 'Ambulatoire';
  matricule: string;
}
// src/types/dashboard.ts
export interface KpiData {
  id: string;
  label: string;
  value: number;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode; // Optionnel - pour l'icône associée
}
export interface BedOccupancyStats {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
}

export interface HospitalizationTrend {
  labels: string[];
  data: number[];
}

export interface ChartData {
  label: string;
  value: number;
}


export interface GraphData {
  hospitalizations: ChartData[];
  bedOccupancy: ChartData[];
  hospitalizationReasons: ChartData[];
}
export interface Hospitalisation {
  id: string;
   litId: string;
  patientId: string;
  patientNom: string;
  dateAdmission: string;
  chambre: string;
  lit: string;
  motif: string;
  statut: 'En cours' | 'Sortie prévue';
}

// src/types/index.ts
// ... (gardez les types existants)

export type LitStatut = 'Libre' | 'Occupé' | 'En nettoyage' | 'En maintenance';

export interface Lit {
  id: string;
  numeroChambre: string;
  numeroLit: string;
  statut: LitStatut;
  patientId?: string;
  patientNom?: string;
}