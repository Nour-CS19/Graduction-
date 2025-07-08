import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Modal, Form, Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt, faCalendarCheck, faMapMarkerAlt, faLaptop, faTasks, faBuilding,
    faUserEdit, faSignOutAlt, faTimes, faBars, faArrowLeft, faArrowRight,
    faHospital, faUsers, faCalendar
} from '@fortawesome/free-solid-svg-icons';
import { format, isToday, parseISO, addHours, format as formatDateFns } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { useAuth } from './Pages/AuthPage';
import Chat from './Chat/Chat';
import AppointmentAtClinics from './DASHBOARD DOCTOR/AppointmentAtClinics';
import AppointmentAtHome from './DASHBOARD DOCTOR/AppointmentAtHome';
import AppointmentsOnline from './DASHBOARD DOCTOR/AppointmentsOnline';
import Clinics from './DASHBOARD DOCTOR/Clinics';
import EditProfileForDoctor from './DASHBOARD DOCTOR/EditProfileForDOctor';
import FetchAll from './DASHBOARD DOCTOR/FetchAll';
import FetchAllAtClinic from './DASHBOARD DOCTOR/FetchAllAtClinic';
import FetchAllAtOnline from './DASHBOARD DOCTOR/FetchAllAtOnline';
import ForgetPasswordForDoctor from './DASHBOARD DOCTOR/ForgetPasswordForDoctor';

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
        zIndex: 1000,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
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
        padding: '15px 20px',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    sidebarMenu: {
        padding: '10px 0',
        flexGrow: 1,
    },
    sidebarMenuItem: {
        padding: '0',
        margin: '3px 6px',
        borderRadius: '6px',
        overflow: 'hidden',
    },
    sidebarMenuLink: {
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        color: '#2d3748',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        borderRadius: '6px',
    },
    sidebarMenuLinkActive: {
        background: 'linear-gradient(90deg, #009DA5 0%, #00b7c2 100%)',
        color: '#ffffff',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0,157,165,0.2)',
    },
    sidebarMenuIcon: {
        marginRight: '12px',
        width: '20px',
        textAlign: 'center',
        fontSize: '1rem',
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
    brandLogo: {
        display: 'flex',
        alignItems: 'center',
        color: '#2d3748',
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
    transform: translateX(4px);
  }
  .custom-toggle-button {
    background-color: transparent !important;
    border: none !important;
    color: #2d3748 !important;
    padding: 0 !important;
    transition: all 0.2s ease;
  }
  .custom-toggle-button:hover {
    color: #009DA5 !important;
    transform: scale(1.1);
  }
  @media (max-width: 768px) {
    .sidebar {
      position: fixed !important;
      transform: translateX(-100%) !important;
      box-shadow: 4px 0 10px rgba(0,0,0,0.15) !important;
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

const getDefaultAvatar = (role, name = '') => {
    const colors = {
        patient: { bg: '#28a745', text: '#FFFFFF' },
        doctor: { bg: '#007bff', text: '#FFFFFF' },
        nurse: { bg: '#fd7e14', text: '#FFFFFF' },
        laboratory: { bg: '#6f42c1', text: '#FFFFFF' },
        default: { bg: '#6c757d', text: '#FFFFFF' },
    };
    const color = colors[role?.toLowerCase()] || colors.default;
    const initial = name ? name.charAt(0).toUpperCase() : role?.charAt(0).toUpperCase() || 'U';
    return `https://ui-avatars.com/api/?name=${initial}&background=${color.bg.substring(1)}&color=${color.text.substring(1)}&size=128&font-size=0.6&bold=true`;
};

const PhysioCareLogo = ({ isCollapsed }) => (
    <div style={styles.brandLogo}>
        {isCollapsed ? null : (
            <>
                <svg viewBox="0 0 97 76" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28, marginRight: 8 }}>
                    <path d="M1.91304 12L3.1087 12.2689L4.30435 13.6134L5.26087 16.5714L6.21739 25.4454L6.45652 28.4034L4.30435 30.5546L4.54348 32.7059L6.69565 35.9328L9.80435 40.7731L11.9565 43.4622L12.913 44L11.2391 41.8487L5.26087 32.437L5.02174 30.8235L6.93478 29.7479L8.36957 30.0168L11.4783 31.8992L13.6304 33.7815L15.7826 36.2017L18.413 39.9664L20.087 41.8487L21.7609 42.9244L27.5 43.7311L31.5652 45.0756L33.9565 46.4202L36.587 48.5714L39.4565 51.7983L41.6087 55.563L43.2826 59.5966L44 62.5546V66.8571L43.7609 68.7395L43.5217 75.7311L43.2826 76H28.2174L27.9783 75.7311L27.7391 68.4706L26.5435 65.7815V65.2437H26.0652V64.7059L25.1087 64.1681L18.8913 59.8655L13.3913 56.1008L10.0435 53.4118L7.8913 51.2605L5.02174 45.0756L1.91304 37.2773L0.23913 31.6303L0 30.0168V25.9832L0.717391 17.1092L1.43478 12.5378L1.91304 12Z" fill="#009DA5" />
                    <path d="M94.788 12L95.7935 12.2689L96.3967 16.3025L97 25.9832V31.0924L95.5924 36.7395L94.1848 41.042L91.1685 49.1092L89.962 51.7983L88.3533 53.6807L84.1304 57.4454L79.7065 60.9412L76.288 63.8992L74.6793 65.7815L73.875 67.6639L73.6739 75.7311L73.4728 76H60.6033L60.4022 75.7311L60.2011 67.395L60 65.5126V63.3613L61.0054 58.2521L62.6141 54.2185L64.2228 51.5294L65.8315 49.1092L68.6467 46.1513L70.8587 44.8067L75.0815 43.4622L78.7011 42.9244L80.1087 41.8487L81.7174 39.9664L84.3315 35.395L86.3424 32.7059L89.5598 30.2857L90.163 30.0168H91.7717L92.9783 31.0924L92.1739 33.2437L89.5598 38.084L87.5489 41.8487L86.5435 43.4622L87.75 42.6555L89.1576 40.2353L91.7717 35.395L92.9783 33.2437L93.3804 31.8992L93.1793 30.2857L92.5761 29.479L91.5707 28.6723L91.7717 25.1765L92.5761 16.8403L93.3804 13.6134L94.3859 12.2689L94.788 12Z" fill="#009DA5" />
                    <path d="M38.6 0L41.313 0.235577L44.2522 1.17788L47.8696 3.29808L48.3217 3.76923L49.6783 3.53365L52.6174 1.64904L55.7826 0.471154L57.8174 0H60.3043L64.8261 1.17788L68.4435 2.82692L70.7043 4.47596L72.7391 6.83173L74.3217 10.3654L75 14.3702V16.9615L74.3217 20.9663L73.1913 23.7933L71.1565 27.5625L68.6696 30.8606L66.6348 33.2163L65.0522 35.101L59.8522 40.5192L58.0435 42.1683L53.7478 46.6442L51.2609 48.5288L49.9043 49H47.8696L45.1565 47.5865L39.9565 42.1683L38.1478 40.5192L30.913 32.9808L29.3304 31.0962L27.0696 28.0337L25.0348 24.7356L23.6783 21.2019L23 18.1394V12.7212L24.1304 8.95192L25.713 6.125L27.9739 3.76923L30.2348 2.35577L33.8522 0.942308L38.6 0Z" fill="#009DA5" />
                </svg>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#009DA5' }}>PhysioCare</span>
            </>
        )}
    </div>
);

const ProfessionalSidebar = ({ isCollapsed, toggleSidebar, activeView, setActiveView, isMobile, isSidebarOpen, user, photoLoading, photoError, setShowLogoutModal }) => {
    const [dropdownStates, setDropdownStates] = useState({
        appointments: false,
        bookings: false,
        profile: false,
        clinics: false,
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
        { id: 'dashboard', label: 'Dashboard', icon: faTachometerAlt, view: 'dashboard', level: 'top' },
        { id: 'appointments', label: 'Appointments', icon: faCalendarCheck, view: null, level: 'top' },
        { id: 'appointmentsOnline', label: 'Online Appointments', icon: faLaptop, view: 'appointmentsOnline', level: 'sub', parentId: 'appointments' },
        { id: 'appointmentAtClinics', label: 'Clinic Appointments', icon: faBuilding, view: 'appointmentAtClinics', level: 'sub', parentId: 'appointments' },
        { id: 'appointmentAtHome', label: 'Home Appointment', icon: faMapMarkerAlt, view: 'appointmentAtHome', level: 'sub', parentId: 'appointments' },
        { id: 'bookings', label: 'Bookings', icon: faTasks, view: null, level: 'top' },
        { id: 'fetchAll', label: 'Home Bookings', icon: faTasks, view: 'fetchAll', level: 'sub', parentId: 'bookings' },
        { id: 'fetchAllAtClinic', label: 'Clinic Bookings', icon: faBuilding, view: 'fetchAllAtClinic', level: 'sub', parentId: 'bookings' },
        { id: 'fetchAllAtOnline', label: 'Online Bookings', icon: faLaptop, view: 'fetchAllAtOnline', level: 'sub', parentId: 'bookings' },
        { id: 'profile', label: 'Profile', icon: faUserEdit, view: null, level: 'top' },
        { id: 'editProfile', label: 'Edit Profile', icon: faUserEdit, view: 'editProfile', level: 'sub', parentId: 'profile' },
        { id: 'settings', label: 'Settings', icon: faUserEdit, view: 'settings', level: 'sub', parentId: 'profile' },
        { id: 'chat', label: 'Messages', icon: faHospital, view: 'chat', level: 'top' },
        { id: 'clinics', label: 'Clinics', icon: faHospital, view: null, level: 'top' },
        { id: 'clinicsSub', label: 'My Clinics', icon: faHospital, view: 'clinics', level: 'sub', parentId: 'clinics' },
        { id: 'logout', label: 'Logout', icon: faSignOutAlt, view: 'logout', level: 'top' },
    ];

    const hasSubItems = (id) => menuConfig.some((item) => item.parentId === id);

    return (
        <>
            <style>{responsiveStyles}</style>
            <div
                style={{
                    ...styles.sidebar,
                    ...(isMobile
                        ? { ...styles.sidebarMobile, ...(isSidebarOpen ? styles.sidebarMobileOpen : {}) }
                        : isCollapsed
                            ? styles.sidebarCollapsed
                            : {}),
                }}
                className={isMobile ? (isSidebarOpen ? 'sidebar sidebar-open' : 'sidebar') : ''}
            >
                <div style={styles.sidebarHeader}>
                    <PhysioCareLogo isCollapsed={isMobile ? false : isCollapsed} />
                    <Button className="custom-toggle-button" onClick={toggleSidebar}>
                        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} size="lg" />
                    </Button>
                </div>
                <ul className="list-unstyled" style={styles.sidebarMenu}>
                    {menuConfig.map((item) => (
                        <li key={item.id} style={styles.sidebarMenuItem}>
                            {item.level === 'top' && (
                                <div
                                    className="sidebar-menu-link"
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
                                    }}
                                >
                                    <FontAwesomeIcon icon={item.icon} style={styles.sidebarMenuIcon} />
                                    {!(isMobile ? false : isCollapsed) && <span>{item.label}</span>}
                                    {!(isMobile ? false : isCollapsed) && hasSubItems(item.id) && (
                                        <FontAwesomeIcon
                                            icon={dropdownStates[item.id] ? faArrowRight : faArrowLeft}
                                            style={{ marginLeft: 'auto', fontSize: '0.75rem' }}
                                        />
                                    )}
                                </div>
                            )}
                            {!(isMobile ? false : isCollapsed) && dropdownStates[item.parentId] && item.level === 'sub' && (
                                <div
                                    className="sidebar-menu-link"
                                    onClick={() => {
                                        setActiveView(item.view);
                                        if (isMobile) toggleSidebar();
                                    }}
                                    style={{
                                        ...styles.sidebarMenuLink,
                                        ...(activeView === item.view ? styles.sidebarMenuLinkActive : {}),
                                        paddingLeft: '45px',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    <FontAwesomeIcon icon={item.icon} style={styles.sidebarMenuIcon} />
                                    <span>{item.label}</span>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                {!(isMobile ? false : isCollapsed) && (
                    <div style={styles.sidebarFooter}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {photoLoading ? (
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
                                    <div className="spinner-border spinner-border-sm text-muted" />
                                </div>
                            ) : user.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="Doctor Profile"
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
                                />
                            ) : (
                                <img
                                    src={getDefaultAvatar('doctor', user?.name)}
                                    alt="Default Doctor Avatar"
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
                                />
                            )}
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2d3748' }}>{user?.name || 'Doctor'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#718096' }}>{user?.email || 'doctor@example.com'}</div>
                                {photoError && <small style={{ color: '#dc3545', fontSize: '0.75rem' }}>{photoError}</small>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const AppointmentTable = ({ appointments, onSort, sortConfig }) => {
    const getSortIcon = (key) => {
        if (!sortConfig) return null;
        return sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '';
    };

    const isValidDateString = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
            console.warn('Invalid or empty date string:', dateStr);
            return false;
        }
        const date = parseISO(dateStr);
        return !isNaN(date.getTime());
    };

    const isValidTimeString = (timeStr) => {
        if (!timeStr || typeof timeStr !== 'string' || timeStr.trim() === '') {
            console.warn('Invalid or empty time string:', timeStr);
            return false;
        }
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        return timeRegex.test(timeStr);
    };

    const formatTime = (timeStr) => {
        if (!isValidTimeString(timeStr)) return 'N/A';
        try {
            const [hours, minutes] = timeStr.split(':').slice(0, 2);
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch (e) {
            console.warn('Time format error:', timeStr, e);
            return 'N/A';
        }
    };

    const getDayOfWeek = (dateStr) => {
        if (!isValidDateString(dateStr)) return 'N/A';
        try {
            return formatDateFns(parseISO(dateStr), 'EEEE');
        } catch (e) {
            console.warn('Day of week error:', dateStr, e);
            return 'N/A';
        }
    };

    const getEndTime = (startTime, durationHours = 1) => {
        if (!isValidTimeString(startTime)) return 'N/A';
        try {
            const [hours, minutes, seconds = '00'] = startTime.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10));
            const endDate = addHours(date, durationHours);
            return formatDateFns(endDate, 'HH:mm');
        } catch (e) {
            console.warn('End time calculation error:', startTime, e);
            return 'N/A';
        }
    };

    return (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                        {['patientName', 'type', 'date', 'day', 'startTime', 'endTime', 'status', 'totalPrice'].map((key) => (
                            <th
                                key={key}
                                style={{ color: '#2d3748', fontWeight: '600', padding: '0.8rem', fontSize: '0.85rem' }}
                                onClick={() => onSort(key)}
                                className="cursor-pointer"
                            >
                                {key === 'patientName' && 'Patient'}
                                {key === 'type' && 'Type'}
                                {key === 'date' && 'Date'}
                                {key === 'day' && 'Day'}
                                {key === 'startTime' && 'Start Time'}
                                {key === 'endTime' && 'End Time'}
                                {key === 'status' && 'Status'}
                                {key === 'totalPrice' && 'Price (EGP)'}
                                <span className="ms-1">{getSortIcon(key)}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {appointments.length > 0 ? (
                        appointments.map((appt) => (
                            <tr
                                key={appt.id}
                                style={{ transition: 'background-color 0.2s' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <td style={{ padding: '0.8rem', color: '#2d3748', fontSize: '0.85rem' }}>{appt.patientName || 'N/A'}</td>
                                <td style={{ padding: '0.8rem', color: '#718096', fontSize: '0.85rem' }}>{appt.type || 'N/A'}</td>
                                <td style={{ padding: '0.8rem', color: '#718096', fontSize: '0.85rem' }}>
                                    {isValidDateString(appt.date) ? format(parseISO(appt.date), 'yyyy-MM-dd') : 'N/A'}
                                </td>
                                <td style={{ padding: '0.8rem', color: '#718096', fontSize: '0.85rem' }}>{getDayOfWeek(appt.date)}</td>
                                <td style={{ padding: '0.8rem', color: '#718096', fontSize: '0.85rem' }}>{formatTime(appt.time || appt.startTime)}</td>
                                <td style={{ padding: '0.8rem', color: '#718096', fontSize: '0.85rem' }}>{formatTime(appt.endTime || getEndTime(appt.time || appt.startTime))}</td>
                                <td style={{ padding: '0.8rem', color: '#718096', fontSize: '0.85rem' }}>
                                    <span
                                        className={`badge ${
                                            appt.status === 'Scheduled' ? 'text-bg-success' : 'text-bg-warning'
                                        }`}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        {appt.status || 'N/A'}
                                    </span>
                                </td>
                                <td style={{ padding: '0.8rem', color: '#718096', fontSize: '0.85rem' }}>{appt.totalPrice ? `${appt.totalPrice} EGP` : 'N/A'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '1.2rem', color: '#718096', fontSize: '0.85rem' }}>
                                No data
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const StatsCard = ({ title, value, icon, color, bg }) => (
    <Col lg={4} md={6} className="mb-3">
        <Card
            style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%', borderRadius: '10px', transition: 'transform 0.2s' }}
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
                        marginRight: '1rem'
                    }}
                >
                    <FontAwesomeIcon icon={icon} style={{ fontSize: '1.2rem', color: color }} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', color: '#2d3748' }}>{value}</h3>
                    <p style={{ margin: 0, color: '#718096', fontSize: '0.85rem', fontWeight: '500' }}>{title}</p>
                </div>
            </Card.Body>
        </Card>
    </Col>
);

const DashboardContent = ({ currentUser, dashboardStats, appointments, setActiveView, onCreateAppointment, photoLoading, photoError }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [sortedAppointments, setSortedAppointments] = useState(appointments);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAppointmentData, setNewAppointmentData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        price: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { user, isAuthenticated } = useAuth();
    const API_BASE_URL = 'https://physiocareapp.runasp.net/api/v1';
    const [currentTime, setCurrentTime] = useState(
        new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' })
    );
    const [currentDate, setCurrentDate] = useState(
        format(new Date(), 'EEEE, MMMM d, yyyy', { timeZone: 'Europe/Bucharest' })
    );

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString('en-US', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' })
            );
            setCurrentDate(
                format(now, 'EEEE, MMMM d, yyyy', { timeZone: 'Europe/Bucharest' })
            );
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setSortedAppointments([...appointments]);
    }, [appointments]);

    const isValidDate = (dateStr) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateStr || !dateRegex.test(dateStr)) return false;
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date) && date >= new Date('2025-06-10');
    };

    const isValidTime = (timeStr) => {
        if (!timeStr) return false;
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        return timeRegex.test(timeStr);
    };

    const isValidPrice = (price) => {
        if (price === '') return false;
        const numPrice = Number(price);
        return !isNaN(numPrice) && numPrice >= 0;
    };

    const formatTimeForAPI = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.split(':').length === 3) return timeStr;
        if (timeStr.split(':').length === 2) return `${timeStr}:00`;
        return timeStr;
    };

    const validateForm = (formData) => {
        const trimmedData = {
            date: formData.date?.trim() || '',
            startTime: formData.startTime?.trim() || '',
            endTime: formData.endTime?.trim() || '',
            price: formData.price?.toString().trim() || '',
        };

        if (!trimmedData.date) return { valid: false, message: 'Date is required' };
        if (!trimmedData.startTime) return { valid: false, message: 'Start Time is required' };
        if (!trimmedData.endTime) return { valid: false, message: 'End Time is required' };
        if (trimmedData.price === '') return { valid: false, message: 'Price is required' };
        if (!isValidDate(trimmedData.date)) {
            return { valid: false, message: 'Please enter a valid date (YYYY-MM-DD) starting from June 10, 2025.' };
        }
        if (!isValidTime(trimmedData.startTime)) {
            return { valid: false, message: 'Please enter a valid start time (HH:MM or HH:MM:SS).' };
        }
        if (!isValidTime(trimmedData.endTime)) {
            return { valid: false, message: 'Please enter a valid end time (HH:MM or HH:MM:SS).' };
        }
        if (!isValidPrice(trimmedData.price)) {
            return { valid: false, message: 'Please enter a valid price (non-negative number).' };
        }
        const startDateTime = new Date(`${trimmedData.date}T${formatTimeForAPI(trimmedData.startTime)}`);
        const endDateTime = new Date(`${trimmedData.date}T${formatTimeForAPI(trimmedData.endTime)}`);
        if (endDateTime <= startDateTime) {
            return { valid: false, message: 'End time must be after start time.' };
        }
        const isDuplicate = appointments.some(
            (app) =>
                app.date === trimmedData.date &&
                (app.time === trimmedData.startTime || app.time === formatTimeForAPI(trimmedData.startTime))
        );
        if (isDuplicate) {
            return { valid: false, message: 'An appointment already exists for this date and start time.' };
        }
        return { valid: true, data: trimmedData };
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !user?.id) {
            setError('Invalid authentication. Please login again.');
            return;
        }

        const validation = validateForm(newAppointmentData);
        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        const { date, startTime, endTime, price } = validation.data;
        const formattedStartTime = formatTimeForAPI(startTime);
        const formattedEndTime = formatTimeForAPI(endTime);

        try {
            const formData = new FormData();
            formData.append('DoctorId', user.id);
            formData.append('Date', date);
            formData.append('Time', formattedStartTime); // API expects 'Time' as start time
            formData.append('EndTime', formattedEndTime); // Assuming API supports EndTime
            formData.append('Price', Number(price).toString());

            const response = await fetch(`${API_BASE_URL}/DoctorAppointmentOnlines`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    Accept: 'application/json',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create appointment: ${errorText}`);
            }

            setSuccessMessage('Created successfully');
            await onCreateAppointment();
            setNewAppointmentData({ date: '', startTime: '', endTime: '', price: '' });
            setError('');
            setTimeout(() => {
                setSuccessMessage('');
                setShowCreateModal(false);
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to create online appointment.');
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sorted = [...sortedAppointments].sort((a, b) => {
            let valA = a[key];
            let valB = b[key];

            if (key === 'date') {
                valA = isValidDateString(a.date) ? parseISO(a.date) : new Date(0);
                valB = isValidDateString(b.date) ? parseISO(b.date) : new Date(0);
            } else if (key === 'day') {
                valA = isValidDateString(a.date) ? formatDateFns(parseISO(a.date), 'EEEE') : '';
                valB = isValidDateString(b.date) ? formatDateFns(parseISO(b.date), 'EEEE') : '';
            } else if (key === 'startTime' || key === 'endTime') {
                valA = isValidTimeString(a[key] || a[key === 'startTime' ? 'time' : 'endTime'] || getEndTime(a.time)) ? a[key] || a[key === 'startTime' ? 'time' : 'endTime'] || getEndTime(a.time) : '';
                valB = isValidTimeString(b[key] || b[key === 'startTime' ? 'time' : 'endTime'] || getEndTime(b.time)) ? b[key] || b[key === 'startTime' ? 'time' : 'endTime'] || getEndTime(b.time) : '';
            } else if (key === 'totalPrice') {
                valA = Number(a.totalPrice) || 0;
                valB = Number(b.totalPrice) || 0;
            } else {
                valA = valA ? valA.toString().toLowerCase() : '';
                valB = valB ? valB.toString().toLowerCase() : '';
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setSortedAppointments(sorted);
    };

    const tileClassName = ({ date }) => {
        const dateStr = date.toISOString().split('T')[0];
        return appointments.some((appt) => appt.date === dateStr) ? 'highlight' : null;
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setNewAppointmentData({
            ...newAppointmentData,
            date: format(date, 'yyyy-MM-dd'),
        });
        setShowCreateModal(true);
    };

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
                        ) : currentUser.profileImage ? (
                            <img src={currentUser.profileImage} alt="Doctor Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }} />
                        ) : (
                            <img
                                src={getDefaultAvatar('doctor', currentUser?.name)}
                                alt="Default Doctor Avatar"
                                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }}
                            />
                        )}
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: '700', fontSize: '1.6rem' }}>
                            Welcome, Dr. {currentUser?.name || 'Doctor'}!
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                            {currentUser?.email || 'doctor@example.com'}
                        </p>
                        {photoError && <small style={{ color: '#ffeb3b', opacity: 0.75 }}>{photoError}</small>}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{currentDate}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>{currentTime}</p>
                </div>
            </div>

            <Row className="mb-4">
                {[
                    { title: 'Today Appointments', value: dashboardStats.todayAppointments, icon: faCalendarCheck, color: '#009DA5', bg: '#e6f7f8' },
                    { title: 'New Patients', value: dashboardStats.newPatients, icon: faUsers, color: '#28a745', bg: '#e8f5e9' },
                    { title: 'Upcoming Appointments', value: dashboardStats.upcomingAppointments, icon: faCalendar, color: '#ffc107', bg: '#fff8e1' },
                ].map((stat, index) => (
                    <StatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} bg={stat.bg} />
                ))}
            </Row>

            <Row>
                <Col lg={6} className="mb-4">
                    <Card style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%', borderRadius: '10px' }}>
                        <Card.Header style={{ backgroundColor: '#ffffff', border: 'none', padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h5 style={{ margin: 0, color: '#2d3748', fontWeight: '600', fontSize: '1rem' }}>Calendar</h5>
                            <Button
                                variant="primary"
                                style={{ backgroundColor: '#009DA5', borderColor: '#009DA5', padding: '6px 12px', fontSize: '0.85rem' }}
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Online Appointment
                            </Button>
                        </Card.Header>
                        <Card.Body style={{ padding: '1.2rem' }}>
                            <Calendar
                                onChange={handleDateChange}
                                value={selectedDate}
                                minDate={new Date('2025-06-10')}
                                tileClassName={tileClassName}
                                className="border-0 w-100"
                                locale="en-US"
                            />
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6} className="mb-4">
                    <Card style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%', borderRadius: '10px' }}>
                        <Card.Header style={{ backgroundColor: '#ffffff', border: 'none', padding: '1rem 1.2rem' }}>
                            <h5 style={{ margin: 0, color: '#2d3748', fontWeight: '600', fontSize: '1rem' }}>Today's Appointments</h5>
                        </Card.Header>
                        <Card.Body style={{ padding: '0' }}>
                            <AppointmentTable appointments={sortedAppointments} onSort={handleSort} sortConfig={sortConfig} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                    <Modal.Title style={{ color: '#2d3748', fontWeight: '600', fontSize: '1.1rem' }}>Create New Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '1.2rem' }}>
                    {error && <Alert variant="danger" onClose={() => setError('')} dismissible style={{ fontSize: '0.85rem', padding: '0.5rem' }}>{error}</Alert>}
                    {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible style={{ fontSize: '0.85rem', padding: '0.5rem' }}>{successMessage}</Alert>}
                    <Form onSubmit={handleCreateAppointment}>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ color: '#2d3748', fontWeight: '500', fontSize: '0.85rem' }}>Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={newAppointmentData.date}
                                onChange={(e) => setNewAppointmentData({ ...newAppointmentData, date: e.target.value })}
                                min="2025-06-10"
                                required
                                style={{ borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ color: '#2d3748', fontWeight: '500', fontSize: '0.85rem' }}>Start Time</Form.Label>
                            <Form.Control
                                type="time"
                                name="startTime"
                                value={newAppointmentData.startTime}
                                onChange={(e) => setNewAppointmentData({ ...newAppointmentData, startTime: e.target.value })}
                                step="60"
                                required
                                style={{ borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ color: '#2d3748', fontWeight: '500', fontSize: '0.85rem' }}>End Time</Form.Label>
                            <Form.Control
                                type="time"
                                name="endTime"
                                value={newAppointmentData.endTime}
                                onChange={(e) => setNewAppointmentData({ ...newAppointmentData, endTime: e.target.value })}
                                step="60"
                                required
                                style={{ borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ color: '#2d3748', fontWeight: '500', fontSize: '0.85rem' }}>Price (EGP)</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                value={newAppointmentData.price}
                                onChange={(e) => setNewAppointmentData({ ...newAppointmentData, price: e.target.value })}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                required
                                style={{ borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}
                            />
                        </Form.Group>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowCreateModal(false)}
                                style={{ borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                style={{ backgroundColor: '#009DA5', borderColor: '#009DA5', borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
                            >
                                Create
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

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
                        transition: background 0.2s ease !important;
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

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeView, setActiveView] = useState(() => localStorage.getItem('activeView') || 'dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        todayAppointments: 0,
        newPatients: 0,
        upcomingAppointments: 0,
        patientFeedback: 0,
    });
    const [photoLoading, setPhotoLoading] = useState(false);
    const [photoError, setPhotoError] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        localStorage.setItem('activeView', activeView);
        if (activeView === 'logout') {
            setShowLogoutModal(true);
        }
    }, [activeView]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isValidDateString = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
            console.warn('Invalid or empty date string:', dateStr);
            return false;
        }
        const date = parseISO(dateStr);
        return !isNaN(date.getTime());
    };

    const isValidTimeString = (timeStr) => {
        if (!timeStr || typeof timeStr !== 'string' || timeStr.trim() === '') {
            console.warn('Invalid or empty time string:', timeStr);
            return false;
        }
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        return timeRegex.test(timeStr);
    };

    const fetchData = async () => {
        if (!user?.id || !isAuthenticated) {
            navigate('/login');
            return;
        }
        setIsLoading(true);
        setPhotoLoading(true);
        setPhotoError(null);
        try {
            let profileImage = null;
            try {
                const photoResponse = await axios.get(`https://physiocareapp.runasp.net/api/v1/Upload/GetPhotoByUserIdAsync`, {
                    params: { userId: user.id, path: 'Actors%2FDoctor' },
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                    responseType: 'json',
                });
                if (photoResponse.data && photoResponse.data.imageUrl) {
                    profileImage = photoResponse.data.imageUrl;
                }
            } catch (photoError) {
                console.warn('Failed to load profile photo:', photoError);
            } finally {
                setPhotoLoading(false);
            }
            user.profileImage = profileImage;

            let homeBookings = [];
            try {
                const homeBookingsResponse = await axios.get(
                    `https://physiocareapp.runasp.net/api/v1/PatientBookingDoctorAtHomes/get-all-booking-at-homes/${user.id}`,
                    {
                        headers: { Authorization: `Bearer ${user.accessToken}` },
                    }
                );
                homeBookings = homeBookingsResponse.data.map((booking) => ({
                    ...booking,
                    type: 'Home',
                    id: booking.id || Math.random().toString(36).substr(2, 9),
                    status: booking.isDeleted ? 'Cancelled' : booking.isAccepted ? 'Scheduled' : 'Pending',
                    time: booking.startTime || booking.time || 'N/A',
                    endTime: booking.endTime || (booking.startTime ? addHours(new Date(`1970-01-01T${booking.startTime}`), 1).toISOString().split('T')[1].slice(0, 5) : 'N/A'),
                    date: booking.date || 'N/A',
                    patientName: booking.patientName || 'N/A',
                    totalPrice: booking.totalPrice || 0,
                }));
            } catch (homeError) {
                console.warn('Failed to load home bookings:', homeError);
            }

            let onlineBookings = [];
            try {
                const onlineBookingsResponse = await axios.get(
                    `https://physiocareapp.runasp.net/api/v1/PatientBookingDoctorOnlines/get-all-booking-online/${user.id}`,
                    {
                        headers: { Authorization: `Bearer ${user.accessToken}` },
                    }
                );
                onlineBookings = onlineBookingsResponse.data.map((booking) => ({
                    ...booking,
                    type: 'Online',
                    id: booking.id || Math.random().toString(36).substr(2, 9),
                    status: booking.isDeleted ? 'Cancelled' : booking.isAccepted ? 'Scheduled' : 'Pending',
                    time: booking.startTime || booking.time || 'N/A',
                    endTime: booking.endTime || (booking.startTime ? addHours(new Date(`1970-01-01T${booking.startTime}`), 1).toISOString().split('T')[1].slice(0, 5) : 'N/A'),
                    date: booking.date || 'N/A',
                    patientName: booking.patientName || 'N/A',
                    totalPrice: booking.totalPrice || 0,
                }));
            } catch (onlineError) {
                console.warn('Failed to load online bookings:', onlineError);
            }

            let clinicBookings = [];
            try {
                const clinicBookingsResponse = await axios.get(
                    `https://physiocareapp.runasp.net/api/v1/PatientBookingDoctorAtClinics/get-all-booking-at-clinics/${user.id}`,
                    {
                        headers: { Authorization: `Bearer ${user.accessToken}` },
                    }
                );
                clinicBookings = clinicBookingsResponse.data.map((booking) => ({
                    ...booking,
                    type: 'Clinic',
                    id: booking.id || Math.random().toString(36).substr(2, 9),
                    status: booking.isDeleted ? 'Cancelled' : booking.isAccepted ? 'Scheduled' : 'Pending',
                    time: booking.startTime || booking.time || 'N/A',
                    endTime: booking.endTime || (booking.startTime ? addHours(new Date(`1970-01-01T${booking.startTime}`), 1).toISOString().split('T')[1].slice(0, 5) : 'N/A'),
                    date: booking.date || 'N/A',
                    patientName: booking.patientName || 'N/A',
                    totalPrice: booking.totalPrice || 0,
                }));
            } catch (clinicError) {
                console.warn('Failed to load clinic bookings:', clinicError);
            }

            const allAppointments = [...homeBookings, ...onlineBookings, ...clinicBookings];
            setAppointments(allAppointments);
            setBookings(allAppointments);

            let clinicsData = [];
            try {
                const clinicsResponse = await axios.get(
                    `https://physiocareapp.runasp.net/api/v1/Clinics/GetAllClinicsByDoctorId/${user.id}`,
                    {
                        headers: { Authorization: `Bearer ${user.accessToken}` },
                    }
                );
                clinicsData = clinicsResponse.data || [];
            } catch (clinicsError) {
                console.warn('Failed to load clinics:', clinicsError);
            }
            setClinics(clinicsData);

            const today = new Date();
            const todayAppointments = allAppointments.filter((a) => isValidDateString(a.date) && isToday(parseISO(a.date))).length;
            const thisWeekStart = new Date(today);
            thisWeekStart.setDate(today.getDate() - today.getDay());
            const newPatients = allAppointments.filter((a) => {
                if (!isValidDateString(a.date)) return false;
                const apptDate = parseISO(a.date);
                return apptDate >= thisWeekStart && a.patientName !== 'Available Slot' && a.patientName !== 'N/A';
            }).length;
            const upcomingAppointments = allAppointments.filter((a) => {
                if (!isValidDateString(a.date)) return false;
                const apptDate = parseISO(a.date);
                return apptDate >= today && a.status === 'Scheduled';
            }).length;

            setDashboardStats({
                todayAppointments,
                newPatients,
                upcomingAppointments,
                patientFeedback: 0,
            });
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load dashboard data. Please try again.');
            setAppointments([]);
            setBookings([]);
            setClinics([]);
            setDashboardStats({
                todayAppointments: 0,
                newPatients: 0,
                upcomingAppointments: 0,
                patientFeedback: 0,
            });
        } finally {
            setIsLoading(false);
            setPhotoLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id, isAuthenticated, navigate, user?.accessToken]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const renderContent = () => {
        switch (activeView) {
            case 'appointmentsOnline':
                return <AppointmentsOnline appointments={appointments.filter((a) => a.type === 'Online')} />;
            case 'appointmentAtClinics':
                return <AppointmentAtClinics appointments={appointments.filter((a) => a.type === 'Clinic')} />;
            case 'appointmentAtHome':
                return <AppointmentAtHome appointments={appointments.filter((a) => a.type === 'Home')} />;
            case 'clinics':
                return <Clinics clinics={clinics} />;
            case 'editProfile':
                return (
                    <EditProfileForDoctor
                        user={user}
                        onProfileUpdate={(updatedUser) => {
                            user.profileImage = updatedUser.profileImage;
                        }}
                    />
                );
            case 'settings':
                return <ForgetPasswordForDoctor />;
            case 'fetchAll':
                return <FetchAll bookings={bookings} />;
            case 'fetchAllAtClinic':
                return <FetchAllAtClinic bookings={bookings.filter((b) => b.type === 'Clinic')} />;
            case 'fetchAllAtOnline':
                return <FetchAllAtOnline bookings={bookings.filter((b) => b.type === 'Online')} />;
            case 'chat':
                return <Chat />;
            case 'logout':
                return null; // Modal handles logout
            default:
                return (
                    <DashboardContent
                        currentUser={user}
                        dashboardStats={dashboardStats}
                        appointments={appointments}
                        setActiveView={setActiveView}
                        onCreateAppointment={fetchData}
                        photoLoading={photoLoading}
                        photoError={photoError}
                    />
                );
        }
    };

    if (isLoading || !isAuthenticated) {
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
                isCollapsed={!isSidebarOpen}
                toggleSidebar={toggleSidebar}
                activeView={activeView}
                setActiveView={setActiveView}
                isMobile={isMobile}
                isSidebarOpen={isSidebarOpen}
                user={user}
                photoLoading={photoLoading}
                photoError={photoError}
                setShowLogoutModal={setShowLogoutModal}
            />
            <div
                style={isMobile ? styles.mainContent : (isSidebarOpen ? styles.mainContent : { ...styles.mainContent, ...styles.mainContentCollapsed })}
                className="main-content"
            >
                <div style={styles.contentWrapper} className="content-wrapper">
                    {error && (
                        <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible style={{ fontSize: '0.85rem' }}>
                            {error}
                        </Alert>
                    )}
                    {successMessage && (
                        <Alert variant="success" className="mb-3" onClose={() => setSuccessMessage(null)} dismissible style={{ fontSize: '0.85rem' }}>
                            {successMessage}
                        </Alert>
                    )}
                    {renderContent()}
                </div>
            </div>
            <Modal show={showLogoutModal} onHide={() => { setShowLogoutModal(false); setActiveView('dashboard'); }} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                    <Modal.Title style={{ color: '#2d3748', fontWeight: '600', fontSize: '1.2rem' }}>
                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                        Confirm Logout
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '1.5rem', fontSize: '1rem', color: '#2d3748' }}>
                    Are you sure you want to log out?
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

export default DashboardPage;