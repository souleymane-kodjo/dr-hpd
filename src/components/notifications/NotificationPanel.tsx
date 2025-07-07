// src/components/notifications/NotificationPanel.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  NotificationsActive as NotificationIcon,
  Assignment as AssignmentIcon,
  LocalHospital as HospitalIcon,
  ExitToApp as ExitIcon,
  Bed as BedIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import type { Notification, NotificationPriority, NotificationType } from '../../types/notifications';
import NotificationSettings from './NotificationSettings';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div hidden={value !== index} style={{ height: '100%' }}>
      {value === index && children}
    </div>
  );
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'all'>('all');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    notifications,
    loading,
    error,
    soundEnabled,
    connected,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    connectRealTime,
    disconnectRealTime,
    toggleSound,
    clearError
  } = useNotificationStore();

  const { user } = useAuthStore();

  useEffect(() => {
    if (open) {
      fetchNotifications();
      fetchStats();
      connectRealTime();
    }
    return () => {
      if (!open) {
        disconnectRealTime();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead([notificationId]);
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const filteredNotifications = notifications.filter(notification => {
    // Filter by user role
    if (notification.userRoles.length > 0 && user?.roles && user.roles.length > 0) {
      const hasMatchingRole = notification.userRoles.some(role => user.roles.includes(role));
      if (!hasMatchingRole) {
        return false;
      }
    }

    // Filter by tab
    if (activeTab === 1 && notification.isRead) return false; // Unread only
    if (activeTab === 2 && !notification.isRead) return false; // Read only

    // Filter by priority
    if (selectedPriority !== 'all' && notification.priority !== selectedPriority) {
      return false;
    }

    // Filter by type
    if (selectedType !== 'all' && notification.type !== selectedType) {
      return false;
    }

    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead && 
    (n.userRoles.length === 0 || (user?.roles && user.roles.length > 0 && n.userRoles.some(role => user.roles.includes(role))))
  ).length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 420 }, maxWidth: '100vw' }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationIcon />
              Notifications
              {unreadCount > 0 && (
                <Badge badgeContent={unreadCount} color="error" />
              )}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Paramètres">
                <IconButton onClick={() => setSettingsOpen(true)} size="small">
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}>
                <IconButton onClick={toggleSound} size="small">
                  {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Actualiser">
                <IconButton onClick={() => fetchNotifications()} size="small" disabled={loading}>
                  {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Marquer tout comme lu">
                <IconButton onClick={markAllAsRead} size="small" disabled={unreadCount === 0}>
                  <MarkReadIcon />
                </IconButton>
              </Tooltip>
              
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Connection status */}
          {connected && (
            <Box sx={{ mt: 1 }}>
              <Chip 
                label="Temps réel activé" 
                color="success" 
                size="small" 
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          )}
        </Box>

        {/* Error display */}
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="fullWidth">
            <Tab label={`Toutes (${notifications.length})`} />
            <Tab label={`Non lues (${unreadCount})`} />
            <Tab label="Lues" />
          </Tabs>
        </Box>

        {/* Filters */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priorité</InputLabel>
              <Select
                value={selectedPriority}
                label="Priorité"
                onChange={(e) => setSelectedPriority(e.target.value as NotificationPriority | 'all')}
              >
                <MenuItem value="all">Toutes</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">Élevée</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="low">Basse</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={selectedType}
                label="Type"
                onChange={(e) => setSelectedType(e.target.value as NotificationType | 'all')}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="admission_request">Admissions</MenuItem>
                <MenuItem value="bed_available">Lits</MenuItem>
                <MenuItem value="urgent_request">Urgences</MenuItem>
                <MenuItem value="system">Système</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <TabPanel value={activeTab} index={0}>
            <NotificationList 
              notifications={filteredNotifications} 
              onMarkRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <NotificationList 
              notifications={filteredNotifications.filter(n => !n.isRead)} 
              onMarkRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <NotificationList 
              notifications={filteredNotifications.filter(n => n.isRead)} 
              onMarkRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          </TabPanel>
        </Box>
      </Box>

      {/* Settings Dialog */}
      <NotificationSettings 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </Drawer>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onMarkRead, 
  onDelete 
}) => {
  const getNotificationIcon = (type: NotificationType) => {
    const iconMap = {
      admission_request: <AssignmentIcon />,
      admission_validated: <AssignmentIcon color="success" />,
      admission_rejected: <AssignmentIcon color="error" />,
      patient_admitted: <HospitalIcon color="primary" />,
      patient_discharged: <ExitIcon color="info" />,
      bed_available: <BedIcon color="success" />,
      urgent_request: <WarningIcon color="error" />,
      system: <InfoIcon color="info" />,
      reminder: <InfoIcon />
    };
    return iconMap[type] || <NotificationIcon />;
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    const colorMap = {
      urgent: '#f44336',
      high: '#ff9800',
      medium: '#2196f3',
      low: '#4caf50'
    };
    return colorMap[priority];
  };

  if (notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <NotificationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography color="text.secondary">
          Aucune notification
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ height: '100%', overflow: 'auto', p: 0 }}>
      {notifications.map((notification, index) => (
        <React.Fragment key={notification.id}>
          <ListItem
            sx={{
              px: 2,
              py: 1.5,
              backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
              borderLeft: 4,
              borderLeftColor: getPriorityColor(notification.priority),
              '&:hover': {
                backgroundColor: 'action.selected',
              },
              cursor: notification.actionUrl ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (notification.actionUrl) {
                window.open(notification.actionUrl, '_blank');
                if (!notification.isRead) {
                  onMarkRead(notification.id);
                }
              }
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'transparent', color: 'primary.main' }}>
                {getNotificationIcon(notification.type)}
              </Avatar>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                    {notification.title}
                  </Typography>
                  <Chip
                    label={notification.priority}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      backgroundColor: getPriorityColor(notification.priority),
                      color: 'white'
                    }}
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(notification.createdAt, { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </Typography>
                </Box>
              }
            />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
              {!notification.isRead && (
                <Tooltip title="Marquer comme lu">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(notification.id);
                    }}
                  >
                    <MarkReadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title="Supprimer">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItem>
          
          {index < notifications.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default NotificationPanel;
