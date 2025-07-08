
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Row, Col, Form, Modal } from 'react-bootstrap';
import {
  MdCheckCircle, MdEdit, MdLogout, MdMenu, MdClose, MdChat,
  MdAddCircle, MdLocationCity, MdList, MdVpnKey, MdEventAvailable,
  MdStar, MdInfo, MdExpandMore, MdExpandLess, MdAccessTime,
  MdHome, MdCalendarToday, MdSchedule
} from 'react-icons/md';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useAuth } from '../Pages/AuthPage';

// Lazy-loaded page components
const ServicesLab = lazy(() => import("./ServicesLab").catch(() => ({ default: () => <div>ServicesLab failed to load</div> })));
const AddAnalysis = lazy(() => import("./AddAnalysis").catch(() => ({ default: () => <div>AddAnalysis failed to load</div> })));
const GetAllAnalysis = lazy(() => import("./GetAllAtAnalysis").catch(() => ({ default: () => <div>GetAllAnalysis failed to load</div> })));
const CreateAnalysisAtCities = lazy(() => import("./CreateAnalysisAtCities").catch(() => ({ default: () => <div>CreateAnalysisAtCities failed to load</div> })));
const CreateAppointmentAtCity = lazy(() => import("./CreateAppointmentAtCity").catch(() => ({ default: () => <div>CreateAppointmentAtCity failed to load</div> })));
const AcceptBook = lazy(() => import("./AcceptBook").catch(() => ({ default: () => <div>AcceptBook failed to load</div> })));
const EditProfileForLab = lazy(() => import("./EditProfileForLab").catch(() => ({ default: () => <div>EditProfileForLab failed to load</div> })));
const ForgetPasswordForLab = lazy(() => import("./ForgetPasswordForLab").catch(() => ({ default: () => <div>ForgetPasswordForLab failed to load</div> })));
const SubscribeLab = lazy(() => import("./SubscribeLab").catch(() => ({ default: () => <div>SubscribeLab failed to load</div> })));
const Chat = lazy(() => import("../Chat/Chat").catch(() => ({ default: () => <div>Chat failed to load</div> })));

const FaFlask = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9 2V7.5L4.5 18H19.5L15 7.5V2H9ZM11 4H13V8.5L17.5 20H6.5L11 8.5V4Z"/>
  </svg>
);

const PhysioCareLogo = ({ isCollapsed }) => {
  if (isCollapsed) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
      <svg
        viewBox="0 0 97 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: 28, height: 28, marginRight: isCollapsed ? 0 : 8 }}
      >
        <path
          d="M1.91304 12L3.1087 12.2689L4.30435 13.6134L5.26087 16.5714L6.21739 25.4454L6.45652 28.4034L4.30435 30.5546L4.54348 32.7059L6.69565 35.9328L9.08704 40.7731L11.9565 43.4622L12.913 44L11.2391 41.8487L5.26087 32.437L5.02174 30.8235L6.93478 29.7479L8.36957 30.0168L11.4783 31.8992L13.6304 33.7815L15.7826 36.2017L18.413 39.9664L20.087 41.8487L21.7609 42.9244L27.5 43.7311L31.5652 45.0756L33.9565 46.4202L36.587 48.5714L39.4565 51.7983L41.6087 55.563L43.2826 59.5966L44 62.5546V66.8571L43.7609 68.7395L43.5217 75.7311L43.2826 76H28.2152H26.0652V64.7059L25.1087 64.1681L18.8913 59.8655L13.3913 56.1008L10.0435 53.4118L7.8913 51.2605L5.02174 45.0756L1.91304 37.2773L0.23913 31.6303L0 30.0168V25.9832L0.717391 17.1092L1.43478 12.5378L1.91304 12Z"
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
      {!isCollapsed && <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#009DA5' }}>PhysioCare</span>}
    </div>
  );
};

