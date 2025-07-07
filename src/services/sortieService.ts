// src/services/sortieService.ts

import type { SortiePatient, HistoriqueHospitalisation } from "../types";

// Données simulées des sorties
const mockSorties: SortiePatient[] = [
  {
    id: 'sortie-001',
    hospitalisationId: 'hosp-003',
    patientId: 'pat-005',
    patientNom: 'Aïssatou Diagne',
    dateSortie: '2025-07-05',
    heureSortie: '14:30',
    typeSortie: 'Normale',
    etatSortie: 'Guéri',
    prescriptionsSortie: 'Paracétamol 1g x2/jour pendant 3 jours',
    rendezvousSuivi: '2025-07-12 à 10h00 - Consultation de contrôle',
    commentaires: 'Patient en bon état général, cicatrisation normale',
    majorValidant: 'Major A. Ndiaye',
    dateValidation: '2025-07-05T14:45:00'
  },
  {
    id: 'sortie-002',
    hospitalisationId: 'hosp-004',
    patientId: 'pat-006',
    patientNom: 'Modou Gueye',
    dateSortie: '2025-07-04',
    heureSortie: '09:15',
    typeSortie: 'Transfert',
    destinationTransfert: 'Hôpital Le Dantec - Service de Neurologie',
    etatSortie: 'Stationnaire',
    prescriptionsSortie: 'Traitement en cours à maintenir',
    commentaires: 'Transfert pour examens spécialisés complémentaires',
    majorValidant: 'Major A. Ndiaye',
    dateValidation: '2025-07-04T09:30:00'
  }
];

// Données simulées de l'historique
const mockHistorique: HistoriqueHospitalisation[] = [
  {
    id: 'hist-001',
    patientId: 'pat-001',
    patientNom: 'Mamadou Lamine Faye',
    dateAdmission: '2025-07-01',
    motifAdmission: 'Suivi post-opératoire',
    serviceHospitalisation: 'Chirurgie générale',
    chambre: '101',
    lit: 'A',
    statut: 'En cours'
  },
  {
    id: 'hist-002',
    patientId: 'pat-005',
    patientNom: 'Aïssatou Diagne',
    dateAdmission: '2025-07-01',
    dateSortie: '2025-07-05',
    dureeHospitalisation: 4,
    motifAdmission: 'Appendicectomie',
    serviceHospitalisation: 'Chirurgie générale',
    chambre: '103',
    lit: 'B',
    typeSortie: 'Normale',
    etatSortie: 'Guéri',
    statut: 'Terminée'
  },
  {
    id: 'hist-003',
    patientId: 'pat-006',
    patientNom: 'Modou Gueye',
    dateAdmission: '2025-06-28',
    dateSortie: '2025-07-04',
    dureeHospitalisation: 6,
    motifAdmission: 'AVC ischémique',
    serviceHospitalisation: 'Médecine interne',
    chambre: '205',
    lit: 'A',
    typeSortie: 'Transfert',
    etatSortie: 'Stationnaire',
    statut: 'Terminée'
  },
  {
    id: 'hist-004',
    patientId: 'pat-007',
    patientNom: 'Fatou Mbaye',
    dateAdmission: '2025-06-20',
    dateSortie: '2025-06-25',
    dureeHospitalisation: 5,
    motifAdmission: 'Pneumonie',
    serviceHospitalisation: 'Pneumologie',
    chambre: '301',
    lit: 'C',
    typeSortie: 'Normale',
    etatSortie: 'Guéri',
    statut: 'Terminée'
  }
];

export const getSorties = async (patientId?: string): Promise<SortiePatient[]> => {
  console.log("Récupération des sorties...");
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (patientId) {
    return mockSorties.filter(sortie => sortie.patientId === patientId);
  }
  
  return mockSorties;
};

export const enregistrerSortie = async (sortieData: Omit<SortiePatient, 'id' | 'dateValidation' | 'majorValidant'>): Promise<SortiePatient> => {
  console.log("Enregistrement de la sortie...", sortieData);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const nouvelleSortie: SortiePatient = {
    ...sortieData,
    id: `sortie-${Date.now()}`,
    majorValidant: 'Major A. Ndiaye', // À remplacer par l'utilisateur connecté
    dateValidation: new Date().toISOString()
  };
  
  mockSorties.push(nouvelleSortie);
  
  // Mettre à jour l'historique
  const histoIndex = mockHistorique.findIndex(h => h.id === sortieData.hospitalisationId);
  if (histoIndex !== -1) {
    mockHistorique[histoIndex] = {
      ...mockHistorique[histoIndex],
      dateSortie: sortieData.dateSortie,
      typeSortie: sortieData.typeSortie,
      etatSortie: sortieData.etatSortie,
      statut: 'Terminée',
      dureeHospitalisation: Math.ceil(
        (new Date(sortieData.dateSortie).getTime() - new Date(mockHistorique[histoIndex].dateAdmission).getTime()) 
        / (1000 * 60 * 60 * 24)
      )
    };
  }
  
  return nouvelleSortie;
};

export const getHistoriqueHospitalisations = async (filtre?: {
  patientId?: string;
  dateDebut?: string;
  dateFin?: string;
  service?: string;
  statut?: 'En cours' | 'Terminée' | 'Annulée';
}): Promise<HistoriqueHospitalisation[]> => {
  console.log("Récupération de l'historique des hospitalisations...", filtre);
  await new Promise(resolve => setTimeout(resolve, 600));
  
  let resultats = [...mockHistorique];
  
  if (filtre) {
    if (filtre.patientId) {
      resultats = resultats.filter(h => h.patientId === filtre.patientId);
    }
    
    if (filtre.statut) {
      resultats = resultats.filter(h => h.statut === filtre.statut);
    }
    
    if (filtre.service) {
      resultats = resultats.filter(h => h.serviceHospitalisation.toLowerCase().includes(filtre.service!.toLowerCase()));
    }
    
    if (filtre.dateDebut) {
      resultats = resultats.filter(h => h.dateAdmission >= filtre.dateDebut!);
    }
    
    if (filtre.dateFin) {
      resultats = resultats.filter(h => 
        h.dateSortie ? h.dateSortie <= filtre.dateFin! : true
      );
    }
  }
  
  // Trier par date d'admission décroissante
  return resultats.sort((a, b) => new Date(b.dateAdmission).getTime() - new Date(a.dateAdmission).getTime());
};

export const getStatistiquesHospitalisations = async () => {
  console.log("Récupération des statistiques d'hospitalisations...");
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const total = mockHistorique.length;
  const enCours = mockHistorique.filter(h => h.statut === 'En cours').length;
  const terminees = mockHistorique.filter(h => h.statut === 'Terminée').length;
  const annulees = mockHistorique.filter(h => h.statut === 'Annulée').length;
  
  const dureesMoyennes = mockHistorique
    .filter(h => h.dureeHospitalisation)
    .map(h => h.dureeHospitalisation!);
  
  const dureeMoyenne = dureesMoyennes.length > 0 
    ? Math.round(dureesMoyennes.reduce((a, b) => a + b, 0) / dureesMoyennes.length)
    : 0;
  
  return {
    total,
    enCours,
    terminees,
    annulees,
    dureeMoyenne,
    tauxOccupation: total > 0 ? Math.round((enCours / total) * 100) : 0
  };
};
