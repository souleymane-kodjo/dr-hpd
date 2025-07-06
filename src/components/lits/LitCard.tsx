// src/components/lits/LitCard.tsx
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem 
} from '@mui/material';
import { 
  Hotel, 
  CleaningServices, 
  Bed, 
  Build, 
  MoreVert 
} from '@mui/icons-material';
import type { Lit, LitStatut } from '../../types';

const statusConfig: { [key in LitStatut]: { icon: React.ReactElement, color: string, label: string } } = {
  'Libre': { icon: <Bed />, color: 'success.main', label: 'Libre' },
  'Occupé': { icon: <Hotel />, color: 'error.main', label: 'Occupé' },
  'En nettoyage': { icon: <CleaningServices />, color: 'info.main', label: 'Nettoyage' },
  'En maintenance': { icon: <Build />, color: 'warning.main', label: 'Maintenance' },
};

interface LitCardProps {
  lit: Lit;
  onStatusChange: (id: string, newStatus: LitStatut) => void;
}

const LitCard = ({ lit, onStatusChange }: LitCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const config = statusConfig[lit.statut];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (newStatus: LitStatut) => {
    onStatusChange(lit.id, newStatus);
    handleClose();
  };

  // Définir les actions possibles en fonction du statut actuel
  const possibleActions: { label: string, status: LitStatut }[] = [];
  if (lit.statut === 'Libre') {
    possibleActions.push({ label: 'Mettre en maintenance', status: 'En maintenance' });
  } else if (lit.statut === 'Occupé') {
    possibleActions.push({ label: 'Libérer le lit (nettoyage)', status: 'En nettoyage' });
  } else if (lit.statut === 'En nettoyage' || lit.statut === 'En maintenance') {
    possibleActions.push({ label: 'Rendre disponible', status: 'Libre' });
  }

  return (
    <Card sx={{ borderLeft: `5px solid ${config.color}`, height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" component="div">
            Ch. {lit.numeroChambre} - Lit {lit.numeroLit}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ color: config.color }}>
              {config.icon}
            </Box>
            <IconButton size="small" onClick={handleClick}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
        
        <Typography sx={{ mt: 1.5 }} color="text.secondary">
          Statut: <Typography component="span" fontWeight="bold" color={config.color}>
            {config.label}
          </Typography>
        </Typography>
        
        {lit.statut === 'Occupé' && lit.patientNom && (
          <Typography sx={{ mt: 0.5 }} variant="body2">
            Patient: {lit.patientNom}
          </Typography>
        )}

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          {possibleActions.map(action => (
            <MenuItem key={action.status} onClick={() => handleMenuClick(action.status)}>
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      </CardContent>
    </Card>
  );
};

export default LitCard;