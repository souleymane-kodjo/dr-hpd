// src/components/hospitalisations/HospitalisationNotifications.tsx
import React from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

interface HospitalisationNotificationsProps {
  open: boolean;
  onClose: () => void;
  severity: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

const HospitalisationNotifications: React.FC<HospitalisationNotificationsProps> = ({
  open,
  onClose,
  severity,
  title,
  message,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default HospitalisationNotifications;
