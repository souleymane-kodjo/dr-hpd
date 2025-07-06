// src/services/userService.ts

import type { User } from "../types";


// Notre base de données simulée d'utilisateurs
let mockUsers: User[] = [
  { id: '1', nom: 'Dr. Mariame Diallo', email: 'medecin@hpd.sn', roles: ['MEDECIN'], matricule: 'M-12345' },
  { id: '2', nom: 'Souleymane Kodjo', email: 'admin@hpd.sn', roles: ['ADMIN'], matricule: 'A-54321' },
  { id: '3', nom: 'Major A. Ndiaye', email: 'major@hpd.sn', roles: ['MAJOR_ADMINISTRATIF'], matricule: 'MA-11223' },
];

export const getUsers = async (): Promise<User[]> => {
  console.log("Récupération de la liste des utilisateurs...");
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockUsers;
};

// Note : le mot de passe est géré côté backend, on ne le manipule pas ici.
export const addUser = async (data: Omit<User, 'id'>): Promise<User> => {
  console.log("Ajout d'un utilisateur...", data);
  await new Promise(resolve => setTimeout(resolve, 500));
  const newUser: User = { ...data, id: `user-${Date.now()}` };
  mockUsers.push(newUser);
  return newUser;
};