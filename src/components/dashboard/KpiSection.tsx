
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import {
  Description as FileTextIcon,
  Hotel as BedDoubleIcon,
  AccessTime as ClockIcon,
  People as UsersIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { getKPIs } from '../../services/dashboardService';
import { FileText, BedDouble, Clock, Users, Timer } from 'lucide-react';
import type { KpiData } from '../../types';

// ---------- KPI CARD ----------
const KpiCard2 = ({ data }: { data: KpiData}) => {
  const getIcon = () => {
    switch (data.id) {
      case 'medical-records': return <FileTextIcon fontSize="medium" color="primary" />;
      case 'bed-occupancy': return <BedDoubleIcon fontSize="medium" color="success" />;
      case 'avg-stay': return <ClockIcon fontSize="medium" color="secondary" />;
      case 'current-hospitalizations': return <UsersIcon fontSize="medium" color="warning" />;
      case 'avg-wait-time': return <TimerIcon fontSize="medium" color="error" />;
      default: return <FileTextIcon fontSize="medium" color="action" />;
    }
  };

  return (
    <Paper sx={{
      p: 3,
      height: '100%',
      borderLeft: `4px solid`,
      borderColor: data.change?.startsWith('+') ? 'success.main' : 'error.main',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3
      }
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {data.label}
          </Typography>
          <Box display="flex" alignItems="baseline" mt={1} gap={0.5}>
            <Typography variant="h5" fontWeight={600}>
              {data.value}
            </Typography>
            {data.unit && (
              <Typography variant="body2" color="text.secondary">
                {data.unit}
              </Typography>
            )}
          </Box>
        </Box>
        <Box>{getIcon()}</Box>
      </Box>

      {data.change && (
        <Box display="flex" alignItems="center" mt={2}>
          <Typography
            variant="caption"
            color={data.change.startsWith('+') ? 'success.main' : 'error.main'}
            fontWeight={500}
          >
            {data.change}
          </Typography>
          <Typography variant="caption" color="text.secondary" ml={0.5}>
            vs. mois précédent
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
const KpiCard: React.FC<KpiCardProps> = ({ data }) => {

  const getIcon = () => {
    switch (data.id) {
      case 'medical-records':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'bed-occupancy':
        return <BedDouble className="h-8 w-8 text-green-500" />;
      case 'avg-stay':
        return <Clock className="h-8 w-8 text-purple-500" />;
      case 'current-hospitalizations':
        return <Users className="h-8 w-8 text-orange-500" />;
      case 'avg-wait-time':
        return <Timer className="h-8 w-8 text-red-500" />;
      default:
        return <FileText className="h-8 w-8 text-blue-500" />;
    }
  };

  const getColorClass = () => {
    switch (data.id) {
      case 'medical-records':
        return 'bg-blue-50 border-blue-200';
      case 'bed-occupancy':
        return 'bg-green-50 border-green-200';
      case 'avg-stay':
        return 'bg-purple-50 border-purple-200';
      case 'current-hospitalizations':
        return 'bg-orange-50 border-orange-200';
      case 'avg-wait-time':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleClick = () => {
    switch (data.id) {
      case 'current-hospitalizations':
        setCurrentView('hospitalizations');
        break;
      case 'bed-occupancy':
        setCurrentView('beds');
        break;
      default:
        // Pour les autres KPI, on peut les rendre cliquables plus tard
        break;
    }
  };

  const isClickable = data.id === 'current-hospitalizations' || data.id === 'bed-occupancy';

  return (
    <div
      className={`rounded-lg border p-4 ${getColorClass()} transition-all duration-200 hover:shadow-md ${
        isClickable ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{data.label}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{data.value}</p>
            {data.unit && <p className="ml-1 text-sm text-gray-600">{data.unit}</p>}
          </div>
        </div>
        <div>{getIcon()}</div>
      </div>
      {data.change && (
        <div className="mt-2 flex items-center">
          <span
            className={`text-xs font-medium ${
              data.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {data.change}
          </span>
          <span className="ml-1 text-xs text-gray-500">vs. mois précédent</span>
        </div>
      )}
      {isClickable && (
        <div className="mt-2">
          <span className="text-xs text-blue-600 font-medium">Cliquer pour voir les détails →</span>
        </div>
      )}
    </div>
  );
};

const KpiSection = () => {
  const { data: kpis = [], isLoading, isError } = useQuery({
    queryKey: ['kpis'],
    queryFn: getKPIs,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography color="error">Erreur lors du chargement des indicateurs</Typography>;

  return (
    <Box mb={4}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        <span
        className="text-primary"
        >Indicateurs de performance</span>
      </Typography>
      <Grid container spacing={3}>
        {kpis.map((kpi) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={kpi.id}>
            <KpiCard data={kpi} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
export default KpiSection;