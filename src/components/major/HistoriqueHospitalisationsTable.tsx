// src/components/major/HistoriqueHospitalisationsTable.tsx
import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

import type { HistoriqueHospitalisation } from '../../types';

interface HistoriqueHospitalisationsTableProps {
  historique: HistoriqueHospitalisation[];
}

const HistoriqueHospitalisationsTable = ({ historique }: HistoriqueHospitalisationsTableProps) => {
  const [filtres, setFiltres] = useState({
    statut: '',
    service: '',
    patient: ''
  });
  
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    hospitalisation: HistoriqueHospitalisation | null;
  }>({
    open: false,
    hospitalisation: null
  });

  const getStatutColor = (statut: string): 'info' | 'success' | 'error' | 'default' => {
    switch (statut) {
      case 'En cours': return 'info';
      case 'Terminée': return 'success';
      case 'Annulée': return 'error';
      default: return 'default';
    }
  };

  const getTypeSortieColor = (typeSortie?: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (typeSortie) {
      case 'Normale': return 'success';
      case 'Transfert': return 'warning';
      case 'Décès': return 'error';
      case 'Fuite': return 'error';
      default: return 'default';
    }
  };

  // Filtrer l'historique
  const historiqueFiltré = historique.filter(h => {
    return (
      (filtres.statut === '' || h.statut === filtres.statut) &&
      (filtres.service === '' || h.serviceHospitalisation.toLowerCase().includes(filtres.service.toLowerCase())) &&
      (filtres.patient === '' || h.patientNom.toLowerCase().includes(filtres.patient.toLowerCase()))
    );
  });

  const columns: GridColDef[] = [
    { 
      field: 'patientNom', 
      headerName: 'Patient', 
      width: 180 
    },
    { 
      field: 'dateAdmission', 
      headerName: 'Date admission', 
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString('fr-FR')
    },
    { 
      field: 'dateSortie', 
      headerName: 'Date sortie', 
      width: 130,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('fr-FR') : '-'
    },
    { 
      field: 'dureeHospitalisation', 
      headerName: 'Durée (j)', 
      width: 100,
      renderCell: (params) => params.value ? `${params.value} j` : '-'
    },
    { 
      field: 'serviceHospitalisation', 
      headerName: 'Service', 
      width: 150 
    },
    {
      field: 'chambre',
      headerName: 'Lieu',
      width: 100,
      renderCell: (params) => `${params.row.chambre}-${params.row.lit}`
    },
    {
      field: 'statut',
      headerName: 'Statut',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatutColor(params.value)}
          size="small"
        />
      )
    },
    {
      field: 'typeSortie',
      headerName: 'Type sortie',
      width: 120,
      renderCell: (params) => params.value ? (
        <Chip 
          label={params.value} 
          color={getTypeSortieColor(params.value)}
          size="small"
        />
      ) : null
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="Voir détails"
          onClick={() => setDetailDialog({ open: true, hospitalisation: params.row })}
        />
      ]
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Historique des Hospitalisations
      </Typography>

      {/* Filtres */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} sm={4}>
          <TextField
            fullWidth
            label="Rechercher un patient"
            value={filtres.patient}
            onChange={(e) => setFiltres({ ...filtres, patient: e.target.value })}
            size="small"
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Statut"
            value={filtres.statut}
            onChange={(e) => setFiltres({ ...filtres, statut: e.target.value })}
            size="small"
          >
            <MenuItem value="">Tous les statuts</MenuItem>
            <MenuItem value="En cours">En cours</MenuItem>
            <MenuItem value="Terminée">Terminée</MenuItem>
            <MenuItem value="Annulée">Annulée</MenuItem>
          </TextField>
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            fullWidth
            label="Service"
            value={filtres.service}
            onChange={(e) => setFiltres({ ...filtres, service: e.target.value })}
            size="small"
          />
        </Grid>
      </Grid>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        {historiqueFiltré.length} hospitalisation(s) trouvée(s)
      </Typography>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={historiqueFiltré}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 15 },
            },
          }}
          pageSizeOptions={[15, 25, 50]}
          getRowId={(row) => row.id}
          sx={{
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }
          }}
        />
      </div>

      {/* Dialog de détails */}
      <Dialog 
        open={detailDialog.open} 
        onClose={() => setDetailDialog({ open: false, hospitalisation: null })} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Détails de l'hospitalisation</DialogTitle>
        <DialogContent>
          {detailDialog.hospitalisation && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Patient</Typography>
                  <Typography variant="body1" gutterBottom>
                    {detailDialog.hospitalisation.patientNom}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Service</Typography>
                  <Typography variant="body1" gutterBottom>
                    {detailDialog.hospitalisation.serviceHospitalisation}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Date d'admission</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(detailDialog.hospitalisation.dateAdmission).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Date de sortie</Typography>
                  <Typography variant="body1" gutterBottom>
                    {detailDialog.hospitalisation.dateSortie 
                      ? new Date(detailDialog.hospitalisation.dateSortie).toLocaleDateString('fr-FR')
                      : 'En cours'
                    }
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Lieu</Typography>
                  <Typography variant="body1" gutterBottom>
                    Chambre {detailDialog.hospitalisation.chambre} - Lit {detailDialog.hospitalisation.lit}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Durée</Typography>
                  <Typography variant="body1" gutterBottom>
                    {detailDialog.hospitalisation.dureeHospitalisation 
                      ? `${detailDialog.hospitalisation.dureeHospitalisation} jour(s)`
                      : 'En cours'
                    }
                  </Typography>
                </Grid>
                <Grid xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Motif d'admission</Typography>
                  <Typography variant="body1" gutterBottom>
                    {detailDialog.hospitalisation.motifAdmission}
                  </Typography>
                </Grid>
                {detailDialog.hospitalisation.typeSortie && (
                  <Grid xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Type de sortie</Typography>
                    <Chip 
                      label={detailDialog.hospitalisation.typeSortie} 
                      color={getTypeSortieColor(detailDialog.hospitalisation.typeSortie)}
                      size="small"
                    />
                  </Grid>
                )}
                {detailDialog.hospitalisation.etatSortie && (
                  <Grid xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">État à la sortie</Typography>
                    <Typography variant="body1">
                      {detailDialog.hospitalisation.etatSortie}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, hospitalisation: null })}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoriqueHospitalisationsTable;
