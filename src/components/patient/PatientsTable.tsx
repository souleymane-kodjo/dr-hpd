// src/components/patients/PatientsTable.tsx
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import type { Patient } from '../../types';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';



interface PatientsTableProps {
  patients: Patient[];
  isLoading: boolean;
}

const PatientsTable = ({ patients, isLoading }: PatientsTableProps) => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: 'nomComplet', headerName: 'Nom complet', width: 250 },
    { field: 'age', headerName: 'Âge', width: 100 },
    { field: 'diagnosticActuel', headerName: 'Diagnostic Actuel', flex: 1 },
    { field: 'statut', headerName: 'Statut', width: 150 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="Voir"
          onClick={() => navigate(`/patients/${params.id}`)}
        />,
      ],
    },
  ];
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={patients}
        columns={columns}
        loading={isLoading}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
      />
    </div>
  );
};

export default PatientsTable;