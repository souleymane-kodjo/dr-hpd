// src/pages/PatientPage.tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { addPatient, getPatients } from '../../services/patientService';
import PatientsTable from '../../components/patient/PatientsTable';
import { useState } from 'react';
import type { PatientFormData } from '../../components/patient/patientSchema';
import AddPatientModal from '../../components/patient/AddPatientModal';


const PatientPage = () => {
  // Utilisation de useQuery pour récupérer et mettre en cache les données
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const { data: patients, isLoading, isError } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  });

  const addPatientMutation = useMutation({
    mutationFn: addPatient,
    onSuccess: () => {
      // Invalider et rafraîchir la liste des patients après un ajout réussi
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setModalOpen(false); // Fermer la modale
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout du patient:", error);
    }
  });

    const handleAddPatient = (data: PatientFormData) => {
        addPatientMutation.mutate(data);
    };

  if (isError) {
    return <Typography color="error">Erreur lors du chargement des patients.</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Liste des Patients</Typography>
        <Button variant="contained" color="primary" onClick={() => setModalOpen(true)}>
          Ajouter un Patient
        </Button>
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <PatientsTable patients={patients || []} isLoading={isLoading} />
      )}

      <AddPatientModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddPatient}
      />
    </Box>
  );
};

export default PatientPage;