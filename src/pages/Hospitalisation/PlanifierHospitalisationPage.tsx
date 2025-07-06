// src/pages/Hospitalisation/PlanifierHospitalisationPage.tsx
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Divider,
  Stack,
} from '@mui/material';

import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Event as EventIcon,
  LocalHospital as HospitalIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

import { hospitalisationSchema, type HospitalisationFormData, prioriteOptions, serviceOptions, chambreOptions, litOptions, medecinOptions } from '../../components/hospitalisations/hospitalisationSchema';
import { planifierHospitalisation } from '../../services/hospitalisationService';
import { getPatients } from '../../services/patientService';
import type { Patient } from '../../types';

const steps = [
  {
    label: 'Sélection du patient',
    description: 'Choisir le patient à hospitaliser',
    icon: <PersonIcon />,
  },
  {
    label: 'Dates et priorité',
    description: 'Définir les dates et la priorité',
    icon: <EventIcon />,
  },
  {
    label: 'Service et attribution',
    description: 'Choisir le service, chambre et lit',
    icon: <HospitalIcon />,
  },
  {
    label: 'Finalisation',
    description: 'Motif et observations',
    icon: <AssignmentIcon />,
  },
];

const PlanifierHospitalisationPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Récupérer la liste des patients
  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  });

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<HospitalisationFormData>({
    resolver: zodResolver(hospitalisationSchema),
    mode: 'onChange',
    defaultValues: {
      patientId: '',
      dateAdmission: '',
      dateSortiePrevue: '',
      motif: '',
      priorite: 'Programmée',
      service: '',
      chambre: '',
      lit: '',
      medecin: '',
      observations: '',
    },
  });

  const watchedValues = watch();
  const selectedPatient = patients.find(p => p.id === watchedValues.patientId);

  const mutation = useMutation({
    mutationFn: planifierHospitalisation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitalisations'] });
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/hospitalisations');
      }, 2000);
    },
    onError: (error) => {
      console.error('Erreur lors de la planification:', error);
      setIsSubmitting(false);
    },
  });

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    reset();
  };

  const onSubmit = async (data: HospitalisationFormData) => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data);
    } catch {
      setIsSubmitting(false);
    }
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return ['patientId'];
      case 1:
        return ['dateAdmission', 'priorite'];
      case 2:
        return ['service', 'chambre', 'lit', 'medecin'];
      case 3:
        return ['motif'];
      default:
        return [];
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'Urgence':
        return 'error';
      case 'Semi-urgente':
        return 'warning';
      case 'Programmée':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Controller
              name="patientId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={patients}
                  loading={loadingPatients}
                  getOptionLabel={(option: Patient) => `${option.nomComplet} (${option.matricule})`}
                  renderOption={(props, option: Patient) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {option.nomComplet}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.matricule} • {option.age} ans • {option.specialty} • {option.sexe}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rechercher et sélectionner un patient *"
                      error={!!errors.patientId}
                      helperText={errors.patientId?.message}
                      fullWidth
                      placeholder="Tapez le nom ou matricule du patient..."
                    />
                  )}
                  onChange={(_, value) => field.onChange(value?.id || '')}
                  value={patients.find(p => p.id === field.value) || null}
                />
              )}
            />

            {selectedPatient && (
              <Card sx={{ mt: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Patient sélectionné
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Nom complet</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedPatient.nomComplet}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Matricule</Typography>
                      <Typography variant="body1">{selectedPatient.matricule}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Âge</Typography>
                      <Typography variant="body1">{selectedPatient.age} ans</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Spécialité</Typography>
                      <Typography variant="body1">{selectedPatient.specialty}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="dateAdmission"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Date d'admission *"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateAdmission}
                      helperText={errors.dateAdmission?.message}
                      inputProps={{
                        min: new Date().toISOString().split('T')[0]
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="dateSortiePrevue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Date de sortie prévue (optionnel)"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateSortiePrevue}
                      helperText={errors.dateSortiePrevue?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="priorite"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.priorite}>
                      <InputLabel>Priorité de l'hospitalisation *</InputLabel>
                      <Select {...field} label="Priorité de l'hospitalisation *">
                        {prioriteOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={option.label}
                                size="small"
                                color={getPrioriteColor(option.value)}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.priorite && (
                        <FormHelperText>{errors.priorite.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="service"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.service}>
                      <InputLabel>Service médical *</InputLabel>
                      <Select {...field} label="Service médical *">
                        {serviceOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.service && (
                        <FormHelperText>{errors.service.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="medecin"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.medecin}>
                      <InputLabel>Médecin responsable *</InputLabel>
                      <Select {...field} label="Médecin responsable *">
                        {medecinOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.medecin && (
                        <FormHelperText>{errors.medecin.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="chambre"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.chambre}>
                      <InputLabel>Chambre *</InputLabel>
                      <Select {...field} label="Chambre *">
                        {chambreOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.chambre && (
                        <FormHelperText>{errors.chambre.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="lit"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.lit}>
                      <InputLabel>Lit *</InputLabel>
                      <Select {...field} label="Lit *">
                        {litOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.lit && (
                        <FormHelperText>{errors.lit.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="motif"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Motif d'hospitalisation *"
                      multiline
                      rows={4}
                      fullWidth
                      error={!!errors.motif}
                      helperText={errors.motif?.message}
                      placeholder="Décrivez le motif médical de l'hospitalisation..."
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="observations"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Observations complémentaires (optionnel)"
                      multiline
                      rows={3}
                      fullWidth
                      error={!!errors.observations}
                      helperText={errors.observations?.message}
                      placeholder="Notes supplémentaires, allergies, consignes particulières..."
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Résumé */}
            <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Résumé de l'hospitalisation
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Patient</Typography>
                    <Typography variant="body1">{selectedPatient?.nomComplet}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Date d'admission</Typography>
                    <Typography variant="body1">{watchedValues.dateAdmission}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Priorité</Typography>
                    <Chip
                      label={watchedValues.priorite}
                      size="small"
                      color={getPrioriteColor(watchedValues.priorite)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Service</Typography>
                    <Typography variant="body1">{watchedValues.service}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Chambre - Lit</Typography>
                    <Typography variant="body1">{watchedValues.chambre} - {watchedValues.lit}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Médecin</Typography>
                    <Typography variant="body1">{watchedValues.medecin}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6">Hospitalisation planifiée avec succès !</Typography>
            <Typography>Redirection vers la liste des hospitalisations...</Typography>
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4 }}>
        {/* En-tête */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/hospitalisations')}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Planifier une Hospitalisation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Processus guidé de planification d'hospitalisation
            </Typography>
          </Box>
        </Box>

        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Une erreur est survenue lors de la planification. Veuillez réessayer.
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === 3 ? (
                    <Typography variant="caption">Dernière étape</Typography>
                  ) : null
                }
                icon={step.icon}
              >
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {getStepContent(index)}
                <Box sx={{ mb: 2, mt: 3 }}>
                  <Stack direction="row" spacing={2}>
                    {index === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        startIcon={<SaveIcon />}
                        color={watchedValues.priorite === 'Urgence' ? 'error' : 'primary'}
                      >
                        {isSubmitting ? 'Planification...' : 'Planifier l\'hospitalisation'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                      >
                        Continuer
                      </Button>
                    )}
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                    >
                      Précédent
                    </Button>
                    <Button
                      onClick={handleReset}
                      color="error"
                      variant="outlined"
                    >
                      Recommencer
                    </Button>
                  </Stack>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
};

export default PlanifierHospitalisationPage;
