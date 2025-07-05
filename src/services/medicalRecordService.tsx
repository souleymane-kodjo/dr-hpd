// services/medicalRecordService.tsx
import { axiosClient } from '../api/axiosClient';

// Types pour les dossiers médicaux
export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  type: 'consultation' | 'hospitalisation' | 'examen' | 'traitement' | 'chirurgie' | 'diagnostic';
  date: string;
  doctor: string;
  specialty: string;
  description: string;
  results?: string;
  notes?: string;
  severity?: 'critique' | 'élevée' | 'modérée' | 'faible';
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordData {
  patientId: string;
  title: string;
  type: MedicalRecord['type'];
  date: string;
  doctor: string;
  specialty: string;
  description: string;
  results?: string;
  notes?: string;
  severity?: MedicalRecord['severity'];
  attachments?: string[];
}

export interface UpdateMedicalRecordData extends Partial<CreateMedicalRecordData> {
  id: string;
}

// Données de test pour le développement
const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'mr-001',
    patientId: 'pat-001',
    title: 'Consultation initiale - Dermatologie',
    type: 'consultation',
    date: '2024-12-15',
    doctor: 'Dr. Martin Dubois',
    specialty: 'Dermatologie',
    description: 'Consultation pour éruption cutanée. Patient présente des plaques rougeâtres sur les bras et le torse depuis 10 jours.',
    results: 'Diagnostic probable : dermatite de contact. Prescriptions de corticoïdes topiques.',
    notes: 'Patient allergique aux fruits à coque. Revoir dans 2 semaines.',
    severity: 'modérée',
    attachments: [],
    createdAt: '2024-12-15T09:30:00Z',
    updatedAt: '2024-12-15T09:30:00Z'
  },
  {
    id: 'mr-002',
    patientId: 'pat-001',
    title: 'Analyse sanguine de contrôle',
    type: 'examen',
    date: '2024-12-10',
    doctor: 'Dr. Sarah Laurent',
    specialty: 'Biologie médicale',
    description: 'Bilan sanguin complet pour suivi post-traitement.',
    results: 'Résultats dans les normes. Légère augmentation des globules blancs (10 500/μL).',
    notes: 'Contrôle recommandé dans 3 mois.',
    severity: 'faible',
    attachments: ['analyse_sang_20241210.pdf'],
    createdAt: '2024-12-10T14:15:00Z',
    updatedAt: '2024-12-10T14:15:00Z'
  },
  {
    id: 'mr-003',
    patientId: 'pat-002',
    title: 'Intervention chirurgicale - Appendicectomie',
    type: 'chirurgie',
    date: '2024-12-08',
    doctor: 'Dr. Pierre Moreau',
    specialty: 'Chirurgie générale',
    description: 'Appendicectomie laparoscopique en urgence pour appendicite aiguë.',
    results: 'Intervention réussie sans complications. Durée : 45 minutes.',
    notes: 'Surveillance post-opératoire 48h. Sortie prévue demain matin.',
    severity: 'élevée',
    attachments: ['rapport_op_20241208.pdf', 'radio_controle.jpg'],
    createdAt: '2024-12-08T16:45:00Z',
    updatedAt: '2024-12-08T20:30:00Z'
  },
  {
    id: 'mr-004',
    patientId: 'pat-003',
    title: 'Hospitalisation - Surveillance cardiaque',
    type: 'hospitalisation',
    date: '2024-12-12',
    doctor: 'Dr. Anne Leroy',
    specialty: 'Cardiologie',
    description: 'Hospitalisation pour surveillance après malaise cardiaque.',
    results: 'ECG normal, troponines négatives. Pas de signe d\'infarctus.',
    notes: 'Patient stable. Sortie autorisée avec traitement préventif.',
    severity: 'modérée',
    attachments: ['ecg_20241212.pdf'],
    createdAt: '2024-12-12T08:00:00Z',
    updatedAt: '2024-12-13T10:00:00Z'
  },
  {
    id: 'mr-005',
    patientId: 'pat-001',
    title: 'Traitement antibiotique',
    type: 'traitement',
    date: '2024-12-05',
    doctor: 'Dr. Martin Dubois',
    specialty: 'Dermatologie',
    description: 'Prescription d\'antibiotiques pour infection cutanée secondaire.',
    results: 'Amélioration notable après 5 jours de traitement.',
    notes: 'Traitement à poursuivre 10 jours. Contrôle prévu.',
    severity: 'modérée',
    attachments: [],
    createdAt: '2024-12-05T11:20:00Z',
    updatedAt: '2024-12-05T11:20:00Z'
  }
];

