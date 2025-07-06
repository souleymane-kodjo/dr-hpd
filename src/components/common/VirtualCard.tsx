// src/components/common/VirtualCard.tsx
import { Box, Paper, Typography, Avatar } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

interface VirtualCardProps {
  cardRef?: React.RefObject<HTMLDivElement | null>;
  nom: string;
  role: string;
  matricule: string;
}

const VirtualCard = ({ cardRef, nom, role, matricule }: VirtualCardProps) => {
  const qrValue = JSON.stringify({ nom, matricule });

  return (
    <Paper ref={cardRef} elevation={3} sx={{ p: 3, width: 350, backgroundColor: '#f5f5f5' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ width: 60, height: 60, mr: 2 }}>{nom.charAt(0)}</Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold">{nom}</Typography>
          <Typography color="text.secondary">{role}</Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
        <Box>
          <Typography variant="caption">Matricule</Typography>
          <Typography fontWeight="bold">{matricule}</Typography>
        </Box>
        <QRCodeSVG value={qrValue} size={80} />
      </Box>
    </Paper>
  );
};

export default VirtualCard;