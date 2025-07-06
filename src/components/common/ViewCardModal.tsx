// src/components/common/ViewCardModal.tsx
import VirtualCard from './VirtualCard';
import { useAuthStore } from '../../store/authStore';

interface ViewCardModalProps {
  open: boolean;
  onClose: () => void;
  cardData: {
    nom: string;
    role: string;
    matricule: string;
  };
}

const ViewCardModal = ({ open, onClose, cardData }: ViewCardModalProps) => {
  const { user } = useAuthStore(); // Pour vérifier le rôle

  // Conversion des données pour la nouvelle interface VirtualCard
  const patientData = {
    name: cardData.nom.split(' ')[0] || cardData.nom,
    lastName: cardData.nom.split(' ').slice(1).join(' ') || '',
    profession: cardData.role,
    id: cardData.matricule,
    age: '25', // Valeur par défaut
    phoneNumber: 'Non renseigné',
    address: 'Non renseignée',
  };

  // Condition pour afficher le modal
  const canView = user?.roles.includes('ADMIN') || user?.roles.includes('CHEF_DE_SERVICE');

  if (!canView) {
    return null;
  }

  return (
    <VirtualCard
      isOpen={open}
      onClose={onClose}
      patient={patientData}
    />
  );
};

export default ViewCardModal;