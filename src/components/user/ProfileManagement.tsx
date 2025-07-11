import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  History as HistoryIcon,
  Login as LoginIcon,
  PersonAdd as UserPlusIcon,
  Description as FileTextIcon,
  Hotel as BedIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfileManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // États pour les données du profil
  const [profileData, setProfileData] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    matricule: user?.matricule || '',
    photoUrl: user?.photoUrl || ''
  });

  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // États pour les statistiques et l'activité
  const [stats, setStats] = useState<any>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  useEffect(() => {
    loadProfileStats();
    loadProfileActivity();
  }, []);

  const loadProfileStats = async () => {
    try {
      const response = await fetch('/api/profile/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadProfileActivity = async () => {
    try {
      const response = await fetch('/api/profile/activity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setMessage('');
    setError('');
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          nom: profileData.nom,
          email: profileData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profil mis à jour avec succès');
        setEditMode(false);
      } else {
        setError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Mot de passe mis à jour avec succès');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La taille de l\'image ne doit pas dépasser 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const photoData = e.target?.result as string;

      setLoading(true);
      try {
        const response = await fetch('/api/profile/photo', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ photoData })
        });

        const data = await response.json();

        if (response.ok) {
          setProfileData(prev => ({ ...prev, photoUrl: data.photoUrl }));
          setMessage('Photo de profil mise à jour avec succès');
          setPhotoDialogOpen(false);
        } else {
          setError(data.message || 'Erreur lors de la mise à jour');
        }
      } catch (error) {
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handlePhotoDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile/photo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        setProfileData(prev => ({ ...prev, photoUrl: '' }));
        setMessage('Photo de profil supprimée avec succès');
        setPhotoDialogOpen(false);
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <LoginIcon color="primary" />;
      case 'patient_create': return <UserPlusIcon color="success" />;
      case 'profile_update': return <EditIcon color="info" />;
      case 'hospitalization_create': return <BedIcon color="warning" />;
      case 'report_generate': return <FileTextIcon color="secondary" />;
      default: return <HistoryIcon color="action" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion du Profil
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper elevation={3}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<PersonIcon />} label="Informations" />
          <Tab icon={<SecurityIcon />} label="Sécurité" />
          <Tab icon={<AnalyticsIcon />} label="Statistiques" />
          <Tab icon={<HistoryIcon />} label="Activité" />
        </Tabs>

        {/* Onglet Informations */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={profileData.photoUrl}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  >
                    {profileData.nom.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <Typography variant="h6" gutterBottom>
                    {profileData.nom}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {profileData.matricule}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    {user?.roles.map((role: string) => (
                      <Chip
                        key={role}
                        label={role}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => setPhotoDialogOpen(true)}
                    fullWidth
                  >
                    Modifier Photo
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Informations Personnelles</Typography>
                    <Button
                      variant={editMode ? "outlined" : "contained"}
                      startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                      onClick={() => {
                        setEditMode(!editMode);
                        if (editMode) {
                          // Annuler les modifications
                          setProfileData({
                            nom: user?.nom || '',
                            email: user?.email || '',
                            matricule: user?.matricule || '',
                            photoUrl: user?.photoUrl || ''
                          });
                        }
                      }}
                    >
                      {editMode ? 'Annuler' : 'Modifier'}
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nom complet"
                        value={profileData.nom}
                        onChange={(e) => setProfileData(prev => ({ ...prev, nom: e.target.value }))}
                        disabled={!editMode}
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!editMode}
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Matricule"
                        value={profileData.matricule}
                        disabled
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Rôles"
                        value={user?.roles.join(', ') || ''}
                        disabled
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                  {editMode && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        onClick={handleProfileUpdate}
                        disabled={loading}
                      >
                        Sauvegarder
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Onglet Sécurité */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Changer le mot de passe
                  </Typography>
                  
                  <Box component="form" sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Mot de passe actuel"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      margin="normal"
                    />
                    
                    <TextField
                      fullWidth
                      type="password"
                      label="Nouveau mot de passe"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      margin="normal"
                    />
                    
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirmer le nouveau mot de passe"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      margin="normal"
                    />
                    
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handlePasswordChange}
                      disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                      sx={{ mt: 3 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Changer le mot de passe'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Paramètres de sécurité
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Authentification sécurisée"
                        secondary="Votre compte utilise JWT pour la sécurité"
                      />
                    </ListItem>
                    
                    <Divider />
                    
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Accès basé sur les rôles"
                        secondary={`Vos rôles: ${user?.roles.join(', ')}`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Onglet Statistiques */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistiques du compte
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Âge du compte"
                        secondary={`${stats.accountAge || 0} jours`}
                      />
                    </ListItem>
                    
                    {stats.patientsCount !== undefined && (
                      <ListItem>
                        <ListItemText
                          primary="Patients suivis"
                          secondary={`${stats.patientsCount} patients`}
                        />
                      </ListItem>
                    )}
                    
                    {stats.hospitalizationsCount !== undefined && (
                      <ListItem>
                        <ListItemText
                          primary="Hospitalisations gérées"
                          secondary={`${stats.hospitalizationsCount} hospitalisations`}
                        />
                      </ListItem>
                    )}
                    
                    {stats.totalUsers !== undefined && (
                      <ListItem>
                        <ListItemText
                          primary="Utilisateurs total (Admin)"
                          secondary={`${stats.totalUsers} utilisateurs`}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Onglet Activité */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historique d'activité récente
              </Typography>
              
              <List>
                {activities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={formatDate(activity.timestamp)}
                      />
                    </ListItem>
                    {index < activities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              {activities.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  Aucune activité récente
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Dialog pour la photo */}
      <Dialog open={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)}>
        <DialogTitle>Modifier la photo de profil</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar
              src={profileData.photoUrl}
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
            >
              {profileData.nom.charAt(0).toUpperCase()}
            </Avatar>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handlePhotoUpload}
            />
            <label htmlFor="photo-upload">
              <Button variant="contained" component="span" sx={{ mr: 1 }}>
                Choisir une photo
              </Button>
            </label>
            
            {profileData.photoUrl && (
              <Button
                variant="outlined"
                color="error"
                onClick={handlePhotoDelete}
                disabled={loading}
              >
                Supprimer
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileManagement;
