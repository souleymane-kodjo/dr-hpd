
import React, { useState, useEffect } from 'react';
import {
    Grid,
  Container,
  Typography,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip
} from '@mui/material';

import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getPatients } from '../../services/patientService';
import { getLits } from '../../services/litService';
import { planifierHospitalisation } from '../../services/hospitalisationService';
import type { Patient } from '../../types';
import { fr } from 'date-fns/locale';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const steps = ['Sélection du patient', 'Informations médicales', 'Attribution du lit', 'Confirmation'];

const PlanifierHospitalisationPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [lits, setLits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Données du formulaire
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [motif, setMotif] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [urgence, setUrgence] = useState<'faible' | 'moyenne' | 'elevee'>('moyenne');
  const [dateAdmission, setDateAdmission] = useState<Date | null>(new Date());
  const [selectedLit, setSelectedLit] = useState<any | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [patientsData, litsData] = await Promise.all([
        getPatients(),
        getLits()
      ]);
      setPatients(patientsData);
      setLits(litsData.filter(lit => lit.statut === 'Libre'));
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        return selectedPatient !== null;
      case 1:
        return motif.trim() !== '' && diagnostic.trim() !== '';
      case 2:
        return selectedLit !== null;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedLit || !dateAdmission) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      await planifierHospitalisation({
        patientId: selectedPatient.id,
        dateAdmission: dateAdmission?.toISOString() || new Date().toISOString(),
        motif,
        priorite: urgence === 'faible' ? 'Programmée' : urgence === 'elevee' ? 'Urgence' : 'Semi-urgente',
        service: selectedLit.service || 'Service général',
        chambre: selectedLit.chambre || 'Chambre standard',
        lit: selectedLit.numero?.toString() || 'Non spécifié',
        medecin: 'Médecin traitant',
        observations: diagnostic
      });
      setSuccess(true);
      setActiveStep(0);
      // Reset form
      setSelectedPatient(null);
      setMotif('');
      setDiagnostic('');
      setUrgence('moyenne');
      setDateAdmission(new Date());
      setSelectedLit(null);
      // Reload available beds
      loadInitialData();
    } catch (error) {
      console.error('Erreur lors de la planification:', error);
      setError('Erreur lors de la planification de l\'hospitalisation');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Sélectionnez le patient à hospitaliser
            </Typography>
            <Grid container spacing={2}>
              {patients.map((patient) => (
                <Grid xs={12} md={6} key={patient.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedPatient?.id === patient.id ? 2 : 1,
                      borderColor: selectedPatient?.id === patient.id ? 'primary.main' : 'grey.300',
                    }}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <CardContent>
                      <Typography variant="h6">
                        {patient.nomComplet}
                      </Typography>
                      <Typography color="textSecondary">
                        Âge: {patient.age} ans
                      </Typography>
                      <Typography color="textSecondary">
                        Matricule: {patient.matricule}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Informations médicales
            </Typography>
            <Grid container spacing={3}>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Motif d'hospitalisation"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Diagnostic"
                  value={diagnostic}
                  onChange={(e) => setDiagnostic(e.target.value)}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Niveau d'urgence</InputLabel>
                  <Select
                    value={urgence}
                    onChange={(e) => setUrgence(e.target.value as 'faible' | 'moyenne' | 'elevee')}
                    label="Niveau d'urgence"
                  >
                    <MenuItem value="faible">Faible</MenuItem>
                    <MenuItem value="moyenne">Moyenne</MenuItem>
                    <MenuItem value="elevee">Élevée</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                  <DatePicker
                    label="Date d'admission prévue"
                    value={dateAdmission}
                    onChange={(newValue) => setDateAdmission(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Attribution du lit
            </Typography>
            <Grid container spacing={2}>
              {lits.map((lit) => (
                <Grid xs={12} md={4} key={lit.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedLit?.id === lit.id ? 2 : 1,
                      borderColor: selectedLit?.id === lit.id ? 'primary.main' : 'grey.300',
                    }}
                    onClick={() => setSelectedLit(lit)}
                  >
                    <CardContent>
                      <Typography variant="h6">
                        Lit {lit.numero}
                      </Typography>
                      <Typography color="textSecondary">
                        Service: {lit.service}
                      </Typography>
                      <Chip
                        label={lit.statut}
                        color={lit.statut === 'libre' ? 'success' : 'default'}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirmation de la planification
            </Typography>
            {selectedPatient && selectedLit && (
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Patient
                      </Typography>
                      <Typography>
                        {selectedPatient.nomComplet}
                      </Typography>
                      <Typography color="textSecondary">
                        Matricule: {selectedPatient.matricule}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Lit attribué
                      </Typography>
                      <Typography>
                        Lit {selectedLit.numero}
                      </Typography>
                      <Typography color="textSecondary">
                        Service: {selectedLit.service}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Informations médicales
                      </Typography>
                      <Typography><strong>Motif:</strong> {motif}</Typography>
                      <Typography><strong>Diagnostic:</strong> {diagnostic}</Typography>
                      <Typography><strong>Urgence:</strong> {urgence}</Typography>
                      <Typography>
                        <strong>Date d'admission:</strong>{' '}
                        {dateAdmission?.toLocaleDateString('fr-FR')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Planifier une hospitalisation
      </Typography>

      <StyledPaper>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Précédent
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Planification...' : 'Confirmer la planification'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!validateStep()}
            >
              Suivant
            </Button>
          )}
        </Box>
      </StyledPaper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Hospitalisation planifiée avec succès !
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PlanifierHospitalisationPage;
