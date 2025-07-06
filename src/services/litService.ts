// src/services/litService.ts

import type { Lit, LitStatut } from "../types";

const mockLits: Lit[] = [
  { id: 'lit-101-a', numeroChambre: '101', numeroLit: 'A', statut: 'Occupé', patientId: 'pat-001', patientNom: 'Mamadou L. Faye' },
  { id: 'lit-101-b', numeroChambre: '101', numeroLit: 'B', statut: 'Libre' },
  { id: 'lit-102-a', numeroChambre: '102', numeroLit: 'A', statut: 'Libre' },
  { id: 'lit-102-b', numeroChambre: '102', numeroLit: 'B', statut: 'Occupé', patientId: 'pat-003', patientNom: 'Ousmane Fall' },
  { id: 'lit-103-a', numeroChambre: '103', numeroLit: 'A', statut: 'En nettoyage' },
  { id: 'lit-103-b', numeroChambre: '103', numeroLit: 'B', statut: 'En maintenance' },
  { id : 'lit-104-a', numeroChambre: '104', numeroLit: 'A', statut: 'Libre' },
  { id: 'lit-104-b', numeroChambre: '104', numeroLit: 'B', statut: 'Libre' },
  { id: 'lit-105-a', numeroChambre: '105', numeroLit: 'A', statut: 'Occupé', patientId: 'pat-005', patientNom: 'Ibrahima Sow' },
];
export const getLits = async (): Promise<Lit[]> => {
  console.log("Récupération de l'état des lits...");
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockLits;
};

export const updateLitStatus = async (id: string, statut: LitStatut): Promise<Lit> => {
  console.log(`Mise à jour du statut du lit ${id} à ${statut}`);
  await new Promise(resolve => setTimeout(resolve, 300));

  const litIndex = mockLits.findIndex(l => l.id === id);
  if (litIndex === -1) {
    throw new Error("Lit non trouvé.");
  }

  mockLits[litIndex].statut = statut;
  // Si le lit devient libre, on enlève les infos du patient
  if (statut === 'Libre' || statut === 'En nettoyage' || statut === 'En maintenance') {
    delete mockLits[litIndex].patientId;
    delete mockLits[litIndex].patientNom;
  }

  return mockLits[litIndex];
};