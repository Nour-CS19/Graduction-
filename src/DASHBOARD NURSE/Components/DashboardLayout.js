// src/components/DashboardLayout.js
import React from 'react';
import { Container, Navbar, Nav, Dropdown, Image } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import defaultAvatar from '../../assets/images/00001zon_cropped.png';
import { BiHomeAlt } from 'react-icons/bi';
import { FaUserFriends } from 'react-icons/fa';
import { BsCalendar } from 'react-icons/bs'; // Example calendar icon

const DashboardLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleProfileClick = () => {
    navigate('/edit-profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleLogoutClick = () => {
    navigate('/logout');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div
        className="bg-white border-end"
        style={{
          width: '250px',
          position: 'fixed',
          height: '100vh',
          padding: '20px'
        }}
      >
        {/* Logo and Brand */}
        <div className="d-flex align-items-center mb-3">
          <svg
            viewBox="0 0 97 76"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: 45, height: 35, marginRight: 8 }}
          >
            <path d="M1.91304 12L3.1087 12.2689L4.30435 13.6134L5.26087 16.5714L6.21739 25.4454L6.45652 28.4034L4.30435 30.5546L4.54348 32.7059L6.69565 35.9328L9.80435 40.7731L11.9565 43.4622L12.913 44L11.2391 41.8487L5.26087 32.437L5.02174 30.8235L6.93478 29.7479L8.36957 30.0168L11.4783 31.8992L13.6304 33.7815L15.7826 36.2017L18.413 39.9664L20.087 41.8487L21.7609 42.9244L27.5 43.7311L31.5652 45.0756L33.9565 46.4202L36.587 48.5714L39.4565 51.7983L41.6087 55.563L43.2826 59.5966L44 62.5546V66.8571L43.7609 68.7395L43.5217 75.7311L43.2826 76H28.2174L27.9783 75.7311L27.7391 68.4706L26.5435 65.7815V65.2437H26.0652V64.7059L25.1087 64.1681L18.8913 59.8655L13.3913 56.1008L10.0435 53.4118L7.8913 51.2605L5.02174 45.0756L1.91304 37.2773L0.23913 31.6303L0 30.0168V25.9832L0.717391 17.1092L1.43478 12.5378L1.91304 12Z" fill="#009DA5" />
            <path d="M94.788 12L95.7935 12.2689L96.3967 16.3025L97 25.9832V31.0924L95.5924 36.7395L94.1848 41.042L91.1685 49.1092L89.962 51.7983L88.3533 53.6807L84.1304 57.4454L79.7065 60.9412L76.288 63.8992L74.6793 65.7815L73.875 67.6639L73.6739 75.7311L73.4728 76H60.6033L60.4022 75.7311L60.2011 67.395L60 65.5126V63.3613L61.0054 58.2521L62.6141 54.2185L64.2228 51.5294L65.8315 49.1092L68.6467 46.1513L70.8587 44.8067L75.0815 43.4622L78.7011 42.9244L80.1087 41.8487L81.7174 39.9664L84.3315 35.395L86.3424 32.7059L89.5598 30.2857L90.163 30.0168H91.7717L92.9783 31.0924L92.1739 33.2437L89.5598 38.084L87.5489 41.8487L86.5435 43.4622L87.75 42.6555L89.1576 40.2353L91.7717 35.395L92.9783 33.2437L93.3804 31.8992L93.1793 30.2857L92.5761 29.479L91.5707 28.6723L91.7717 25.1765L92.5761 16.8403L93.3804 13.6134L94.3859 12.2689L94.788 12Z" fill="#009DA5" />
            <path d="M38.6 0L41.313 0.235577L44.2522 1.17788L47.8696 3.29808L48.3217 3.76923L49.6783 3.53365L52.6174 1.64904L55.7826 0.471154L57.8174 0H60.3043L64.8261 1.17788L68.4435 2.82692L70.7043 4.47596L72.7391 6.83173L74.3217 10.3654L75 14.3702V16.9615L74.3217 20.9663L73.1913 23.7933L71.1565 27.5625L68.6696 30.8606L66.6348 33.2163L65.0522 35.101L59.8522 40.5192L58.0435 42.1683L53.7478 46.6442L51.2609 48.5288L49.9043 49H47.8696L45.1565 47.5865L39.9565 42.1683L38.1478 40.5192L30.913 32.9808L29.3304 31.0962L27.0696 28.0337L25.0348 24.7356L23.6783 21.2019L23 18.1394V12.7212L24.1304 8.95192L25.713 6.125L27.9739 3.76923L30.2348 2.35577L33.8522 0.942308L38.6 0Z" fill="#009DA5" />
          </svg>
          <span className="fs-4 fw-bold">PhysioCare</span>
        </div>

        {/* Divider Line */}
        <hr style={{ margin: '16px 0', borderColor: '#ddd' }} />

        {/* Navigation Links */}
        <Nav className="flex-column p-3">
          <Nav.Item>
            <Nav.Link
              className={`d-flex align-items-center mb-2 ${isActive('/dash') ? 'bg-primary text-white rounded' : ''}`}
              onClick={() => navigate('/dash')}
            >
              <i className="bi bi-house-door me-2"></i> لوحة التحكم
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              className={`d-flex align-items-center ${isActive('/dash-nurse/appointments') ? 'bg-primary text-white rounded' : ''}`}
              onClick={() => navigate('/asasas')}
            >
              <i className="bi bi-calendar me-2"></i> المواعيد
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              className={`d-flex align-items-center ${isActive('/dash-nurse/patients') ? 'bg-primary text-white rounded' : ''}`}
              onClick={() => navigate('/patients')}
            >
              <i className="bi bi-people me-2"></i> المرضى
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ marginLeft: '250px', flex: 1 }}>
        {/* Header */}
        <Navbar bg="white" expand="lg" className="border-bottom">
          <Container fluid>
            <Navbar.Brand>
              <h3 className="mb-0">{title || "لوحة التحكم"}</h3>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse className="justify-content-end">
              <Dropdown align="end">
                <Dropdown.Toggle variant="light">
                  <Image src={defaultAvatar} roundedCircle width="40" className="me-2" />
                  الممرضة
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleProfileClick}>
                    <i className="bi bi-person me-2"></i> الملف الشخصي
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleSettingsClick}>
                    <i className="bi bi-gear me-2"></i> الإعدادات
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogoutClick}>
                    <i className="bi bi-box-arrow-right me-2"></i> تسجيل الخروج
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Page Content */}
        <Container fluid className="p-4">
          {children}
        </Container>
      </div>
    </div>
  );
};

export default DashboardLayout;