const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f4f7fa',
  },
  sidebar: {
    width: '280px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
    color: '#2d3748',
    transition: 'width 0.3s ease, transform 0.3s ease',
    overflowY: 'auto',
    zIndex: 1100,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
  },
  sidebarCollapsed: {
    width: '70px',
  },
  sidebarMobile: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '280px',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease',
  },
  sidebarMobileOpen: {
    transform: 'translateX(0)',
  },
  sidebarOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1099,
    transition: 'opacity 0.3s ease',
  },
  sidebarHeader: {
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
  },
  sidebarFooter: {
    marginTop: 'auto',
    padding: '20px',
    borderTop: '1px solid rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
  },
  sidebarMenu: {
    padding: '15px 0',
    flexGrow: 1,
  },
  sidebarMenuItem: {
    padding: '0',
    margin: '4px 8px',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  sidebarMenuLink: {
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    color: '#2d3748',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    borderRadius: '6px',
  },
  sidebarMenuLinkActive: {
    background: 'linear-gradient(90deg, #00b7c2 0%, #00d4e0 100%)',
    color: '#ffffff',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,157,165,0.2)',
  },
  sidebarMenuIcon: {
    marginRight: '12px',
    width: '22px',
    textAlign: 'center',
    fontSize: '1.1rem',
  },
  mainContent: {
    flex: '1',
    backgroundColor: '#f4f7fa',
    transition: 'margin-left 0.3s ease',
    width: '100%',
    overflowX: 'hidden',
  },
  mainContentCollapsed: {
    marginLeft: '70px',
  },
  contentWrapper: {
    padding: '20px 20px 20px 0',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f7fa',
    flexDirection: 'column',
  },
};

const responsiveStyles = `
  .sidebar-menu-link:hover {
    background: #f1f5f9 !important;
    color: #009DA5 !important;
    transform: scale(1.02);
  }
  .sidebar-menu-link.collapsed {
    justify-content: center;
    padding: 12px 0;
  }
  .sidebar-menu-link.collapsed span,
  .sidebar-menu-link.collapsed .dropdown-icon {
    display: none;
  }
  .custom-toggle-button {
    background-color: transparent !important;
    border: none !important;
    color: #2d3748 !important;
    padding: 0 !important;
    transition: all 0.3s ease;
  }
  .custom-toggle-button:hover {
    color: #009DA5 !important;
    transform: scale(1.1);
  }
  .sidebar-overlay {
    opacity: 0;
    pointer-events: none;
  }
  .sidebar-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }
  @media (max-width: 768px) {
    .sidebar {
      position: fixed !important;
      transform: translateX(-100%) !important;
      box-shadow: 2px 0 8px rgba(0,0,0,0.1) !important;
    }
    .sidebar-open {
      transform: translateX(0) !important;
    }
    .main-content {
      margin-left: 0 !important;
    }
    .content-wrapper {
      padding: 15px !important;
    }
  }
  @media (max-width: 576px) {
    .content-wrapper {
      padding: 10px !important;
    }
  }
`;

