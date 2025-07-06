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
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HotelIcon from '@mui/icons-material/Hotel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { User, LogOut, BedIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const drawerWidth = 240;

const navItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/' },
  { text: 'Patients', icon: <PeopleIcon />, path: '/patients' },
  { text: 'Hospitalisations', icon: <HotelIcon />, path: '/hospitalisations' },
  { text: 'Planifier Hospitalisation', icon: <EventAvailableIcon />, path: '/hospitalisations/planifier' },
    { text: 'Gestion des Lits', icon: <BedIcon />, path: '/lits' }, // Ajouté
];

interface SidebarProps {
  open: boolean;
  toggleDrawer: () => void;
}

interface StyledDrawerProps {
  open?: boolean;
}

// MUI styling functions
const openedMixin = (theme: Theme) => ({
  width: drawerWidth,
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden' as const,
});

const closedMixin = (theme: Theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden' as const,
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
})<StyledDrawerProps>(({ theme, open }) => ({
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

const Sidebar: React.FC<SidebarProps> = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const { user: currentUser, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const profileRef = useRef<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <StyledDrawer variant="permanent" open={open}>
      {/* Logo et titre */}
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

      <Divider />

      {/* Footer - Profil utilisateur */}
      <Box
        sx={{
          mt: 'auto',
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
        ref={profileRef}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            p: 0,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
          onClick={handleMenuOpen}
        >
          <Avatar
            src={currentUser?.photoUrl}
            alt={currentUser?.nom}
            sx={{ width: 40, height: 40 }}
          />
          {open && (
            <Box>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                {currentUser?.nom }
                <Box component="span" sx={{ color: 'success.main', ml: 0.5 }}>●</Box>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentUser?.roles || 'Médecin'}
              </Typography>
            </Box>
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <User size={16} style={{ marginRight: theme.spacing(1) }} />
            Voir le profil
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogOut size={16} style={{ marginRight: theme.spacing(1) }} />
            Se déconnecter
          </MenuItem>
        </Menu>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;