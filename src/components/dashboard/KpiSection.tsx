import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import {
  Description as FileTextIcon,
  Hotel as BedDoubleIcon,
  AccessTime as ClockIcon,
  People as UsersIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { getKPIs } from '../../services/dashboardService';
import type { KpiData } from '../../types';

// Types
interface KpiCardProps {
  data: KpiData;
}

// Configuration des couleurs et icônes par KPI
const KPI_CONFIG = {
  'medical-records': {
    icon: FileTextIcon,
    color: 'primary',
    gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
  },
  'bed-occupancy': {
    icon: BedDoubleIcon,
    color: 'success',
    gradient: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)'
  },
  'avg-stay': {
    icon: ClockIcon,
    color: 'secondary',
    gradient: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)'
  },
  'current-hospitalizations': {
    icon: UsersIcon,
    color: 'warning',
    gradient: 'linear-gradient(135deg, #ed6c02 0%, #ffb74d 100%)'
  },
  'avg-wait-time': {
    icon: TimerIcon,
    color: 'error',
    gradient: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)'
  }
} as const;

// Composant KPI Card amélioré
const KpiCard: React.FC<KpiCardProps> = ({ data }) => {
  const config = KPI_CONFIG[data.id as keyof typeof KPI_CONFIG] || KPI_CONFIG['medical-records'];
  const IconComponent = config.icon;
  const isPositiveChange = data.change?.startsWith('+');

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: 190,
        width: '100%',
        borderRadius: 3,
        background: config.gradient,
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
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          transform: 'translate(30px, -30px)',
        }
      }}
    >
      {/* Header avec icône */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <IconComponent sx={{ fontSize: 28, color: 'white' }} />
        </Box>

        {data.change && (
          <Chip
            icon={isPositiveChange ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={data.change}
            size="small"
            sx={{
              backgroundColor: isPositiveChange ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
              color: 'white',
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: 'white'
              }
            }}
          />
        )}
      </Box>

      {/* Contenu principal */}
      <Box
      //taille width
       width="170px"
      >
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            mb: 0.5
          }}
        >
          {data.label}
        </Typography>

        <Box display="flex" alignItems="baseline" gap={0.5}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2
            }}
          >
            {data.value}
          </Typography>
          {data.unit && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 500
              }}
            >
              {data.unit}
            </Typography>
          )}
        </Box>

        {data.change && (
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 500,
              mt: 1,
              display: 'block'
            }}
          >
            vs. mois précédent
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

// Composant principal
const KpiSection = () => {
  const { data: kpis = [], isLoading, isError } = useQuery({
    queryKey: ['kpis'],
    queryFn: getKPIs,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error" variant="h6">
          Erreur lors du chargement des indicateurs
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Veuillez réessayer plus tard
        </Typography>
      </Box>
    );
  }

  return (
    <Box mb={5}>
      <Box mb={3}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            color: 'primary.main',
            mb: 0.5
          }}
        >
          Indicateurs de performance
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          Aperçu en temps réel des métriques hospitalières
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',                    // 1 colonne sur très petit écran
            sm: 'repeat(2, 1fr)',        // 2 colonnes sur petit écran
            md: 'repeat(3, 1fr)',        // 3 colonnes sur moyen écran
            lg: 'repeat(4, 1fr)'         // 4 colonnes sur grand écran
          },
          gap: 4,
          maxWidth: '1024px',
          margin: '0 auto'
        }}
      >
        {kpis.map((kpi) => (
          <Box key={kpi.id}>
            <KpiCard data={kpi} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default KpiSection;
