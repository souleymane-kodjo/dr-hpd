// src/pages/Admin/UserDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { getUsers, updateUser, deleteUser } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types';

// Types pour le formulaire
interface UserFormData {
  nom: string;
  email: string;
  matricule: string;
  roles: string[];
}

interface FormErrors {
  nom?: string;
  email?: string;
  matricule?: string;
  roles?: string;
}

// Configuration des rôles disponibles
const AVAILABLE_ROLES = [
  { value: 'MEDECIN', label: 'Médecin', color: 'primary' as const },
  { value: 'ADMIN', label: 'Administrateur', color: 'error' as const },
  { value: 'MAJOR_ADMINISTRATIF', label: 'Major Administratif', color: 'warning' as const },
  { value: 'INFIRMIER', label: 'Infirmier', color: 'success' as const },
  { value: 'TECHNICIEN', label: 'Technicien', color: 'info' as const },
  { value: 'RECEPTIONNISTE', label: 'Réceptionniste', color: 'secondary' as const }
];

const UserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  // États locaux
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    nom: '',
    email: '',
    matricule: '',
    roles: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Vérifier si l'utilisateur actuel est admin
  const isCurrentUserAdmin = currentUser?.roles.includes('ADMIN') || false;

  // Récupérer les données utilisateur
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const user = users?.find(u => u.id === userId);

  // Mutation pour mettre à jour l'utilisateur
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Omit<User, 'id'>> }) => 
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSubmitError(null);
      setShowSuccess(true);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour:', error);
      setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue');
    },
  });

  // Mutation pour supprimer l'utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/utilisateurs');
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error);
      setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression');
    },
  });

  // Initialiser le formulaire quand les données utilisateur sont chargées
  React.useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom,
        email: user.email,
        matricule: user.matricule,
        roles: user.roles
      });
    }
  }, [user]);

  // Validation du formulaire
  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    } else if (users) {
      // Vérifier les doublons d'email (exclure l'utilisateur actuel)
      const emailExists = users.some(u => 
        u.id !== userId && u.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (emailExists) {
        newErrors.email = 'Cet email est déjà utilisé';
      }
    }

    if (!formData.matricule.trim()) {
      newErrors.matricule = 'Le matricule est requis';
    } else if (!/^[A-Z]+-\d+$/.test(formData.matricule)) {
      newErrors.matricule = 'Format de matricule invalide (ex: M-12345)';
    } else if (users) {
      // Vérifier les doublons de matricule (exclure l'utilisateur actuel)
      const matriculeExists = users.some(u => 
        u.id !== userId && u.matricule === formData.matricule
      );
      if (matriculeExists) {
        newErrors.matricule = 'Ce matricule est déjà utilisé';
      }
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'Au moins un rôle doit être sélectionné';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer les changements dans les champs du formulaire
  const handleInputChange = (field: keyof UserFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Gérer l'ajout/suppression de rôles
  const handleRoleToggle = (role: string) => {
    if (!isCurrentUserAdmin) return;
    
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: undefined }));
    }
  };

  // Soumettre les modifications
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    
    const isValid = await validateForm();
    if (isValid && userId) {
      updateUserMutation.mutate({
        id: userId,
        data: formData
      });
    }
  };

  // Annuler les modifications
  const handleCancel = () => {
    if (user) {
      setFormData({
        nom: user.nom,
        email: user.email,
        matricule: user.matricule,
        roles: user.roles
      });
    }
    setErrors({});
    setSubmitError(null);
    setIsEditing(false);
  };

  // Retourner à la liste
  const handleBack = () => {
    navigate('/admin/utilisateurs');
  };

  // Démarrer l'édition
  const handleStartEdit = () => {
    if (isCurrentUserAdmin) {
      setIsEditing(true);
    }
  };

  // Gérer la suppression
  const handleDeleteUser = () => {
    if (userId && isCurrentUserAdmin) {
      deleteUserMutation.mutate(userId);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Erreur lors du chargement des données utilisateur.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Retour à la liste">
            <IconButton onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            <Typography variant="h4" fontWeight="bold">
              {isEditing ? 'Modifier l\'utilisateur' : 'Détails de l\'utilisateur'}
            </Typography>
          </Box>
        </Box>

        {/* Actions selon les permissions */}
        <Stack direction="row" spacing={1}>
          {!isEditing && isCurrentUserAdmin && (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleStartEdit}
              >
                Modifier
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Supprimer
              </Button>
            </>
          )}
          {!isEditing && (
            <Tooltip title={isCurrentUserAdmin ? "Consulter" : "Vous n'avez pas les permissions pour modifier"}>
              <IconButton color="primary">
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>

      {/* Carte profil */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              {user.nom.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {user.nom}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {user.email}
              </Typography>
              <Stack direction="row" spacing={1}>
                {user.roles.map((role) => {
                  const roleConfig = AVAILABLE_ROLES.find(r => r.value === role);
                  return (
                    <Chip
                      key={role}
                      label={roleConfig?.label || role}
                      color={roleConfig?.color || 'default'}
                      size="small"
                    />
                  );
                })}
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Formulaire d'édition ou affichage */}
      <Paper elevation={2} sx={{ p: 4 }}>
        {isEditing ? (
          // Mode édition
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 3
              }}
            >
              {/* Informations personnelles */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Informations personnelles
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
              </Box>

              {/* Nom complet */}
              <TextField
                fullWidth
                label="Nom complet"
                value={formData.nom}
                onChange={handleInputChange('nom')}
                error={!!errors.nom}
                helperText={errors.nom}
                disabled={!isCurrentUserAdmin}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />

              {/* Email */}
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                disabled={!isCurrentUserAdmin}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />

              {/* Matricule */}
              <TextField
                fullWidth
                label="Matricule"
                value={formData.matricule}
                onChange={handleInputChange('matricule')}
                error={!!errors.matricule}
                helperText={errors.matricule || 'Format: [LETTRE]-[CHIFFRES] (ex: M-12345)'}
                disabled={!isCurrentUserAdmin}
                InputProps={{
                  startAdornment: <BadgeIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />

              {/* Rôles */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SecurityIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Rôles et permissions
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {isCurrentUserAdmin ? 'Sélectionnez les rôles :' : 'Rôles attribués :'}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {AVAILABLE_ROLES.map((role) => (
                    <Chip
                      key={role.value}
                      label={role.label}
                      clickable={isCurrentUserAdmin}
                      color={formData.roles.includes(role.value) ? role.color : 'default'}
                      variant={formData.roles.includes(role.value) ? 'filled' : 'outlined'}
                      onClick={() => handleRoleToggle(role.value)}
                      sx={{
                        transition: 'all 0.2s',
                        cursor: isCurrentUserAdmin ? 'pointer' : 'default',
                        '&:hover': isCurrentUserAdmin ? {
                          transform: 'scale(1.05)'
                        } : {}
                      }}
                    />
                  ))}
                </Stack>
                {errors.roles && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.roles}
                  </Typography>
                )}
              </Box>

              {/* Messages d'erreur */}
              {submitError && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Alert severity="error">
                    {submitError}
                  </Alert>
                </Box>
              )}

              {/* Boutons d'action */}
              {isCurrentUserAdmin && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      startIcon={<CancelIcon />}
                      disabled={updateUserMutation.isPending}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending ? 'Mise à jour...' : 'Enregistrer'}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>
          </form>
        ) : (
          // Mode affichage
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3
            }}
          >
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                📧 Email
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {user.email}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                🆔 Matricule
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {user.matricule}
              </Typography>
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                🔐 Rôles et permissions
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {user.roles.map((role) => {
                  const roleConfig = AVAILABLE_ROLES.find(r => r.value === role);
                  return (
                    <Chip
                      key={role}
                      label={roleConfig?.label || role}
                      color={roleConfig?.color || 'default'}
                    />
                  );
                })}
              </Stack>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Notification de succès */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Utilisateur mis à jour avec succès !
        </Alert>
      </Snackbar>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            <Typography variant="h6">
              Confirmer la suppression
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{user?.nom}</strong> ?
          </Typography>
          <Alert severity="warning">
            Cette action est irréversible. Toutes les données associées à cet utilisateur seront définitivement supprimées.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteUserMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={deleteUserMutation.isPending}
            startIcon={deleteUserMutation.isPending ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteUserMutation.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDetailPage;
