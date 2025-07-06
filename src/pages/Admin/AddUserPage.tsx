// src/pages/Admin/AddUserPage.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { addUser, getUsers } from '../../services/userService';
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

const AddUserPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // État du formulaire
  const [formData, setFormData] = useState<UserFormData>({
    nom: '',
    email: '',
    matricule: '',
    roles: []
  });

  // État pour les erreurs de validation
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mutation pour ajouter un utilisateur
  const addUserMutation = useMutation({
    mutationFn: (data: Omit<User, 'id'>) => addUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSubmitError(null);
      setShowSuccess(true);
      // Attendre un peu avant de naviguer pour montrer le message de succès
      setTimeout(() => {
        navigate('/admin/utilisateurs');
      }, 1000);
    },
    onError: (error) => {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      setSubmitError(error instanceof Error ? error.message : 'Une erreur inconnue est survenue');
    },
  });

  // Validation du formulaire
  const validateForm = async (): Promise<boolean> => {
    setIsValidating(true);
    const newErrors: FormErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    } else {
      // Vérifier les doublons d'email
      try {
        const existingUsers = await getUsers();
        if (existingUsers.some(user => user.email.toLowerCase() === formData.email.toLowerCase())) {
          newErrors.email = 'Cet email est déjà utilisé';
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des doublons:', error);
      }
    }

    if (!formData.matricule.trim()) {
      newErrors.matricule = 'Le matricule est requis';
    } else if (!/^[A-Z]+-\d+$/.test(formData.matricule)) {
      newErrors.matricule = 'Format de matricule invalide (ex: M-12345)';
    } else {
      // Vérifier les doublons de matricule
      try {
        const existingUsers = await getUsers();
        if (existingUsers.some(user => user.matricule === formData.matricule)) {
          newErrors.matricule = 'Ce matricule est déjà utilisé';
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des doublons:', error);
      }
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'Au moins un rôle doit être sélectionné';
    }

    setErrors(newErrors);
    setIsValidating(false);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer les changements dans les champs du formulaire
  const handleInputChange = (field: keyof UserFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Gérer l'ajout/suppression de rôles
  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
    // Effacer l'erreur pour les rôles
    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: undefined }));
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const isValid = await validateForm();
    if (isValid) {
      addUserMutation.mutate(formData);
    }
  };

  // Annuler et retourner à la liste
  const handleCancel = () => {
    navigate('/admin/utilisateurs');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Retour à la liste">
          <IconButton onClick={handleCancel} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h4" fontWeight="bold">
            Ajouter un utilisateur
          </Typography>
        </Box>
      </Box>

      {/* Formulaire */}
      <Paper elevation={2} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3
            }}
          >
            {/* Informations personnelles - Section header */}
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
              placeholder="Ex: Dr. Mariame Diallo"
              value={formData.nom}
              onChange={handleInputChange('nom')}
              error={!!errors.nom}
              helperText={errors.nom}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />

            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              placeholder="Ex: medecin@hpd.sn"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />

            {/* Matricule */}
            <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
              <TextField
                fullWidth
                label="Matricule"
                placeholder="Ex: M-12345"
                value={formData.matricule}
                onChange={handleInputChange('matricule')}
                error={!!errors.matricule}
                helperText={errors.matricule || 'Format: [LETTRE]-[CHIFFRES] (ex: M-12345, A-54321)'}
                InputProps={{
                  startAdornment: <BadgeIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Box>

            {/* Rôles et permissions - Section header */}
            <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Rôles et permissions
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </Box>

            {/* Sélection des rôles */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Sélectionnez les rôles pour cet utilisateur :
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {AVAILABLE_ROLES.map((role) => (
                  <Chip
                    key={role.value}
                    label={role.label}
                    clickable
                    color={formData.roles.includes(role.value) ? role.color : 'default'}
                    variant={formData.roles.includes(role.value) ? 'filled' : 'outlined'}
                    onClick={() => handleRoleToggle(role.value)}
                    sx={{
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
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

            {/* Rôles sélectionnés */}
            {formData.roles.length > 0 && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Rôles sélectionnés:</strong> {formData.roles.join(', ')}
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* Messages d'erreur global */}
            {(addUserMutation.isError || submitError) && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Alert severity="error">
                  {submitError || 'Une erreur est survenue lors de l\'ajout de l\'utilisateur. Veuillez réessayer.'}
                </Alert>
              </Box>
            )}

            {/* Boutons d'action */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<CancelIcon />}
                  disabled={addUserMutation.isPending || isValidating}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={addUserMutation.isPending || isValidating}
                >
                  {addUserMutation.isPending
                    ? 'Ajout en cours...'
                    : isValidating
                    ? 'Validation...'
                    : 'Ajouter l\'utilisateur'
                  }
                </Button>
              </Stack>
            </Box>
          </Box>
        </form>
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
          Utilisateur ajouté avec succès !
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddUserPage;
