// src/components/common/VirtualCard.tsx
import React, { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Avatar,
  Typography,
  Box,
  Button,
  IconButton,
  Divider,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

interface Patient {
  name?: string;
  lastName?: string;
  age?: string;
  admissionDate?: string;
  profession?: string;
  bedNumber?: string;
  roomType?: string;
  phoneNumber?: string;
  address?: string;
  id?: string;
  status?: string;
  photo?: string;
}

interface VirtualCardProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

const VirtualCard: React.FC<VirtualCardProps> = ({ isOpen, onClose, patient }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const id2 = 'DK-' + Math.random().toString(36).substring(2, 15).toUpperCase();
  const {
    name = 'Nom inconnu',
    lastName = '',
    age = '23',
    profession = 'Comptable',
    phoneNumber = 'Non renseigné',
    address = 'Non renseignée',
  } = patient || {};

  const qrData = JSON.stringify({
    id: id2,
    name,
    lastName,
    age,
    profession,
    phoneNumber,
    address,
  });

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          useCORS: true,
          allowTaint: true,
        });
        const link = document.createElement('a');
        link.download = `HPD_Carte_Patient_${name}_${lastName}_${id2}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 0, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Box
          ref={cardRef}
          sx={{
            width: 450,
            height: 282,
            bgcolor: 'white',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            fontFamily: 'Inter, Arial, sans-serif',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              height: 56,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'linear-gradient(90deg, #0F4C81 0%, #1A5F9A 100%)',
              background: 'linear-gradient(90deg, #0F4C81 0%, #1A5F9A 100%)',
              borderBottom: '2px solid #2563EB',
            }}
          >
            <img src="/images/logo.png" alt="Logo" style={{ height: 36, marginRight: 8 }} />
            <Box>
              <Typography variant="caption" color="white" fontWeight="bold">
                HÔPITAL PRINCIPAL DE DAKAR
              </Typography>
              <Typography variant="caption" color="white" sx={{ fontSize: 10 }}>
                Établissement de Référence Nationale
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto', bgcolor: 'white', color: '#0F4C81', px: 1, py: 0.5, borderRadius: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                CARTE PATIENT
              </Typography>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: 2, display: 'flex' }}>
            {/* Left Column */}
            <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={patient.photo || 'https://via.placeholder.com/150'}
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  border: '3px solid #0F4C81',
                }}
              />
              <QRCodeSVG value={qrData} size={80} />
            </Box>

            {/* Right Column */}
            <Box sx={{ width: '70%', pl: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="#0F4C81">
                {name} {lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Matricule : <strong>{id2}</strong> — Âge : <strong>{age}</strong>
              </Typography>

              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ width: '48%' }}>
                  <Typography variant="caption" color="textSecondary">
                    Profession
                  </Typography>
                  <Typography variant="body2">{profession}</Typography>
                </Box>

                <Box sx={{ width: '48%' }}>
                  <Typography variant="caption" color="textSecondary">
                    Nationalité
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2">Sénégalaise</Typography>
                    <img src="https://flagcdn.com/w320/sn.png" alt="SN" style={{ height: 12, marginLeft: 6 }} />
                  </Box>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <Typography variant="caption" color="textSecondary">
                    Téléphone
                  </Typography>
                  <Typography variant="body2">{phoneNumber}</Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <Typography variant="caption" color="textSecondary">
                    Adresse
                  </Typography>
                  <Typography variant="body2">{address}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              fontSize: 10,
              color: '#0F4C81'
            }}
          >
            <Typography variant="caption">
              Valide jusqu'au{' '}
              {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('fr-FR')}
            </Typography>
            <Typography variant="caption">www.mirahtec.com</Typography>
            <Typography variant="caption" sx={{ color: 'gray' }}>
              #{id2}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ mt: 2, px: 2 }}>
          <Button
            onClick={handleDownload}
            variant="contained"
            fullWidth
            color="primary"
            startIcon={<DownloadIcon />}
          >
            Télécharger la carte
          </Button>
        </Box>

        <Tooltip title="Fermer">
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', top: 8, right: 8 }}
            color="error"
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualCard;