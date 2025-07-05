// src/components/layout/Sidebar.tsx
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HotelIcon from '@mui/icons-material/Hotel';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const navItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/' },
  { text: 'Patients', icon: <PeopleIcon />, path: '/patients' },
  { text: 'Hospitalisations', icon: <HotelIcon />, path: '/hospitalisations' },
];

const openedMixin = (theme) => ({
  width: drawerWidth,
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: theme.spacing(7),
  [theme.breakpoints.up('sm')]: {
    width: theme.spacing(8),
  },
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
});

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const Sidebar = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  return (
    <StyledDrawer variant="permanent" open={open}>
      {/* Logo et nom de la plateforme */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: 2,
          py: 1,
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box
            component="img"
            src="/images/logo.png"
            alt="Logo"
            sx={{
              height: 36,
              width: 36,
              marginRight: open ? 1 : 0,
              transition: 'margin 0.3s',
              borderRadius: '50%',
              backgroundColor: '#fff',
              p: 0.5,
            }}
          />
          {open && (
            <Typography variant="h6" noWrap fontWeight="bold">
              SIH - HPD
            </Typography>
          )}
        </Box>

        <IconButton onClick={toggleDrawer} sx={{ color: '#fff' }}>
          {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>

      <Divider />

      {/* Navigation */}
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={!open ? item.text : ''} placement="right">
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: theme.palette.primary.main,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: open ? 1 : 0,
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      {/* diviver */}
      <Divider/>
      {/* Profil (footer) */}
          <div className="relative border-t border-blue-600 p-4" ref={profileRef}>
            <button
              className="flex items-center w-full space-x-3 focus:outline-none"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img
                  src="https://www.w3schools.com/howto/img_avatar.png"
                  alt="Dr Lamine Faye"
                  className="h-full w-full object-cover"
                />
              </div>
                <div className="text-left">
                <p className="text-sm font-medium text-white flex items-center">
                  {currentUser?.nom || 'Lamine'} {currentUser?.prenom || 'Faye'}
                  <span className="ml-1 text-green-400 text-base">●</span>
                </p>
                <p className="text-xs text-blue-200">
                  {currentUser?.role || 'Médecin'}
                </p>
                </div>
            </button>

            {profileMenuOpen && (
              <div className="absolute bottom-16 left-4 w-52 bg-white rounded-md shadow-lg z-40 animate-fade-in-down">
                <button
                  onClick={() => handleMenuClick('settings')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="mr-2" size={16} /> Voir le profil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-2" size={16} /> Se déconnecter
                </button>
              </div>
            )}
          </div>
    </StyledDrawer>

  );
};

export default Sidebar;
