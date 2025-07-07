// src/components/major/SortiesPatientTable.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  Grid
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { 
  ExitToApp as ExitIcon,
  Visibility as VisibilityIcon 
} from '@mui/icons-material';

import type { SortiePatient, Hospitalisation } from '../../types';
import { getSorties, enregistrerSortie } from '../../services/sortieService';
import { getHospitalisations } from '../../services/hospitalisationService';

const SortiesPatientTable = () => {
  const [sortieDialog, setSortieDialog] = useState<{
    open: boolean;
    hospitalisation: Hospitalisation | null;
  }>({
    open: false,
    hospitalisation: null
  });
  
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    sortie: SortiePatient | null;
  }>({
    open: false,
    sortie: null
  });

  const [formData, setFormData] = useState({
    dateSortie: new Date().toISOString().split('T')[0],
    heureSortie: new Date().toTimeString().substring(0, 5),
    typeSortie: 'Normale' as 'Normale' | 'Transfert' | 'Décès' | 'Fuite',
    destinationTransfert: '',
    etatSortie: 'Guéri' as 'Guéri' | 'Amélioré' | 'Stationnaire' | 'Aggravé',
    prescriptionsSortie: '',
    rendezvousSuivi: '',
    commentaires: ''
  });

  const queryClient = useQueryClient();

  const { data: hospitalisationsEnCours = [] } = useQuery({
    queryKey: ['hospitalisations-en-cours'],
    queryFn: async () => {
      const toutes = await getHospitalisations();
      return toutes.filter(h => h.statut === 'En cours');
    }
  });

  const { data: sorties = [] } = useQuery<SortiePatient[]>({
    queryKey: ['sorties'],
    queryFn: () => getSorties()
  });

  const sortieMutation = useMutation({
    mutationFn: enregistrerSortie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sorties'] });
      queryClient.invalidateQueries({ queryKey: ['hospitalisations'] });
      queryClient.invalidateQueries({ queryKey: ['historique-hospitalisations'] });
      setSortieDialog({ open: false, hospitalisation: null });
      resetForm();
    },
    onError: (error) => {
      console.error('Erreur lors de l\'enregistrement de la sortie:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      dateSortie: new Date().toISOString().split('T')[0],
      heureSortie: new Date().toTimeString().substring(0, 5),
      typeSortie: 'Normale',
      destinationTransfert: '',
      etatSortie: 'Guéri',
      prescriptionsSortie: '',
      rendezvousSuivi: '',
      commentaires: ''
    });
  };

  const handleSortie = (hospitalisation: Hospitalisation) => {
    setSortieDialog({ open: true, hospitalisation });
  };

  const handleConfirmSortie = () => {
    if (!sortieDialog.hospitalisation) return;

    const sortieData = {
      hospitalisationId: sortieDialog.hospitalisation.id,
      patientId: sortieDialog.hospitalisation.patientId,
      patientNom: sortieDialog.hospitalisation.patientNom,
      ...formData
    };

    sortieMutation.mutate(sortieData);
  };

  const getTypeSortieColor = (typeSortie: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (typeSortie) {
      case 'Normale': return 'success';
      case 'Transfert': return 'warning';
      case 'Décès': return 'error';
      case 'Fuite': return 'error';
      default: return 'default';
    }
  };

  const columnsEnCours: GridColDef[] = [
    { 
      field: 'patientNom', 
      headerName: 'Patient', 
      width: 200 
    },
    { 
      field: 'dateAdmission', 
      headerName: 'Date admission', 
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString('fr-FR')
    },
    { 
      field: 'motif', 
      headerName: 'Motif', 
      flex: 1 
    },
    {
      field: 'chambre',
      headerName: 'Lieu',
      width: 120,
      renderCell: (params) => `${params.row.chambre}-${params.row.lit}`
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ExitIcon color="primary" />}
          label="Enregistrer sortie"
          onClick={() => handleSortie(params.row)}
        />
      ]
    }
  ];

  const columnsSorties: GridColDef[] = [
    { 
      field: 'patientNom', 
      headerName: 'Patient', 
      width: 180 
    },
    { 
      field: 'dateSortie', 
      headerName: 'Date sortie', 
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString('fr-FR')
    },
    { 
      field: 'heureSortie', 
      headerName: 'Heure', 
      width: 100 
    },
    {
      field: 'typeSortie',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getTypeSortieColor(params.value)}
          size="small"
        />
      )
    },
    { 
      field: 'etatSortie', 
      headerName: 'État', 
      width: 120 
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
          onClick={() => setDetailDialog({ open: true, sortie: params.row })}
        />
      ]
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Gestion des Sorties de Patients
      </Typography>

      {/* Patients hospitalisés en attente de sortie */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Patients en cours d'hospitalisation ({hospitalisationsEnCours.length})
        </Typography>
        <div style={{ height: 300, width: '100%' }}>
          <DataGrid
            rows={hospitalisationsEnCours}
            columns={columnsEnCours}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            getRowId={(row) => row.id}
          />
        </div>
      </Box>

      {/* Historique des sorties récentes */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Sorties récentes ({sorties.length})
        </Typography>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={sorties}
            columns={columnsSorties}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 8 },
              },
            }}
            pageSizeOptions={[8, 15, 25]}
            getRowId={(row) => row.id}
          />
        </div>
      </Box>

      {/* Dialog d'enregistrement de sortie */}
      <Dialog open={sortieDialog.open} onClose={() => setSortieDialog({ open: false, hospitalisation: null })} maxWidth="md" fullWidth>
        <DialogTitle>Enregistrer la sortie du patient</DialogTitle>
        <DialogContent>
          {sortieDialog.hospitalisation && (
            <Box sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <strong>Patient:</strong> {sortieDialog.hospitalisation.patientNom}<br />
                <strong>Hospitalisé depuis:</strong> {new Date(sortieDialog.hospitalisation.dateAdmission).toLocaleDateString('fr-FR')}<br />
                <strong>Motif:</strong> {sortieDialog.hospitalisation.motif}
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date de sortie"
                    value={formData.dateSortie}
                    onChange={(e) => setFormData({ ...formData, dateSortie: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Heure de sortie"
                    value={formData.heureSortie}
                    onChange={(e) => setFormData({ ...formData, heureSortie: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Type de sortie"
                    value={formData.typeSortie}
                    onChange={(e) => setFormData({ ...formData, typeSortie: e.target.value as 'Normale' | 'Transfert' | 'Décès' | 'Fuite' })}
                  >
                    <MenuItem value="Normale">Normale</MenuItem>
                    <MenuItem value="Transfert">Transfert</MenuItem>
                    <MenuItem value="Décès">Décès</MenuItem>
                    <MenuItem value="Fuite">Fuite</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="État à la sortie"
                    value={formData.etatSortie}
                    onChange={(e) => setFormData({ ...formData, etatSortie: e.target.value as 'Guéri' | 'Amélioré' | 'Stationnaire' | 'Aggravé' })}
                  >
                    <MenuItem value="Guéri">Guéri</MenuItem>
                    <MenuItem value="Amélioré">Amélioré</MenuItem>
                    <MenuItem value="Stationnaire">Stationnaire</MenuItem>
                    <MenuItem value="Aggravé">Aggravé</MenuItem>
                  </TextField>
                </Grid>
                {formData.typeSortie === 'Transfert' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Destination du transfert"
                      value={formData.destinationTransfert}
                      onChange={(e) => setFormData({ ...formData, destinationTransfert: e.target.value })}
                      placeholder="Ex: Hôpital Le Dantec - Service de Cardiologie"
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Prescriptions de sortie"
                    value={formData.prescriptionsSortie}
                    onChange={(e) => setFormData({ ...formData, prescriptionsSortie: e.target.value })}
                    placeholder="Médicaments, soins à domicile..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rendez-vous de suivi"
                    value={formData.rendezvousSuivi}
                    onChange={(e) => setFormData({ ...formData, rendezvousSuivi: e.target.value })}
                    placeholder="Date et heure du prochain rendez-vous"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Commentaires"
                    value={formData.commentaires}
                    onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
                    placeholder="Observations particulières..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSortieDialog({ open: false, hospitalisation: null })}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmSortie}
            variant="contained"
            disabled={sortieMutation.isPending}
          >
            Enregistrer la sortie
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de détails de sortie */}
      <Dialog open={detailDialog.open} onClose={() => setDetailDialog({ open: false, sortie: null })} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la sortie</DialogTitle>
        <DialogContent>
          {detailDialog.sortie && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Patient</Typography>
                  <Typography variant="body1" gutterBottom>
                    {detailDialog.sortie.patientNom}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Date et heure de sortie</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(detailDialog.sortie.dateSortie).toLocaleDateString('fr-FR')} à {detailDialog.sortie.heureSortie}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Type de sortie</Typography>
                  <Chip 
                    label={detailDialog.sortie.typeSortie} 
                    color={getTypeSortieColor(detailDialog.sortie.typeSortie)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">État à la sortie</Typography>
                  <Typography variant="body1" gutterBottom>
                    {detailDialog.sortie.etatSortie}
                  </Typography>
                </Grid>
                {detailDialog.sortie.destinationTransfert && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Destination du transfert</Typography>
                    <Typography variant="body1" gutterBottom>
                      {detailDialog.sortie.destinationTransfert}
                    </Typography>
                  </Grid>
                )}
                {detailDialog.sortie.prescriptionsSortie && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Prescriptions</Typography>
                    <Typography variant="body1" gutterBottom>
                      {detailDialog.sortie.prescriptionsSortie}
                    </Typography>
                  </Grid>
                )}
                {detailDialog.sortie.rendezvousSuivi && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Rendez-vous de suivi</Typography>
                    <Typography variant="body1" gutterBottom>
                      {detailDialog.sortie.rendezvousSuivi}
                    </Typography>
                  </Grid>
                )}
                {detailDialog.sortie.commentaires && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Commentaires</Typography>
                    <Typography variant="body1" gutterBottom>
                      {detailDialog.sortie.commentaires}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Validé par</Typography>
                  <Typography variant="body1" gutterBottom>
                    {detailDialog.sortie.majorValidant} - {new Date(detailDialog.sortie.dateValidation).toLocaleString('fr-FR')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, sortie: null })}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SortiesPatientTable;
