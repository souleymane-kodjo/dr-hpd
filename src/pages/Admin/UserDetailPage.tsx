// src/pages/Admin/UserDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
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
  Visibility as VisibilityIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
  Download as DownloadIcon
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

// Composant QR Code avec options d'agrandissement
const QRCodeComponent: React.FC<{ text: string; size?: number; showActions?: boolean }> = ({
  text,
  size = 100,
  showActions = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    if (canvasRef.current && text) {
      const canvas = canvasRef.current;
      QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }).catch((err: Error) => {
        console.error('Erreur lors de la génération du QR code:', err);
      });
    }
  }, [text, size]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-code-${text}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Box sx={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '8px',
              backgroundColor: 'white',
              cursor: showActions ? 'pointer' : 'default',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onClick={showActions ? () => setQrModalOpen(true) : undefined}
            onMouseEnter={(e) => {
              if (showActions) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (showActions) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />
          {showActions && (
            <Box sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              display: 'flex',
              gap: 0.5,
              opacity: 0,
              transition: 'opacity 0.2s ease',
              '&:hover': { opacity: 1 },
              '.parent:hover &': { opacity: 1 }
            }}>
              <Tooltip title="Agrandir le QR Code">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQrModalOpen(true);
                  }}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 24,
                    height: 24,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ZoomInIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Télécharger le QR Code">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  sx={{
                    bgcolor: 'success.main',
                    color: 'white',
                    width: 24,
                    height: 24,
                    '&:hover': {
                      bgcolor: 'success.dark',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <DownloadIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          {showActions ? 'Cliquez pour agrandir' : 'QR Code Matricule'}
        </Typography>
      </Box>

      {/* Modal d'agrandissement */}
      <QRCodeModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        text={text}
      />
    </>
  );
};

// Composant Modal pour afficher le QR Code agrandi
const QRCodeModal: React.FC<{
  open: boolean;
  onClose: () => void;
  text: string;
}> = ({ open, onClose, text }) => {
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (modalCanvasRef.current && text && open) {
      const canvas = modalCanvasRef.current;
      QRCode.toCanvas(canvas, text, {
        width: 320,
        margin: 4,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff'
        }
      }).catch((err: Error) => {
        console.error('Erreur lors de la génération du QR code agrandi:', err);
      });
    }
  }, [text, open]);

  const handleDownload = async () => {
    if (modalCanvasRef.current) {
      setDownloading(true);
      try {
        // Simulation d'un délai pour l'animation
        await new Promise(resolve => setTimeout(resolve, 500));

        const link = document.createElement('a');
        link.download = `qr-code-${text}-large.png`;
        link.href = modalCanvasRef.current.toDataURL('image/png', 1.0);
        link.click();
      } finally {
        setDownloading(false);
      }
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12), 0 12px 24px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
          },
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          }
        }
      }}
      transitionDuration={400}
    >
      <DialogTitle sx={{ pb: 1, pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(25,118,210,0.3)'
            }}>
              <BadgeIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" component="div" fontWeight="bold" color="primary">
                QR Code Matricule
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Code d'identification personnel
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="large"
            sx={{
              bgcolor: 'grey.100',
              '&:hover': {
                bgcolor: 'grey.200',
                transform: 'rotate(90deg)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', py: 4, px: 4 }}>
        {/* QR Code Container */}
        <Box sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <Box sx={{
            position: 'relative',
            p: 3,
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.8)',
            transform: open ? 'scale(1)' : 'scale(0.8)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5, #1976d2)',
              borderRadius: 'inherit',
              zIndex: -1,
              opacity: 0.1,
              animation: open ? 'pulse 2s infinite' : 'none',
            },
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.1 },
              '50%': { opacity: 0.3 },
            }
          }}>
            <canvas
              ref={modalCanvasRef}
              style={{
                display: 'block',
                borderRadius: '12px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />

            {/* Corner decorations */}
            {[...Array(4)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  ...(i === 0 && { top: 8, left: 8, borderRight: 'none', borderBottom: 'none' }),
                  ...(i === 1 && { top: 8, right: 8, borderLeft: 'none', borderBottom: 'none' }),
                  ...(i === 2 && { bottom: 8, left: 8, borderRight: 'none', borderTop: 'none' }),
                  ...(i === 3 && { bottom: 8, right: 8, borderLeft: 'none', borderTop: 'none' }),
                  opacity: 0.6,
                  animation: `fadeIn 0.8s ease ${i * 0.2}s both`
                }}
              />
            ))}

            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: scale(0.5); }
                  to { opacity: 0.6; transform: scale(1); }
                }
              `}
            </style>
          </Box>
        </Box>

        {/* Matricule Display */}
        <Box sx={{
          mb: 3,
          p: 2,
          bgcolor: 'rgba(25, 118, 210, 0.04)',
          borderRadius: 2,
          border: '1px solid rgba(25, 118, 210, 0.12)'
        }}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            {text}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Numéro de matricule personnel
          </Typography>
        </Box>

        {/* Description */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 4,
            fontStyle: 'italic',
            opacity: 0.8
          }}
        >
          📱 Scannez ce code QR avec votre téléphone pour accéder rapidement aux informations du matricule
        </Typography>

        {/* Action Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ '& > *': { minWidth: { xs: '100%', sm: '140px' } } }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            onClick={handleDownload}
            disabled={downloading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {downloading ? 'Téléchargement...' : 'Télécharger HD'}
          </Button>

          <Button
            variant={copied ? 'contained' : 'outlined'}
            size="large"
            color={copied ? 'success' : 'primary'}
            startIcon={copied ?
              <Box component="span" sx={{ fontSize: '20px' }}>✓</Box> :
              <Box component="span" sx={{ fontSize: '20px' }}>📋</Box>
            }
            onClick={handleCopyText}
            sx={{
              py: 1.5,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              ...(copied && {
                background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
              }),
              '&:hover': {
                transform: 'translateY(-2px)',
              }
            }}
          >
            {copied ? 'Copié !' : 'Copier le texte'}
          </Button>
        </Stack>

        {/* Footer Info */}
        <Box sx={{
          mt: 4,
          pt: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          opacity: 0.7
        }}>
          <Box component="span" sx={{ fontSize: '16px' }}>🔒</Box>
          <Typography variant="caption" color="text.secondary">
            Code QR sécurisé - Généré localement
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
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
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <Typography variant="h5" fontWeight="bold">
                {user.nom}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Matricule: {user.matricule}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <QRCodeComponent text={user.matricule} size={100} showActions={true} />
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
              <Box>
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
                {formData.matricule && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <QRCodeComponent text={formData.matricule} size={80} showActions={false} />
                  </Box>
                )}
              </Box>

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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {user.matricule}
                </Typography>
                <QRCodeComponent text={user.matricule} size={80} showActions={true} />
              </Box>
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
