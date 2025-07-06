// src/components/hospitalisations/HospitalisationsTable.tsx
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { Hospitalisation } from '../../types';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Chip } from '@mui/material';

interface HospitalisationsTableProps {
  hospitalisations: Hospitalisation[];
  isLoading: boolean;
}

const columns: GridColDef[] = [
  { field: 'patientNom', headerName: 'Patient', width: 220 },
  { field: 'dateAdmission', headerName: 'Date d\'admission', width: 150 },
  { field: 'motif', headerName: 'Motif d\'hospitalisation', flex: 1 },
  {
    field: 'chambre',
    headerName: 'Lieu',
    width: 120,
    renderCell: (params) => `Ch. ${params.row.chambre} - Lit ${params.row.lit}`,
  },
  {
    field: 'statut',
    headerName: 'Statut',
    width: 150,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color={params.value === 'En cours' ? 'primary' : 'warning'}
        size="small"
      />
    ),
  },
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 100,
    getActions: (params) => [
      <GridActionsCellItem
        icon={<VisibilityIcon />}
        label="Voir Dossier Patient"
        // Note: Le lien devrait aller au dossier du patient, pas de l'hospitalisation pour l'instant
        onClick={() => window.location.assign(`/patients/${params.row.patientId}/medical-record`)}
      />,
    ],
  },
];

const HospitalisationsTable = ({ hospitalisations, isLoading }: HospitalisationsTableProps) => {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={hospitalisations}
        columns={columns}
        loading={isLoading}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        getRowId={(row) => row.id}
      />
    </div>
  );
};

export default HospitalisationsTable;