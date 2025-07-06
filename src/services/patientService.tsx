// src/services/patientService.ts

import type { Patient } from "../types";
import type { PatientFormData } from "../components/patient/patientSchema";
const mockPatients: Patient[] = [
  { id: 'pat-001', matricule: 'MAT-001', nomComplet: 'Mamadou Lamine Faye', name: 'Mamadou Lamine Faye', age: 45, sexe: 'M', diagnosticActuel: 'Lupus érythémateux', statut: 'Hospitalisé', admissionDate: '2024-01-01', specialty: 'Dermatologie' },
  { id: 'pat-002', matricule: 'MAT-002', nomComplet: 'Awa Diop', name: 'Awa Diop', age: 32, sexe: 'F', diagnosticActuel: 'Psoriasis', statut: 'Ambulatoire', admissionDate: '2024-01-02', specialty: 'Dermatologie' },
  { id: 'pat-003', matricule: 'MAT-003', nomComplet: 'Ousmane Fall', name: 'Ousmane Fall', age: 60, sexe: 'M', diagnosticActuel: 'Polyarthrite rhumatoïde', statut: 'Hospitalisé', admissionDate: '2024-01-03', specialty: 'Rhumatologie' },
  { id: 'pat-004', matricule: 'MAT-004', nomComplet: 'Fatou Ndiaye', name: 'Fatou Ndiaye', age: 28, sexe: 'F', diagnosticActuel: 'Sclérodermie', statut: 'Ambulatoire', admissionDate: '2024-01-04', specialty: 'Dermatologie' },
  { id: 'pat-005', matricule: 'MAT-005', nomComplet: 'Ibrahima Sow', name: 'Ibrahima Sow', age: 50, sexe: 'M', diagnosticActuel: 'Dermatite atopique', statut: 'Hospitalisé', admissionDate: '2024-01-05', specialty: 'Dermatologie' },
  { id: 'pat-006', matricule: 'MAT-006', nomComplet: 'Mariama Ba', name: 'Mariama Ba', age: 40, sexe: 'F', diagnosticActuel: '', statut: 'Ambulatoire', admissionDate: '2024-01-06', specialty: 'Dermatologie' },
  { id: 'pat-007', matricule: 'MAT-007', nomComplet: 'Cheikh Mbaye', name: 'Cheikh Mbaye', age: 55, sexe: 'M', diagnosticActuel: 'Vitiligo', statut: 'Hospitalisé', admissionDate: '2024-01-07', specialty: 'Dermatologie' },
  { id: 'pat-008', matricule: 'MAT-008', nomComplet: 'Aissatou Diallo ', name: 'Aissatou Diallo', age: 30, sexe: 'F', diagnosticActuel: 'Eczéma', statut: 'Ambulatoire', admissionDate: '2024-01-08', specialty: 'Dermatologie' },
  { id: 'pat-009', matricule: 'MAT-009', nomComplet: 'Boubacar Ndiaye', name: 'Boubacar Ndiaye', age: 65, sexe: 'M', diagnosticActuel: 'Acné rosacée', statut: 'Hospitalisé', admissionDate: '2024-01-09', specialty: 'Dermatologie' },
  { id: 'pat-010', matricule: 'MAT-010', nomComplet: 'Sokhna Fall', name: 'Sokhna Fall', age: 35, sexe: 'F', diagnosticActuel: 'Urticaire chronique', statut: 'Ambulatoire', admissionDate: '2024-01-10', specialty: 'Dermatologie' },
  { id: 'pat-011', matricule: 'MAT-011', nomComplet: 'Moussa Sow', name: 'Moussa Sow', age: 48, sexe: 'M', diagnosticActuel: 'Kératose pilaire', statut: 'Hospitalisé', admissionDate: '2024-01-11', specialty: 'Dermatologie' },
  { id: 'pat-012', matricule: 'MAT-012', nomComplet: 'Ndeye Diop', name: 'Ndeye Diop', age: 29, sexe: 'F', diagnosticActuel: 'Rosacée', statut: 'Ambulatoire', admissionDate: '2024-01-12', specialty: 'Dermatologie' },
  { id: 'pat-013', matricule: 'MAT-013', nomComplet: 'Lamine Faye ', name: 'Lamine Faye', age: 52, sexe: 'M', diagnosticActuel: 'Dermatophytose', statut: 'Hospitalisé', admissionDate: '2024-01-13', specialty: 'Dermatologie' },
  { id: 'pat-014', matricule: 'MAT-014', nomComplet: 'Aissatou Sow', name: 'Aissatou Sow', age: 38, sexe: 'F', diagnosticActuel: 'Lichen plan', statut: 'Ambulatoire', admissionDate: '2024-01-14', specialty: 'Dermatologie' },
  { id: 'pat-015', matricule: 'MAT-015', nomComplet: 'Mamadou Ndiaye', name: 'Mamadou Ndiaye', age: 42, sexe: 'M', diagnosticActuel: 'Erythème noueux', statut: 'Hospitalisé', admissionDate: '2024-01-15', specialty: 'Dermatologie' },
  { id: 'pat-016', matricule: 'MAT-016', nomComplet: 'Fatoumata Ba', name: 'Fatoumata Ba', age: 33, sexe: 'F', diagnosticActuel: 'Pityriasis rosé de Gibert', statut: 'Ambulatoire', admissionDate: '2024-01-16', specialty: 'Dermatologie' },
  { id: 'pat-017', matricule: 'MAT-017', nomComplet: 'Oumar Diop', name: 'Oumar Diop', age: 47, sexe: 'M', diagnosticActuel: 'Lichen scléreux', statut: 'Hospitalisé', admissionDate: '2024-01-17', specialty: 'Dermatologie' },
  { id: 'pat-018', matricule: 'MAT-018', nomComplet: 'Marieme Sow', name: 'Marieme Sow', age : 31, sexe: 'F', diagnosticActuel: 'Dermatite séborrhéique', statut: 'Ambulatoire', admissionDate: '2024-01-18', specialty: 'Dermatologie' },
  { id: 'pat-019', matricule: 'MAT-019', nomComplet: 'Binta Ndiaye', name: 'Binta Ndiaye', age: 44, sexe: 'F', diagnosticActuel: 'Pustulose palmo-plantaire', statut: 'Hospitalisé', admissionDate: '2024-01-19', specialty: 'Dermatologie' },
  { id: 'pat-020', matricule: 'MAT-020', nomComplet: 'Cheikh Fall', name: 'Cheikh Fall', age: 39, sexe: 'M', diagnosticActuel: 'Angiome stellaire', statut: 'Ambulatoire', admissionDate: '2024-01-20', specialty: 'Dermatologie' }
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
      matricule: `MAT-${Date.now()}`, // Always generate matricule
      name: patientData.nomComplet, // ✅ Compatible
      admissionDate: (patientData as Partial<Patient>).admissionDate ?? new Date().toISOString().slice(0, 10), // Compatible with missing property
      specialty: (patientData as Partial<Patient>).specialty ?? "", // Compatible with missing property
      diagnosticActuel: patientData.diagnosticActuel ?? "", // ✅ Compatible
      statut: 'Ambulatoire' // ✅ Compatible
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

export const dischargePatient = async (hospitalisationId: string, litId: string): Promise<{success: boolean}> => {
  console.log(`Sortie du patient pour l'hospitalisation ${hospitalisationId}`);
  await new Promise(resolve => setTimeout(resolve, 500));

  const hospiIndex = mockHospitalisations.findIndex(h => h.id === hospitalisationId);

  if (hospiIndex === -1) {
    throw new Error("Hospitalisation non trouvée.");
  }

  // 1. Mettre à jour le statut de l'hospitalisation
  mockHospitalisations[hospiIndex].statut = 'Sortie effectuée'; // Nouveau statut

  // 2. Mettre à jour le statut du lit pour qu'il soit nettoyé
  await updateLitStatus(litId, 'En nettoyage');

  return { success: true };
};