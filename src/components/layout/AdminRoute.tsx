// src/layouts/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';


const AdminRoute = () => {
  const { user } = useAuthStore();

  // Vérifie si l'utilisateur est connecté ET s'il a le rôle 'ADMIN'
  if (!user || !user.roles.includes('ADMIN')) {
    // Redirige vers la page d'accueil si non autorisé
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;