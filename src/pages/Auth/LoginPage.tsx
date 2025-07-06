import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { loginWithCredentials } from '../../services/authService';

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  type Theme,
} from '@mui/material';

const LoginPage: React.FC = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await loginWithCredentials(form.username, form.password);
      login(user, token);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Colonne de l'image - cachée sur mobile et tablette */}
      <Box
        sx={{
          flex: 1,
          backgroundImage: 'url(/images/bg.jpeg)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: (theme: Theme) =>
            theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
          display: { xs: 'none', sm: 'none', md: 'block' },
        }}
      />

      {/* Colonne du formulaire */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        <Paper elevation={6} square sx={{ width: '100%' }}>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <img
              src="/images/hpd-logo.png"
              alt="HPD Logo"
              style={{ height: '64px', marginBottom: 16 }}
            />
            <Typography component="h1" variant="h5" fontWeight="bold">
              Hôpital Principal de Dakar
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Système d'Information Hospitalier
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 3, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Nom d'utilisateur"
                name="username"
                autoComplete="username"
                autoFocus
                value={form.username}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Se souvenir de moi"
                />
                <Link href="#" variant="body2">
                  Mot de passe oublié ?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
              <Typography variant="body2" color="text.secondary" align="center">
                Vous n'avez pas de compte ?{' '}
                <Link href="#" variant="body2" fontWeight="medium">
                  Contactez l'administrateur
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;