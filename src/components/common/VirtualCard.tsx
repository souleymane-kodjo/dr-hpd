// src/components/common/VirtualCard.tsx
import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Avatar,
  Typography,
  Box,
  Button,
  IconButton,
  Divider,
  Tooltip,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import FlipToFrontIcon from '@mui/icons-material/FlipToFront';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { styled } from '@mui/material/styles';

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
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
}

interface VirtualCardProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

const FlipCard = styled(Card)({
  perspective: '1000px',
  width: '450px',
  height: '282px',
  position: 'relative',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.6s',
});

const FlipCardFront = styled(CardContent)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  backgroundColor: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  padding: 0,
});

const FlipCardBack = styled(CardContent)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
  overflow: 'hidden',
  padding: 0,
  transform: 'rotateY(180deg)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const VirtualCard: React.FC<VirtualCardProps> = ({ isOpen, onClose, patient }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const id2 = 'DK-' + Math.random().toString(36).substring(2, 15).toUpperCase();

  const {
    name = 'Nom inconnu',
    lastName = '',
    age = '23',
    profession = 'Comptable',
    phoneNumber = 'Non renseigné',
    address = 'Non renseignée',
    bloodType = 'O+',
    allergies = 'Aucune connue',
    emergencyContact = 'Non renseigné',
    photo = 'https://via.placeholder.com/150'
  } = patient || {};

  const qrData = JSON.stringify({
    id: id2,
    name,
    lastName,
    age,
    profession,
    phoneNumber,
    address,
    bloodType,
    allergies,
    emergencyContact
  });

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          useCORS: true,
          allowTaint: true,
          scale: 2
        });
        const link = document.createElement('a');
        link.download = `HPD_Carte_Patient_${name}_${lastName}_${id2}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
      }
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 0, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Box
          ref={cardRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2,
            backgroundColor: '#f5f5f5'
          }}
        >
          <FlipCard sx={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
            {/* Face avant */}
            <FlipCardFront>
              {/* Header */}
              <Box
                sx={{
                  height: 56,
                  px: 2,
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(90deg, #0F4C81 0%, #1A5F9A 100%)',
                  borderBottom: '2px solid #2563EB',
                }}
              >
                <img
                  src="/images/logo.png"
                  alt="Logo"
                  style={{ height: 36, marginRight: 8 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/36x36?text=Logo';
                  }}
                />
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
              <Box sx={{ p: 2, display: 'flex', height: 'calc(100% - 56px)' }}>
                {/* Left Column */}
                <Box sx={{
                  width: '30%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Avatar
                    src={photo}
                    sx={{
                      width: 100,
                      height: 100,
                      border: '3px solid #0F4C81',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      Groupe sanguin
                    </Typography>
                    <Typography variant="h6" color="#d32f2f" fontWeight="bold">
                      {bloodType}
                    </Typography>
                  </Box>
                </Box>

                {/* Right Column */}
                <Box sx={{ width: '70%', pl: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#0F4C81">
                    {name} {lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: <strong>{id2}</strong> — Âge: <strong>{age} ans</strong>
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                        <img
                          src="https://flagcdn.com/w320/sn.png"
                          alt="SN"
                          style={{ height: 12, marginLeft: 6 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
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
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {address}
                      </Typography>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" color="textSecondary">
                        Allergies
                      </Typography>
                      <Typography variant="body2">{allergies}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </FlipCardFront>

            {/* Face arrière */}
            <FlipCardBack>
              <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QRCodeSVG
                  value={qrData}
                  size={180}
                  level="H"
                  includeMargin
                  bgColor="#f8f8f8"
                />
                <Typography variant="h6" sx={{ mt: 2, color: '#0F4C81' }}>
                  {name} {lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  ID: {id2}
                </Typography>

                <Box sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: 1,
                  width: '80%',
                  textAlign: 'center'
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Contact d'urgence
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {emergencyContact}
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ mt: 2, color: '#999' }}>
                  Scannez pour plus d'informations
                </Typography>
              </Box>
            </FlipCardBack>
          </FlipCard>

          {/* Footer */}
          <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2,
            px: 2
          }}>
            <Typography variant="caption" color="#0F4C81">
              Valide jusqu'au {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('fr-FR')}
            </Typography>
            <Typography variant="caption" color="#0F4C81">
              #{id2}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ mt: 2, px: 2, display: 'flex', gap: 2 }}>
          <Button
            onClick={handleFlip}
            variant="outlined"
            color="primary"
            startIcon={isFlipped ? <FlipToFrontIcon /> : <FlipToBackIcon />}
            sx={{ flex: 1 }}
          >
            {isFlipped ? 'Voir le recto' : 'Voir le verso'}
          </Button>
          <Button
            onClick={handleDownload}
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            sx={{ flex: 1 }}
          >
            Télécharger
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