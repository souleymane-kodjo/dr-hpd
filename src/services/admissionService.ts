// src/services/admissionService.ts

import type { DemandeAdmission, ValidationAdmission } from "../types/admissions";
import { sendNotification } from './notificationService';

// Données simulées des demandes d'admission
const mockDemandesAdmission: DemandeAdmission[] = [
  {
    id: 'dem-001',
    patientId: 'pat-001',
    patientNom: 'Aminata Seck',
    patientAge: 34,
    patientSexe: 'F',
    motifAdmission: 'Surveillance post-opératoire césarienne',
    serviceRequis: 'Gynécologie-Obstétrique',
    medecinDemandeur: 'Dr. Fatou Diop',
    priorite: 'Normale',
    dateCreation: '2025-07-05T08:30:00',
    dateSouhaitee: '2025-07-07',
    statut: 'En attente',
    diagnosticProvisoire: 'Post-césarienne élective, surveillance maternelle',
    observationsSpeciales: 'Patient présentant une hypertension légère'
  },
  {
    id: 'dem-002',
    patientId: 'pat-002',
    patientNom: 'Moussa Ba',
    patientAge: 67,
    patientSexe: 'M',
    motifAdmission: 'Insuffisance cardiaque décompensée',
    serviceRequis: 'Cardiologie',
    medecinDemandeur: 'Dr. Omar Sy',
    priorite: 'Urgente',
    dateCreation: '2025-07-06T14:15:00',
    dateSouhaitee: '2025-07-06',
    statut: 'En attente',
    diagnosticProvisoire: 'Insuffisance cardiaque NYHA III',
    observationsSpeciales: 'Antécédents de diabète type 2'
  },
  {
    id: 'dem-003',
    patientId: 'pat-003',
    patientNom: 'Khadija Ndiaye',
    patientAge: 28,
    patientSexe: 'F',
    motifAdmission: 'Pneumonie bilatérale',
    serviceRequis: 'Pneumologie',
    medecinDemandeur: 'Dr. Cheikh Fall',
    priorite: 'Critique',
    dateCreation: '2025-07-06T16:45:00',
    dateSouhaitee: '2025-07-06',
    statut: 'Validée',
    commentaireMajor: 'Admission immédiate accordée - Chambre 205 attribuée',
    dateDecision: '2025-07-06T17:00:00',
    majorDecideur: 'Major A. Ndiaye',
    diagnosticProvisoire: 'Pneumonie bilatérale sévère'
  },
  {
    id: 'dem-004',
    patientId: 'pat-004',
    patientNom: 'Alassane Diallo',
    patientAge: 45,
    patientSexe: 'M',
    motifAdmission: 'Fracture complexe tibia-péroné',
    serviceRequis: 'Orthopédie',
    medecinDemandeur: 'Dr. Ibrahima Sarr',
    priorite: 'Normale',
    dateCreation: '2025-07-05T11:20:00',
    dateSouhaitee: '2025-07-08',
    statut: 'Rejetée',
    commentaireMajor: 'Lits indisponibles en orthopédie. Reprogrammer dans 10 jours.',
    dateDecision: '2025-07-05T16:30:00',
    majorDecideur: 'Major A. Ndiaye',
    diagnosticProvisoire: 'Fracture complexe membre inférieur droit'
  }
];

export const getDemandesAdmission = async (filtre?: 'En attente' | 'Validée' | 'Rejetée'): Promise<DemandeAdmission[]> => {
  console.log("Récupération des demandes d'admission...");
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (filtre) {
    return mockDemandesAdmission.filter(demande => demande.statut === filtre);
  }
  
  return mockDemandesAdmission;
};

export const validerDemandeAdmission = async (validation: ValidationAdmission): Promise<DemandeAdmission> => {
  console.log("Validation de la demande d'admission...", validation);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const demandeIndex = mockDemandesAdmission.findIndex(d => d.id === validation.demandeId);
  if (demandeIndex === -1) {
    throw new Error("Demande d'admission non trouvée");
  }
  
  const demande = mockDemandesAdmission[demandeIndex];
  
  // Mise à jour de la demande
  mockDemandesAdmission[demandeIndex] = {
    ...demande,
    statut: validation.statut,
    commentaireMajor: validation.commentaire,
    dateDecision: new Date().toISOString(),
    majorDecideur: 'Major A. Ndiaye' // À remplacer par l'utilisateur connecté
  };
  
  // Envoyer une notification selon le statut
  try {
    if (validation.statut === 'Validée') {
      await sendNotification({
        type: 'admission_validated',
        title: 'Demande d\'admission validée',
        message: `L'admission de ${demande.patientNom} a été validée pour le service ${demande.serviceRequis}`,
        priority: 'medium',
        targetRoles: ['DOCTEUR'],
        actionUrl: '/admin/major?tab=admissions',
        metadata: {
          patientId: demande.patientId,
          admissionId: demande.id,
          bedId: validation.litAttribue
        }
      });
    } else if (validation.statut === 'Rejetée') {
      await sendNotification({
        type: 'admission_rejected',
        title: 'Demande d\'admission rejetée',
        message: `L'admission de ${demande.patientNom} a été rejetée: ${validation.commentaire}`,
        priority: 'medium',
        targetRoles: ['DOCTEUR'],
        actionUrl: '/admin/major?tab=admissions',
        metadata: {
          patientId: demande.patientId,
          admissionId: demande.id
        }
      });
    }
  } catch (error) {
    console.warn('Erreur lors de l\'envoi de la notification:', error);
  }
  
  // Si validée et qu'on a un lit attribué, on peut créer l'hospitalisation
  if (validation.statut === 'Validée' && validation.litAttribue) {
    // TODO: Intégrer avec le service d'hospitalisation
    console.log(`Lit ${validation.litAttribue} attribué au patient ${demande.patientNom}`);
    
    // Notification pour la disponibilité du lit suivant
    try {
      await sendNotification({
        type: 'bed_available',
        title: 'Lit attribué',
        message: `Lit ${validation.litAttribue} attribué au patient ${demande.patientNom}`,
        priority: 'low',
        targetRoles: ['MAJOR_ADMINISTRATIF'],
        actionUrl: '/lits',
        metadata: {
          patientId: demande.patientId,
          bedId: validation.litAttribue
        }
      });
    } catch (error) {
      console.warn('Erreur lors de l\'envoi de la notification de lit:', error);
    }
  }
  
  return mockDemandesAdmission[demandeIndex];
};

export const getStatistiquesAdmissions = async () => {
  console.log("Récupération des statistiques d'admissions...");
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const total = mockDemandesAdmission.length;
  const enAttente = mockDemandesAdmission.filter(d => d.statut === 'En attente').length;
  const validees = mockDemandesAdmission.filter(d => d.statut === 'Validée').length;
  const rejetees = mockDemandesAdmission.filter(d => d.statut === 'Rejetée').length;
  
  return {
    total,
    enAttente,
    validees,
    rejetees,
    tauxValidation: total > 0 ? Math.round((validees / total) * 100) : 0
  };
};
