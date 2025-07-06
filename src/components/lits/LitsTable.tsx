// src/components/lits/LitsTable.tsx
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { Lit, LitStatut } from '../../types';
import { 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem, 
  Box,
  Tooltip 
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Hotel as HotelIcon,
  CleaningServices as CleaningServicesIcon,
  Bed as BedIcon,
  Build as BuildIcon 
} from '@mui/icons-material';
import { useState } from 'react';

interface LitsTableProps {
  lits: Lit[];
  isLoading: boolean;
  onStatusChange: (id: string, newStatus: LitStatut) => void;
  isUpdating?: boolean;
}

const statusConfig: { [key in LitStatut]: { icon: React.ReactElement, color: 'success' | 'error' | 'info' | 'warning', label: string } } = {
  'Libre': { icon: <BedIcon fontSize="small" />, color: 'success', label: 'Libre' },
  'Occupé': { icon: <HotelIcon fontSize="small" />, color: 'error', label: 'Occupé' },
  'En nettoyage': { icon: <CleaningServicesIcon fontSize="small" />, color: 'info', label: 'Nettoyage' },
  'En maintenance': { icon: <BuildIcon fontSize="small" />, color: 'warning', label: 'Maintenance' },
};

const ActionsCell = ({ lit, onStatusChange }: { lit: Lit, onStatusChange: (id: string, status: LitStatut) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (newStatus: LitStatut) => {
    onStatusChange(lit.id, newStatus);
    handleClose();
  };

  // Définir les actions possibles en fonction du statut actuel
  const possibleActions: { label: string, status: LitStatut }[] = [];
  if (lit.statut === 'Libre') {
    possibleActions.push({ label: 'Marquer comme occupé', status: 'Occupé' });
    possibleActions.push({ label: 'Mettre en maintenance', status: 'En maintenance' });
    possibleActions.push({ label: 'Envoyer en nettoyage', status: 'En nettoyage' });
  } else if (lit.statut === 'Occupé') {
    possibleActions.push({ label: 'Libérer le lit (nettoyage)', status: 'En nettoyage' });
  } else if (lit.statut === 'En nettoyage' || lit.statut === 'En maintenance') {
    possibleActions.push({ label: 'Rendre disponible', status: 'Libre' });
  }

  return (
    <Box>
      <Tooltip title="Actions">
        <IconButton size="small" onClick={handleClick}>
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {possibleActions.map(action => (
          <MenuItem key={action.status} onClick={() => handleMenuClick(action.status)}>
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const columns = (onStatusChange: (id: string, status: LitStatut) => void): GridColDef[] => [
  { 
    field: 'numeroChambre', 
    headerName: 'Chambre', 
    width: 120,
    renderCell: (params) => `Ch. ${params.value}`,
  },
  { 
    field: 'numeroLit', 
    headerName: 'Lit', 
    width: 80,
    renderCell: (params) => `Lit ${params.value}`,
  },
  {
    field: 'statut',
    headerName: 'Statut',
    width: 150,
    renderCell: (params) => {
      const config = statusConfig[params.value as LitStatut];
      return (
        <Chip
          icon={config.icon}
          label={config.label}
          color={config.color}
          size="small"
          variant="outlined"
        />
      );
    },
  },
  {
    field: 'patientNom',
    headerName: 'Patient',
    flex: 1,
    renderCell: (params) => params.value || '-',
  },
  {
    field: 'patientId',
    headerName: 'ID Patient',
    width: 120,
    renderCell: (params) => params.value || '-',
  },
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 100,
    getActions: (params) => [
      <GridActionsCellItem
        icon={<ActionsCell lit={params.row} onStatusChange={onStatusChange} />}
        label="Actions"
      />,
    ],
  },
];

const LitsTable = ({ lits, isLoading, onStatusChange, isUpdating = false }: LitsTableProps) => {
  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={lits}
        columns={columns(onStatusChange)}
        loading={isLoading || isUpdating}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      />
    </Box>
  );
};

export default LitsTable;
