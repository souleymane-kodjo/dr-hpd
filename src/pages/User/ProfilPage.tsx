import React from 'react';
import { Box, Container } from '@mui/material';
import ProfileManagement from '../../components/user/ProfileManagement';

const ProfilPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <ProfileManagement />
      </Box>
    </Container>
  );
};

export default ProfilPage;
