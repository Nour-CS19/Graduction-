import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardCheck,
  faCalendarCheck,
  faStethoscope,
  faUsers,
  faCog,
  faSignOutAlt,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const sidebarItems = [
    { path: '/labratorys', icon: faClipboardCheck, label: 'Dashboard' },
    { path: '/appointmentlab', icon: faCalendarCheck, label: 'Appointments' },
    { path: '/consultantionlab', icon: faStethoscope, label: 'Consultations' },
    { path: '/patientlab', icon: faUsers, label: 'Patients' },
    { path: '/settinglab', icon: faCog, label: 'Settings' },
    { path: '/profilelab', icon: faUser, label: 'Profile' },
    { path: '/logoutlab', icon: faSignOutAlt, label: 'Logout' }
  ];

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img
              src="https://via.placeholder.com/120x60?text=PhysioCare+Logo"
              alt="PhysioCare Logo"
            />
          </div>
          <h6 className="panel-title">Nurse Panel</h6>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                'nav-link' + (isActive ? ' active' : '')
              }
            >
              <FontAwesomeIcon icon={item.icon} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      {/* Inline CSS */}
      <style>{`
        /* Sidebar container */
        .sidebar {
          width: 250px;
          min-height: 100vh;
          background-color: #f8f9fa;
          border-right: 1px solid #dee2e6;
          padding: 20px;
        }

        /* Header styling */
        .sidebar-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .logo img {
          max-width: 100%;
          height: auto;
        }

        .panel-title {
          color: #6c757d;
          font-size: 1.1rem;
          margin-top: 10px;
        }

        /* Navigation styles */
        .sidebar-nav {
          display: flex;
          flex-direction: column;
        }

        /* Link styles */
        .nav-link {
          display: flex;
          align-items: center;
          color: #495057;
          text-decoration: none;
          padding: 10px 15px;
          border-radius: 4px;
          margin-bottom: 5px;
          transition: background-color 0.2s, color 0.2s;
        }

        .nav-link:hover {
          background-color: #e9ecef;
          color: #343a40;
        }

        /* Active link styles */
        .nav-link.active {
          background-color: #007bff;
          color: #fff;
        }

        .nav-link.active .nav-icon {
          color: #fff;
        }

        /* Icon spacing */
        .nav-icon {
          margin-right: 10px;
          font-size: 1.2rem;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
