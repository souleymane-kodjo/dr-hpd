// src/layouts/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';


const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) {
    // Redirige vers la page de connexion si non authentifié
    return <Navigate to="/connexion" replace />;
  }

  // Affiche le contenu de la page privée
  return <Outlet />;
};

export default ProtectedRoute;