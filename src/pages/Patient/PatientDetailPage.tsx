// src/pages/Patient/PatientDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import { Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { getPatientById, updatePatient } from '../../services/patientService';
import { useState } from 'react';
import EditPatientModal from '../../components/patient/EditPatientModal';
import type { Patient } from '../../types';

const PatientDetailPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [isModalOpen, setModalOpen] = useState(false);
  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Patient) => updatePatient(patientId!, data),
    onSuccess: () => {
      setModalOpen(false);
      // Optionally, you can refetch the patient data here
    },
  });


  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError || !patient) {
    return <Typography color="error">Erreur ou patient non trouvé.</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Dossier de {patient.nomComplet}
        </Typography>
        <Button variant="contained" onClick={() => setModalOpen(true)}>Modifier</Button>
      </Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box>
              <Typography variant="h6">Informations Personnelles</Typography>
              <Typography><strong>Âge:</strong> {patient.age} ans</Typography>
              <Typography><strong>Sexe:</strong> {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Informations Médicales</Typography>
              <Typography><strong>Statut:</strong> {patient.statut}</Typography>
              <Typography><strong>Diagnostic:</strong> {patient.diagnosticActuel}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <EditPatientModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(data) =>
          updateMutation.mutate({
            ...patient,
            ...data,
            id: patient.id,
            statut: patient.statut,
          })
        }
        patient={patient}
      />
    </Box>
  );
};

export default PatientDetailPage;