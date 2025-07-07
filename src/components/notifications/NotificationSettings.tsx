// src/components/notifications/NotificationSettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Box,

  Stack,
  Chip,
  Card,
  CardContent,
  FormGroup,
  Alert,

  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  VolumeUp as VolumeIcon,
  Email as EmailIcon,
  NotificationsActive as PushIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import type {
  NotificationPreferences
} from '../../types/notifications';
import type {
  NotificationType,
  NotificationPriority
} from '../../types/notifications';
import {
  getNotificationPreferences,
  updateNotificationPreferences
} from '../../services/notificationService';
import { useAuthStore } from '../../store/authStore';

interface NotificationSettingsProps {
  open: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ open, onClose }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (open && user) {
      loadPreferences();
    }
  }, [open, user]);

  const loadPreferences = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const prefs = await getNotificationPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      setError('Erreur lors du chargement des préférences');
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    setError(null);
    try {
      await updateNotificationPreferences(preferences);
      onClose();
    } catch (error) {
      setError('Erreur lors de la sauvegarde');
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateGlobalSetting = (key: keyof Pick<NotificationPreferences, 'enablePush' | 'enableEmail' | 'enableSound'>, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  const updateTypeSetting = (type: NotificationType, key: 'enabled' | 'priority', value: boolean | NotificationPriority) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      types: {
        ...preferences.types,
        [type]: {
          ...preferences.types[type],
          [key]: value
        }
      }
    });
  };

  const getTypeLabel = (type: NotificationType) => {
    const labels = {
      admission_request: 'Demandes d\'admission',
      admission_validated: 'Admissions validées',
      admission_rejected: 'Admissions rejetées',
      patient_admitted: 'Patients admis',
      patient_discharged: 'Sorties de patients',
      bed_available: 'Lits disponibles',
      urgent_request: 'Demandes urgentes',
      system: 'Notifications système',
      reminder: 'Rappels'
    };
    return labels[type];
  };

  const getTypeDescription = (type: NotificationType) => {
    const descriptions = {
      admission_request: 'Nouvelles demandes d\'admission à traiter',
      admission_validated: 'Confirmations d\'admissions validées',
      admission_rejected: 'Notifications d\'admissions rejetées',
      patient_admitted: 'Arrivées de patients dans les services',
      patient_discharged: 'Départs et sorties de patients',
      bed_available: 'Disponibilités de lits et chambres',
      urgent_request: 'Demandes nécessitant une attention immédiate',
      system: 'Messages et maintenances du système',
      reminder: 'Rappels et échéances importantes'
    };
    return descriptions[type];
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    const colors = {
      urgent: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    } as const;
    return colors[priority];
  };

  const getPriorityLabel = (priority: NotificationPriority) => {
    const labels = {
      urgent: 'Urgent',
      high: 'Élevée',
      medium: 'Moyenne',
      low: 'Basse'
    };
    return labels[priority];
  };

  if (!preferences) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Chargement des préférences...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon />
        Paramètres des notifications
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Paramètres généraux */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Paramètres généraux
              </Typography>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.enablePush}
                      onChange={(e) => updateGlobalSetting('enablePush', e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PushIcon />
                      <Box>
                        <Typography>Notifications push</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Afficher les notifications dans le navigateur
                        </Typography>
                      </Box>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.enableSound}
                      onChange={(e) => updateGlobalSetting('enableSound', e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VolumeIcon />
                      <Box>
                        <Typography>Son des notifications</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Jouer un son lors des nouvelles notifications
                        </Typography>
                      </Box>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.enableEmail}
                      onChange={(e) => updateGlobalSetting('enableEmail', e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon />
                      <Box>
                        <Typography>Notifications par email</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recevoir les notifications importantes par email
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </FormGroup>
            </CardContent>
          </Card>

          {/* Paramètres par type */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Types de notifications
              </Typography>

              <Stack spacing={2}>
                {Object.entries(preferences.types).map(([type, settings]) => (
                  <Box key={type} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">
                          {getTypeLabel(type as NotificationType)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getTypeDescription(type as NotificationType)}
                        </Typography>
                      </Box>

                      <Switch
                        checked={settings.enabled}
                        onChange={(e) => updateTypeSetting(
                          type as NotificationType,
                          'enabled',
                          e.target.checked
                        )}
                        size="small"
                      />
                    </Box>

                    {settings.enabled && (
                      <Box sx={{ mt: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel>Priorité</InputLabel>
                          <Select
                            value={settings.priority}
                            label="Priorité"
                            onChange={(e) => updateTypeSetting(
                              type as NotificationType,
                              'priority',
                              e.target.value as NotificationPriority
                            )}
                          >
                            <MenuItem value="low">Basse</MenuItem>
                            <MenuItem value="medium">Moyenne</MenuItem>
                            <MenuItem value="high">Élevée</MenuItem>
                            <MenuItem value="urgent">Urgent</MenuItem>
                          </Select>
                        </FormControl>

                        <Chip
                          label={getPriorityLabel(settings.priority)}
                          color={getPriorityColor(settings.priority)}
                          size="small"
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Informations */}
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              À propos des notifications
            </Typography>
            <Typography variant="body2">
              • Les notifications urgentes ne peuvent pas être désactivées<br/>
              • Les notifications push nécessitent l'autorisation du navigateur<br/>
              • Les emails sont envoyés uniquement pour les priorités élevées et urgentes
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationSettings;
