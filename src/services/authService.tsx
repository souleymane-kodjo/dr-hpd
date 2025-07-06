// src/services/authService.ts

import type { User } from "../types";

// Simulation d'un appel API
export const loginWithCredentials = async (email: string, pass: string): Promise<{ user: User, token: string }> => {
    console.log(`Tentative de connexion pour ${email} avec le mot de passe ${pass}`);

    // Simule une latence réseau
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === "medecin@hpd.sn" && pass === "password") {
        const mockUser: User = {
            id: '1',
            nom: 'Dr. Mariame Diallo',
            email: 'medecin@hpd.sn',
            roles: ['MEDECIN','ADMIN'],
            matricule: 'M-12345'
        };
        const mockToken = 'fake-jwt-token-string';

        return { user: mockUser, token: mockToken };
    }

    throw new Error("Identifiants incorrects");
};