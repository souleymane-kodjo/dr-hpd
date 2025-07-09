// src/pages/HospitalisationPage.tsx

import { useNavigate } from 'react-router-dom';

import { Box, Button, Typography } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import HospitalisationsTable from '../../components/hospitalisations/HospitalisationsTable';
import { getHospitalisations } from '../../services/hospitalisationService';
import { dischargePatient } from '../../services/patientService';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

const HospitalisationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();


  const { data: hospitalisations, isLoading, isError } = useQuery({
    queryKey: ['hospitalisations'],
    queryFn: getHospitalisations,
  });

  const handlePlanifierHospitalisation = () => {
    navigate('/hospitalisations/planifier');
  };

  const dischargeMutation = useMutation({
    mutationFn: ({ hospitalisationId, litId }: { hospitalisationId: string, litId: string }) =>
      dischargePatient(hospitalisationId, litId),
    onSuccess: () => {
      // Invalider les requêtes pour rafraîchir les listes
      queryClient.invalidateQueries({ queryKey: ['hospitalisations'] });
      queryClient.invalidateQueries({ queryKey: ['lits'] });
      console.log("La sortie du patient a été enregistrée avec succès.");
    },
    onError: (error: Error) => {
      console.error(`Erreur: ${error.message}`);
    }
  });

  const handleDischarge = (hospitalisationId: string | number, litId: string | number) => {
    if (window.confirm("Voulez-vous vraiment enregistrer la sortie de ce patient ?")) {
      dischargeMutation.mutate({ 
        hospitalisationId: String(hospitalisationId), 
        litId: String(litId) 
      });
    }
  };

  if (isError) {
    return <Typography color="error">Erreur lors du chargement des données d'hospitalisation.</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Hospitalisations
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handlePlanifierHospitalisation}
        >
          Planifier une Hospitalisation
        </Button>
      </Box>

      <HospitalisationsTable
        hospitalisations={hospitalisations || []}
        isLoading={isLoading}
        onDischarge={handleDischarge} // Passer la fonction au tableau
      />
    </Box>
  );
};

export default HospitalisationPage;