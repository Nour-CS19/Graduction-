import {
  Box,
  IconButton,
  InputBase,
  Stack,
  Toolbar,
  styled,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar from '@mui/material/AppBar';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  backgroundColor: '#ffffff',
  color: '#1976d2',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Subtle shadow
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(!open && {
    marginLeft: 65,
    width: `calc(100% - 65px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }),
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(0, 0, 0, 0.08)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const TopBar = ({ open, handleDrawerOpen }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New patient registered in Cairo hospital', read: false },
    { id: 2, message: 'Invoice overdue for Alexandria clinic', read: false },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = () => {
    setNotificationOpen(true);
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ minHeight: '48px !important' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 1,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <svg
              viewBox="0 0 97 76"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: 18, height: 18 }}
            >
              <path
                d="M1.91304 12L3.1087 12.2689L4.30435 13.6134L5.26087 16.5714L6.21739 25.4454L6.45652 28.4034L4.30435 30.5546L4.54348 32.7059L6.69565 35.9328L9.80435 40.7731L11.9565 43.4622L12.913 44L11.2391 41.8487L5.26087 32.437L5.02174 30.8235L6.93478 29.7479L8.36957 30.0168L11.4783 31.8992L13.6304 33.7815L15.7826 36.2017L18.413 39.9664L20.087 41.8487L21.7609 42.9244L27.5 43.7311L31.5652 45.0756L33.9565 46.4202L36.587 48.5714L39.4565 51.7983L41.6087 55.563L43.2826 59.5966L44 62.5546V66.8571L43.7609 68.7395L43.5217 75.7311L43.2826 76H28.2174L27.9783 75.7311L27.7391 68.4706L26.5435 65.7815V65.2437H26.0652V64.7059L25.1087 64.1681L18.8913 59.8655L13.3913 56.1008L10.0435 53.4118L7.8913 51.2605L5.02174 45.0756L1.91304 37.2773L0.23913 31.6303L0 30.0168V25.9832L0.717391 17.1092L1.43478 12.5378L1.91304 12Z"
                fill="#1976d2"
              />
              <path
                d="M94.788 12L95.7935 12.2689L96.3967 16.3025L97 25.9832V31.0924L95.5924 36.7395L94.1848 41.042L91.1685 49.1092L89.962 51.7983L88.3533 53.6807L84.1304 57.4454L79.7065 60.9412L76.288 63.8992L74.6793 65.7815L73.875 67.6639L73.6739 75.7311L73.4728 76H60.6033L60.4022 75.7311L60.2011 67.395L60 65.5126V63.3613L61.0054 58.2521L62.6141 54.2185L64.2228 51.5294L65.8315 49.1092L68.6467 46.1513L70.8587 44.8067L75.0815 43.4622L78.7011 42.9244L80.1087 41.8487L81.7174 39.9664L84.3315 35.395L86.3424 32.7059L89.5598 30.2857L90.163 30.0168H91.7717L92.9783 31.0924L92.1739 33.2437L89.5598 38.084L87.5489 41.8487L86.5435 43.4622L87.75 42.6555L89.1576 40.2353L91.7717 35.395L92.9783 33.2437L93.3804 31.8992L93.1793 30.2857L92.5761 29.479L91.5707 28.6723L91.7717 25.1765L92.5761 16.8403L93.3804 13.6134L94.3859 12.2689L94.788 12Z"
                fill="#1976d2"
              />
              <path
                d="M38.6 0L41.313 0.235577L44.2522 1.17788L47.8696 3.29808L48.3217 3.76923L49.6783 3.53365L52.6174 1.64904L55.7826 0.471154L57.8174 0H60.3043L64.8261 1.177V1.17788L68.4435 2.82692L70.7043 4.47596L72.7391 6.83173L74.3217 10.3654L75 14.3702V16.9615L74.3217 20.9663L73.1913 23.7933L71.1565 27.5625L68.6696 30.8606L66.6348 33.2163L65.0522 35.101L59.8522 40.5192L58.0435 42.1683L53.7478 46.6442L51.2609 48.5288L49.9043 49H47.8696L45.1565 47.5865L39.9565 42.1683L38.1478 40.5192L30.913 32.9808L29.3304 31.0962L27.0696 28.0337L25.0348 24.7356L23.6783 21.2019L23 18.1394V12.7212L24.1304 8.95192L25.713 6.125L27.9739 3.76923L30.2348 2.35577L33.8522 0.942308L38.6 0Z"
                fill="#1976d2"
              />
            </svg>
            <Typography variant="h6" sx={{ ml: 1, color: 'inherit' }}>
              Egypt Admin
            </Typography>
          </Box>

          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>

          <Box flexGrow={1} />

          <Stack direction="row" alignItems="center">
            <IconButton color="primary" onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Dialog open={notificationOpen} onClose={handleNotificationClose}>
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent>
          {notifications.length === 0 ? (
            <Typography>No new notifications</Typography>
          ) : (
            notifications.map((notification) => (
              <Typography key={notification.id}>
                {notification.message}
              </Typography>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNotificationClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TopBar;