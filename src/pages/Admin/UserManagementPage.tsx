// src/pages/Admin/UserManagementPage.tsx
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../services/userService';
import { Box, Typography, Button, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import type { GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'nom', headerName: 'Nom', width: 220 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'matricule', headerName: 'Matricule', width: 150 },
  {
    field: 'roles',
    headerName: 'Rôles',
    width: 250,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {params.value.map((role: string) => (
          <Chip key={role} label={role} size="small" />
        ))}
      </Box>
    ),
  },
];

const UserManagementPage = () => {
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  if (isError) return <Typography color="error">Erreur de chargement des utilisateurs.</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Utilisateurs
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Ajouter un utilisateur
        </Button>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users || []}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 20]}
        />
      </Box>
    </Box>
  );
};

export default UserManagementPage;