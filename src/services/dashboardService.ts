// src/services/dashboardService.ts

import type { KpiData, Patient } from "../types";

// Données mockées pour les KPIs
const mockKPIs: KpiData[] = [
  {
    id: 'medical-records',
    label: 'Dossiers médicaux',
    value: 245,
    unit: '',
    change: '+12%'
  },
  {
    id: 'bed-occupancy',
    label: 'Taux d\'occupation',
    value: 78,
    unit: '%',
    change: '-3%'
  },
  {
    id: 'avg-stay',
    label: 'Durée moyenne',
    value: 4.2,
    unit: 'j',
    change: '+0.5j'
  },
  {
    id: 'current-hospitalizations',
    label: 'Hospitalisations',
    value: 45,
    unit: '',
    change: '+8%'
  },
  {
    id: 'avg-wait-time',
    label: 'Temps d\'attente',
    value: 32,
    unit: 'min',
    change: '-5min'
  }
];

// Données mockées pour les patients hospitalisés
const mockHospitalizedPatients: Patient[] = [
  {
      id: 'pat-001',
      name: 'Mamadou Lamine Faye',
      age: 45,
      admissionDate: '2023-05-15',
      specialty: 'Dermatologie',
      bedNumber: 101,
      nomComplet: "",
      sexe: "M",
      diagnosticActuel: "",
      statut: "Hospitalisé"
  },
  {
      id: 'pat-003',
      name: 'Ousmane Fall',
      age: 60,
      admissionDate: '2023-05-16',
      specialty: 'Rhumatologie',
      bedNumber: 102,
      nomComplet: "",
      sexe: "M",
      diagnosticActuel: "",
      statut: "Hospitalisé"
  },
  {
      id: 'pat-005',
      name: 'Ibrahima Sow',
      age: 50,
      admissionDate: '2023-05-17',
      specialty: 'Dermatologie',
      bedNumber: 103,
      nomComplet: "",
      sexe: "M",
      diagnosticActuel: "",
      statut: "Hospitalisé"
  },
  {
      id: 'pat-007',
      name: 'Cheikh Mbaye',
      age: 55,
      admissionDate: '2023-05-18',
      specialty: 'Dermatologie',
      bedNumber: 104,
      nomComplet: "",
      sexe: "M",
      diagnosticActuel: "",
      statut: "Hospitalisé"
  },
  {
      id: 'pat-009',
      name: 'Boubacar Ndiaye',
      age: 65,
      admissionDate: '2023-05-19',
      specialty: 'Rhumatologie',
      bedNumber: 105,
      nomComplet: "",
      sexe: "M",
      diagnosticActuel: "",
      statut: "Hospitalisé"
  }
];

/**
 * Récupère les indicateurs de performance (KPIs)
 */
export const getKPIs = async (): Promise<KpiData[]> => {
  console.log("Récupération des indicateurs de performance...");
  await new Promise(resolve => setTimeout(resolve, 500)); // Simule la latence
  return mockKPIs;
};

/**
 * Récupère la liste des patients hospitalisés
 */
export const getHospitalizedPatients = async (): Promise<Patient[]> => {
  console.log("Récupération des patients hospitalisés...");
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockHospitalizedPatients;
};

/**
 * Récupère les statistiques d'occupation des lits
 */
export const getBedOccupancyStats = async () => {
  console.log("Récupération des stats d'occupation...");
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    totalBeds: 120,
    occupiedBeds: mockHospitalizedPatients.length,
    availableBeds: 120 - mockHospitalizedPatients.length,
    occupancyRate: Math.round((mockHospitalizedPatients.length / 120) * 100)
  };
};

/**
 * Récupère les tendances des hospitalisations
 */
export const getHospitalizationTrends = async () => {
  console.log("Récupération des tendances...");
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [35, 42, 38, 45, 50, 47]
  };
};