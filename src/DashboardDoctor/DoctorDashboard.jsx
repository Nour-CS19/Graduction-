import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {
  Dashboard as DashboardIcon,
  Event,
  Schedule,
  Receipt,
  Message,
  Person,
  Settings as SettingsIcon,
  People,
  Chat,
} from '@mui/icons-material';
// Import your NavBar component (which includes your SVG logo and profile menu)
import NavBar from '../components/NavBar';

// Import page components (replace these with your actual component implementations)
import Appointment from './Appointment';
import ScheduleTiming from './ScheduleTiming';
import Invoices from './Invoices';
import Messages from './Messages';
import Profile from './Profile';
import ProfileSettings from './ProfileSettings';
import Patients from './Patients';
import PatientsReview from './PatientsReview';
import ChatPage from './Chat';
import Login from './Login';
import ForgetPassword from './ForgetPassword';
import bg from "../assets/images/doctor_01.jpg" ;
export default function DoctorDashboard() {
  // Active sidebar item state
  const [activeSidebarItem, setActiveSidebarItem] = useState('Dashboard');

  // Helper: check if item is active
  const isActive = (item) => activeSidebarItem === item;

  const renderContent = () => {
    switch (activeSidebarItem) {
      case 'Dashboard': return <DashboardPage />;
      case 'Appointment': return <Appointment />;
      case 'Schedule': return <ScheduleTiming />;
      case 'Invoices': return <Invoices />;
      case 'Messages': return <Messages />;
      case 'Profile': return <Profile />;
      case 'ProfileSettings': return <ProfileSettings />;
      case 'Patients': return <Patients />;
      case 'PatientsReview': return <PatientsReview />;
      case 'Chat': return <ChatPage />;
      case 'Login': return <Login />;
      case 'ForgetPassword': return <ForgetPassword />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Top Navbar */}
      <NavBar />

      {/* Sidebar + Main Content */}
      <div className="row m-0">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 p-0 bg-white shadow-sm">
          <div className="position-sticky pt-3" style={{ minHeight: '100vh' }}>
            <div className="text-center p-4 border-bottom">
              <img
                src={bg}// Replace with your doctor's image path
                alt="Dr. Calvin Carlo"
                className="rounded-circle mb-2"
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
              <h5 className="mb-0">Dr. Calvin Carlo</h5>
              <p className="text-muted mb-0">Orthopedic</p>
            </div>
            <ul className="nav flex-column p-3">
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('Dashboard') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('Dashboard')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <DashboardIcon className="me-2" /> Dashboard
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('Appointment') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('Appointment')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Event className="me-2" /> Appointment
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('Schedule') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('Schedule')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Schedule className="me-2" /> Schedule Timing
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('Invoices') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('Invoices')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Receipt className="me-2" /> Invoices
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('Messages') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('Messages')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Message className="me-2" /> Messages
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('Profile') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('Profile')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Person className="me-2" /> Profile
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('ProfileSettings') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('ProfileSettings')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <SettingsIcon className="me-2" /> Profile Settings
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('Patients') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('Patients')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <People className="me-2" /> Patients
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('PatientsReview') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('PatientsReview')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Person className="me-2" /> Patients Review
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('Chat') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('Chat')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Chat className="me-2" /> Chat
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('Login') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('Login')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Person className="me-2" /> Login
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${isActive('ForgetPassword') ? 'fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => setActiveSidebarItem('ForgetPassword')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Person className="me-2" /> Forget Password
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 p-4 bg-light">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

/* ---------- Inline Dashboard Component (Renamed to DashboardPage) ---------- */
function DashboardPage() {
  return (
    <div className="dashboard-section p-4">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6>Total Appointments</h6>
              <h3>20</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6>Patients Today</h6>
              <h3>15</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6>New Messages</h6>
              <h3>8</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6>Earnings</h6>
              <h3>$450</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

