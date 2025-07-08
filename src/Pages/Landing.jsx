import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, IconButton, Box, Typography, Menu, MenuItem, Divider, Button, Badge } from "@mui/material";
import { styled } from "@mui/material/styles";
import Link from "@mui/material/Link";
import Grow from "@mui/material/Grow";
import "bootstrap/dist/css/bootstrap.min.css"; 
import { Container, Row, Col } from "react-bootstrap";

// -------------- Icons --------------
import AccountCircle from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailIcon from "@mui/icons-material/Mail";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";

import aboutImg from "../assets/images/Capture122.PNG";  // Example
import heroImg from "../assets/images/Capture122.PNG";    // Example
import newSectionImg from "../assets/images/Capture122.PNG"; // Example

// ------------------------------------------------------------------
// Sticky Navbar style
// ------------------------------------------------------------------
const StyledAppBar = styled(AppBar)(() => ({
  backgroundColor: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  transition: "box-shadow 0.3s ease",
}));

// Video card styling
const VideoCard = styled(Box)(({ theme }) => ({
  borderRadius: "12px",
  overflow: "hidden",
  position: "relative",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  height: "200px",
  marginBottom: "20px",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
  },
}));

// ------------------------------------------------------------------
// Landing Page Component
// ------------------------------------------------------------------
export default function LandingPage() {
  // 1) Scroll-based color change (gray -> black)
  const [headerShadow, setHeaderShadow] = useState(false);
  const navTextColor = headerShadow ? "#000" : "grey";

  useEffect(() => {
    const handleScroll = () => {
      setHeaderShadow(window.pageYOffset > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2) Menu states for Profile, Services, etc.
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [servicesAnchorEl, setServicesAnchorEl] = useState(null);

  // (Optional) Notifications/Messages menus
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [messagesAnchorEl, setMessagesAnchorEl] = useState(null);

  // Sample data for notifications/messages
  const [notifications] = useState([
    { id: 1, text: "New appointment booked", time: "10:00 AM" },
    { id: 2, text: "Prescription ready", time: "9:15 AM" },
  ]);
  const [messages] = useState([
    { id: 1, text: "Patient inquiry: Back pain", time: "Yesterday" },
    { id: 2, text: "Follow-up scheduled", time: "2 days ago" },
  ]);

  // Video advice data
  const [videoAdvices] = useState([
    { id: 1, title: "Understanding Your Medication", duration: "5:20", thumbnail: aboutImg },
    { id: 2, title: "Home Exercises for Back Pain", duration: "7:45", thumbnail: aboutImg },
    { id: 3, title: "Nutrition Tips for Recovery", duration: "4:15", thumbnail: aboutImg },
    { id: 4, title: "Managing Chronic Conditions", duration: "8:30", thumbnail: aboutImg },
  ]);

  // Menu handlers
  const handleProfileMenuOpen = (e) => setProfileAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const handleServicesMenuOpen = (e) => setServicesAnchorEl(e.currentTarget);
  const handleServicesMenuClose = () => setServicesAnchorEl(null);

  const handleNotificationMenuOpen = (e) => setNotificationAnchorEl(e.currentTarget);
  const handleNotificationMenuClose = () => setNotificationAnchorEl(null);

  const handleMessagesMenuOpen = (e) => setMessagesAnchorEl(e.currentTarget);
  const handleMessagesMenuClose = () => setMessagesAnchorEl(null);

  const handleLogout = () => {
    alert("Logging out...");
  };

  // 3) "Read More" functionality in About Us
  const [isReadMore, setIsReadMore] = useState(false);
  const handleReadMore = () => setIsReadMore((prev) => !prev);

  // ------------------------------------------------------------------
  // Navbar with improved profile menu, services dropdown
  // ------------------------------------------------------------------
  const renderProfileMenu = (
    <Menu
      anchorEl={profileAnchorEl}
      open={Boolean(profileAnchorEl)}
      onClose={handleProfileMenuClose}
      TransitionComponent={Grow}
      PaperProps={{ sx: { width: 240, borderRadius: "12px", mt: 1 } }}
    >
      {/* Notifications (inside profile) */}
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          handleNotificationMenuOpen(e);
        }}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon sx={{ color: "#0d6efd" }} />
        </Badge>
        <Box sx={{ ml: 1 }}>Notifications</Box>
      </MenuItem>

      {/* Messages (inside profile) */}
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          handleMessagesMenuOpen(e);
        }}
      >
        <Badge badgeContent={messages.length} color="error">
          <MailIcon sx={{ color: "#0d6efd" }} />
        </Badge>
        <Box sx={{ ml: 1 }}>Messages</Box>
      </MenuItem>

      <Divider />

      {/* Account Heading with Close Icon */}
      <Box sx={{ px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#0d6efd" }}>
          Account
        </Typography>
        <IconButton onClick={handleProfileMenuClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider />

      {/* Profile */}
      <MenuItem sx={{ py: 1.5 }}>
        <SettingsIcon sx={{ mr: 2, color: "#0d6efd" }} />
        Settings
      </MenuItem>

      <Divider />

      {/* Logout */}
      <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
        <ExitToAppIcon sx={{ mr: 2, color: "error.main" }} />
        <Typography color="error">Logout</Typography>
      </MenuItem>
    </Menu>
  );

  const renderServicesMenu = (
    <Menu
      anchorEl={servicesAnchorEl}
      open={Boolean(servicesAnchorEl)}
      onClose={handleServicesMenuClose}
      TransitionComponent={Grow}
      PaperProps={{ sx: { width: 200, borderRadius: "12px", mt: 1 } }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#0d6efd" }}>
          Our Services
        </Typography>
      </Box>
      <Divider />
      <MenuItem onClick={handleServicesMenuClose}>General Consultation</MenuItem>
      <MenuItem onClick={handleServicesMenuClose}>Emergency Care</MenuItem>
      <MenuItem onClick={handleServicesMenuClose}>Specialized Treatments</MenuItem>
      <MenuItem onClick={handleServicesMenuClose}>Surgical Procedures</MenuItem>
      <MenuItem onClick={handleServicesMenuClose}>Diagnostic Imaging</MenuItem>
      <MenuItem onClick={handleServicesMenuClose}>Rehabilitation</MenuItem>
    </Menu>
  );

  // Optional: Notification & Messages separate menus
  const renderNotificationsMenu = (
    <Menu
      anchorEl={notificationAnchorEl}
      open={Boolean(notificationAnchorEl)}
      onClose={handleNotificationMenuClose}
      TransitionComponent={Grow}
      PaperProps={{ sx: { width: 300, borderRadius: "12px", mt: 1 } }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#0d6efd" }}>
          Notifications
        </Typography>
      </Box>
      <Divider />
      {notifications.map((notif) => (
        <MenuItem key={notif.id} sx={{ py: 1.5 }}>
          <NotificationsIcon sx={{ mr: 2, color: "#0d6efd" }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {notif.text}
            </Typography>
            <Typography variant="caption" sx={{ color: "gray" }}>
              {notif.time}
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </Menu>
  );

  const renderMessagesMenu = (
    <Menu
      anchorEl={messagesAnchorEl}
      open={Boolean(messagesAnchorEl)}
      onClose={handleMessagesMenuClose}
      TransitionComponent={Grow}
      PaperProps={{ sx: { width: 300, borderRadius: "12px", mt: 1 } }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#0d6efd" }}>
          Messages
        </Typography>
      </Box>
      <Divider />
      {messages.map((msg) => (
        <MenuItem key={msg.id} sx={{ py: 1.5 }}>
          <MailIcon sx={{ mr: 2, color: "#0d6efd" }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {msg.text}
            </Typography>
            <Typography variant="caption" sx={{ color: "gray" }}>
              {msg.time}
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </Menu>
  );

  // ------------------------------------------------------------------
  // Navbar JSX
  // ------------------------------------------------------------------
  const navbar = (
    <StyledAppBar position="sticky" sx={{ boxShadow: headerShadow ? 3 : 0 }}>
      <Toolbar sx={{ py: 1 }}>
        {/* SVG Logo */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          <svg
            viewBox="0 0 97 76"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: 45, height: 35 }}
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
        </Box>

        {/* Middle Nav: Home, Services, About */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 4 }}>
          <Link href="#aboutus" underline="none" sx={{ fontWeight: 600, color: navTextColor, cursor: "pointer" }}>
            About Us
          </Link>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: navTextColor,
              fontWeight: 600,
            }}
            onClick={handleServicesMenuOpen}
          >
            Services <ArrowDropDownIcon />
          </Box>
          <Link href="#hero" underline="none" sx={{ fontWeight: 600, color: navTextColor, cursor: "pointer" }}>
            Hero
          </Link>
          <Link href="#video-advice" underline="none" sx={{ fontWeight: 600, color: navTextColor, cursor: "pointer" }}>
            Video Advice
          </Link>
          <Link href="#new-section" underline="none" sx={{ fontWeight: 600, color: navTextColor, cursor: "pointer" }}>
            New Section
          </Link>
        </Box>

        {/* Right: Profile Icon */}
        <Box>
          <IconButton onClick={handleProfileMenuOpen}>
            <AccountCircle sx={{ fontSize: 32, color: navTextColor }} />
          </IconButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );

  // ------------------------------------------------------------------
  // About Us Section (first below navbar)
  // ------------------------------------------------------------------
  const aboutUsSection = (
    <Box id="aboutus" sx={{ py: 6, px: 2, backgroundColor: "#f9f9f9" }}>
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              About Us
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: "#555" }}>
              We provide top-notch healthcare solutions through innovative approaches and personalized care.
              Our experienced team is committed to ensuring you have the best experience possible.
            </Typography>

            {/* Toggleable read more text */}
            {isReadMore && (
              <Typography variant="body2" sx={{ mb: 2, color: "#777" }}>
                Here is some extra content that appears when you click "Read More." 
                We focus on patient-centered care, advanced treatments, and seamless 
                integration of technology to deliver excellent healthcare outcomes.
              </Typography>
            )}

            <Button
              variant="contained"
              sx={{ borderRadius: "50px", px: 4, py: 1.2, backgroundColor: "#0d6efd" }}
              onClick={handleReadMore}
            >
              {isReadMore ? "Show Less" : "Read More"}
            </Button>
          </Col>
          <Col md={6} className="text-center mt-4 mt-md-0">
            <img
              src={aboutImg}
              alt="About"
              style={{ width: "80%", maxWidth: "400px", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
            />
          </Col>
        </Row>
      </Container>
    </Box>
  );

  // ------------------------------------------------------------------
  // Hero Section (enhanced)
  // ------------------------------------------------------------------
  const heroSection = (
    <Box 
      id="hero" 
      sx={{ 
        py: 8,
        background: "linear-gradient(135deg, #0d6efd 0%, #0099ff 100%)",
        color: "white",
      }}
    >
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="mb-5 mb-lg-0">
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800, 
                mb: 3,
                textShadow: "0px 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              Your Health is Our Priority
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: "500px" }}>
              We combine cutting-edge technology with compassionate care to provide 
              the best healthcare experience for you and your family.
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button 
                variant="contained" 
                sx={{ 
                  borderRadius: "30px", 
                  px: 4, 
                  py: 1.5, 
                  backgroundColor: "white", 
                  color: "#0d6efd",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#f0f0f0"
                  }
                }}
              >
                Book an Appointment
              </Button>
              <Button 
                variant="outlined" 
                sx={{ 
                  borderRadius: "30px", 
                  px: 4, 
                  py: 1.5, 
                  borderColor: "white", 
                  color: "white",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255,255,255,0.1)" 
                  }
                }}
              >
                Our Services
              </Button>
            </Box>
          </Col>
          <Col lg={6} className="text-center">
            <img
              src={heroImg}
              alt="Healthcare Hero"
              style={{ 
                width: "100%", 
                maxWidth: "550px", 
                borderRadius: "15px",
                boxShadow: "0 15px 30px rgba(0,0,0,0.2)"
              }}
            />
          </Col>
        </Row>
      </Container>
    </Box>
  );

  // ------------------------------------------------------------------
  // Video Advice Section (NEW)
  // ------------------------------------------------------------------
  const videoAdviceSection = (
    <Box id="video-advice" sx={{ py: 6, backgroundColor: "#fff" }}>
      <Container>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: "center" }}>
          Video Advice
        </Typography>
        <Typography variant="body1" sx={{ color: "#555", mb: 5, textAlign: "center", maxWidth: "700px", mx: "auto" }}>
          Watch our health experts share valuable advice on various medical topics to help you maintain your wellbeing.
        </Typography>
        
        <Row>
          {videoAdvices.map((video) => (
            <Col md={6} lg={3} key={video.id} className="mb-4">
              <VideoCard>
                <Box sx={{ position: "relative", height: "100%" }}>
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover" 
                    }} 
                  />
                  
                  {/* Overlay with play button */}
                  <Box 
                    sx={{ 
                      position: "absolute", 
                      top: 0, 
                      left: 0, 
                      width: "100%", 
                      height: "100%", 
                      backgroundColor: "rgba(0,0,0,0.4)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      padding: 2,
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.6)"
                      }
                    }}
                  >
                    <PlayCircleFilledIcon sx={{ fontSize: 50, mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: "center" }}>
                      {video.title}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 1 }}>
                      {video.duration}
                    </Typography>
                  </Box>
                </Box>
              </VideoCard>
            </Col>
          ))}
        </Row>
        
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button 
            variant="outlined" 
            sx={{ 
              borderRadius: "30px", 
              px: 4, 
              py: 1.2, 
              borderColor: "#0d6efd", 
              color: "#0d6efd" 
            }}
          >
            View All Videos
          </Button>
        </Box>
      </Container>
    </Box>
  );

  // ------------------------------------------------------------------
  // New Section
  // ------------------------------------------------------------------
  const newSection = (
    <Box id="new-section" sx={{ py: 6, backgroundColor: "#f0f4f8", textAlign: "center" }}>
      <Container>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Our New Section
        </Typography>
        <Typography variant="body1" sx={{ color: "#555", mb: 4, maxWidth: "600px", margin: "0 auto" }}>
          This is a brand new section where you can highlight additional features, 
          services, or announcements. Customize it as needed.
        </Typography>
        <img
          src={newSectionImg}
          alt="New Section"
          style={{ width: "100%", maxWidth: "600px", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
        />
      </Container>
    </Box>
  );

  // ------------------------------------------------------------------
  // Footer
  // ------------------------------------------------------------------
  const footer = (
    <Box sx={{ backgroundColor: "#0d6efd", color: "#fff", py: 4, mt: 6, textAlign: "center" }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        &copy; {new Date().getFullYear()} My Healthcare. All rights reserved.
      </Typography>
      <Typography variant="caption">
        123 Health St, Wellness City, Country
      </Typography>
    </Box>
  );

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <Box sx={{ backgroundColor: "#fff" }}>
      {/* Navbar */}
      {navbar}

      {/* Menus */}
      {renderProfileMenu}
      {renderServicesMenu}
      {renderNotificationsMenu}
      {renderMessagesMenu}

      {/* About Us Section (first below navbar) */}
      {aboutUsSection}

      {/* Hero Section */}
      {heroSection}
      
      {/* Video Advice Section */}
      {videoAdviceSection}

      {/* New Section */}
      {newSection}

      {/* Footer */}
      {footer}
    </Box>
  );
}