// src/services/hospitalisationService.ts

import type { Hospitalisation } from "../types";
import type { HospitalisationFormData } from "../components/hospitalisations/hospitalisationSchema";

// Données simulées
const mockHospitalisations: Hospitalisation[] = [
  {
    id: 'hosp-001',
    patientId: 'pat-001',
    patientNom: 'Mamadou Lamine Faye',
    dateAdmission: '2025-07-01',
    chambre: '101',
    lit: 'A',
    motif: 'Suivi post-opératoire',
    statut: 'En cours'
  },
  {
    id: 'hosp-002',
    patientId: 'pat-003',
    patientNom: 'Ousmane Fall',
    dateAdmission: '2025-06-28',
    chambre: '102',
    lit: 'B',
    motif: 'Crise de polyarthrite',
    statut: 'Sortie prévue'
  },
  // Ajoutez d'autres hospitalisations si nécessaire
];

export const getHospitalisations = async (): Promise<Hospitalisation[]> => {
  console.log("Récupération de la liste des hospitalisations...");
  // Simule une latence réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockHospitalisations;
};

// Fonction pour planifier une nouvelle hospitalisation
export const planifierHospitalisation = async (data: HospitalisationFormData): Promise<Hospitalisation> => {
  console.log("Planification d'une nouvelle hospitalisation...", data);
  
  // Simule une latence réseau
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Génère un ID unique
  const newId = `hosp-${Date.now()}`;
  
  // Trouve le nom du patient (simulation)
  const patientNom = `Patient ID: ${data.patientId}`;
  
  // Crée la nouvelle hospitalisation
  const nouvelleHospitalisation: Hospitalisation = {
    id: newId,
    patientId: data.patientId,
    patientNom: patientNom,
    dateAdmission: data.dateAdmission,
    chambre: data.chambre,
    lit: data.lit,
    motif: data.motif,
    statut: 'En cours'
  };
  
  // Ajoute à la liste des hospitalisations (simulation)
  mockHospitalisations.push(nouvelleHospitalisation);
  
  console.log("Hospitalisation planifiée avec succès:", nouvelleHospitalisation);
  return nouvelleHospitalisation;
};

// Fonction pour mettre à jour une hospitalisation
export const updateHospitalisation = async (id: string, data: Partial<Hospitalisation>): Promise<Hospitalisation> => {
  console.log(`Mise à jour de l'hospitalisation ${id}...`, data);
  
  // Simule une latence réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockHospitalisations.findIndex(h => h.id === id);
  if (index === -1) {
    throw new Error('Hospitalisation non trouvée');
  }
  
  mockHospitalisations[index] = { ...mockHospitalisations[index], ...data };
  
  console.log("Hospitalisation mise à jour:", mockHospitalisations[index]);
  return mockHospitalisations[index];
};

// Fonction pour annuler une hospitalisation
export const annulerHospitalisation = async (id: string): Promise<void> => {
  console.log(`Annulation de l'hospitalisation ${id}...`);
  
  // Simule une latence réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockHospitalisations.findIndex(h => h.id === id);
  if (index === -1) {
    throw new Error('Hospitalisation non trouvée');
  }
  
  // Marque comme annulée ou supprime de la liste
  mockHospitalisations[index].statut = 'Sortie prévue';
  
  console.log("Hospitalisation annulée");
};