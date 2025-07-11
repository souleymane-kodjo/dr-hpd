import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { loginWithCredentials } from '../../services/authService';
import { Loader2 } from 'lucide-react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';

const LoginPage: React.FC = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginWithCredentials(form.username, form.password);
      if (response.user && response.token) {
        localStorage.clear();
        login(response.user, response.token);
        navigate('/');
      } else {
        setError('Identifiants invalides ou réponse inattendue.');
      }
    } catch (err) {
      console.error('Erreur de connexion :', err);
      setError('Erreur lors de la connexion. Veuillez vérifier vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{
      width: '100%',
      display: 'flex',
      height: '100vh' }}>
      {/* Image à gauche avec informations défilantes */}
      {!isMobile && (
        <Grid
          item
          md={6}
          sx={{
            width: '60%',
            backgroundImage: 'url("/images/bg.jpeg")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(16, 185, 129, 0.6))',
              zIndex: 1,
            }
          }}
        >
          {/* Overlay avec informations défilantes */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              p: 4,
            }}
          >
            {/* Logo principal */}
            <Avatar
              src="/images/hpd-logo.png"
              sx={{
                width: 120,
                height: 120,
                mb: 3,
                border: '4px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' },
                },
              }}
            />

            {/* Titre principal */}
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                mb: 2,
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                animation: 'fadeInUp 1s ease-out',
                '@keyframes fadeInUp': {
                  '0%': { opacity: 0, transform: 'translateY(30px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              HPD
            </Typography>

            {/* Sous-titre */}
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                textAlign: 'center',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                animation: 'fadeInUp 1s ease-out 0.3s both',
              }}
            >
              Excellence • Innovation • Soins
            </Typography>

            {/* Conteneur des informations défilantes */}
            <Box
              sx={{
                width: '100%',
                maxWidth: 400,
                height: 200,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                p: 3,
              }}
            >
              {/* Informations qui défilent */}
              <Box
                sx={{
                  animation: 'slideUp 12s infinite linear',
                  '@keyframes slideUp': {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(-100%)' },
                  },
                }}
              >
                {[
                  {
                    icon: '🏥',
                    title: 'Dermatologie',
                    description: 'Soins spécialisés de la peau'
                  },
                  {
                    icon: '🦴',
                    title: 'Rhumatologie',
                    description: 'Traitement des articulations'
                  },
                  {
                    icon: '💊',
                    title: 'Pharmacie',
                    description: 'Médicaments de qualité'
                  },
                  {
                    icon: '🔬',
                    title: 'Laboratoire',
                    description: 'Analyses médicales précises'
                  },
                  {
                    icon: '📊',
                    title: 'Système Digital',
                    description: 'Gestion moderne des patients'
                  },
                  {
                    icon: '👩‍⚕️',
                    title: 'Équipe Médicale',
                    description: 'Professionnels expérimentés'
                  },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        transform: 'scale(1.02)',
                      }
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        mr: 2,
                        animation: `pulse 2s infinite ${index * 0.2}s`,
                        '@keyframes pulse': {
                          '0%, 100%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.1)' },
                        },
                      }}
                    >
                      {item.icon}
                    </Typography>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 0.5 }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.9 }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Statistiques en bas */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 30,
                left: 30,
                right: 30,
                display: 'flex',
                justifyContent: 'space-around',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 2,
                animation: 'fadeInUp 1s ease-out 0.6s both',
              }}
            >
              {[
                { number: '50+', label: 'Médecins' },
                { number: '1000+', label: 'Patients/mois' },
                { number: '24/7', label: 'Disponibilité' },
              ].map((stat, index) => (
                <Box key={index} sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      animation: `countUp 2s ease-out ${index * 0.2}s both`,
                      '@keyframes countUp': {
                        '0%': { opacity: 0, transform: 'scale(0.5)' },
                        '100%': { opacity: 1, transform: 'scale(1)' },
                      },
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      )}

      {/* Formulaire de connexion */}
      <Grid
      item xs={12} md={6}
      sx ={{

        width : '40%',
      display: 'flex',
        flexDirection: 'column',

        justifyContent: 'center',
        alignItems: 'center',
        px: 4,
        // py: 6,
      }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: 4,
            py: 6,
          }}
        >
          <Box
          sx={{
            mb: 4,
             textAlign: 'center'
          }}
          >
            {isMobile && (
              <Avatar
                src="/images/hpd-logo.png"
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              />
            )}
            <Avatar
              src="/images/hpd-logo.png"
              sx={{ width: 72, height: 72, mb: 2, mx: 'auto', boxShadow: 3 }}
            />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Hôpital Principal de Dakar
            </Typography>
            <Typography variant="body1">
              Département de Dermatologie et Rhumatologie
            </Typography>

          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              maxWidth: 400,
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              name="username"
              label="Nom d'utilisateur"
              value={form.username}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Entrez votre identifiant"
            />
            <TextField
              name="password"
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Mot de passe"
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Se souvenir de moi"
              />
              <Link href="/forgot-password" variant="body2" color="primary">
                Mot de passe oublié ?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <Loader2 className="animate-spin" size={20} /> : undefined}
              sx={{
                mt: 2,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: 2,
              }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Vous n'avez pas de compte ?{' '}
              <Link href="mailto:admin@hpd.sn" color="primary">
                Contactez l'administrateur
              </Link>
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
