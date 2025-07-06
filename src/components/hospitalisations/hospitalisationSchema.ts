// src/components/hospitalisations/hospitalisationSchema.ts
import { z } from 'zod';

export const hospitalisationSchema = z.object({
  patientId: z.string().min(1, 'Veuillez sélectionner un patient'),
  dateAdmission: z.string().min(1, 'La date d\'admission est requise'),
  dateSortiePrevue: z.string().optional(),
  motif: z.string().min(3, 'Le motif doit contenir au moins 3 caractères'),
  priorite: z.enum(['Urgence', 'Programmée', 'Semi-urgente'], {
    required_error: 'Veuillez sélectionner une priorité',
  }),
  service: z.string().min(1, 'Veuillez sélectionner un service'),
  chambre: z.string().min(1, 'Veuillez sélectionner une chambre'),
  lit: z.string().min(1, 'Veuillez sélectionner un lit'),
  medecin: z.string().min(1, 'Veuillez sélectionner un médecin'),
  observations: z.string().optional(),
});

export type HospitalisationFormData = z.infer<typeof hospitalisationSchema>;

// Options pour les sélections
export const prioriteOptions = [
  { value: 'Urgence', label: 'Urgence' },
  { value: 'Programmée', label: 'Programmée' },
  { value: 'Semi-urgente', label: 'Semi-urgente' },
];

export const serviceOptions = [
  { value: 'Cardiologie', label: 'Cardiologie' },
  { value: 'Chirurgie Générale', label: 'Chirurgie Générale' },
  { value: 'Pédiatrie', label: 'Pédiatrie' },
  { value: 'Gynécologie', label: 'Gynécologie' },
  { value: 'Orthopédie', label: 'Orthopédie' },
  { value: 'Neurologie', label: 'Neurologie' },
  { value: 'Pneumologie', label: 'Pneumologie' },
  { value: 'Dermatologie', label: 'Dermatologie' },
  { value: 'ORL', label: 'ORL' },
  { value: 'Urgences', label: 'Urgences' },
];

export const chambreOptions = [
  { value: 'C101', label: 'Chambre 101 - Cardiologie' },
  { value: 'C102', label: 'Chambre 102 - Cardiologie' },
  { value: 'C201', label: 'Chambre 201 - Chirurgie' },
  { value: 'C202', label: 'Chambre 202 - Chirurgie' },
  { value: 'P101', label: 'Chambre 101 - Pédiatrie' },
  { value: 'P102', label: 'Chambre 102 - Pédiatrie' },
  { value: 'G101', label: 'Chambre 101 - Gynécologie' },
  { value: 'O101', label: 'Chambre 101 - Orthopédie' },
  { value: 'N101', label: 'Chambre 101 - Neurologie' },
  { value: 'U101', label: 'Chambre 101 - Urgences' },
];

export const litOptions = [
  { value: 'A', label: 'Lit A' },
  { value: 'B', label: 'Lit B' },
  { value: 'C', label: 'Lit C' },
  { value: 'D', label: 'Lit D' },
];

export const medecinOptions = [
  { value: 'Dr. Amadou Diallo', label: 'Dr. Amadou Diallo - Cardiologie' },
  { value: 'Dr. Fatou Sow', label: 'Dr. Fatou Sow - Chirurgie Générale' },
  { value: 'Dr. Moussa Kane', label: 'Dr. Moussa Kane - Pédiatrie' },
  { value: 'Dr. Aissatou Ba', label: 'Dr. Aissatou Ba - Gynécologie' },
  { value: 'Dr. Ibrahima Sarr', label: 'Dr. Ibrahima Sarr - Orthopédie' },
  { value: 'Dr. Mariam Diouf', label: 'Dr. Mariam Diouf - Neurologie' },
  { value: 'Dr. Oumar Ndiaye', label: 'Dr. Oumar Ndiaye - Pneumologie' },
  { value: 'Dr. Khadija Fall', label: 'Dr. Khadija Fall - Dermatologie' },
  { value: 'Dr. Alassane Mbaye', label: 'Dr. Alassane Mbaye - ORL' },
  { value: 'Dr. Aminata Gueye', label: 'Dr. Aminata Gueye - Urgences' },
];
