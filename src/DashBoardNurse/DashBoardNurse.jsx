import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt, faCalendarCheck, faMapMarkerAlt, faUserNurse, faTasks,
    faUserEdit, faSignOutAlt, faTimes, faBars, faArrowLeft, faArrowRight, faCreditCard, faComments, faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { useAuth } from '../Pages/AuthPage';
import AddAppointment from './AddAppointment';
import AddPlace from './AddPlace';
import AddNursing from './AddNursing';
import ManageBookings from './ManageBookings';
import ManagePlaces from './ManagePlaces';
import EditProfile from './EditProfileForNurse';
import ForgetPassword from './ForgetPasswordForNurse';
import DashboardNurseHome from './DashboardNurseHome';
import Subscribe from './Subscribe';
import Chat from '../Chat/Chat';

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
        padding: '20px 25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: '#fff',
    },
    sidebarFooter: {
        marginTop: 'auto',
        padding: '15px 25px',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    sidebarMenu: {
        padding: '15px 0',
        flex: 1,
    },
    sidebarMenuItem: {
        padding: '0',
        margin: '4px 8px',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    sidebarMenuLink: {
        padding: '14px 25px',
        display: 'flex',
        alignItems: 'center',
        color: '#2d3748',
        textDecoration: 'none',
        fontSize: '1rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        borderRadius: '8px',
    },
    sidebarMenuLinkActive: {
        background: 'linear-gradient(90deg, #009DA5 0%, #00b7c2 100%)',
        color: '#ffffff',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0,157,165,0.2)',
    },
    sidebarMenuIcon: {
        marginRight: '15px',
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
        padding: '25px 25px 25px 0',
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
    errorContainer: {
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

const PhysioCareLogo = ({ isCollapsed }) => (
    <div style={styles.brandLogo}>
        {isCollapsed ? null : (
            <>
                <svg viewBox="0 0 97 76" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 32, height: 32, marginRight: 10 }}>
                    <path d="M1.91304 12L3.1087 12.2689L4.30435 13.6134L5.26087 16.5714L6.21739 25.4454L6.45652 28.4034L4.30435 30.5546L4.54348 32.7059L6.69565 35.9328L9.80435 40.7731L11.9565 43.4622L12.913 44L11.2391 41.8487L5.26087 32.437L5.02174 30.8235L6.93478 29.7479L8.36957 30.0168L11.4783 31.8992L13.6304 33.7815L15.7826 36.2017L18.413 39.9664L20.087 41.8487L21.7609 42.9244L27.5 43.7311L31.5652 45.0756L33.9565 46.4202L36.587 48.5714L39.4565 51.7983L41.6087 55.563L43.2826 59.5966L44 62.5546V66.8571L43.7609 68.7395L43.5217 75.7311L43.2826 76H28.2174L27.9783 75.7311L27.7391 68.4706L26.5435 65.7815V65.2437H26.0652V64.7059L25.1087 64.1681L18.8913 59.8655L13.3913 56.1008L10.0435 53.4118L7.8913 51.2605L5.02174 45.0756L1.91304 37.2773L0.23913 31.6303L0 30.0168V25.9832L0.717391 17.1092L1.43478 12.5378L1.91304 12Z" fill="#009DA5" />
                    <path d="M94.788 12L95.7935 12.2689L96.3967 16.3025L97 25.9832V31.0924L95.5924 36.7395L94.1848 41.042L91.1685 49.1092L89.962 51.7983L88.3533 53.6807L84.1304 57.4454L79.7065 60.9412L76.288 63.8992L74.6793 65.7815L73.875 67.6639L73.6739 75.7311L73.4728 76H60.6033L60.4022 75.7311L60.2011 67.395L60 65.5126V63.3613L61.0054 58.2521L62.6141 54.2185L64.2228 51.5294L65.8315 49.1092L68.6467 46.1513L70.8587 44.8067L75.0815 43.4622L78.7011 42.9244L80.1087 41.8487L81.7174 39.9664L84.3315 35.395L86.3424 32.7059L89.5598 30.2857L90.163 30.0168H91.7717L92.9783 31.0924L92.1739 33.2437L89.5598 38.084L87.5489 41.8487L86.5435 43.4622L87.75 42.6555L89.1576 40.2353L91.7717 35.395L92.9783 33.2437L93.3804 31.8992L93.1793 30.2857L92.5761 29.479L91.5707 28.6723L91.7717 25.1765L92.5761 16.8403L93.3804 13.6134L94.3859 12.2689L94.788 12Z" fill="#009DA5" />
                    <path d="M38.6 0L41.313 0.235577L44.2522 1.17788L47.8696 3.29808L48.3217 3.76923L49.6783 3.53365L52.6174 1.64904L55.7826 0.471154L57.8174 0H60.3043L64.8261 1.17788L68.4435 2.82692L70.7043 4.47596L72.7391 6.83173L74.3217 10.3654L75 14.3702V16.9615L74.3217 20.9663L73.1913 23.7933L71.1565 27.5625L68.6696 30.8606L66.6348 33.2163L65.0522 35.101L59.8522 40.5192L58.0435 42.1683L53.7478 46.6442L51.2609 48.5288L49.9043 49H47.8696L45.1565 47.5865L39.9565 42.1683L38.1478 40.5192L30.913 32.9808L29.3304 31.0962L27.0696 28.0337L25.0348 24.7356L23.6783 21.2019L23 18.1394V12.7212L24.1304 8.95192L25.713 6.125L27.9739 3.76923L30.2348 2.35577L33.8522 0.942308L38.6 0Z" fill="#009DA5" />
                </svg>
                <span style={{ fontSize: '1.3rem', fontWeight: '700', color: '#009DA5' }}>PhysioCare</span>
            </>
        )}
    </div>
);

const NurseSidebar = ({ isCollapsed, toggleSidebar, activeView, setActiveView, isMobile, isSidebarOpen, user }) => {
    const [dropdownStates, setDropdownStates] = useState({
        appointment: false,
        manage: false,
        edit: false,
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [photoError, setPhotoError] = useState(null);

    const token = user?.token || localStorage.getItem('token') || null;
    const nurseId = user?.id || user?.Id || null;

    useEffect(() => {
        const fetchProfilePhoto = async () => {
            if (!nurseId || !token) {
                setPhotoError('User not authenticated. Please log in.');
                return;
            }

            setPhotoLoading(true);
            try {
                const photoResponse = await axios.get('https://physiocareapp.runasp.net/api/v1/Upload/GetPhotoByUserIdAsync', {
                    params: { userId: nurseId },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'image/*',
                    },
                    responseType: 'blob',
                });

                const contentType = photoResponse.headers['content-type'];
                if (!contentType.startsWith('image/')) {
                    throw new Error('Response is not an image');
                }

                setProfilePhoto(URL.createObjectURL(photoResponse.data));
            } catch (err) {
                console.error('Fetch photo error:', err);
            } finally {
                setPhotoLoading(false);
            }
        };

        if (nurseId && token) {
            fetchProfilePhoto();
        }
    }, [nurseId, token]);

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
        { id: 'appointment', label: 'Appointment', icon: faCalendarCheck, view: null, level: 'top' },
        { id: 'add-appointment', label: 'Add Appointment', icon: faCalendarCheck, view: 'add-appointment', level: 'sub', parentId: 'appointment' },
        { id: 'add-place', label: 'Add Place', icon: faMapMarkerAlt, view: 'add-place', level: 'sub', parentId: 'appointment' },
        { id: 'add-nursing', label: 'Add Nursing', icon: faUserNurse, view: 'add-nursing', level: 'sub', parentId: 'appointment' },
        { id: 'manage', label: 'Manage', icon: faTasks, view: null, level: 'top' },
        { id: 'manage-bookings', label: 'Manage Bookings', icon: faCalendarCheck, view: 'manage-bookings', level: 'sub', parentId: 'manage' },
        { id: 'manage-places', label: 'Manage Places', icon: faMapMarkerAlt, view: 'manage-places', level: 'sub', parentId: 'manage' },
        { id: 'edit', label: 'Edit', icon: faUserEdit, view: null, level: 'top' },
        { id: 'edit-profile', label: 'Edit Profile', icon: faUserEdit, view: 'edit-profile', level: 'sub', parentId: 'edit' },
        { id: 'forget-password', label: 'Forget Password', icon: faUserEdit, view: 'forget-password', level: 'sub', parentId: 'edit' },
        { id: 'chat', label: 'Chat', icon: faComments, view: 'chat', level: 'top' },
        { id: 'subscribe', label: 'Subscribe', icon: faCreditCard, view: 'subscribe', level: 'top' },
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
                                            setActiveView(item.view);
                                            if (isMobile) toggleSidebar();
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
                                            style={{ marginLeft: 'auto', fontSize: '0.8rem' }}
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
                                        paddingLeft: '50px',
                                        fontSize: '0.95rem',
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
                        {photoLoading ? (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="spinner-border spinner-border-sm text-secondary" />
                            </div>
                        ) : profilePhoto ? (
                            <img src={profilePhoto} alt="Nurse Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }} />
                        ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: '1.5rem', color: '#718096' }} />
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#2d3748' }}>
                                {user?.name || 'Nurse User'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#718096', opacity: 0.9 }}>
                                {user?.email || 'nurse@example.com'}
                            </span>
                            {photoError && <small style={{ fontSize: '0.7rem', color: '#e53e3e' }}>{photoError}</small>}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const AuthError = ({ onRetry }) => (
    <div style={styles.errorContainer}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h3 style={{ color: '#e53e3e', marginBottom: '1rem' }}>Authentication Error</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                There seems to be an issue with the authentication system. This could be due to:
            </p>
            <ul style={{ textAlign: 'left', color: '#666', marginBottom: '2rem' }}>
                <li>AuthProvider not properly wrapping the application</li>
                <li>Authentication context not being initialized</li>
                <li>Network connectivity issues</li>
                <li>Session expired</li>
            </ul>
            <div>
                <Button
                    variant="primary"
                    onClick={onRetry}
                    style={{ marginRight: '1rem', backgroundColor: '#009DA5', borderColor: '#009DA5' }}
                >
                    Retry
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => window.location.href = '/login'}
                >
                    Go to Login
                </Button>
            </div>
        </div>
    </div>
);

const LoadingScreen = ({ message = "Loading..." }) => (
    <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #009DA5',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
            }}></div>
            <div style={{ fontSize: '1.2rem', color: '#2d3748' }}>{message}</div>
            <div style={{ fontSize: '1rem', color: '#666', marginTop: '10px' }}>
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

function NurseDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState(() => {
        const savedView = localStorage.getItem('activeViewBox');
        return savedView || 'dashboard';
    });
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [authError, setAuthError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    let authData;
    try {
        authData = useAuth();
    } catch (authHookError) {
        console.error('Error using useAuth hook:', authHookError);
        authData = {
            isAuthenticated: undefined,
            isLoading: false,
            logout: null,
            user: { name: '', email: '' },
            error: 'Authentication hook failed'
        };
    }

    const { isAuthenticated, isLoading, logout, user } = authData || {};

    useEffect(() => {
        localStorage.setItem('activeViewBox', activeView);
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

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (isAuthenticated === undefined && !authError) {
            console.error('Authentication status is undefined. AuthProvider may not be properly set up.');
            setAuthError(true);
            return;
        }

        if (isAuthenticated !== undefined && authError) {
            setAuthError(false);
        }

        if (isAuthenticated === false && !authError) {
            console.log('User not authenticated, redirecting to login...');
            navigate('/login', { replace: true });
            return;
        }

        if (activeView === 'logout') {
            setShowLogoutModal(true);
        }
    }, [isAuthenticated, isLoading, navigate, authError, retryCount, activeView]);

    const handleLogout = async () => {
        try {
            if (logout) {
                await logout();
            }
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            localStorage.removeItem('activeViewBox');
            setShowLogoutModal(false);
            navigate('/login', { replace: true });
        } catch (err) {
            setError('Failed to log out. Please try again.');
            console.error('Logout error:', err);
            setShowLogoutModal(false);
            navigate('/login', { replace: true });
        }
    };

    const handleCloseLogoutModal = () => {
        setShowLogoutModal(false);
        setActiveView('dashboard');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleRetryAuth = () => {
        setRetryCount(prev => prev + 1);
        setAuthError(false);
        setError(null);
        window.location.reload();
    };

    const renderContent = () => {
        if (!isAuthenticated) {
            return <LoadingScreen message="Redirecting to login..." />;
        }

        try {
            switch (activeView) {
                case 'dashboard':
                    return <DashboardNurseHome user={user} />;
                case 'add-appointment':
                    return <AddAppointment />;
                case 'add-place':
                    return <AddPlace />;
                case 'add-nursing':
                    return <AddNursing />;
                case 'manage-bookings':
                    return <ManageBookings />;
                case 'manage-places':
                    return <ManagePlaces />;
                case 'edit-profile':
                    return <EditProfile />;
                case 'forget-password':
                    return <ForgetPassword />;
                case 'chat':
                    return <Chat />;
                case 'subscribe':
                    return <Subscribe />;
                case 'logout':
                    return <LoadingScreen message="Preparing to log out..." />;
                default:
                    return <DashboardNurseHome user={user} />;
            }
        } catch (componentError) {
            console.error('Error rendering component:', componentError);
            setError(`Failed to load ${activeView} component. Please try refreshing the page.`);
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh',
                    flexDirection: 'column'
                }}>
                    <div style={{ color: '#e53e3e', marginBottom: '1rem' }}>
                        Error loading component
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => window.location.reload()}
                        style={{ backgroundColor: '#009DA5', borderColor: '#009DA5' }}
                    >
                        Refresh Page
                    </Button>
                </div>
            );
        }
    };

    if (authError) {
        return <AuthError onRetry={handleRetryAuth} />;
    }

    if (isLoading) {
        return <LoadingScreen message="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return <LoadingScreen message="Redirecting to login..." />;
    }

    return (
        <div style={styles.dashboardContainer}>
            <NurseSidebar
                isCollapsed={!isSidebarOpen}
                toggleSidebar={toggleSidebar}
                activeView={activeView}
                setActiveView={setActiveView}
                isMobile={isMobile}
                isSidebarOpen={isSidebarOpen}
                user={user}
            />
            
            <div
                style={{
                    ...styles.mainContent,
                    ...(isMobile ? {} : !isSidebarOpen ? styles.mainContentCollapsed : {}),
                }}
                className="main-content"
            >
                <div style={styles.contentWrapper}>
                    {error && (
                        <Alert
                            variant="danger"
                            dismissible
                            onClose={() => setError(null)}
                            style={{ marginBottom: '20px' }}
                        >
                            {error}
                        </Alert>
                    )}
                    
                    {renderContent()}
                </div>
            </div>
 
            <Modal
                show={showLogoutModal}
                onHide={handleCloseLogoutModal}
                centered
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to log out of your account?</p>
                    <p className="text-muted">
                        You will need to log in again to access your dashboard.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={handleCloseLogoutModal}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleLogout}
                        style={{
                            backgroundColor: '#dc3545',
                            borderColor: '#dc3545'
                        }}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '8px' }} />
                        Logout
                    </Button>
                </Modal.Footer>
            </Modal>
 
            {isMobile && isSidebarOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999,
                    }}
                    onClick={toggleSidebar}
                />
            )}
        </div>
    );
 }
 
 export default NurseDashboard;