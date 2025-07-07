// src/components/layout/MajorRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const MajorRoute = () => {
  const { user } = useAuthStore();

  // Vérifie si l'utilisateur est connecté ET s'il a le rôle 'ADMIN' ou 'MAJOR_ADMINISTRATIF'
  if (!user || (!user.roles.includes('ADMIN') && !user.roles.includes('MAJOR_ADMINISTRATIF'))) {
    // Redirige vers la page d'accueil si non autorisé
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default MajorRoute;
