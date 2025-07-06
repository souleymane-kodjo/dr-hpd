import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  MenuItem,
  Alert,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Box,
  Chip,
  Stack,
} from '@mui/material';

import { hospitalisationSchema, type HospitalisationFormData, prioriteOptions, serviceOptions, chambreOptions, litOptions, medecinOptions } from './hospitalisationSchema';
import { planifierHospitalisation } from '../../services/hospitalisationService';
import { getPatients } from '../../services/patientService';
import HospitalisationNotifications from './HospitalisationNotifications';
import type { Patient } from '../../types';

interface PlanifierHospitalisationModalProps {
  open: boolean;
  onClose: () => void;
}

const PlanifierHospitalisationModal = ({
  open,
  onClose,
}: PlanifierHospitalisationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    severity: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    open: false,
    severity: 'success',
    title: '',
    message: '',
  });
  
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<HospitalisationFormData>({
    resolver: zodResolver(hospitalisationSchema),
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

  const priorite = watch('priorite');

  const mutation = useMutation({
    mutationFn: planifierHospitalisation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitalisations'] });
      setNotification({
        open: true,
        severity: 'success',
        title: 'Hospitalisation planifiée',
        message: 'L\'hospitalisation a été planifiée avec succès.',
      });
      handleClose();
    },
    onError: (error) => {
      console.error('Erreur lors de la planification:', error);
      setNotification({
        open: true,
        severity: 'error',
        title: 'Erreur de planification',
        message: 'Une erreur est survenue lors de la planification de l\'hospitalisation.',
      });
      setIsSubmitting(false);
    },
  });

  const handleClose = () => {
    reset();
    setIsSubmitting(false);
    onClose();
  };

  const onSubmit = async (data: HospitalisationFormData) => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data);
    } catch {
      setIsSubmitting(false);
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

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Planifier une Hospitalisation
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {mutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Erreur lors de la planification de l'hospitalisation. Veuillez réessayer.
              </Alert>
            )}

            <Stack spacing={3}>
              <Controller
                name="patientId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={patients}
                    getOptionLabel={(option: Patient) => `${option.nomComplet} (${option.matricule})`}
                    renderOption={(props, option: Patient) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body1">{option.nomComplet}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.matricule} • {option.age} ans • {option.specialty}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Patient *"
                        error={!!errors.patientId}
                        helperText={errors.patientId?.message}
                        fullWidth
                      />
                    )}
                    onChange={(_, value) => field.onChange(value?.id || '')}
                    value={patients.find(p => p.id === field.value) || null}
                  />
                )}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
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
                    />
                  )}
                />

                <Controller
                  name="dateSortiePrevue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Date de sortie prévue"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateSortiePrevue}
                      helperText={errors.dateSortiePrevue?.message}
                    />
                  )}
                />
              </Box>

              <Controller
                name="motif"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Motif d'hospitalisation *"
                    multiline
                    rows={3}
                    fullWidth
                    error={!!errors.motif}
                    helperText={errors.motif?.message}
                  />
                )}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="priorite"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.priorite}>
                      <InputLabel>Priorité *</InputLabel>
                      <Select {...field} label="Priorité *">
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

                <Controller
                  name="service"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.service}>
                      <InputLabel>Service *</InputLabel>
                      <Select {...field} label="Service *">
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
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
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
              </Box>

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

              <Controller
                name="observations"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Observations complémentaires"
                    multiline
                    rows={3}
                    fullWidth
                    error={!!errors.observations}
                    helperText={errors.observations?.message}
                  />
                )}
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              color={priorite === 'Urgence' ? 'error' : 'primary'}
            >
              {isSubmitting ? 'Planification...' : 'Planifier l\'hospitalisation'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <HospitalisationNotifications
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        severity={notification.severity}
        title={notification.title}
        message={notification.message}
      />
    </>
  );
};

export default PlanifierHospitalisationModal;
