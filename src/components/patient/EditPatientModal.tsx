// src/components/patients/EditPatientModal.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';
import { patientSchema, type PatientFormData } from './patientSchema';
import type { Patient } from '../../types';
import { useEffect } from 'react';

interface EditPatientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
  patient: Patient | null;
}

const EditPatientModal = ({ open, onClose, onSubmit, patient  }: EditPatientModalProps) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  // Pré-remplir le formulaire quand le patient change
  useEffect(() => {
    if (patient) {
      reset(patient);
    }
  }, [patient, reset]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Modifier les informations du patient</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
           {/* Les champs sont les mêmes que pour l'ajout */}
          <TextField {...register('nomComplet')} label="Nom complet" fullWidth margin="dense" error={!!errors.nomComplet} helperText={errors.nomComplet?.message} />
          <TextField {...register('age')} label="Âge" type="number" fullWidth margin="dense" error={!!errors.age} helperText={errors.age?.message} />
          <TextField {...register('sexe')} label="Sexe" select fullWidth margin="dense" defaultValue={patient?.sexe || ''} error={!!errors.sexe} helperText={errors.sexe?.message}>
            <MenuItem value="M">Masculin</MenuItem>
            <MenuItem value="F">Féminin</MenuItem>
          </TextField>
          <TextField {...register('diagnosticActuel')} label="Diagnostic (optionnel)" fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit">Sauvegarder</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditPatientModal;