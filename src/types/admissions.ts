// src/types/admissions.ts

export interface DemandeAdmission {
  id: string;
  patientId: string;
  patientNom: string;
  patientAge: number;
  patientSexe: 'M' | 'F';
  motifAdmission: string;
  serviceRequis: string;
  medecinDemandeur: string;
  priorite: 'Normale' | 'Urgente' | 'Critique';
  dateCreation: string;
  dateSouhaitee: string;
  statut: 'En attente' | 'Validée' | 'Rejetée';
  commentaireMajor?: string;
  dateDecision?: string;
  majorDecideur?: string;
  diagnosticProvisoire: string;
  observationsSpeciales?: string;
}

export interface ValidationAdmission {
  demandeId: string;
  statut: 'Validée' | 'Rejetée';
  commentaire?: string;
  litAttribue?: string;
  chambreAttribuee?: string;
}
