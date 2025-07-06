import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as UserIcon,
  MedicalServices as FileTextIcon,
  History as HistoryIcon,
  LocalHospital as ActivityIcon,
  Hotel as BedIcon,
  CalendarToday as CalendarIcon,
  Healing as StethoscopeIcon,
  Biotech as TestTubeIcon,
  Assignment as ClipboardIcon,
  Medication as PillIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMedicalRecordsByPatient } from '../../services/medicalRecordService';
import type { MedicalRecord } from '../../services/medicalRecordService';
import { getPatients } from '../../services/patientService';
import type { Patient } from '../../types';
import { CreditCardIcon } from 'lucide-react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const PatientMedicalRecordPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  // Récupération des données patient
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  });

  // Récupération des dossiers médicaux
  const { data: records = [], isLoading: isLoadingRecords, isError } = useQuery({
    queryKey: ['medical-records', patientId],
    queryFn: () => getMedicalRecordsByPatient(patientId!),
    enabled: !!patientId,
  });

  // Trouver le patient sélectionné
  const selectedPatient = patients.find((p: Patient) => p.id === patientId);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'hospitalisé':
        return 'error';
      case 'ambulatoire':
        return 'warning';
      case 'sortie':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'consultation':
        return <StethoscopeIcon sx={{ fontSize: 16 }} />;
      case 'hospitalisation':
        return <BedIcon sx={{ fontSize: 16 }} />;
      case 'examen':
        return <TestTubeIcon sx={{ fontSize: 16 }} />;
      case 'traitement':
        return <PillIcon sx={{ fontSize: 16 }} />;
      case 'chirurgie':
        return <ActivityIcon sx={{ fontSize: 16 }} />;
      case 'diagnostic':
        return <ClipboardIcon sx={{ fontSize: 16 }} />;
      default:
        return <FileTextIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critique':
        return 'error';
      case 'élevée':
        return 'warning';
      case 'modérée':
        return 'info';
      case 'faible':
        return 'success';
      default:
        return 'default';
    }
  };

  if (isLoadingPatients || isLoadingRecords) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error" variant="h6">
          Erreur lors du chargement des dossiers médicaux
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Veuillez réessayer plus tard
        </Typography>
      </Box>
    );
  }

  if (!selectedPatient) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Patient non trouvé
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/patients')}
          startIcon={<ArrowBackIcon />}
        >
          Retour à la liste des patients
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/patients')}
            startIcon={<ArrowBackIcon />}
          >
            Retour
          </Button>
          <Box>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {selectedPatient.name || selectedPatient.nomComplet}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {selectedPatient.age} ans • {selectedPatient.specialty}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={selectedPatient.statut || 'Statut non défini'}
          color={getStatusColor(selectedPatient.statut)}
          size="medium"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          <Tab
            icon={<UserIcon />}
            label="Informations Patient"
            iconPosition="start"
          />
          <Tab
            icon={<FileTextIcon />}
            label="Dossier Médical"
            iconPosition="start"
          />
          <Tab
            icon={<HistoryIcon />}
            label="Historique"
            iconPosition="start"
          />
          <Tab
            icon={<CreditCardIcon />}
            label="Carte Patient"
            iconPosition="start"
            />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {/* Informations Patient */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={3}>
          {/* Informations personnelles */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <UserIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Informations personnelles
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Nom complet
                </Typography>
                <Typography variant="body1">
                  {selectedPatient.name || selectedPatient.nomComplet || 'Non renseigné'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Âge
                </Typography>
                <Typography variant="body1">
                  {selectedPatient.age ? `${selectedPatient.age} ans` : 'Non renseigné'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Sexe
                </Typography>
                <Typography variant="body1">
                  {selectedPatient.sexe === 'M' ? 'Masculin' : selectedPatient.sexe === 'F' ? 'Féminin' : 'Non renseigné'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Informations médicales */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <FileTextIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Informations médicales
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Spécialité
                </Typography>
                <Typography variant="body1">
                  {selectedPatient.specialty || 'Non définie'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Date d'admission
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {selectedPatient.admissionDate || 'Non renseignée'}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Numéro de lit
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <BedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {selectedPatient.bedNumber || 'Non assigné'}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Diagnostic actuel
                </Typography>
                <Typography variant="body1">
                  {selectedPatient.diagnosticActuel || 'Non renseigné'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Dossier Médical */}
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Dossier médical
          </Typography>
          {records && records.length > 0 ? (
            <Box display="flex" flexDirection="column" gap={3}>
              {records.map((record: MedicalRecord) => (
                <Paper key={record.id} sx={{ p: 3, '&:hover': { boxShadow: 3 } }}>
                  <Box display="flex" alignItems="start" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: 'primary.light',
                          color: 'primary.dark'
                        }}
                      >
                        {getTypeIcon(record.type)}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {record.title || 'Dossier médical'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {record.date} • Dr. {record.doctor || 'Non spécifié'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Chip
                        label={record.type || 'Général'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {record.severity && (
                        <Chip
                          label={record.severity}
                          size="small"
                          color={getSeverityColor(record.severity)}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>

                  <Box display="flex" flexDirection="column" gap={2}>
                    {record.description && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          Description
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {record.description}
                        </Typography>
                      </Box>
                    )}

                    {record.results && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          Résultats
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {record.results}
                        </Typography>
                      </Box>
                    )}

                    {record.notes && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          Notes
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          {record.notes}
                        </Typography>
                      </Box>
                    )}

                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <UserIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {record.specialty || 'Médecine générale'} • Dr. {record.doctor || 'Non spécifié'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <FileTextIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucun dossier médical disponible
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Les dossiers médicaux apparaîtront ici une fois créés
              </Typography>
            </Paper>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Historique */}
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Historique des consultations
          </Typography>
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Historique non disponible
            </Typography>
            <Typography variant="body2" color="text.secondary">
              L'historique des consultations sera disponible prochainement
            </Typography>
          </Paper>
        </Box>
      </TabPanel>

      {/* Carte Patient */}
      <TabPanel value={activeTab} index={3}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Carte Patient <Box component="span" sx={{ color: 'primary.main' }}>Virtuelle</Box>
          </Typography>

          {/* Carte virtuelle du patient */}
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Paper
              elevation={8}
              sx={{
                p: 4,
                width: 400,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url(/images/hpd-logo.png) no-repeat center',
                  backgroundSize: '120px',
                  opacity: 0.1,
                  zIndex: 0
                }
              }}
            >
              {/* Header de la carte */}
              <Box display="flex" alignItems="center" mb={3} sx={{ position: 'relative', zIndex: 1 }}>
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    mr: 2,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {selectedPatient?.name?.charAt(0) || selectedPatient?.nomComplet?.charAt(0) || 'P'}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {selectedPatient?.name || selectedPatient?.nomComplet || 'Patient'}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Patient • {selectedPatient?.age || 'N/A'} ans
                  </Typography>
                </Box>
              </Box>

              {/* Informations de la carte */}
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                      Numéro Patient
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedPatient?.matricule || selectedPatient?.id || 'N/A'}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                      Spécialité
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedPatient?.specialty || 'Médecine générale'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                      Statut
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedPatient?.statut || 'Actif'}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                      Sexe
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedPatient?.sexe === 'M' ? 'Masculin' : selectedPatient?.sexe === 'F' ? 'Féminin' : 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                {/* Footer de la carte */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={3}
                  pt={2}
                  sx={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                      HÔPITAL PRIVÉ DE DAKAR
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      Carte Patient Officielle
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CreditCardIcon size={30} />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Informations supplémentaires */}
          <Paper sx={{ p: 3, width: '100%', maxWidth: 600 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
              Informations de la carte
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }} gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Date d'émission
                </Typography>
                <Typography variant="body1">
                  {new Date().toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Validité
                </Typography>
                <Typography variant="body1">
                  Permanente
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Diagnostic principal
                </Typography>
                <Typography variant="body1">
                  {selectedPatient?.diagnosticActuel || 'Non renseigné'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Service
                </Typography>
                <Typography variant="body1">
                  {selectedPatient?.specialty || 'Médecine générale'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default PatientMedicalRecordPage;
