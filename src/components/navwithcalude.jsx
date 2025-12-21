import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Pages/AuthPage";

const Navbar = ({ onNavigate }) => {
  const [headerShadow, setHeaderShadow] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [appointmentsOpen, setAppointmentsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [userInfo, setUserInfo] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const profileRef = useRef(null);
  const servicesRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const { user, logout } = useAuth();

  const doctorNotifications = [
    { id: 1, text: "Dr. Abdullah scheduled an appointment", time: "10:00 AM", read: false },
    { id: 2, text: "Dr. Marwa updated your treatment plan", time: "9:15 AM", read: true },
    { id: 3, text: "Prescription ready for pickup", time: "Yesterday", read: false },
  ];

  const labNotifications = [
    { id: 4, text: "Lab result ready: Blood test", time: "8:30 AM", read: false },
    { id: 5, text: "X-Ray results available", time: "2 days ago", read: true },
  ];

  const doctorMessages = [
    { id: 1, text: "Message from Dr.Abdullah Ali: Please follow up.", time: "Yesterday", read: false },
    { id: 2, text: "Reminder: Take medication as prescribed", time: "2 days ago", read: true },
  ];

  const labMessages = [
    { id: 3, text: "Lab message: Your sample is processed.", time: "Today", read: false },
  ];

  const unreadNotifications = [...doctorNotifications, ...labNotifications].filter((n) => !n.read).length;
  const unreadMessages = [...doctorMessages, ...labMessages].filter((m) => !m.read).length;

  useEffect(() => {
    if (user) {
      setUserInfo({ id: user.id, name: user.name });
      fetchProfileImage(user.id);
    } else {
      setUserInfo(null);
      setProfileImageUrl(null);
    }
  }, [user]);

  const fetchProfileImage = async (userId) => {
    setImageLoading(true);
    try {
      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/Upload/GetPhotoByUserIdAsync?userId=${userId}&path=Patient`,
        {
          method: 'GET',
          headers: {
            'Accept': 'image/*',
          },
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setProfileImageUrl(imageUrl);
      } else {
        console.log('No profile image found, using initials');
        setProfileImageUrl(null);
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
      setProfileImageUrl(null);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (profileImageUrl) {
        URL.revokeObjectURL(profileImageUrl);
      }
    };
  }, [profileImageUrl]);

  useEffect(() => {
    const handleScroll = () => {
      setHeaderShadow(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Lock body scroll when mobile menu is open
    if (navbarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [navbarOpen]);

  const handleServicesHoverOpen = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setServicesOpen(true);
  };

  const handleServicesHoverClose = () => {
    closeTimeoutRef.current = setTimeout(() => setServicesOpen(false), 300);
  };

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    setProfileMenuOpen(false);
    setNavbarOpen(false);
    setServicesOpen(false);
    setAppointmentsOpen(false);
    if (onNavigate && typeof onNavigate === "function") {
      try {
        onNavigate(path);
        return;
      } catch (error) {
        console.error("Error with onNavigate:", error);
      }
    }
    if (window.history && window.history.pushState) {
      window.history.pushState({ path }, "", path);
      window.dispatchEvent(new CustomEvent("navigate", { detail: { path, timestamp: Date.now() } }));
      window.dispatchEvent(new PopStateEvent("popstate", { state: { path } }));
      return;
    }
    window.location.href = path;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      handleNavigation("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
      setProfileMenuOpen(false);
      setNavbarOpen(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleAppointmentType = (type) => {
    console.log(`Navigating to ${type} appointments`);
    setProfileMenuOpen(false);
    setNavbarOpen(false);
    const appointmentPaths = {
      Online: "/AppointmentForDoctorsOnline",
      Offline: "/AppointmentPatientOfflineInDoctors",
      AtHome: "/AppointmentPatientInDoctorsAtHome",
      Nurse: "/AppointmentsNurseForPatients",
      Lab: "/AppointmentForLabFromPatient",
    };
    if (appointmentPaths[type]) handleNavigation(appointmentPaths[type]);
  };

  const handlePageClick = (page) => {
    console.log(`Page clicked: ${page}`);
    setActivePage(page);
    setNavbarOpen(false);
    if (page === "services") {
      setServicesOpen(true);
      return;
    }
    const pagePaths = {
      home: "/",
      homepage: "/homepage",
      services: "/servicedoctoronlineofflineathome",
      contact: "/AboutUs",
    };
    if (pagePaths[page]) handleNavigation(pagePaths[page]);
  };

  const handleServiceClick = (servicePath) => {
    console.log(`Service clicked: ${servicePath}`);
    setServicesOpen(false);
    setNavbarOpen(false);
    setActivePage("services");
    const servicePaths = {
      consultations: "/servicedoctoronlineofflineathome",
      "medical-analysis": "/lab1",
      nursing: "/nurse1",
    };
    if (servicePaths[servicePath]) handleNavigation(servicePaths[servicePath]);
  };

  const toggleNavbar = () => {
    setNavbarOpen((prev) => !prev);
    setServicesOpen(false);
    setProfileMenuOpen(false);
    setAppointmentsOpen(false);
  };

  const markNotificationAsRead = (id) => {
    console.log(`Marking notification ${id} as read`);
  };

  const markMessageAsRead = (id) => {
    console.log(`Marking message ${id} as read`);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = (confirm) => {
    if (confirm) {
      handleLogout();
    }
    setShowLogoutConfirm(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
        setAppointmentsOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      console.log(`Browser navigation: ${path}`);
      setActivePage(
        path === "/" || path === "/home"
          ? "home"
          : path.includes("/service") || path.includes("/lab") || path.includes("/nurse")
          ? "services"
          : path.includes("/contact-us")
          ? "contact"
          : activePage
      );
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activePage]);

  useEffect(() => {
    const handleCustomNavigation = (event) => {
      const { path } = event.detail;
      console.log(`Custom navigation: ${path}`);
      setActivePage(
        path === "/" || path === "/home"
          ? "home"
          : path.includes("/service") || path.includes("/lab") || path.includes("/nurse")
          ? "services"
          : path.includes("/contact-us")
          ? "contact"
          : activePage
      );
    };
    window.addEventListener("navigate", handleCustomNavigation);
    return () => window.removeEventListener("navigate", handleCustomNavigation);
  }, [activePage]);

  const renderProfileAvatar = (size = "45px", fontSize = "1.1rem") => {
    if (imageLoading) {
      return (
        <div
          className="profile-avatar"
          style={{
            width: size,
            height: size,
            fontSize: fontSize
          }}
        >
          <div className="spinner-border spinner-border-sm text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }
    if (profileImageUrl) {
      return (
        <div
          className="profile-avatar"
          style={{
            width: size,
            height: size,
            backgroundImage: `url(${profileImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontSize: fontSize
          }}
        />
      );
    }
    return (
      <div
        className="profile-avatar"
        style={{
          width: size,
          height: size,
          fontSize: fontSize
        }}
      >
        {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
      </div>
    );
  };

  return (
    <>
      <style>{`
        :root {
          --primary-color: #009DA5;
          --primary-hover: #007d84;
          --danger-color: #dc3545;
          --success-color: #28a745;
          --warning-color: #ffc107;
          --light-bg: #f8f9fa;
          --dark-text: #333;
          --border-color: #dee2e6;
          --shadow-light: 0 2px 8px rgba(0,0,0,0.1);
          --shadow-medium: 0 4px 12px rgba(0,0,0,0.15);
          --transition: all 0.3s ease;
        }

        * {
          box-sizing: border-box;
        }

        .navbar-custom {
          background-color: #fff;
          box-shadow: ${headerShadow ? "var(--shadow-medium)" : "var(--shadow-light)"};
          transition: var(--transition);
          border-bottom: 1px solid var(--border-color);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1030;
        }

        .navbar-brand-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .navbar-logo {
          flex-shrink: 0;
        }

        .navbar-brand-custom {
          color: var(--primary-color);
          font-weight: 700;
          text-decoration: none;
          font-size: clamp(1.1rem, 3vw, 1.5rem);
          transition: var(--transition);
          cursor: pointer;
          white-space: nowrap;
          line-height: 1;
        }

        .navbar-brand-custom:hover {
          color: var(--primary-hover);
          transform: scale(1.02);
        }

        .nav-link-custom {
          color: rgb(0, 157, 165) !important;
          font-weight: 600;
          text-decoration: none;
          padding: 0.75rem 1rem;
          transition: var(--transition);
          border-radius: 10px;
          cursor: pointer;
          margin: 0.25rem 0.5rem;
          white-space: nowrap;
          font-size: clamp(0.9rem, 2vw, 1rem);
        }

        .nav-link-custom:hover {
          background-color: rgba(0, 157, 165, 0.1);
          transform: translateY(-2px);
        }

        .nav-link-custom.active {
          color: rgb(0, 157, 165) !important;
          background-color: rgba(0, 157, 165, 0.08);
        }

        .services-dropdown {
          position: relative;
          cursor: pointer;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          transition: var(--transition);
          margin: 0.25rem 0.5rem;
        }

        .services-dropdown.active {
          color: rgb(0, 157, 165) !important;
          background-color: rgba(0, 157, 165, 0.08);
        }

        .services-link {
          color: rgb(0, 157, 165) !important;
          font-weight: 600;
          text-decoration: none;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          font-size: clamp(0.9rem, 2vw, 1rem);
        }

        .services-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border-radius: 12px;
          box-shadow: var(--shadow-medium);
          min-width: 250px;
          z-index: 1050;
          margin-top: 0.75rem;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .services-menu::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 20px;
          width: 16px;
          height: 16px;
          background: white;
          transform: rotate(45deg);
          box-shadow: -3px -3px 5px rgba(0,0,0,0.04);
          border-left: 1px solid var(--border-color);
          border-top: 1px solid var(--border-color);
        }

        .dropdown-item-custom {
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          color: var(--dark-text);
          text-decoration: none;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: var(--transition);
          font-weight: 500;
          font-size: clamp(0.85rem, 2vw, 0.95rem);
        }

        .dropdown-item-custom:hover {
          background: linear-gradient(90deg, rgba(0, 157, 165, 0.1), rgba(0, 157, 165, 0.05));
          color: var(--primary-color);
          transform: translateX(5px);
        }

        .dropdown-item-custom:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .dropdown-item-custom.text-danger:hover {
          background: linear-gradient(90deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05));
          color: var(--danger-color);
        }

        .profile-avatar {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 2px 10px rgba(0, 157, 165, 0.3);
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .profile-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(0, 157, 165, 0.4);
        }

        .profile-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: white;
          border-radius: 15px;
          box-shadow: var(--shadow-medium);
          min-width: 280px;
          max-width: min(320px, 90vw);
          z-index: 1050;
          max-height: min(500px, 70vh);
          overflow-y: auto;
          border: 1px solid var(--border-color);
        }

        .profile-menu-header {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .profile-menu-avatar {
          flex-shrink: 0;
        }

        .profile-menu-info {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .profile-menu-name {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .menu-icon {
          width: 20px;
          height: 20px;
          margin-right: 0.75rem;
          color: inherit;
          flex-shrink: 0;
        }

        .nursing-icon {
          width: 20px;
          height: 20px;
          margin-right: 0.75rem;
          object-fit: contain;
          flex-shrink: 0;
        }

        .badge-custom {
          background: var(--danger-color);
          color: white;
          border-radius: 50%;
          font-size: 0.65rem;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          position: absolute;
          top: 0;
          right: 0;
          padding: 0 4px;
        }

        .modal-backdrop-custom {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.6);
          z-index: 1040;
          backdrop-filter: blur(2px);
        }

        .modal-custom {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 15px;
          max-width: 550px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          z-index: 1050;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .submenu-item {
          padding-left: 3.5rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .notification-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color);
          transition: var(--transition);
          cursor: pointer;
        }

        .notification-item:hover {
          background-color: var(--light-bg);
        }

        .notification-item.unread {
          background-color: rgba(0, 157, 165, 0.05);
          border-left: 3px solid var(--primary-color);
        }

        .notification-time {
          font-size: 0.75rem;
          color: #666;
        }

        .navbar-nav-center {
          display: flex;
          justify-content: center;
          flex-grow: 1;
          align-items: center;
        }

        .icon-button {
          padding: 0.5rem;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: var(--transition);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-button:hover {
          background-color: rgba(0, 157, 165, 0.1);
        }

        .logout-confirm {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 15px;
          max-width: 400px;
          width: 90%;
          padding: 1.5rem;
          z-index: 1050;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
        }

        .logout-confirm-buttons {
          margin-top: 1.25rem;
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .logout-confirm-btn {
          padding: 0.625rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: var(--transition);
          font-size: 0.95rem;
        }

        .logout-confirm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .logout-confirm-btn.yes {
          background-color: var(--danger-color);
          color: white;
        }

        .logout-confirm-btn.no {
          background-color: var(--primary-color);
          color: white;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Mobile Slide-in Menu */
        @media (max-width: 991px) {
          .mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1020;
            opacity: ${navbarOpen ? '1' : '0'};
            pointer-events: ${navbarOpen ? 'auto' : 'none'};
            transition: opacity 0.3s ease;
          }

          .navbar-collapse {
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            width: 320px;
            max-width: 85vw;
            background-color: #fff;
            overflow-y: auto;
            padding: 1.5rem;
            z-index: 1025;
            transform: translateX(${navbarOpen ? '0' : '100%'});
            transition: transform 0.3s ease;
            box-shadow: -5px 0 15px rgba(0,0,0,0.2);
          }

          .mobile-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--primary-color);
          }

          .mobile-menu-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--primary-color);
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            transition: var(--transition);
          }

          .mobile-menu-close:hover {
            background-color: rgba(0, 157, 165, 0.1);
          }

          .navbar-nav-center {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
          }

          .nav-link-custom {
            width: 100%;
            text-align: left;
            padding: 0.75rem 1rem;
            margin: 0.25rem 0;
            border-radius: 8px;
          }

          .services-dropdown {
            width: 100%;
            margin: 0.25rem 0;
            padding: 0.75rem 1rem;
          }

          .services-link {
            width: 100%;
            padding: 0;
          }

          .services-menu {
            position: static;
            box-shadow: none;
            margin: 0.5rem 0 0 0;
            background: var(--light-bg);
            border: none;
            width: 100%;
          }

          .services-menu::before {
            display: none;
          }

          .mobile-menu-section {
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
          }

          .mobile-icons-section {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .mobile-profile-section {
            margin-top: 1.5rem;
          }

          .profile-menu {
            position: static;
            margin: 0;
            background: var(--light-bg);
            box-shadow: none;
            width: 100%;
            border: none;
            max-width: 100%;
            border-radius: 10px;
          }

          .profile-menu-header {
            background: white;
            border-radius: 8px;
            margin-bottom: 0.5rem;
          }
        }

        /* Desktop Styles */
        @media (min-width: 992px) {
          .mobile-menu-overlay,
          .mobile-menu-header,
          .mobile-menu-section,
          .mobile-icons-section,
          .mobile-profile-section {
            display: none !important;
          }

          .navbar-collapse {
            display: flex !important;
            flex-basis: auto;
            position: static;
            height: auto;
            width: auto;
            padding: 0;
            transform: none;
            box-shadow: none;
            overflow: visible;
          }

          .navbar-nav-center {
            flex-direction: row;
            gap: 0.5rem;
          }

          .nav-link-custom {
            color: rgb(0, 157, 165) !important;
          }
        }

        /* Tablet Styles */
        @media (min-width: 992px) and (max-width: 1199px) {
          .navbar-nav-center {
            flex-direction: row;
            gap: 0.5rem;
          }
          .nav-link-custom {
            padding: 0.65rem 0.85rem;
            margin: 0 0.25rem;
          }
          .services-dropdown {
            padding: 0.65rem 0.85rem;
            margin: 0 0.25rem;
          }
        }

        /* Large Desktop Styles */
        @media (min-width: 1200px) {
          .navbar-nav-center {
            gap: 1rem;
          }
          .nav-link-custom {
            padding: 0.75rem 1.25rem;
            margin: 0 0.5rem;
          }
          .services-dropdown {
            padding: 0.75rem 1.25rem;
            margin: 0 0.5rem;
          }
        }

        /* Small Mobile Styles */
        @media (max-width: 575px) {
          .navbar-brand-wrapper {
            gap: 0.4rem;
          }
          .navbar-brand-custom {
            font-size: 1rem;
          }
          .navbar-logo {
            width: 35px !important;
            height: 28px !important;
          }
          .profile-avatar {
            width: 38px;
            height: 38px;
            font-size: 0.95rem;
          }
          .badge-custom {
            min-width: 16px;
            height: 16px;
            font-size: 0.6rem;
          }
          .icon-button i {
            font-size: 1.1rem;
          }
          .logout-confirm {
            padding: 1.25rem;
          }
          .logout-confirm-btn {
            padding: 0.5rem 1.25rem;
            font-size: 0.9rem;
          }
          .profile-menu {
            min-width: 260px;
          }
          .profile-menu-header {
            padding: 0.875rem;
          }
          .profile-menu-name {
            font-size: 0.875rem;
          }
        }

        /* Smooth scrolling */
        .navbar-collapse,
        .profile-menu,
        .modal-custom {
          scrollbar-width: thin;
          scrollbar-color: var(--primary-color) var(--light-bg);
        }

        .navbar-collapse::-webkit-scrollbar,
        .profile-menu::-webkit-scrollbar,
        .modal-custom::-webkit-scrollbar {
          width: 6px;
        }

        .navbar-collapse::-webkit-scrollbar-track,
        .profile-menu::-webkit-scrollbar-track,
        .modal-custom::-webkit-scrollbar-track {
          background: var(--light-bg);
        }

        .navbar-collapse::-webkit-scrollbar-thumb,
        .profile-menu::-webkit-scrollbar-thumb,
        .modal-custom::-webkit-scrollbar-thumb {
          background-color: var(--primary-color);
          border-radius: 3px;
        }
      `}</style>

      {/* Mobile Menu Overlay */}
      {navbarOpen && (
        <div className="mobile-menu-overlay" onClick={toggleNavbar} />
      )}

      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container-fluid px-3 px-md-4 py-2">
          <div className="navbar-brand-wrapper">
            <svg
              viewBox="0 0 97 76"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="navbar-logo"
              style={{
                width: 'clamp(35px, 6vw, 50px)',
                height: 'clamp(28px, 4.8vw, 40px)',
              }}
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
            <span className="navbar-brand-custom" onClick={() => handlePageClick("homepage")}>
              PhysioCare
            </span>
          </div>
          <button
            className="navbar-toggler border-0 d-lg-none"
            type="button"
            onClick={toggleNavbar}
            aria-label="Toggle navigation"
            style={{ boxShadow: "none" }}
          >
            <i
              className="bi bi-list"
              style={{
                fontSize: "1.5rem",
                color: "var(--primary-color)"
              }}
            ></i>
          </button>
          <div className="navbar-collapse" id="navbarNav">
            {/* Mobile Menu Header - Only visible on mobile */}
            <div className="mobile-menu-header">
              <span className="navbar-brand-custom" style={{ fontSize: '1.2rem' }}>Menu</span>
              <button
                className="mobile-menu-close"
                onClick={toggleNavbar}
                aria-label="Close menu"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="navbar-nav-center flex-column flex-lg-row">
              <button
                className={`nav-link-custom ${activePage === "home" ? "active" : ""}`}
                onClick={() => handlePageClick("homepage")}
                style={{ border: "none", background: "none" }}
              >
                <i className="bi bi-house-door me-2 d-lg-none"></i>Home
              </button>
              <div
                className={`services-dropdown ${activePage === "services" ? "active" : ""}`}
                ref={servicesRef}
                onMouseEnter={handleServicesHoverOpen}
                onMouseLeave={handleServicesHoverClose}
                onClick={() => handlePageClick("services")}
              >
                <div className="services-link">
                  <i className="bi bi-grid-3x3-gap me-2 d-lg-none"></i>
                  <span>Services</span>
                  <i
                    className={`bi bi-chevron-${servicesOpen ? "up" : "down"}`}
                    style={{
                      transition: "transform 0.3s",
                      fontSize: "0.9rem",
                      marginLeft: "auto"
                    }}
                  ></i>
                </div>
                {servicesOpen && (
                  <div className="services-menu">
                    <button
                      className="dropdown-item-custom"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceClick("consultations");
                      }}
                    >
                      <i className="bi bi-hospital menu-icon"></i>
                      <span className="flex-grow-1">Medical Consultations</span>
                    </button>
                    <button
                      className="dropdown-item-custom"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceClick("medical-analysis");
                      }}
                    >
                      <i className="bi bi-heart-pulse menu-icon"></i>
                      <span className="flex-grow-1">Medical Analysis</span>
                    </button>
                    <button
                      className="dropdown-item-custom"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceClick("nursing");
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="nursing-icon">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.1 14.1 11 13 11H11C9.9 11 9 10.1 9 9V7.5L3 7V9C3 10.1 3.9 11 5 11H7C8.1 11 9 10.1 9 9V7.5L21 9ZM12 13.5C11.2 13.5 10.5 14.2 10.5 15V22H13.5V15C13.5 14.2 12.8 13.5 12 13.5Z" />
                      </svg>
                      <span className="flex-grow-1">Nursing Services</span>
                    </button>
                  </div>
                )}
              </div>
              <button
                className={`nav-link-custom ${activePage === "contact" ? "active" : ""}`}
                onClick={() => handlePageClick("contact")}
                style={{ border: "none", background: "none" }}
              >
                <i className="bi bi-telephone me-2 d-lg-none"></i>Contact Us
              </button>
            </div>
            
            {/* Desktop Icons - Only visible on desktop */}
            <div className="d-none d-lg-flex align-items-center gap-2 gap-md-3">
              <div className="position-relative">
                <button
                  className="icon-button position-relative"
                  onClick={() => setNotificationsDialogOpen(true)}
                  aria-label="Notifications"
                >
                  <i className="bi bi-bell" style={{ fontSize: "1.3rem", color: "var(--primary-color)" }}></i>
                  {unreadNotifications > 0 && (
                    <span className="badge-custom">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>
                  )}
                </button>
              </div>
              <div className="position-relative">
                <button
                  className="icon-button position-relative"
                  onClick={() => setMessagesDialogOpen(true)}
                  aria-label="Messages"
                >
                  <i className="bi bi-envelope" style={{ fontSize: "1.3rem", color: "var(--primary-color)" }}></i>
                  {unreadMessages > 0 && <span className="badge-custom">{unreadMessages > 9 ? "9+" : unreadMessages}</span>}
                </button>
              </div>
              <div className="position-relative" ref={profileRef}>
                <div
                  className="profile-avatar"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  role="button"
                  aria-label="User profile"
                  tabIndex={0}
                >
                  {renderProfileAvatar()}
                </div>
                {profileMenuOpen && (
                  <div className="profile-menu">
                    <div className="profile-menu-header">
                      <div className="profile-menu-avatar">
                        {renderProfileAvatar("50px", "1.2rem")}
                      </div>
                      <div className="profile-menu-info">
                        <h6 className="profile-menu-name">
                          {userInfo?.name || "Guest"}
                        </h6>
                      </div>
                    </div>
                    <button className="dropdown-item-custom" onClick={() => handleNavigation("/profile")}>
                      <i className="bi bi-person menu-icon"></i>
                      <span>My Profile</span>
                    </button>
                    <div className="position-relative">
                      <button className="dropdown-item-custom" onClick={() => setAppointmentsOpen(!appointmentsOpen)}>
                        <i className="bi bi-calendar-check menu-icon"></i>
                        <span>My Appointments</span>
                        <i className={`bi bi-chevron-${appointmentsOpen ? "up" : "down"} ms-auto`}></i>
                      </button>
                      {appointmentsOpen && (
                        <div>
                          <button className="dropdown-item-custom submenu-item" onClick={() => handleAppointmentType("Online")}>
                            <i className="bi bi-laptop menu-icon"></i>
                            <span>Online Bookings</span>
                          </button>
                          <button className="dropdown-item-custom submenu-item" onClick={() => handleAppointmentType("Offline")}>
                            <i className="bi bi-building menu-icon"></i>
                            <span>At Clinic Bookings</span>
                          </button>
                          <button className="dropdown-item-custom submenu-item" onClick={() => handleAppointmentType("AtHome")}>
                            <i className="bi bi-house menu-icon"></i>
                            <span>At Home Bookings</span>
                          </button>
                          <button className="dropdown-item-custom submenu-item" onClick={() => handleAppointmentType("Nurse")}>
                            <i className="bi bi-heart menu-icon"></i>
                            <span>Nurse Bookings</span>
                          </button>
                          <button className="dropdown-item-custom submenu-item" onClick={() => handleAppointmentType("Lab")}>
                            <i className="bi bi-heart-pulse menu-icon"></i>
                            <span>Laboratory Bookings</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <button className="dropdown-item-custom" onClick={() => handleNavigation("/chats")}>
                      <i className="bi bi-chat-dots menu-icon"></i>
                      <span>Chats</span>
                    </button>
                    <button className="dropdown-item-custom" onClick={() => handleNavigation("/resetpasswordforpatient")}>
                      <i className="bi bi-person-lock menu-icon"></i>
                      <span>Forget Password</span>
                    </button>
                    <div className="border-top mt-2">
                      <button
                        className="dropdown-item-custom text-danger d-flex align-items-center"
                        onClick={confirmLogout}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <div className="spinner-border spinner-border-sm me-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : (
                          <i className="bi bi-box-arrow-right menu-icon"></i>
                        )}
                        <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Icons and Profile Section */}
            <div className="mobile-menu-section d-lg-none">
              <div className="mobile-icons-section">
                <button
                  className="icon-button position-relative flex-1"
                  onClick={() => {
                    setNotificationsDialogOpen(true);
                    setNavbarOpen(false);
                  }}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <i className="bi bi-bell" style={{ fontSize: "1.3rem", color: "var(--primary-color)" }}></i>
                  {unreadNotifications > 0 && (
                    <span className="badge-custom">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>
                  )}
                </button>
                <button
                  className="icon-button position-relative flex-1"
                  onClick={() => {
                    setMessagesDialogOpen(true);
                    setNavbarOpen(false);
                  }}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <i className="bi bi-envelope" style={{ fontSize: "1.3rem", color: "var(--primary-color)" }}></i>
                  {unreadMessages > 0 && <span className="badge-custom">{unreadMessages > 9 ? "9+" : unreadMessages}</span>}
                </button>
              </div>
            </div>

            {/* Mobile Profile Section */}
            <div className="mobile-profile-section d-lg-none">
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="profile-menu-avatar">
                    {renderProfileAvatar("50px", "1.2rem")}
                  </div>
                  <div className="profile-menu-info">
                    <h6 className="profile-menu-name">
                      {userInfo?.name || "Guest"}
                    </h6>
                  </div>
                </div>
                <button className="dropdown-item-custom" onClick={() => handleNavigation("/profile")}>
                  <i className="bi bi-person menu-icon"></i>
                  <span>My Profile</span>
                </button>
                <div className="position-relative">
                  <button className="dropdown-item-custom" onClick={() => setAppointmentsOpen(!appointmentsOpen)}>
                    <i className="bi bi-calendar-check menu-icon"></i>
                    <span>My Appointments</span>
                    <i className={`bi bi-chevron-${appointmentsOpen ? "up" : "down"} ms-auto`}></i>
                  </button>
                  {appointmentsOpen && (
                    <div>
                      <button className="dropdown-item-custom submenu-item" onClick={() => handleAppointmentType("Online")}>
                        <i className="bi bi-laptop menu-icon"></i>
                        <span>Online Bookings</span>
                      </button>
                      <button className="dropdown-item-custom submenu-item" onClick={() => handleAppointmentType("Offline")}>
                        <i className="bi bi-building menu-icon"></i>
                        <span>At Clinic Bookings</span>
                      </button>
                      <button className="dropdown-item-custom submenu-item" onClick={() => handleAppointmentType("AtHome")}>
                        <i className="bi bi-house menu-icon"></i>
                        <span>At Home Bookings</span>
                      </button>
                      <button className="dropdown-item-custom submenu-item" onClick={() => handleAppointmentType("Nurse")}>
                        <i className="bi bi-heart menu-icon"></i>
                        <span>Nurse Bookings</span>
                      </button>
                      <button className="dropdown-item-custom submenu-item" onClick={() => handleAppointmentType("Lab")}>
                        <i className="bi bi-heart-pulse menu-icon"></i>
                        <span>Laboratory Bookings</span>
                      </button>
                    </div>
                  )}
                </div>
                <button className="dropdown-item-custom" onClick={() => handleNavigation("/chats")}>
                  <i className="bi bi-chat-dots menu-icon"></i>
                  <span>Chats</span>
                </button>
                <button className="dropdown-item-custom" onClick={() => handleNavigation("/resetpasswordforpatient")}>
                  <i className="bi bi-person-lock menu-icon"></i>
                  <span>Forget Password</span>
                </button>
                <div className="border-top mt-2">
                  <button
                    className="dropdown-item-custom text-danger d-flex align-items-center"
                    onClick={confirmLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <div className="spinner-border spinner-border-sm me-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <i className="bi bi-box-arrow-right menu-icon"></i>
                    )}
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div style={{ height: '70px' }}></div>

      {/* Notifications Modal */}
      {notificationsDialogOpen && (
        <div>
          <div className="modal-backdrop-custom" onClick={() => setNotificationsDialogOpen(false)}></div>
          <div className="modal-custom" role="dialog" aria-labelledby="NotificationsModal">
            <div className="modal-header p-3 p-md-4 border-bottom">
              <h5 className="modal-title mb-0" id="NotificationsModal">
                <i className="bi bi-bell me-2"></i>Notifications
              </h5>
              <button
                className="btn-close"
                onClick={() => setNotificationsDialogOpen(false)}
                aria-label="Close"
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body p-2 p-md-3">
              <div className="mb-3">
                <h6 className="text-primary mb-2 px-2">
                  <i className="bi bi-hospital me-2"></i>Doctor Notifications
                </h6>
                {doctorNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? "unread" : ""}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <p className="mb-1" style={{ wordBreak: 'break-word' }}>{notification.text}</p>
                        <small className="notification-time">{notification.time}</small>
                      </div>
                      {!notification.read && <span className="badge bg-primary rounded-pill ms-2 flex-shrink-0">New</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h6 className="text-success mb-2 px-2">
                  <i className="bi bi-heart-pulse me-2"></i>Lab Notifications
                </h6>
                {labNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? "unread" : ""}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <p className="mb-1" style={{ wordBreak: 'break-word' }}>{notification.text}</p>
                        <small className="notification-time">{notification.time}</small>
                      </div>
                      {!notification.read && <span className="badge bg-success rounded-pill ms-2 flex-shrink-0">New</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Modal */}
      {messagesDialogOpen && (
        <div>
          <div className="modal-backdrop-custom" onClick={() => setMessagesDialogOpen(false)}></div>
          <div className="modal-custom" role="dialog" aria-labelledby="MessagesModal">
            <div className="modal-header p-3 p-md-4 border-bottom">
              <h5 className="modal-title mb-0" id="MessagesModal">
                <i className="bi bi-envelope me-2"></i>Messages
              </h5>
              <button
                className="btn-close"
                onClick={() => setMessagesDialogOpen(false)}
                aria-label="Close"
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body p-2 p-md-3">
              <div className="mb-3">
                <h6 className="text-primary mb-2 px-2">
                  <i className="bi bi-hospital me-2"></i>Doctor Messages
                </h6>
                {doctorMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`notification-item ${!message.read ? "unread" : ""}`}
                    onClick={() => markMessageAsRead(message.id)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <p className="mb-1" style={{ wordBreak: 'break-word' }}>{message.text}</p>
                        <small className="notification-time">{message.time}</small>
                      </div>
                      {!message.read && <span className="badge bg-primary rounded-pill ms-2 flex-shrink-0">New</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h6 className="text-success mb-2 px-2">
                  <i className="bi bi-heart-pulse me-2"></i>Lab Messages
                </h6>
                {labMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`notification-item ${!message.read ? "unread" : ""}`}
                    onClick={() => markMessageAsRead(message.id)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <p className="mb-1" style={{ wordBreak: 'break-word' }}>{message.text}</p>
                        <small className="notification-time">{message.time}</small>
                      </div>
                      {!message.read && <span className="badge bg-success rounded-pill ms-2 flex-shrink-0">New</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div>
          <div className="modal-backdrop-custom" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="logout-confirm" role="dialog" aria-labelledby="LogoutConfirmModal">
            <h5 className="modal-title mb-3" id="LogoutConfirmModal">
              Confirm Logout
            </h5>
            <p>Are you sure you want to logout?</p>
            <div className="logout-confirm-buttons">
              <button className="logout-confirm-btn yes" onClick={() => handleLogoutConfirm(true)}>
                Yes
              </button>
              <button className="logout-confirm-btn no" onClick={() => handleLogoutConfirm(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;