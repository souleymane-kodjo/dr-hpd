import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const AuthLayout: React.FC = () => {
  return (
    <Box
          sx={{
            display: 'flex',
            height: '100vh', // Hauteur plein écran
            width: '100vw',  // Largeur plein écran
            overflow: 'hidden', // Évite scrolls internes
          }}
          border={1}
          borderColor="divider"
        >
      <Outlet />
    </Box>
  );
};

export default AuthLayout;
