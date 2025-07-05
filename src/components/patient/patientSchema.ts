// src/components/patients/patientSchema.ts
import { z } from 'zod';

export const patientSchema = z.object({
  nomComplet: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères." }),
  age: z.coerce.number().positive({ message: "L'âge doit être un nombre positif." }),
  sexe: z.enum(['M', 'F'], { errorMap: () => ({ message: "Veuillez sélectionner un sexe." }) }),
  diagnosticActuel: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;