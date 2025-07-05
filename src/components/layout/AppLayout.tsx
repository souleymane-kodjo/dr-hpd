// src/layouts/AppLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = () => {
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

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
      <CssBaseline />

      {/* Top Navigation */}
      <Navbar open={open} toggleDrawer={toggleDrawer} />

      {/* Sidebar / Drawer */}
      <Sidebar open={open} toggleDrawer={toggleDrawer} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflowY: 'auto', // Permet le scroll uniquement ici si besoin
          height: '100vh', // Prend toute la hauteur pour scroll interne
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