// Services API
export const getMedicalRecords = async (): Promise<MedicalRecord[]> => {
  try {
    // En mode développement, utiliser les données de test
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simule un délai réseau
      return mockMedicalRecords;
    }

    const response = await axiosClient.get<MedicalRecord[]>('/medical-records');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers médicaux:', error);
    // Fallback sur les données de test en cas d'erreur
    return mockMedicalRecords;
  }
};

export const getMedicalRecordsByPatient = async (patientId: string): Promise<MedicalRecord[]> => {
  try {
    // En mode développement, filtrer les données de test
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simule un délai réseau
      return mockMedicalRecords.filter(record => record.patientId === patientId);
    }

    const response = await axiosClient.get<MedicalRecord[]>(`/medical-records/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers médicaux du patient:', error);
    // Fallback sur les données de test filtrées
    return mockMedicalRecords.filter(record => record.patientId === patientId);
  }
};

export const getMedicalRecordById = async (recordId: string): Promise<MedicalRecord | null> => {
  try {
    // En mode développement, chercher dans les données de test
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockMedicalRecords.find(record => record.id === recordId) || null;
    }

    const response = await axiosClient.get<MedicalRecord>(`/medical-records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du dossier médical:', error);
    // Fallback sur les données de test
    return mockMedicalRecords.find(record => record.id === recordId) || null;
  }
};

export const createMedicalRecord = async (data: CreateMedicalRecordData): Promise<MedicalRecord> => {
  try {
    // En mode développement, simuler la création
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 400));

      const newRecord: MedicalRecord = {
        id: `mr-${Date.now()}`,
        ...data,
        attachments: data.attachments || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockMedicalRecords.push(newRecord);
      return newRecord;
    }

    const response = await axiosClient.post<MedicalRecord>('/medical-records', data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du dossier médical:', error);
    throw new Error('Impossible de créer le dossier médical');
  }
};

export const updateMedicalRecord = async (data: UpdateMedicalRecordData): Promise<MedicalRecord> => {
  try {
    // En mode développement, simuler la mise à jour
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 300));

      const index = mockMedicalRecords.findIndex(record => record.id === data.id);
      if (index === -1) {
        throw new Error('Dossier médical non trouvé');
      }

      const updatedRecord: MedicalRecord = {
        ...mockMedicalRecords[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      mockMedicalRecords[index] = updatedRecord;
      return updatedRecord;
    }

    const response = await axiosClient.put<MedicalRecord>(`/medical-records/${data.id}`, data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du dossier médical:', error);
    throw new Error('Impossible de mettre à jour le dossier médical');
  }
};

export const deleteMedicalRecord = async (recordId: string): Promise<void> => {
  try {
    // En mode développement, simuler la suppression
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 200));

      const index = mockMedicalRecords.findIndex(record => record.id === recordId);
      if (index === -1) {
        throw new Error('Dossier médical non trouvé');
      }

      mockMedicalRecords.splice(index, 1);
      return;
    }

    await axiosClient.delete(`/medical-records/${recordId}`);
  } catch (error) {
    console.error('Erreur lors de la suppression du dossier médical:', error);
    throw new Error('Impossible de supprimer le dossier médical');
  }
};

// Services utilitaires
export const getMedicalRecordsByType = async (type: MedicalRecord['type']): Promise<MedicalRecord[]> => {
  const allRecords = await getMedicalRecords();
  return allRecords.filter(record => record.type === type);
};

export const getMedicalRecordsBySeverity = async (severity: MedicalRecord['severity']): Promise<MedicalRecord[]> => {
  const allRecords = await getMedicalRecords();
  return allRecords.filter(record => record.severity === severity);
};

export const getMedicalRecordsByDateRange = async (startDate: string, endDate: string): Promise<MedicalRecord[]> => {
  const allRecords = await getMedicalRecords();
  return allRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
  });
};

export const searchMedicalRecords = async (query: string): Promise<MedicalRecord[]> => {
  const allRecords = await getMedicalRecords();
  const searchTerm = query.toLowerCase();

  return allRecords.filter(record =>
    record.title.toLowerCase().includes(searchTerm) ||
    record.description.toLowerCase().includes(searchTerm) ||
    record.doctor.toLowerCase().includes(searchTerm) ||
    record.specialty.toLowerCase().includes(searchTerm) ||
    (record.results && record.results.toLowerCase().includes(searchTerm)) ||
    (record.notes && record.notes.toLowerCase().includes(searchTerm))
  );
};

export default {
  getMedicalRecords,
  getMedicalRecordsByPatient,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecordsByType,
  getMedicalRecordsBySeverity,
  getMedicalRecordsByDateRange,
  searchMedicalRecords
};
