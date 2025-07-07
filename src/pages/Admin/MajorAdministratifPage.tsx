// src/pages/Admin/MajorAdministratifPage.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Badge,
  Grid
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  ExitToApp as ExitIcon,
  History as HistoryIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

import { getDemandesAdmission, getStatistiquesAdmissions } from '../../services/admissionService';
import { getHistoriqueHospitalisations, getStatistiquesHospitalisations } from '../../services/sortieService';
import { useAuthStore } from '../../store/authStore';

// Composants à créer
import DemandesAdmissionTable from '../../components/major/DemandesAdmissionTable';
import SortiesPatientTable from '../../components/major/SortiesPatientTable';
import HistoriqueHospitalisationsTable from '../../components/major/HistoriqueHospitalisationsTable';
import MajorDashboard from '../../components/major/MajorDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const MajorAdministratifPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuthStore();

  // Vérifier les permissions
  const hasPermission = user?.roles.includes('MAJOR_ADMINISTRATIF') || user?.roles.includes('ADMIN');

  const { data: demandesAdmission = [] } = useQuery({
    queryKey: ['demandes-admission'],
    queryFn: () => getDemandesAdmission(),
    enabled: hasPermission
  });

  const { data: statsAdmissions } = useQuery({
    queryKey: ['stats-admissions'],
    queryFn: getStatistiquesAdmissions,
    enabled: hasPermission
  });

  const { data: historiqueHospitalisations = [] } = useQuery({
    queryKey: ['historique-hospitalisations'],
    queryFn: () => getHistoriqueHospitalisations(),
    enabled: hasPermission
  });

  const { data: statsHospitalisations } = useQuery({
    queryKey: ['stats-hospitalisations'],
    queryFn: getStatistiquesHospitalisations,
    enabled: hasPermission
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!hasPermission) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Accès non autorisé
        </Typography>
        <Typography>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Typography>
      </Box>
    );
  }

  const demandesEnAttente = demandesAdmission.filter(d => d.statut === 'En attente').length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Interface Major Administratif
        </Typography>
        <Chip 
          label={`${user?.nom}`} 
          color="primary" 
          variant="outlined"
          sx={{ fontSize: '0.9rem', px: 1 }}
        />
      </Box>

      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Demandes en attente
              </Typography>
              <Typography variant="h4" color="warning.main">
                {demandesEnAttente}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Taux de validation
              </Typography>
              <Typography variant="h4" color="success.main">
                {statsAdmissions?.tauxValidation || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Hospitalisations en cours
              </Typography>
              <Typography variant="h4" color="info.main">
                {statsHospitalisations?.enCours || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Durée moyenne (jours)
              </Typography>
              <Typography variant="h4" color="primary.main">
                {statsHospitalisations?.dureeMoyenne || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            icon={<DashboardIcon />} 
            label="Tableau de bord" 
            iconPosition="start" 
          />
          <Tab 
            icon={
              <Badge badgeContent={demandesEnAttente} color="warning">
                <AssignmentIcon />
              </Badge>
            } 
            label="Demandes d'admission" 
            iconPosition="start" 
          />
          <Tab 
            icon={<ExitIcon />} 
            label="Sorties de patients" 
            iconPosition="start" 
          />
          <Tab 
            icon={<HistoryIcon />} 
            label="Historique" 
            iconPosition="start" 
          />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      <TabPanel value={tabValue} index={0}>
        <MajorDashboard 
          statsAdmissions={statsAdmissions}
          statsHospitalisations={statsHospitalisations}
          demandesRecentes={demandesAdmission.slice(0, 5)}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <DemandesAdmissionTable 
          demandes={demandesAdmission}
          onValidation={() => {
            // Refetch des données après validation
          }}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <SortiesPatientTable />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <HistoriqueHospitalisationsTable 
          historique={historiqueHospitalisations}
        />
      </TabPanel>
    </Box>
  );
};

export default MajorAdministratifPage;
