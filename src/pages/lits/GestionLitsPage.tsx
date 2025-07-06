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
  ToggleButtonGroup,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  TableRows as TableRowsIcon,
  GridView as GridViewIcon,
  Hotel as HotelIcon,
  Bed as BedIcon,
  CleaningServices as CleaningServicesIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { getLits, updateLitStatus } from '../../services/litService';
import LitsTable from '../../components/lits/LitsTable';
import LitCard from '../../components/lits/LitCard';
import type { LitStatut } from '../../types';

const GestionLitsPage = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LitStatut | 'all'>('all');

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

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Calcul des statistiques
  const stats = {
    total: lits.length,
    libres: lits.filter(l => l.statut === 'Libre').length,
    occupes: lits.filter(l => l.statut === 'Occupé').length,
    enNettoyage: lits.filter(l => l.statut === 'En nettoyage').length,
    enMaintenance: lits.filter(l => l.statut === 'En maintenance').length,
  };

  // Filtrage des lits
  const filteredLits = lits.filter(lit => {
    const matchesSearch = searchTerm === '' || 
      lit.numeroChambre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lit.numeroLit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lit.patientNom && lit.patientNom.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lit.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
        {/* KPI Total */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            height: 180,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: 6,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              transform: 'translate(20px, -20px)',
            }
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <AssessmentIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, mb: 0.5 }}>
            Total des lits
          </Typography>
          <Typography variant="h3" fontWeight="bold">{stats.total}</Typography>
        </Paper>

        {/* KPI Libres */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            height: 180,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: 6,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              transform: 'translate(20px, -20px)',
            }
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <BedIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, mb: 0.5 }}>
            Lits libres
          </Typography>
          <Typography variant="h3" fontWeight="bold">{stats.libres}</Typography>
        </Paper>

        {/* KPI Occupés */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            height: 180,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: 6,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              transform: 'translate(20px, -20px)',
            }
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <HotelIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, mb: 0.5 }}>
            Lits occupés
          </Typography>
          <Typography variant="h3" fontWeight="bold">{stats.occupes}</Typography>
        </Paper>

        {/* KPI En nettoyage */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            height: 180,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#333',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: 6,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.3)',
              transform: 'translate(20px, -20px)',
            }
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <CleaningServicesIcon sx={{ fontSize: 28, color: '#333' }} />
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(51, 51, 51, 0.8)', fontWeight: 500, mb: 0.5 }}>
            En nettoyage
          </Typography>
          <Typography variant="h3" fontWeight="bold" color="#333">{stats.enNettoyage}</Typography>
        </Paper>

        {/* KPI En maintenance */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            height: 180,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            color: '#333',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: 6,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.3)',
              transform: 'translate(20px, -20px)',
            }
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <BuildIcon sx={{ fontSize: 28, color: '#333' }} />
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(51, 51, 51, 0.8)', fontWeight: 500, mb: 0.5 }}>
            En maintenance
          </Typography>
          <Typography variant="h3" fontWeight="bold" color="#333">{stats.enMaintenance}</Typography>
        </Paper>
      </Box>

      {/* Message d'actualisation */}
      {updateStatusMutation.isPending && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Mise à jour du statut en cours...
        </Alert>
      )}

      {/* Section Filtres et Recherche */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="primary" />
          Filtres et recherche
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
          <TextField
            placeholder="Rechercher par chambre, lit ou patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statusFilter}
              label="Statut"
              onChange={(e) => setStatusFilter(e.target.value as LitStatut | 'all')}
            >
              <MenuItem value="all">Tous les statuts</MenuItem>
              <MenuItem value="Libre">Libre</MenuItem>
              <MenuItem value="Occupé">Occupé</MenuItem>
              <MenuItem value="En nettoyage">En nettoyage</MenuItem>
              <MenuItem value="En maintenance">En maintenance</MenuItem>
            </Select>
          </FormControl>
          {(searchTerm || statusFilter !== 'all') && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${filteredLits.length} lit(s) trouvé(s)`}
                color="primary"
                variant="outlined"
              />
              <Tooltip title="Réinitialiser les filtres">
                <Fab
                  size="small"
                  color="default"
                  onClick={handleClearFilters}
                  sx={{ minHeight: 32, width: 32, height: 32 }}
                >
                  <ClearIcon fontSize="small" />
                </Fab>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Liste des lits */}
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
            Liste des lits ({filteredLits.length} lits)
          </Typography>

          {viewMode === 'table' ? (
            <LitsTable
              lits={filteredLits}
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
              {filteredLits.map(lit => (
                <LitCard
                  key={lit.id}
                  lit={lit}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </Box>
          )}

          {filteredLits.length === 0 && lits.length > 0 && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
              textAlign="center"
            >
              <Box>
                <Typography variant="h6" color="text.secondary">
                  Aucun lit trouvé
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Essayez de modifier vos critères de recherche ou de filtre
                </Typography>
              </Box>
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
