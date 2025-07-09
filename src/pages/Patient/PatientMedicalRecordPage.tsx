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
  Avatar,
  IconButton
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
  Medication as PillIcon,
  FlipToBack as FlipToBackIcon,
  FlipToFront as FlipToFrontIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMedicalRecordsByPatient } from '../../services/medicalRecordService';
import type { MedicalRecord } from '../../services/medicalRecordService';
import { getPatients } from '../../services/patientService';
import type { Patient } from '../../types';
import { CreditCardIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = () => setIsFlipped(!isFlipped);
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
      <TabPanel value={activeTab} index={3}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={4} mt={0}
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          width: '100%',
          maxWidth: 1000,
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden',
        }}

        border ="1px solid rgba(255,255,255,0.2)"
        >
          <Box
          border ="1px solid rgba(239, 34, 34, 0.2)"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '60%',
            perspective: '1000px',
            height: 390,
            position: 'relative'
          }}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
                ransform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                cursor: 'pointer',
                '&:hover': {
                  '& .flip-button': {
                    opacity: 1
                  }
                }
              }}
              onClick={handleFlip}
            >
              {/* Face avant */}
              <Paper
                elevation={8}
                sx={{
                  p: 3,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #0F4C81 0%, #1A5F9A 100%)',
                  color: 'white',
                  borderRadius: 3,
                  position: 'absolute',
                  backfaceVisibility: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url(/images/hpd-logo.png) no-repeat center',
                    backgroundSize: '150px',
                    opacity: 0.08,
                    zIndex: 0
                  }
                }}
              >
                {/* Bouton flip */}
                <IconButton
                  className="flip-button"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.2)'
                  }}
                >
                  <FlipToBackIcon />
                </IconButton>

                {/* Header */}
                <Box display="flex" alignItems="center"

                sx={{
                   position: 'relative',
                    zIndex: 1 ,
                    width: '100%',
                    justifyContent: 'space-between',
                    height : 200
                   }}>
                  <Avatar
                    src='/images/avatar1.jpg' // Placeholder image, replace with selectedPatient.photoUrl if available
                    sx={{
                      width: 90,
                      height: 90,
                      mr: 3,
                      border: '3px solid rgba(255,255,255,0.3)',
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      bgcolor: 'rgba(255,255,255,0.2)'
                    }}
                  >
                    {selectedPatient?.name?.charAt(0) || selectedPatient?.nomComplet?.charAt(0) || 'P'}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                      {selectedPatient?.name || selectedPatient?.nomComplet || 'Patient'}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {selectedPatient?.age || 'N/A'} ans • {selectedPatient?.sexe === 'M' ? 'Masculin' : 'Féminin' || 'N/A'}
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mt: 1,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1
                    }}>
                      <FavoriteIcon sx={{ fontSize: 16, mr: 1 }} />
                      <Typography variant="body2" fontWeight="600">
                        {selectedPatient?.bloodType || 'Groupe sanguin inconnu'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Informations principales */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 2,
                  position: 'relative',
                  zIndex: 1,
                  mt: 2
                }}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                        ID Patient
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {selectedPatient?.matricule || selectedPatient?.id || 'N/A'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                        Date admission
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {selectedPatient?.admissionDate || 'N/A'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                        Chambre/Lit
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {selectedPatient?.roomNumber ? `Ch. ${selectedPatient.roomNumber}` : 'N/A'} {selectedPatient?.bedNumber ? `/ Lit ${selectedPatient.bedNumber}` : ''}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                        Médecin traitant
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {selectedPatient?.attendingPhysician || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Footer */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                        HÔPITAL PRINCIPAL DE DAKAR
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {new Date().toLocaleDateString('fr-FR')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src="/images/hospital-logo.png"
                        sx={{
                          width: 30,
                          height: 30,
                          mr: 1,
                          backgroundColor: 'white',
                          padding: 0.5
                        }}
                      />
                      <Typography variant="body2" fontWeight="600">
                        Carte Patient
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Face arrière */}
                <Paper
                  elevation={8}
                  sx={{
                    p: 3,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    color: '#333',
                    borderRadius: 3,
                    position: 'absolute',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {/* Bouton flip */}
                  <IconButton
                    className="flip-button"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      color: '#0F4C81'
                    }}
                  >
                    <FlipToFrontIcon />
                  </IconButton>

                  {/* QR Code */}
                  <QRCodeSVG
                    value={JSON.stringify({
                      id: selectedPatient?.id,
                      name: selectedPatient?.name,
                      age: selectedPatient?.age,
                      bloodType: selectedPatient?.bloodType,
                      room: selectedPatient?.roomNumber,
                      bed: selectedPatient?.bedNumber,
                      doctor: selectedPatient?.attendingPhysician
                    })}
                    size={150}
                    level="H"
                    includeMargin
                  />

                  <Typography variant="h6" sx={{ mt: 2, color: '#0F4C81', fontWeight: 'bold' }}>
                    {selectedPatient?.name || selectedPatient?.nomComplet || 'Patient'}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', maxWidth: '80%' }}>
                    Scannez ce code pour accéder aux informations du patient
                  </Typography>

                  <Box sx={{
                    mt: 2,
                    p: 1,
                    backgroundColor: 'white',
                    borderRadius: 1,
                    width: '80%',
                    textAlign: 'center',
                    border: '1px solid #eee'
                  }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Contact d'urgence
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {selectedPatient?.emergencyContact || 'Non renseigné'}
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{
                    position: 'absolute',
                    bottom: 8,
                    color: '#999',
                    fontSize: '0.65rem'
                  }}>
                    #{selectedPatient?.id || 'ID-NON-DISPONIBLE'} • HPD {new Date().getFullYear()}
                  </Typography>
                </Paper>
              </Box>
          </Box>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default PatientMedicalRecordPage;
