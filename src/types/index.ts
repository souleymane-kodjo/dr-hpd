// src/types/index.ts
export interface User {
  id: string;
  nom: string;
  email: string;
  roles: string[];
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

