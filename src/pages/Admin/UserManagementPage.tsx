// src/pages/Admin/UserManagementPage.tsx
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../../services/userService';
import { Box, Typography, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import type { GridColDef } from '@mui/x-data-grid';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const handleAddUser = () => {
    navigate('/admin/utilisateurs/ajouter');
  };

  const handleViewUser = (userId: string) => {
    navigate(`/admin/utilisateurs/${userId}`);
  };

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
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Voir les détails">
            <IconButton
              size="small"
              onClick={() => handleViewUser(params.row.id)}
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              onClick={() => handleViewUser(params.row.id)}
              color="default"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (isError) return <Typography color="error">Erreur de chargement des utilisateurs.</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Utilisateurs
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddUser}>
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