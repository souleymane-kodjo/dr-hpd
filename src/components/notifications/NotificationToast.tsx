// src/components/notifications/NotificationToast.tsx
import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  IconButton,
  Chip,
  Slide,
  type SlideProps} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  LocalHospital as HospitalIcon,
  ExitToApp as ExitIcon,
  Bed as BedIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  NotificationsActive as NotificationIcon
} from '@mui/icons-material';
import type { NotificationType,
    NotificationPriority,
    Notification,


 } from '../../types';


interface NotificationToastProps {
  notification: Notification | null;
  open: boolean;
  onClose: () => void;
  onAction?: () => void;
}

const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="left" />;
};

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  open,
  onClose,
  onAction
}) => {
  const [autoHide, setAutoHide] = useState(true);

  useEffect(() => {
    if (notification?.priority === 'urgent') {
      setAutoHide(false);
    } else {
      setAutoHide(true);
    }
  }, [notification]);

  const getNotificationIcon = (type: NotificationType) => {
    const iconMap = {
      admission_request: <AssignmentIcon fontSize="small" />,
      admission_validated: <AssignmentIcon fontSize="small" />,
      admission_rejected: <AssignmentIcon fontSize="small" />,
      patient_admitted: <HospitalIcon fontSize="small" />,
      patient_discharged: <ExitIcon fontSize="small" />,
      bed_available: <BedIcon fontSize="small" />,
      urgent_request: <WarningIcon fontSize="small" />,
      system: <InfoIcon fontSize="small" />,
      reminder: <InfoIcon fontSize="small" />
    };
    return iconMap[type] || <NotificationIcon fontSize="small" />;
  };

  const getSeverity = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'info';
    }
  };

  const getPriorityLabel = (priority: NotificationPriority) => {
    const labelMap = {
      urgent: 'URGENT',
      high: 'ÉLEVÉE',
      medium: 'MOYENNE',
      low: 'BASSE'
    };
    return labelMap[priority];
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    const colorMap = {
      urgent: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    } as const;
    return colorMap[priority];
  };

  if (!notification) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHide ? 6000 : null}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
      sx={{
        top: { xs: 56, sm: 64 },
        right: 16,
        maxWidth: { xs: 'calc(100vw - 32px)', sm: 400 }
      }}
    >
      <Alert
        severity={getSeverity(notification.priority)}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {notification.actionUrl && (
              <IconButton
                size="small"
                onClick={() => {
                  if (onAction) {
                    onAction();
                  } else if (notification.actionUrl) {
                    window.open(notification.actionUrl, '_blank');
                  }
                  onClose();
                }}
                sx={{ color: 'inherit' }}
              >
                <AssignmentIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{
          width: '100%',
          alignItems: 'flex-start',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <AlertTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {getNotificationIcon(notification.type)}
          {notification.title}
          <Chip
            label={getPriorityLabel(notification.priority)}
            size="small"
            color={getPriorityColor(notification.priority)}
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 600
            }}
          />
        </AlertTitle>

        <Box sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          {notification.message}
        </Box>

        {notification.metadata?.patientId && (
          <Box sx={{ mt: 1, fontSize: '0.75rem', opacity: 0.8 }}>
            Patient: {notification.metadata.patientId}
          </Box>
        )}
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;
