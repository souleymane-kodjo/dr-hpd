// src/pages/Auth/LoginPage.tsx
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { loginWithCredentials } from '../../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async () => {
    try {
      // Pour la démo, on utilise des identifiants en dur
      const { user, token } = await loginWithCredentials('medecin@hpd.sn', 'password');
      login(user, token);
      navigate('/'); // Redirige vers le tableau de bord
    } catch (error) {
      console.error("Erreur de connexion", error);
      // Afficher un message d'erreur à l'utilisateur
    }
  };

  return (
    <div>
      <h1>Page de Connexion</h1>
      {/* Ici, vous ajouterez les champs de formulaire (email, mot de passe) */}
      <button onClick={handleLogin}>Se connecter (Simulation)</button>
    </div>
  );
};

export default LoginPage;