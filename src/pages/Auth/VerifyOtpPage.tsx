import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeft, RotateCw, Loader2 } from 'lucide-react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  useTheme,
  Avatar,
  TextField,
  IconButton,
  Chip
} from '@mui/material';

// Services API à adapter selon votre implémentation
const validateOtp = async (username: string, otp: string, token: string) => {
  // Simuler la validation OTP pour les tests
  await new Promise(resolve => setTimeout(resolve, 2000));
  if (otp === '1234') {
    return { status: 200, data: { access_token: 'new-token' } };
  }
  throw new Error('Code OTP invalide');
};

const resendOtp = async (username: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

const VerifyOtpPage: React.FC = () => {
  const { user, token, login } = useAuthStore();
  const navigate = useNavigate();
  const theme = useTheme();

  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(120);
  const [isLoading, setIsLoading] = useState(false);

  // Redirection si pas de token ou d'utilisateur
  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
    }
  }, [user, token, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setError('');
    const otp = otpDigits.join('');

    try {
      const res = await validateOtp(user?.username || '', otp, token || '');
      console.log('OTP verification response:', res);

      if (res.status === 200) {
        const newToken = res.data.access_token;
        // Mise à jour du contexte
        if (user) {
          login(user, newToken);
        }
        localStorage.clear();
        localStorage.setItem('token', newToken);
        localStorage.setItem('username', user?.username || '');
        console.log('OTP vérifié avec succès, redirection vers /dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Erreur lors de la vérification OTP:', err);
      setError('Code OTP invalide. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      await resendOtp(user?.username || '');
      setCountdown(120);
      setError('');
    } catch (err) {
      setError("Impossible d'envoyer un nouveau code");
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 4,
        py: 6,
        position: 'relative',
      }}
    >
      {/* Bouton retour */}
      <IconButton
        onClick={() => navigate('/login')}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.main + '10',
          }
        }}
      >
        <ArrowLeft size={20} />
      </IconButton>

      {/* Header avec logo */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar
          src="/images/hpd-logo.png"
          sx={{ 
            width: 64, 
            height: 64, 
            mx: 'auto', 
            mb: 2,
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s'
            }
          }}
        />
        <Typography variant="h4" component="h2" fontWeight="bold" color="text.primary" gutterBottom>
          Vérification OTP
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
          Entrez le code de vérification envoyé à votre adresse email.
        </Typography>
      </Box>

      {/* Message d'erreur */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            width: '100%', 
            maxWidth: 400,
            borderRadius: 2 
          }}
        >
          {error}
        </Alert>
      )}

      {/* Champs OTP */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4,
          justifyContent: 'center'
        }}
      >
        {otpDigits.map((digit, index) => (
          <TextField
            key={index}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            inputRef={(el) => (inputRefs.current[index] = el)}
            inputProps={{
              maxLength: 1,
              style: { 
                textAlign: 'center', 
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }
            }}
            sx={{
              width: 56,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderWidth: 2,
                },
              },
            }}
          />
        ))}
      </Box>

      {/* Bouton de vérification */}
      <Button
        onClick={handleVerify}
        disabled={isLoading || otpDigits.includes('')}
        fullWidth
        variant="contained"
        size="large"
        sx={{
          maxWidth: 400,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          mb: 3,
          boxShadow: theme.shadows[3],
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: theme.shadows[6],
          },
          '&:disabled': {
            backgroundColor: theme.palette.grey[400],
          },
        }}
        startIcon={isLoading ? <Loader2 className="animate-spin" size={20} /> : null}
      >
        {isLoading ? 'Vérification...' : 'Vérifier le code'}
      </Button>

      {/* Section renvoi du code */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Vous n'avez pas reçu de code ?
        </Typography>
        
        <Button
          onClick={handleResendOtp}
          disabled={countdown > 0}
          variant="text"
          startIcon={<RotateCw size={16} />}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            '&:disabled': {
              color: theme.palette.text.disabled,
            }
          }}
        >
          Renvoyer
          {countdown > 0 && (
            <Chip 
              label={formatCountdown(countdown)}
              size="small"
              color="secondary"
              sx={{ ml: 1 }}
            />
          )}
        </Button>
      </Box>

      {/* Indicateur de statut pour les tests */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Chip 
          label="Code de test : 1234" 
          color="success" 
          variant="outlined"
          size="small"
        />
      </Box>
    </Box>
  );
};

export default VerifyOtpPage;
