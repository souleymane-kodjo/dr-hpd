// src/pages/Admin/userSchema.ts
//Nous allons utiliser Zod pour valider les données du formulaire d'ajout/modification.
import { z } from 'zod';

// Schéma pour la création, où le mot de passe est requis
export const createUserSchema = z.object({
  nom: z.string().min(3, "Le nom est requis."),
  email: z.string().email("L'adresse email est invalide."),
  matricule: z.string().min(3, "Le matricule est requis."),
  roles: z.array(z.string()).nonempty("Au moins un rôle doit être sélectionné."),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
});

// Schéma pour la modification, où le mot de passe est optionnel
export const updateUserSchema = createUserSchema.extend({
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères.").optional().or(z.literal('')),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;