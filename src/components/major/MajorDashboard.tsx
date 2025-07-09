// src/components/major/MajorDashboard.tsx
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';

import {
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  ExitToApp as ExitIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

import type { DemandeAdmission } from '../../types/admissions';

interface MajorDashboardProps {
  statsAdmissions?: {
    total: number;
    enAttente: number;
    validees: number;
    rejetees: number;
    tauxValidation: number;
  };
  statsHospitalisations?: {
    total: number;
    enCours: number;
    terminees: number;
    annulees: number;
    dureeMoyenne: number;
    tauxOccupation: number;
  };
  demandesRecentes: DemandeAdmission[];
}

const MajorDashboard = ({
  statsAdmissions,
  statsHospitalisations,
  demandesRecentes
}: MajorDashboardProps) => {

  const getPrioriteColor = (priorite: string): 'error' | 'warning' | 'default' => {
    switch (priorite) {
      case 'Critique': return 'error';
      case 'Urgente': return 'warning';
      case 'Normale': return 'default';
      default: return 'default';
    }
  };

  const getStatutColor = (statut: string): 'warning' | 'success' | 'error' | 'default' => {
    switch (statut) {
      case 'En attente': return 'warning';
      case 'Validée': return 'success';
      case 'Rejetée': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tableau de Bord - Major Administratif
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Vue d'ensemble des activités et statistiques
      </Typography>

      <Grid container spacing={3}>
        {/* Statistiques des admissions */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Demandes d'Admission</Typography>
              </Box>

              {statsAdmissions && (
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">En attente</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {statsAdmissions.enAttente}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Validées</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {statsAdmissions.validees}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Rejetées</Typography>
                    <Typography variant="body2" color="error.main" fontWeight="bold">
                      {statsAdmissions.rejetees}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Taux de validation</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {statsAdmissions.tauxValidation}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={statsAdmissions.tauxValidation}
                      color="success"
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques des hospitalisations */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Hospitalisations</Typography>
              </Box>

              {statsHospitalisations && (
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">En cours</Typography>
                    <Typography variant="body2" color="info.main" fontWeight="bold">
                      {statsHospitalisations.enCours}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Terminées</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {statsHospitalisations.terminees}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Durée moyenne</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {statsHospitalisations.dureeMoyenne} jours
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Taux d'occupation</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {statsHospitalisations.tauxOccupation}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={statsHospitalisations.tauxOccupation}
                      color={statsHospitalisations.tauxOccupation > 80 ? "warning" : "primary"}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Actions rapides */}
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Actions Rapides</Typography>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Demandes urgentes"
                    secondary={`${demandesRecentes.filter(d => d.priorite === 'Urgente' && d.statut === 'En attente').length} en attente`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Demandes critiques"
                    secondary={`${demandesRecentes.filter(d => d.priorite === 'Critique' && d.statut === 'En attente').length} en attente`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <ExitIcon color="info" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sorties prévues"
                    secondary="À traiter aujourd'hui"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Validations effectuées"
                    secondary="Cette semaine"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Demandes récentes */}
        <Grid xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Demandes Récentes
              </Typography>

              {demandesRecentes.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Aucune demande récente
                </Typography>
              ) : (
                <List>
                  {demandesRecentes.map((demande) => (
                    <ListItem key={demande.id} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2">
                              {demande.patientNom}
                            </Typography>
                            <Chip
                              label={demande.priorite}
                              color={getPrioriteColor(demande.priorite)}
                              size="small"
                            />
                            <Chip
                              label={demande.statut}
                              color={getStatutColor(demande.statut)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {demande.serviceRequis} • {demande.motifAdmission}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Créé le {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MajorDashboard;
