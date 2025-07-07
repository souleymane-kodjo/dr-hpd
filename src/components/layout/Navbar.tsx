import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useNotificationPermission } from '../../store/notificationStore';
import NotificationPanel from '../notifications/NotificationPanel';

const drawerWidth = 240;

interface AppBarProps {
  open?: boolean;
}

interface NavbarProps {
  open: boolean;
  toggleDrawer: () => void;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Navbar: React.FC<NavbarProps> = ({ open, toggleDrawer }) => {
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const openMenu = Boolean(anchorEl);

  const { stats, fetchStats, connectRealTime } = useNotificationStore();
  const { requestPermission, hasPermission } = useNotificationPermission();
  // Initialize notifications
  useEffect(() => {
    fetchStats();
    connectRealTime();

    // Request notification permission if not already granted
    if (!hasPermission()) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleNotificationClick = () => {
    setNotificationPanelOpen(true);
  };

  const unreadCount = stats?.unread || 0;

  return (
    <AppBar position="fixed" open={open} elevation={3}>
      <Toolbar
        sx={{
          minHeight: 64,
          display: 'flex',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Menu / Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!open && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            SIH - Système d'Information Hospitalier
          </Typography>
        </Box>

        {/* Actions à droite */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Avatar & menu utilisateur */}
          <Tooltip title="Compte utilisateur">
            <IconButton onClick={handleMenuClick} size="small" sx={{ ml: 1 }}>
              <Avatar
                sx={{ width: 36, height: 36 }}
                src={
                    user?.photoUrl || "https://cdn.vectorstock.com/i/1000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.jpg"
                }
              >
                {user?.nom?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 180,
              },
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                {user?.nom || 'Utilisateur'}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    backgroundColor: 'success.main',
                    borderRadius: '50%',
                  }}
                />
              </Box>
            </MenuItem>

            <MenuItem disabled>
              <Typography
                variant="caption"
                sx={{
                  color: 'success.dark',
                  fontWeight: 600,
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                {user?.roles ? `${user.roles}` : 'Docteur'}
              </Typography>
              <Divider sx={{ my: 1 }} />
            </MenuItem>
            <MenuItem onClick={handleClose}>Mon Profil</MenuItem>
            <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Notification Panel */}
      <NotificationPanel
        open={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />
    </AppBar>
  );
};

export default Navbar;
