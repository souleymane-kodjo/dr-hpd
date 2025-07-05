// src/components/patients/AddPatientModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';
import { patientSchema, type PatientFormData } from './patientSchema';

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
}

const AddPatientModal = ({ open, onClose, onSubmit }: AddPatientModalProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema)
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Ajouter un nouveau patient</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField {...register('nomComplet')} label="Nom complet" fullWidth margin="dense" error={!!errors.nomComplet} helperText={errors.nomComplet?.message} />
          <TextField {...register('age')} label="Âge" type="number" fullWidth margin="dense" error={!!errors.age} helperText={errors.age?.message} />
          <TextField {...register('sexe')} label="Sexe" select fullWidth margin="dense" defaultValue="" error={!!errors.sexe} helperText={errors.sexe?.message}>
            <MenuItem value="M">Masculin</MenuItem>
            <MenuItem value="F">Féminin</MenuItem>
          </TextField>
          <TextField {...register('diagnosticActuel')} label="Diagnostic (optionnel)" fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit">Ajouter</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddPatientModal;