// src/services/patientService.ts

import type { Patient } from "../types";
import type { PatientFormData } from "../components/patient/patientSchema";
const mockPatients: Patient[] = [
  { id: 'pat-001', nomComplet: 'Mamadou Lamine Faye', age: 45, sexe: 'M', diagnosticActuel: 'Lupus érythémateux', statut: 'Hospitalisé' },
  { id: 'pat-002', nomComplet: 'Awa Diop', age: 32, sexe: 'F', diagnosticActuel: 'Psoriasis', statut: 'Ambulatoire' },
  { id: 'pat-003', nomComplet: 'Ousmane Fall', age: 60, sexe: 'M', diagnosticActuel: 'Polyarthrite rhumatoïde', statut: 'Hospitalisé' },
    { id: 'pat-004', nomComplet: 'Fatou Ndiaye', age: 28, sexe: 'F', diagnosticActuel: 'Sclérodermie', statut: 'Ambulatoire' },
    { id: 'pat-005', nomComplet: 'Ibrahima Sow', age: 50, sexe: 'M', diagnosticActuel: 'Dermatite atopique', statut: 'Hospitalisé' },
    { id: 'pat-006', nomComplet: 'Mariama Ba', age: 40, sexe: 'F', diagnosticActuel: '', statut: 'Ambulatoire' },
    { id: 'pat-007', nomComplet: 'Cheikh Mbaye', age: 55, sexe: 'M', diagnosticActuel: 'Vitiligo', statut: 'Hospitalisé' },
    { id: 'pat-008', nomComplet: 'Aissatou Diallo ', age: 30, sexe: 'F', diagnosticActuel: 'Eczéma', statut: 'Ambulatoire' },
    { id: 'pat-009', nomComplet: 'Boubacar Ndiaye', age: 65, sexe: 'M', diagnosticActuel: 'Acné rosacée', statut: 'Hospitalisé' },
    { id: 'pat-010', nomComplet: 'Sokhna Fall', age: 35, sexe: 'F', diagnosticActuel: 'Urticaire chronique', statut: 'Ambulatoire' },
    { id: 'pat-011', nomComplet: 'Moussa Sow', age: 48, sexe: 'M', diagnosticActuel: 'Kératose pilaire', statut: 'Hospitalisé' },
    { id: 'pat-012', nomComplet: 'Ndeye Diop', age: 29, sexe: 'F', diagnosticActuel: 'Rosacée', statut: 'Ambulatoire' },
    { id: 'pat-013', nomComplet: 'Lamine Faye ', age: 52, sexe: 'M', diagnosticActuel: 'Dermatophytose', statut: 'Hospitalisé' },
    { id: 'pat-014', nomComplet: 'Aissatou Sow', age: 38, sexe: 'F', diagnosticActuel: 'Lichen plan', statut: 'Ambulatoire' },
    { id: 'pat-015', nomComplet: 'Mamadou Ndiaye', age: 42, sexe: 'M', diagnosticActuel: 'Erythème noueux', statut: 'Hospitalisé' },
    { id: 'pat-016', nomComplet: 'Fatoumata Ba', age: 33, sexe: 'F', diagnosticActuel: 'Pityriasis rosé de Gibert', statut: 'Ambulatoire' },
    { id: 'pat-017', nomComplet: 'Oumar Diop', age: 47, sexe: 'M', diagnosticActuel: 'Lichen scléreux', statut: 'Hospitalisé' },
    { id: 'pat-018', nomComplet: 'Marieme Sow', age : 31, sexe: 'F', diagnosticActuel: 'Dermatite séborrhéique', statut: 'Ambulatoire' },
    { id: 'pat-019', nomComplet: 'Binta Ndiaye', age: 44, sexe: 'F', diagnosticActuel: 'Pustulose palmo-plantaire', statut: 'Hospitalisé' },
    { id: 'pat-020', nomComplet: 'Cheikh Fall', age: 39, sexe: 'M', diagnosticActuel: 'Angiome stellaire', statut: 'Ambulatoire' }
];

// Simule la récupération de la liste des patients
export const getPatients = async (): Promise<Patient[]> => {
  console.log("Récupération de la liste des patients...");
  await new Promise(resolve => setTimeout(resolve, 500)); // Simule la latence
  return mockPatients;
};

export const addPatient = async (patientData: PatientFormData): Promise<Patient> => {
    console.log("Ajout du patient...", patientData);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newPatient: Patient = {
        id: `pat-${Date.now()}`,
        ...patientData,
        diagnosticActuel: patientData.diagnosticActuel ?? "",
        statut: 'Ambulatoire' // Statut par défaut
    };
    mockPatients.push(newPatient);
    return newPatient;
};

export const getPatientById = async (id: string): Promise<Patient | undefined> => {
  console.log(`Récupération du patient avec l'ID: ${id}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPatients.find(p => p.id === id);
};


// Simule la mise à jour d'un patient
export const updatePatient = async (id: string, data: PatientFormData): Promise<Patient> => {
  console.log(`Mise à jour du patient ${id}`, data);
  await new Promise(resolve => setTimeout(resolve, 500));

  const patientIndex = mockPatients.findIndex(p => p.id === id);
  if (patientIndex === -1) {
    throw new Error("Patient non trouvé");
  }

  const updatedPatient = { ...mockPatients[patientIndex], ...data };
  mockPatients[patientIndex] = updatedPatient;

  return updatedPatient;
};