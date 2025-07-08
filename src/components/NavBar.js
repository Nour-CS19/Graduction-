import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button as MuiButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom"; // Import from react-router-dom
import AccountCircle from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailIcon from "@mui/icons-material/Mail";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ScienceIcon from "@mui/icons-material/Science";

// Styled AppBar
const StyledAppBar = styled(AppBar)(() => ({
  backgroundColor: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  transition: "box-shadow 0.3s ease",
}));

const Navbar = () => {
  // Scroll shadow
  const [headerShadow, setHeaderShadow] = useState(false);
  useEffect(() => {
    const handleScroll = () => setHeaderShadow(window.pageYOffset > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navTextColor = headerShadow ? "#000" : "grey";

  // Menu state for profile
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const handleProfileMenuOpen = (e) => setProfileAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  // Dialog states for Notifications and Messages
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);

  // Sample backend data
  const doctorNotifications = [
    { id: 1, text: "Dr. Smith scheduled an appointment", time: "10:00 AM" },
    { id: 2, text: "Dr. Brown updated your treatment plan", time: "9:15 AM" },
  ];
  const labNotifications = [
    { id: 3, text: "Lab result ready: Blood test", time: "8:30 AM" },
  ];

  const doctorMessages = [
    { id: 1, text: "Message from Dr. Smith: Please follow up.", time: "Yesterday" },
  ];
  const labMessages = [
    { id: 2, text: "Lab message: Your sample is processed.", time: "Today" },
  ];

  const openNotificationsDialog = () => {
    setNotificationsDialogOpen(true);
    handleProfileMenuClose();
  };
  const closeNotificationsDialog = () => setNotificationsDialogOpen(false);

  const openMessagesDialog = () => {
    setMessagesDialogOpen(true);
    handleProfileMenuClose();
  };
  const closeMessagesDialog = () => setMessagesDialogOpen(false);

  const handleLogout = () => {
    fetch("https://api.example.com/logout", { method: "POST", credentials: "include" })
      .then((res) => {
        if (res.ok) {
          window.location.href = "/login";
        }
      })
      .catch((error) => console.error("Logout error", error));
    handleProfileMenuClose();
  };

  const handleSettings = () => {
    window.location.href = "/settings";
    handleProfileMenuClose();
  };

  // Profile Menu
  const renderProfileMenu = (
    <Menu
      anchorEl={profileAnchorEl}
      open={Boolean(profileAnchorEl)}
      onClose={handleProfileMenuClose}
      TransitionComponent={Grow}
      PaperProps={{ sx: { width: 250, borderRadius: "12px", mt: 1 } }}
    >
      <MenuItem onClick={openNotificationsDialog}>
        <NotificationsIcon sx={{ mr: 1, color: "#0d6efd" }} />
        <Typography variant="body1">Notifications</Typography>
      </MenuItem>
      <MenuItem onClick={openMessagesDialog}>
        <MailIcon sx={{ mr: 1, color: "#0d6efd" }} />
        <Typography variant="body1">Messages</Typography>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleSettings}>
        <SettingsIcon sx={{ mr: 1, color: "#0d6efd" }} />
        <Typography variant="body1">Settings</Typography>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ExitToAppIcon sx={{ mr: 1, color: "error.main" }} />
        <Typography variant="body1" color="error">
          Logout
        </Typography>
      </MenuItem>
    </Menu>
  );

  // Notifications Dialog
  const renderNotificationsDialog = (
    <Dialog open={notificationsDialogOpen} onClose={closeNotificationsDialog}>
      <DialogTitle>Notifications</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocalHospitalIcon sx={{ mr: 1, color: "#0d6efd" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            From Doctors
          </Typography>
        </Box>
        {doctorNotifications.map((n) => (
          <DialogContentText key={n.id}>
            {n.text} ({n.time})
          </DialogContentText>
        ))}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <ScienceIcon sx={{ mr: 1, color: "#0d6efd" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            From Laboratory
          </Typography>
        </Box>
        {labNotifications.map((n) => (
          <DialogContentText key={n.id}>
            {n.text} ({n.time})
          </DialogContentText>
        ))}
      </DialogContent>
      <DialogActions>
        <MuiButton onClick={closeNotificationsDialog}>Close</MuiButton>
      </DialogActions>
    </Dialog>
  );

  // Messages Dialog
  const renderMessagesDialog = (
    <Dialog open={messagesDialogOpen} onClose={closeMessagesDialog}>
      <DialogTitle>Messages</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocalHospitalIcon sx={{ mr: 1, color: "#0d6efd" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            From Doctors
          </Typography>
        </Box>
        {doctorMessages.map((m) => (
          <DialogContentText key={m.id}>
            {m.text} ({m.time})
          </DialogContentText>
        ))}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <ScienceIcon sx={{ mr: 1, color: "#0d6efd" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            From Laboratory
          </Typography>
        </Box>
        {labMessages.map((m) => (
          <DialogContentText key={m.id}>
            {m.text} ({m.time})
          </DialogContentText>
        ))}
      </DialogContent>
      <DialogActions>
        <MuiButton onClick={closeMessagesDialog}>Close</MuiButton>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <StyledAppBar position="sticky" sx={{ boxShadow: headerShadow ? 3 : 0 }}>
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <svg
              viewBox="0 0 97 76"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: 45, height: 35, marginRight: 8 }}
            >
              <path
                d="M1.91304 12L3.1087 12.2689L4.30435 13.6134L5.26087 16.5714L6.21739 25.4454L6.45652 28.4034L4.30435 30.5546L4.54348 32.7059L6.69565 35.9328L9.80435 40.7731L11.9565 43.4622L12.913 44L11.2391 41.8487L5.26087 32.437L5.02174 30.8235L6.93478 29.7479L8.36957 30.0168L11.4783 31.8992L13.6304 33.7815L15.7826 36.2017L18.413 39.9664L20.087 41.8487L21.7609 42.9244L27.5 43.7311L31.5652 45.0756L33.9565 46.4202L36.587 48.5714L39.4565 51.7983L41.6087 55.563L43.2826 59.5966L44 62.5546V66.8571L43.7609 68.7395L43.5217 75.7311L43.2826 76H28.2174L27.9783 75.7311L27.7391 68.4706L26.5435 65.7815V65.2437H26.0652V64.7059L25.1087 64.1681L18.8913 59.8655L13.3913 56.1008L10.0435 53.4118L7.8913 51.2605L5.02174 45.0756L1.91304 37.2773L0.23913 31.6303L0 30.0168V25.9832L0.717391 17.1092L1.43478 12.5378L1.91304 12Z"
                fill="#009DA5"
              />
              <path
                d="M94.788 12L95.7935 12.2689L96.3967 16.3025L97 25.9832V31.0924L95.5924 36.7395L94.1848 41.042L91.1685 49.1092L89.962 51.7983L88.3533 53.6807L84.1304 57.4454L79.7065 60.9412L76.288 63.8992L74.6793 65.7815L73.875 67.6639L73.6739 75.7311L73.4728 76H60.6033L60.4022 75.7311L60.2011 67.395L60 65.5126V63.3613L61.0054 58.2521L62.6141 54.2185L64.2228 51.5294L65.8315 49.1092L68.6467 46.1513L70.8587 44.8067L75.0815 43.4622L78.7011 42.9244L80.1087 41.8487L81.7174 39.9664L84.3315 35.395L86.3424 32.7059L89.5598 30.2857L90.163 30.0168H91.7717L92.9783 31.0924L92.1739 33.2437L89.5598 38.084L87.5489 41.8487L86.5435 43.4622L87.75 42.6555L89.1576 40.2353L91.7717 35.395L92.9783 33.2437L93.3804 31.8992L93.1793 30.2857L92.5761 29.479L91.5707 28.6723L91.7717 25.1765L92.5761 16.8403L93.3804 13.6134L94.3859 12.2689L94.788 12Z"
                fill="#009DA5"
              />
              <path
                d="M38.6 0L41.313 0.235577L44.2522 1.17788L47.8696 3.29808L48.3217 3.76923L49.6783 3.53365L52.6174 1.64904L55.7826 0.471154L57.8174 0H60.3043L64.8261 1.17788L68.4435 2.82692L70.7043 4.47596L72.7391 6.83173L74.3217 10.3654L75 14.3702V16.9615L74.3217 20.9663L73.1913 23.7933L71.1565 27.5625L68.6696 30.8606L66.6348 33.2163L65.0522 35.101L59.8522 40.5192L58.0435 42.1683L53.7478 46.6442L51.2609 48.5288L49.9043 49H47.8696L45.1565 47.5865L39.9565 42.1683L38.1478 40.5192L30.913 32.9808L29.3304 31.0962L27.0696 28.0337L25.0348 24.7356L23.6783 21.2019L23 18.1394V12.7212L24.1304 8.95192L25.713 6.125L27.9739 3.76923L30.2348 2.35577L33.8522 0.942308L38.6 0Z"
                fill="#009DA5"
              />
            </svg>
            <Typography variant="h6" sx={{ color: navTextColor }}>
              Physiocare
            </Typography>
          </Box>

          <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 4 }}>
            <Link to="/" style={{ textDecoration: "none", fontWeight: 600, color: navTextColor, cursor: "pointer" }}>
              Home
            </Link>
            <Link
              to="/services"
              style={{ textDecoration: "none", fontWeight: 600, color: navTextColor, cursor: "pointer" }}
            >
              Services
            </Link>
            <Link to="/about" style={{ textDecoration: "none", fontWeight: 600, color: navTextColor, cursor: "pointer" }}>
              About
            </Link>
          </Box>

          <Box>
            <IconButton onClick={handleProfileMenuOpen}>
              <AccountCircle sx={{ fontSize: 32, color: navTextColor }} />
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {renderProfileMenu}
      {renderNotificationsDialog}
      {renderMessagesDialog}
    </>
  );
};

export default Navbar;