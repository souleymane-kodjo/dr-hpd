// src/pages/HospitalisationPage.tsx
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Typography } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import HospitalisationsTable from '../../components/hospitalisations/HospitalisationsTable';
import { getHospitalisations } from '../../services/hospitalisationService';

const HospitalisationPage = () => {
  const navigate = useNavigate();

  const { data: hospitalisations, isLoading, isError } = useQuery({
    queryKey: ['hospitalisations'],
    queryFn: getHospitalisations,
  });

  const handlePlanifierHospitalisation = () => {
    navigate('/hospitalisations/planifier');
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
      />
    </Box>
  );
};

export default HospitalisationPage;