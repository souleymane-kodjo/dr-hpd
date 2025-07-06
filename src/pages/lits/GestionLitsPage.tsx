// src/pages/lits/GestionLitsPage.tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Paper,
  Alert,
  Fab,
  Tooltip,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Add as AddIcon,
  TableRows as TableRowsIcon,
  GridView as GridViewIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { getLits, updateLitStatus } from '../../services/litService';
import LitsTable from '../../components/lits/LitsTable';
import LitCard from '../../components/lits/LitCard';
import type { LitStatut } from '../../types';

const GestionLitsPage = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const { data: lits = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['lits'],
    queryFn: getLits,
    refetchInterval: 30000, // Actualisation automatique toutes les 30 secondes
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string, statut: LitStatut }) => updateLitStatus(id, statut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lits'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du statut:', error);
    },
  });

  const handleStatusChange = (id: string, statut: LitStatut) => {
    updateStatusMutation.mutate({ id, statut });
  };

  const handleRefresh = () => {
    refetch();
  };

  // Calcul des statistiques
  const stats = {
    total: lits.length,
    libres: lits.filter(l => l.statut === 'Libre').length,
    occupes: lits.filter(l => l.statut === 'Occupé').length,
    enNettoyage: lits.filter(l => l.statut === 'En nettoyage').length,
    enMaintenance: lits.filter(l => l.statut === 'En maintenance').length,
  };

  const tauxOccupation = stats.total > 0 ? Math.round((stats.occupes / stats.total) * 100) : 0;

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erreur lors du chargement des données des lits. Veuillez réessayer.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Gestion des Lits
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Surveillance en temps réel de l'occupation des lits
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="table">
              <Tooltip title="Vue tableau">
                <TableRowsIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="cards">
              <Tooltip title="Vue cartes">
                <GridViewIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          <Chip 
            label={`Taux d'occupation: ${tauxOccupation}%`}
            color={tauxOccupation > 80 ? 'error' : tauxOccupation > 60 ? 'warning' : 'success'}
            variant="outlined"
          />
          <Tooltip title="Actualiser">
            <Fab 
              size="small" 
              color="primary" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshIcon />
            </Fab>
          </Tooltip>
        </Stack>
      </Box>

      {/* Section des KPIs */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(5, 1fr)'
          },
          gap: 3,
          mb: 4
        }}
      >
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h3" fontWeight="bold">{stats.total}</Typography>
          <Typography variant="h6">Total</Typography>
        </Paper>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h3" fontWeight="bold" color="inherit">
            {stats.libres}
          </Typography>
          <Typography variant="h6">Libres</Typography>
        </Paper>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h3" fontWeight="bold" color="inherit">
            {stats.occupes}
          </Typography>
          <Typography variant="h6">Occupés</Typography>
        </Paper>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#333',
          }}
        >
          <Typography variant="h3" fontWeight="bold" color="inherit">
            {stats.enNettoyage}
          </Typography>
          <Typography variant="h6">Nettoyage</Typography>
        </Paper>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            color: '#333',
          }}
        >
          <Typography variant="h3" fontWeight="bold" color="inherit">
            {stats.enMaintenance}
          </Typography>
          <Typography variant="h6">Maintenance</Typography>
        </Paper>
      </Box>

      {/* Message d'actualisation */}
      {updateStatusMutation.isPending && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Mise à jour du statut en cours...
        </Alert>
      )}

      {/* Grille des lits */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Chargement des lits...
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Typography variant="h5" sx={{ mb: 2 }}>
            État des lits ({lits.length} lits)
          </Typography>
          
          {viewMode === 'table' ? (
            <LitsTable 
              lits={lits}
              isLoading={isLoading}
              onStatusChange={handleStatusChange}
              isUpdating={updateStatusMutation.isPending}
            />
          ) : (
            <Box 
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)'
                },
                gap: 3
              }}
            >
              {lits.map(lit => (
                <LitCard
                  key={lit.id}
                  lit={lit}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </Box>
          )}
          
          {lits.length === 0 && (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              minHeight="200px"
              textAlign="center"
            >
              <Box>
                <Typography variant="h6" color="text.secondary">
                  Aucun lit disponible
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contactez l'administrateur pour ajouter des lits
                </Typography>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Bouton flottant pour actions rapides */}
      <Tooltip title="Actions rapides">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
          }}
          onClick={() => {
            // Future: Ouvrir un modal pour ajouter un lit
            console.log('Ajouter un nouveau lit');
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default GestionLitsPage;
