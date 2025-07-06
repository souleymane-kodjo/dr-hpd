// src/components/common/ViewCardModal.tsx
import { useRef } from 'react';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { toPng } from 'html-to-image';
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
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore(); // Pour vérifier le rôle

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current);
      const link = document.createElement('a');
      link.download = `carte_${cardData.matricule}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erreur lors du téléchargement de la carte', err);
    }
  };

  // Condition pour afficher le bouton de téléchargement
  const canDownload = user?.roles.includes('ADMIN') || user?.roles.includes('CHEF_DE_SERVICE');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ p: 4 }}>
        <VirtualCard cardRef={cardRef} {...cardData} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        {canDownload && (
          <Button onClick={handleDownload} variant="contained">
            Télécharger
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewCardModal;