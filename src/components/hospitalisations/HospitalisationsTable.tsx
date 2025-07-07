// src/components/hospitalisations/HospitalisationsTable.tsx
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { Hospitalisation } from '../../types';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Chip } from '@mui/material';
import { CheckCircleOutline, Visibility } from '@mui/icons-material';

interface HospitalisationsTableProps {
  hospitalisations: Hospitalisation[];
  isLoading: boolean;
  onDischarge: (hospitalisationId: string | number, litId: string | number) => void;
}
const getColumns = (onDischarge: (hospitalisationId: string | number, litId: string | number) => void): GridColDef[] => [
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
      renderCell: (params) => {
        let color: "primary" | "warning" | "success" = "primary";
        if (params.value === 'Sortie prévue') color = 'warning';
        if (params.value === 'Sortie effectuée') color = 'success';
        return <Chip label={params.value} color={color} size="small" />;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<Visibility />}
            label="Voir Dossier Patient"
            onClick={() => window.location.assign(`/patients/${params.row.patientId}/medical-record`)}
          />
        ];

        // Afficher le bouton de sortie uniquement si le statut le permet
        if (params.row.statut === 'En cours' || params.row.statut === 'Sortie prévue') {
          actions.push(
            <GridActionsCellItem
              icon={<CheckCircleOutline />}
              label="Finaliser la sortie"
              onClick={() => onDischarge(params.row.id, params.row.litId)}
              color="success"
            />
          );
        }
        return actions;
      },
    },
];
const HospitalisationsTable = ({ hospitalisations, isLoading, onDischarge }: HospitalisationsTableProps) => {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={hospitalisations}
        columns={getColumns(onDischarge)}
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