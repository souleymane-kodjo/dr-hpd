// src/components/major/DemandesAdmissionTable.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

import type { DemandeAdmission, ValidationAdmission } from '../../types/admissions';
import { validerDemandeAdmission } from '../../services/admissionService';

interface DemandesAdmissionTableProps {
  demandes: DemandeAdmission[];
  onValidation: () => void;
}

const DemandesAdmissionTable = ({ demandes, onValidation }: DemandesAdmissionTableProps) => {
  const [validationDialog, setValidationDialog] = useState<{
    open: boolean;
    demande: DemandeAdmission | null;
    action: 'Validée' | 'Rejetée' | null;
  }>({
    open: false,
    demande: null,
    action: null
  });
  
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    demande: DemandeAdmission | null;
  }>({
    open: false,
    demande: null
  });

  const [commentaire, setCommentaire] = useState('');
  const [litAttribue, setLitAttribue] = useState('');

  const queryClient = useQueryClient();

  const validationMutation = useMutation({
    mutationFn: validerDemandeAdmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandes-admission'] });
      queryClient.invalidateQueries({ queryKey: ['stats-admissions'] });
      setValidationDialog({ open: false, demande: null, action: null });
      setCommentaire('');
      setLitAttribue('');
      onValidation();
    },
    onError: (error) => {
      console.error('Erreur lors de la validation:', error);
    }
  });

  const handleValidation = (demande: DemandeAdmission, action: 'Validée' | 'Rejetée') => {
    setValidationDialog({ open: true, demande, action });
  };

  const handleConfirmValidation = () => {
    if (!validationDialog.demande || !validationDialog.action) return;

    const validation: ValidationAdmission = {
      demandeId: validationDialog.demande.id,
      statut: validationDialog.action,
      commentaire,
      litAttribue: validationDialog.action === 'Validée' ? litAttribue : undefined
    };

    validationMutation.mutate(validation);
  };

  const getPrioriteColor = (priorite: string): "error" | "warning" | "default" | "primary" | "secondary" | "info" | "success" => {
    switch (priorite) {
      case 'Critique': return 'error';
      case 'Urgente': return 'warning';
      case 'Normale': return 'default';
      default: return 'default';
    }
  };

  const getStatutColor = (statut: string): "error" | "warning" | "default" | "primary" | "secondary" | "info" | "success" => {
    switch (statut) {
      case 'En attente': return 'warning';
      case 'Validée': return 'success';
      case 'Rejetée': return 'error';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'patientNom', 
      headerName: 'Patient', 
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {params.value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.patientAge} ans, {params.row.patientSexe}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'serviceRequis', 
      headerName: 'Service', 
      width: 150 
    },
    { 
      field: 'motifAdmission', 
      headerName: 'Motif', 
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' 
        }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'priorite',
      headerName: 'Priorité',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getPrioriteColor(params.value)}
          size="small"
        />
      )
    },
    {
      field: 'dateSouhaitee',
      headerName: 'Date souhaitée',
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString('fr-FR')
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
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<VisibilityIcon />}
            label="Voir détails"
            onClick={() => setDetailDialog({ open: true, demande: params.row })}
          />
        ];

        if (params.row.statut === 'En attente') {
          actions.push(
            <GridActionsCellItem
              icon={<CheckIcon color="success" />}
              label="Valider"
              onClick={() => handleValidation(params.row, 'Validée')}
            />,
            <GridActionsCellItem
              icon={<CancelIcon color="error" />}
              label="Rejeter"
              onClick={() => handleValidation(params.row, 'Rejetée')}
            />
          );
        }

        return actions;
      }
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Demandes d'Admission à Traiter
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {demandes.filter(d => d.statut === 'En attente').length} demande(s) en attente de validation
        </Typography>
      </Box>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={demandes}
          columns={columns}
          loading={validationMutation.isPending}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
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

      {/* Dialog de validation */}
      <Dialog open={validationDialog.open} onClose={() => setValidationDialog({ open: false, demande: null, action: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {validationDialog.action === 'Validée' ? 'Valider la demande' : 'Rejeter la demande'}
        </DialogTitle>
        <DialogContent>
          {validationDialog.demande && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Patient: {validationDialog.demande.patientNom}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {validationDialog.demande.motifAdmission}
              </Typography>
              
              {validationDialog.action === 'Validée' && (
                <TextField
                  fullWidth
                  label="Lit à attribuer"
                  value={litAttribue}
                  onChange={(e) => setLitAttribue(e.target.value)}
                  margin="normal"
                  placeholder="Ex: 101-A"
                  helperText="Spécifiez le lit à attribuer au patient"
                />
              )}
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Commentaire"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                margin="normal"
                placeholder={
                  validationDialog.action === 'Validée' 
                    ? "Commentaire sur l'admission..." 
                    : "Raison du rejet..."
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setValidationDialog({ open: false, demande: null, action: null })}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmValidation}
            variant="contained"
            color={validationDialog.action === 'Validée' ? 'success' : 'error'}
            disabled={validationMutation.isPending}
          >
            {validationDialog.action === 'Validée' ? 'Valider' : 'Rejeter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de détails */}
      <Dialog open={detailDialog.open} onClose={() => setDetailDialog({ open: false, demande: null })} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la demande d'admission</DialogTitle>
        <DialogContent>
          {detailDialog.demande && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {detailDialog.demande.patientNom}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Âge:</strong> {detailDialog.demande.patientAge} ans • <strong>Sexe:</strong> {detailDialog.demande.patientSexe}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Médecin demandeur:</strong> {detailDialog.demande.medecinDemandeur}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Service requis:</strong> {detailDialog.demande.serviceRequis}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Motif:</strong> {detailDialog.demande.motifAdmission}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Diagnostic provisoire:</strong> {detailDialog.demande.diagnosticProvisoire}
              </Typography>
              {detailDialog.demande.observationsSpeciales && (
                <Typography variant="body2" gutterBottom>
                  <strong>Observations:</strong> {detailDialog.demande.observationsSpeciales}
                </Typography>
              )}
              <Typography variant="body2" gutterBottom>
                <strong>Date de création:</strong> {new Date(detailDialog.demande.dateCreation).toLocaleString('fr-FR')}
              </Typography>
              {detailDialog.demande.commentaireMajor && (
                <Alert severity={detailDialog.demande.statut === 'Validée' ? 'success' : 'error'} sx={{ mt: 2 }}>
                  <strong>Décision du Major:</strong> {detailDialog.demande.commentaireMajor}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, demande: null })}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DemandesAdmissionTable;