const ProfessionalSidebar = ({ isSidebarOpen, toggleSidebar, activeView, setActiveView, isMobile, handleLogout, user, labPhoto, photoLoading, photoError, setShowLogoutModal }) => {
  const [dropdownStates, setDropdownStates] = useState({
    analysis: false,
    appointments: false,
    profile: false,
    manage: false,
  });

  const isLinkActive = (view) => {
    if (view === activeView) return true;
    const activeItem = menuConfig.find(item => item.view === activeView);
    return activeItem && activeItem.parentId === view;
  };

  const toggleDropdown = (id) => {
    setDropdownStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const menuConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: MdEventAvailable, view: 'dashboard', level: 'top' },
    { id: 'analysis', label: 'Analysis', icon: FaFlask, view: null, level: 'top' },
    { id: 'add-analysis', label: 'Add Analysis', icon: MdAddCircle, view: 'AddAnalysis', level: 'sub', parentId: 'analysis' },
    { id: 'create-analysis-cities', label: 'Analysis by City', icon: MdLocationCity, view: 'CreateAnalysisAtCities', level: 'sub', parentId: 'analysis' },
    { id: 'get-all-analysis', label: 'All Analysis', icon: MdList, view: 'GetAllAnalysis', level: 'sub', parentId: 'analysis' },
    { id: 'appointments', label: 'Appointments', icon: MdCalendarToday, view: null, level: 'top' },
    { id: 'create-appointment', label: 'Create Appointment', icon: MdEventAvailable, view: 'CreateAppointmentAtCity', level: 'sub', parentId: 'appointments' },
    { id: 'accept-book', label: 'Accept Booking', icon: MdCheckCircle, view: 'AcceptBook', level: 'sub', parentId: 'appointments' },
    { id: 'profile', label: 'Profile', icon: MdEdit, view: null, level: 'top' },
    { id: 'edit-profile', label: 'Edit Profile', icon: MdEdit, view: 'EditProfileForLab', level: 'sub', parentId: 'profile' },
    { id: 'forget-password', label: 'Change Password', icon: MdVpnKey, view: 'ForgetPasswordForLab', level: 'sub', parentId: 'profile' },
    { id: 'manage', label: 'Manage', icon: MdCheckCircle, view: null, level: 'top' },
    { id: 'services', label: 'Services', icon: MdInfo, view: 'ServicesLab', level: 'sub', parentId: 'manage' },
    { id: 'subscribe', label: 'Subscribe', icon: MdStar, view: 'SubscribeLab', level: 'sub', parentId: 'manage' },
    { id: 'chat', label: 'Chats', icon: MdChat, view: 'chat', level: 'top' },
    { id: 'logout', label: 'Logout', icon: MdLogout, view: 'logout', level: 'top' },
  ];

  const hasSubItems = (id) => menuConfig.some((item) => item.parentId === id);

  return (
    <>
      <style>{responsiveStyles}</style>
      {isMobile && isSidebarOpen && (
        <div
          style={styles.sidebarOverlay}
          className={isSidebarOpen ? 'sidebar-overlay open' : 'sidebar-overlay'}
          onClick={toggleSidebar}
        />
      )}
      <div
        style={{
          ...styles.sidebar,
          ...(isMobile
            ? { ...styles.sidebarMobile, ...(isSidebarOpen ? styles.sidebarMobileOpen : {}) }
            : !isSidebarOpen
              ? styles.sidebarCollapsed
              : {}),
        }}
        className={isMobile ? (isSidebarOpen ? 'sidebar sidebar-open' : 'sidebar') : ''}
      >
        <div style={{ ...styles.sidebarHeader, justifyContent: !isSidebarOpen && !isMobile ? 'center' : 'space-between' }}>
          <PhysioCareLogo isCollapsed={!isSidebarOpen && !isMobile} />
          <Button className="custom-toggle-button" onClick={toggleSidebar}>
            {isSidebarOpen ? <MdClose size="24" /> : <MdMenu size="24" />}
          </Button>
        </div>
        <ul className="list-unstyled" style={styles.sidebarMenu}>
          {menuConfig.map((item) => (
            <li key={item.id} style={styles.sidebarMenuItem}>
              {item.level === 'top' && (
                <div
                  className={`sidebar-menu-link ${!isSidebarOpen && !isMobile ? 'collapsed' : ''}`}
                  onClick={() => {
                    if (hasSubItems(item.id)) {
                      toggleDropdown(item.id);
                    } else if (item.view) {
                      if (item.view === 'logout') {
                        setShowLogoutModal(true);
                      } else {
                        setActiveView(item.view);
                        if (isMobile) toggleSidebar();
                      }
                    }
                  }}
                  style={{
                    ...styles.sidebarMenuLink,
                    ...(isLinkActive(item.view || item.id) ? styles.sidebarMenuLinkActive : {}),
                    ...(!isSidebarOpen && !isMobile ? { justifyContent: 'center', padding: '12px 0' } : {}),
                  }}
                >
                  <item.icon style={styles.sidebarMenuIcon} size={item.level === 'top' ? 22 : 18} />
                  {(isMobile || isSidebarOpen) && <span>{item.label}</span>}
                  {(isMobile || isSidebarOpen) && hasSubItems(item.id) && (
                    <div className="dropdown-icon" style={{ marginLeft: 'auto' }}>
                      {dropdownStates[item.id] ? <MdExpandLess size="18" /> : <MdExpandMore size="18" />}
                    </div>
                  )}
                </div>
              )}
              {(isMobile || isSidebarOpen) && dropdownStates[item.parentId] && item.level === 'sub' && (
                <div
                  className="sidebar-menu-link"
                  style={{
                    ...styles.sidebarMenuLink,
                    ...(activeView === item.view ? styles.sidebarMenuLinkActive : {}),
                    paddingLeft: '45px',
                    fontSize: '0.9rem',
                  }}
                  onClick={() => {
                    setActiveView(item.view);
                    if (isMobile) toggleSidebar();
                  }}
                >
                  <item.icon style={{ ...styles.sidebarMenuIcon, width: '18px' }} size="18" />
                  <span>{item.label}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
        {(isMobile || isSidebarOpen) && (
          <div style={styles.sidebarFooter}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {photoLoading ? (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                  <div className="spinner-border spinner-border-sm text-muted" />
                </div>
              ) : labPhoto ? (
                <img
                  src={labPhoto}
                  alt="Laboratory"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <MdEdit size="20" style={{ color: '#718096' }} />
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#2d3748' }}>{user?.name || 'Laboratory'}</div>
                <div style={{ fontSize: '0.85rem', color: '#718096' }}>{user?.email || 'lab@example.com'}</div>
                {photoError && <small style={{ color: '#dc3545', fontSize: '0.75rem' }}>{photoError}</small>}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const StatsCard = ({ title, value, icon: Icon, color, bg }) => (
  <Col lg={3} md={6} className="mb-3">
    <Card
      style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%', borderRadius: '10px', transition: 'transform 0.3s ease' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <Card.Body className="d-flex align-items-center">
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            backgroundColor: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem',
          }}
        >
          <Icon size="20" style={{ color }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', color: '#2d3748' }}>{value}</h3>
          <p style={{ margin: 0, color: '#718096', fontSize: '0.85rem', fontWeight: '500' }}>{title}</p>
        </div>
      </Card.Body>
    </Card>
  </Col>
);

const AppointmentTable = ({ bookings, onSort, sortConfig }) => {
  const getSortIcon = (key) => {
    if (!sortConfig) return null;
    return sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '';
  };

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            {['patientName', 'patientPhone', 'bookingDate', 'type', 'status'].map((key) => (
              <th
                key={key}
                style={{ color: '#2d3748', fontWeight: '600', padding: '0.8rem', fontSize: '0.85rem' }}
                onClick={() => onSort(key)}
                className="cursor-pointer"
              >
                {key === 'patientName' && 'Patient'}
                {key === 'patientPhone' && 'Contact'}
                {key === 'bookingDate' && 'Date & Time'}
                {key === 'type' && 'Type'}
                {key === 'status' && 'Status'}
                <span className="ms-1">{getSortIcon(key)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <tr
                key={booking.id}
                style={{ transition: 'background-color 0.3s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,157,165,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '0.8rem', color: '#2d3748', fontSize: '0.85rem' }}>{booking.patientName}</td>
                <td style={{ padding: '0.8rem', color: '#718096', fontSize: '0.85rem' }}>{booking.patientPhone}</td>
                <td style={{ padding: '0.8rem', color: '#718096', fontSize: '0.85rem' }}>
                  <div>
                    <div>{format(parseISO(booking.bookingDate), 'yyyy-MM-dd')}</div>
                    <div>{format(parseISO(booking.bookingDate), 'HH:mm')}</div>
                  </div>
                </td>
                <td style={{ padding: '0.8rem', color: '#718096', fontSize: '0.85rem' }}>
                  <span className={`badge ${booking.isAtHome ? 'bg-success' : 'bg-info'}`}>
                    {booking.isAtHome ? (
                      <>
                        <MdHome size="14" className="me-1" />
                        Home Visit
                      </>
                    ) : (
                      <>
                        <FaFlask size="14" className="me-1" />
                        Lab Visit
                      </>
                    )}
                  </span>
                </td>
                <td style={{ padding: '0.8rem', color: '#718096', fontSize: '0.85rem' }}>
                  <span className={`badge ${getStatusBadgeClass(booking.status)}`} style={{ fontSize: '0.75rem' }}>
                    {booking.statusDisplay}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '1.2rem', color: '#718096', fontSize: '0.85rem' }}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  function getStatusBadgeClass(status) {
    const statusStr = status === true ? 'confirmed' : status === false ? 'cancelled' : status?.toString().toLowerCase() || 'unknown';
    switch (statusStr) {
      case 'confirmed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
};

const useDashboardData = (user, isAuthenticated, navigate) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [sortedBookings, setSortedBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    homeBookings: 0,
    labBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isAtHomeFilter, setIsAtHomeFilter] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [appointmentDay, setAppointmentDay] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [appointmentError, setAppointmentError] = useState('');
  const [labPhoto, setLabPhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  const API_BASE = 'https://physiocareapp.runasp.net/api/v1';
  const ENDPOINTS = {
    getCities: `${API_BASE}/LaboratoryCity/get-cities-with-initial-phAnalyses-by-lab-id?labId=${user?.id}`,
    addAppointment: `${API_BASE}/LaboratoryCityAppointment/AddLaboratoryCityAppointment`,
    getBookings: `${API_BASE}/PatientBookLab/get-all-booking-lab-by-lab-id`,
  };

  const generateDayOptions = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateString = date.toLocaleDateString('en-GB');
      const isoString = date.toISOString().split('T')[0];
      
      days.push({
        value: isoString,
        display: `${dayName} - ${dateString}`
      });
    }
    
    return days;
  };

  const dayOptions = generateDayOptions();

  const fetchBookings = async (isAtHome = true) => {
    if (!user?.id || !isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const bookingsResponse = await axios.get(ENDPOINTS.getBookings, {
        params: {
          labId: user.id,
          status: true,
          isAtHome: isAtHome,
        },
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const bookings = bookingsResponse.data.map((b) => ({
        id: b.id || Math.random().toString(36).substr(2, 9),
        patientName: b.patientName || 'Unknown',
        patientPhone: b.patientPhone || 'N/A',
        bookingDate: b.bookingDate || new Date().toISOString(),
        isAtHome: b.isAtHome ?? isAtHome,
        status: b.status,
        statusDisplay: b.status === true ? 'Confirmed' : b.status === false ? 'Cancelled' : b.status?.toString() || 'Unknown',
      }));

      setRecentBookings(bookings);
      setSortedBookings(bookings);

      setStats({
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.statusDisplay.toLowerCase() === 'pending').length,
        homeBookings: bookings.filter(b => b.isAtHome).length,
        labBookings: bookings.filter(b => !b.isAtHome).length,
      });
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError(null);
      setRecentBookings([]);
      setSortedBookings([]);
      setStats({
        totalBookings: 0,
        pendingBookings: 0,
        homeBookings: 0,
        labBookings: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    if (!user?.id || !isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      setPhotoLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE}/Upload/GetPhotoByUserIdAsync?userId=${user.id}&path=Actors%2Flaboratory`,
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
              Accept: '*/*',
            },
            responseType: 'blob',
          }
        );
        setLabPhoto(URL.createObjectURL(response.data));
      } catch (err) {
        setPhotoError('Failed to load lab photo');
      } finally {
        setPhotoLoading(false);
      }

      const citiesResponse = await axios.get(ENDPOINTS.getCities, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setCities(citiesResponse.data.map(c => ({ id: c.id, name: c.cityName })));

      await fetchBookings(isAtHomeFilter);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(null);
      setCities([]);
      setRecentBookings([]);
      setSortedBookings([]);
      setStats({
        totalBookings: 0,
        pendingBookings: 0,
        homeBookings: 0,
        labBookings: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, isAuthenticated, navigate, user?.accessToken]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });

    const sorted = [...sortedBookings].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      if (key === 'bookingDate') {
        valA = parseISO(a.bookingDate);
        valB = parseISO(b.bookingDate);
      } else if (key === 'status') {
        valA = a.statusDisplay ? a.statusDisplay.toLowerCase() : '';
        valB = b.statusDisplay ? b.statusDisplay.toLowerCase() : '';
      } else {
        valA = valA ? valA.toString().toLowerCase() : '';
        valB = valB ? valB.toString().toLowerCase() : '';
      }
      return direction === 'asc' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });
    setSortedBookings(sorted);
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!user?.id || !isAuthenticated) {
      setAppointmentError('Invalid authentication. Please login again.');
      return;
    }

    if (!selectedCityId || !appointmentDay || !appointmentTime) {
      setAppointmentError('Please fill all fields.');
      return;
    }

    const payload = [
      {
        day: appointmentDay,
        time: `${appointmentTime}:00`,
        available: true,
      },
    ];

    try {
      const response = await axios.post(
        `${ENDPOINTS.addAppointment}?labId=${user.id}&cityId=${selectedCityId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccessMessage('Appointment added successfully!');
      setAppointmentError('');
      await fetchData();
      setSelectedCityId('');
      setAppointmentDay('');
      setAppointmentTime('');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      let msg = 'Failed to create appointment.';
      if (err.response?.data?.includes('FOREIGN KEY')) msg = 'Invalid city or lab ID.';
      else if (err.response?.data?.includes('duplicate')) msg = 'An appointment already exists for this time.';
      setAppointmentError(msg);
    }
  };

  return {
    isLoading,
    error,
    setError,
    sortConfig,
    sortedBookings,
    stats,
    recentBookings,
    isAtHomeFilter,
    setIsAtHomeFilter,
    selectedDate,
    setSelectedDate,
    cities,
    selectedCityId,
    setSelectedCityId,
    appointmentDay,
    setAppointmentDay,
    appointmentTime,
    setAppointmentTime,
    handleCreateAppointment,
    successMessage,
    setSuccessMessage,
    appointmentError,
    setAppointmentError,
    labPhoto,
    photoLoading,
    photoError,
    filteredBookings: sortedBookings,
    handleSort,
    fetchData,
    fetchBookings,
    dayOptions,
  };
};

const DashboardContent = ({
  user,
  labPhoto,
  photoLoading,
  photoError,
  currentTime,
  stats,
  sortedBookings,
  handleSort,
  sortConfig,
  isAtHomeFilter,
  setIsAtHomeFilter,
  selectedDate,
  setSelectedDate,
  cities,
  selectedCityId,
  setSelectedCityId,
  appointmentDay,
  setAppointmentDay,
  appointmentTime,
  setAppointmentTime,
  handleCreateAppointment,
  successMessage,
  setSuccessMessage,
  appointmentError,
  setAppointmentError,
  fetchBookings,
  dayOptions,
}) => {
  return (
    <div style={styles.contentWrapper} className="content-wrapper">
      <div style={{
        background: 'linear-gradient(90deg, #009DA5 0%, #00b7c2 100%)',
        padding: '15px 25px',
        borderRadius: '10px',
        marginBottom: '20px',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,157,165,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '1rem' }}>
            {photoLoading ? (
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-border spinner-border-sm text-white" />
              </div>
            ) : labPhoto ? (
              <img src={labPhoto} alt="Laboratory" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }} />
            ) : (
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MdEdit size="24" style={{ color: '#fff', opacity: 0.75 }} />
              </div>
            )}
          </div>
          <div>
            <h2 style={{ margin: 0, fontWeight: '700', fontSize: '1.6rem' }}>
              Welcome, {user?.name || 'PhysioCare Laboratory'}!
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              {user?.email || 'lab@example.com'}
            </p>
            {photoError && <small style={{ color: '#ffeb3b', opacity: 0.75 }}>{photoError}</small>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>{currentTime}</p>
        </div>
      </div>

      <Row className="mb-4">
        <StatsCard title="Total Bookings" value={stats.totalBookings} icon={MdEventAvailable} color="#009DA5" bg="#e6f7f8" />
        <StatsCard title="Pending Bookings" value={stats.pendingBookings} icon={MdAccessTime} color="#ffc107" bg="#fff8e1" />
        <StatsCard title="Home Visits" value={stats.homeBookings} icon={MdHome} color="#28a745" bg="#e8f5e9" />
        <StatsCard title="Lab Visits" value={stats.labBookings} icon={FaFlask} color="#17a2b8" bg="#e3f2fd" />
      </Row>

      <Row>
        <Col lg={8} className="mb-4">
          <Card style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '10px' }}>
            <Card.Header style={{ backgroundColor: '#ffffff', border: 'none', padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0, color: '#2d3748', fontWeight: '600', fontSize: '1rem' }}>Recent Bookings</h5>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant={isAtHomeFilter ? 'primary' : 'outline-primary'}
                  size="sm"
                  style={{ borderRadius: '6px', fontSize: '0.85rem', backgroundColor: isAtHomeFilter ? '#009DA5' : undefined, borderColor: '#009DA5' }}
                  onClick={() => {
                    setIsAtHomeFilter(true);
                    fetchBookings(true);
                  }}
                >
                  <MdHome size="16" className="me-1" />
                  Home Visits
                </Button>
                <Button
                  variant={!isAtHomeFilter ? 'primary' : 'outline-primary'}
                  size="sm"
                  style={{ borderRadius: '6px', fontSize: '0.85rem', backgroundColor: !isAtHomeFilter ? '#009DA5' : undefined, borderColor: '#009DA5' }}
                  onClick={() => {
                    setIsAtHomeFilter(false);
                    fetchBookings(false);
                  }}
                >
                  <FaFlask size="16" className="me-1" />
                  Lab Visits
                </Button>
              </div>
            </Card.Header>
            <Card.Body style={{ padding: '0' }}>
              <AppointmentTable bookings={sortedBookings} onSort={handleSort} sortConfig={sortConfig} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '10px' }}>
            <Card.Header style={{ backgroundColor: '#ffffff', border: 'none', padding: '1rem 1.2rem' }}>
              <h5 style={{ margin: 0, color: '#2d3748', fontWeight: '600', fontSize: '1rem' }}>Create Appointment</h5>
            </Card.Header>
            <Card.Body style={{ padding: '1.2rem' }}>
              {appointmentError && (
                <Alert variant="danger" onClose={() => setAppointmentError('')} dismissible style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
                  {appointmentError}
                </Alert>
              )}
              {successMessage && (
                <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
                  {successMessage}
                </Alert>
              )}
              <Form onSubmit={handleCreateAppointment}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    style={{ backgroundColor: '#009DA5', borderColor: '#009DA5', borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    <MdAddCircle size="16" className="me-1" />
                    Create Appointment
                  </Button>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#2d3748', fontWeight: '500', fontSize: '0.85rem' }}>
                    <MdLocationCity size="18" className="me-2" />
                    Select City
                  </Form.Label>
                  <Form.Select
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    required
                    style={{ borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Select City --</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#2d3748', fontWeight: '500', fontSize: '0.85rem' }}>
                    <MdCalendarToday size="18" className="me-2" />
                    Appointment Day
                  </Form.Label>
                  <Form.Select
                    value={appointmentDay}
                    onChange={(e) => setAppointmentDay(e.target.value)}
                    required
                    style={{ borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Select Day --</option>
                    {dayOptions.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.display}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#2d3748', fontWeight: '500', fontSize: '0.85rem' }}>
                    <MdSchedule size="18" className="me-2" />
                    Appointment Time
                  </Form.Label>
                  <Form.Control
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    step="60"
                    required
                    style={{ borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>
        {`
          .highlight {
            background-color: #e6f7f8 !important;
            border-radius: 4px;
          }
          .react-calendar {
            border: none !important;
            width: 100% !important;
            font-family: 'Inter', sans-serif !important;
            font-size: 0.85rem !important;
          }
          .react-calendar__tile {
            padding: 0.5rem !important;
            border-radius: 0.25rem !important;
            transition: background 0.3s ease !important;
          }
          .react-calendar__tile:hover {
            background: #f1f5f9 !important;
          }
          .react-calendar__tile--active {
            background: #009DA5 !important;
            color: white !important;
            border-radius: 4px;
          }
          .react-calendar__navigation {
            background: #f8f9fa !important;
            padding: 0.3rem !important;
          }
          .react-calendar__navigation button {
            color: #2d3748 !important;
            font-weight: 600 !important;
            font-size: 0.85rem !important;
          }
          .react-calendar__month-view__weekdays {
            background: #ffffff !important;
            padding: 0.3rem 0 !important;
          }
          .react-calendar__month-view__weekdays__weekday {
            color: #495057 !important;
            font-weight: 500 !important;
            font-size: 0.8rem !important;
          }
        `}
      </style>
    </div>
  );
};

const Layout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeView, setActiveView] = useState(() => localStorage.getItem('activeView') || 'dashboard');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' }));
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dashboardData = useDashboardData(user, isAuthenticated, navigate);

  useEffect(() => {
    localStorage.setItem('activeView', activeView);
    if (activeView === 'logout') {
      setShowLogoutModal(true);
    }
  }, [activeView]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderContent = () => {
    const ComponentMap = {
      dashboard: <DashboardContent {...dashboardData} user={user} currentTime={currentTime} />,
      AcceptBook: <AcceptBook />,
      AddAnalysis: <AddAnalysis />,
      CreateAnalysisAtCities: <CreateAnalysisAtCities />,
      CreateAppointmentAtCity: <CreateAppointmentAtCity />,
      GetAllAnalysis: <GetAllAnalysis />,
      EditProfileForLab: <EditProfileForLab user={user} onProfileUpdate={(updatedUser) => { user.profileImage = updatedUser.profileImage; }} />,
      ForgetPasswordForLab: <ForgetPasswordForLab />,
      ServicesLab: <ServicesLab />,
      SubscribeLab: <SubscribeLab />,
      chat: <Chat />,
    };

    const selectedComponent = ComponentMap[activeView];
    return selectedComponent || <div style={{ padding: '20px' }}><h2 style={{ color: '#2d3748', fontSize: '1.6rem' }}>Page Not Found</h2></div>;
  };

  if (dashboardData.isLoading || authLoading || !isAuthenticated) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #009DA5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <div style={{ fontSize: '1rem', color: '#2d3748' }}>Loading Dashboard...</div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
            Please wait while we set things up...
          </div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <ProfessionalSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeView={activeView}
        setActiveView={setActiveView}
        isMobile={isMobile}
        handleLogout={handleLogout}
        user={user}
        labPhoto={dashboardData.labPhoto}
        photoLoading={dashboardData.photoLoading}
        photoError={dashboardData.photoError}
        setShowLogoutModal={setShowLogoutModal}
      />
      <div
        style={isMobile ? styles.mainContent : (isSidebarOpen ? styles.mainContent : { ...styles.mainContent, ...styles.mainContentCollapsed })}
        className="main-content"
      >
        <div style={styles.contentWrapper} className="content-wrapper">
          {dashboardData.error && (
            <Alert variant="danger" className="mb-3" onClose={() => dashboardData.setError(null)} dismissible style={{ fontSize: '0.85rem' }}>
              {dashboardData.error}
            </Alert>
          )}
          <Suspense fallback={
            <div style={styles.loadingContainer}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #009DA5',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <div style={{ fontSize: '1rem', color: '#2d3748' }}>Loading Page...</div>
              </div>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </div>
      </div>
      <Modal show={showLogoutModal} onHide={() => { setShowLogoutModal(false); setActiveView('dashboard'); }} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <Modal.Title style={{ color: '#2d3748', fontWeight: '600', fontSize: '1.2rem' }}>
            <MdLogout className="me-2" />
            Confirm Logout
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem', fontSize: '1rem', color: '#2d3748' }}>
          Are you sure you want to logout?
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', padding: '1rem' }}>
          <Button
            variant="outline-secondary"
            onClick={() => { setShowLogoutModal(false); setActiveView('dashboard'); }}
            style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.95rem' }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleLogout}
            style={{ backgroundColor: '#009DA5', borderColor: '#009DA5', borderRadius: '8px', padding: '8px 16px', fontSize: '0.95rem' }}
          >
            Log Out
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Layout;
