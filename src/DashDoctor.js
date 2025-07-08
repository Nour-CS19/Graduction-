import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Material UI Icons
import {
  Dashboard as DashboardIcon,
  Event,
  Schedule,
  Receipt,
  Message,
  Person,
  Settings as SettingsIcon,
  People,
  Chat
} from '@mui/icons-material';

// SAMPLE appointment data
const initialAppointments = [
  {
    id: 1,
    name: 'Rewarr Tomar',
    age: 26,
    gender: 'Male',
    department: 'Cardiology',
    date: '2025-03-09',
    time: '10:30 AM',
    doctor: 'Dr. Calvin Carlo',
    fees: '$50/Patient'
  },
  {
    id: 2,
    name: 'Wendy Watson',
    age: 33,
    gender: 'Female',
    department: 'Gynecology',
    date: '2025-03-09',
    time: '09:15 AM',
    doctor: 'Dr. Christine Murphy',
    fees: '$80/Patient'
  },
  {
    id: 3,
    name: 'Peter Bridger',
    age: 39,
    gender: 'Male',
    department: 'Eye Care',
    date: '2025-03-10', // tomorrow
    time: '11:00 AM',
    doctor: 'Dr. Kate Moody',
    fees: '$60/Patient'
  },
  {
    id: 4,
    name: 'Rachel Garcia',
    age: 42,
    gender: 'Female',
    department: 'Orthopedic',
    date: '2025-03-09',
    time: '12:00 PM',
    doctor: 'Dr. Calvin Carlo',
    fees: '$50/Patient'
  },
  {
    id: 5,
    name: 'Morris Loke',
    age: 51,
    gender: 'Male',
    department: 'Eye Care',
    date: '2025-03-10', // tomorrow
    time: '08:45 AM',
    doctor: 'Dr. Jessica Martinez',
    fees: '$55/Patient'
  }
];

// MAIN COMPONENT
export default function DoctorDashboard() {
  // Track active sidebar item; default to "Dashboard"
  const [activeSidebarItem, setActiveSidebarItem] = useState('Dashboard');

  // APPOINTMENT STATE
  const [appointments, setAppointments] = useState(initialAppointments);
  const [showTomorrow, setShowTomorrow] = useState(false);

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);

  // FORM DATA FOR BOOKING
  const [formData, setFormData] = useState({
    patientName: '',
    department: 'Eye Care',
    doctor: 'Dr. Calvin Carlo',
    email: '',
    phone: '',
    date: '',
    time: '',
    comments: ''
  });

  // Helper: highlight active sidebar link
  const isActive = (itemName) => activeSidebarItem === itemName;

  // APPOINTMENT FILTER LOGIC
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowString = tomorrowDate.toISOString().split('T')[0]; // e.g. "2025-03-10"

  // Filter if "Tomorrow" is toggled
  const appointmentsToRender = showTomorrow
    ? appointments.filter((appt) => appt.date === tomorrowString)
    : appointments;

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form to create new appointment
  const handleSubmit = (e) => {
    e.preventDefault();
    const newAppt = {
      id: appointments.length + 1,
      name: formData.patientName,
      age: 0,
      gender: 'N/A',
      department: formData.department,
      date: formData.date,
      time: formData.time,
      doctor: formData.doctor,
      fees: '$50/Patient'
    };
    setAppointments([...appointments, newAppt]);
    // reset
    setFormData({
      patientName: '',
      department: 'Eye Care',
      doctor: 'Dr. Calvin Carlo',
      email: '',
      phone: '',
      date: '',
      time: '',
      comments: ''
    });
    setShowModal(false);
    setShowTomorrow(false);
  };

  // RENDER SIDEBAR ITEM CONTENT
  const renderContent = () => {
    switch (activeSidebarItem) {
      case 'Dashboard':
        return renderDashboardSection();
      case 'Appointment':
        return renderAppointmentSection();
      case 'Schedule':
        return <Placeholder title="Schedule Timing" />;
      case 'Invoices':
        return <Placeholder title="Invoices" />;
      case 'Messages':
        return <Placeholder title="Messages" />;
      case 'Profile':
        return <Placeholder title="Profile" />;
      case 'ProfileSettings':
        return <Placeholder title="Profile Settings" />;
      case 'Patients':
        return <Placeholder title="Patients" />;
      case 'PatientsReview':
        return <Placeholder title="Patients Review" />;
      case 'Chat':
        return <Placeholder title="Chat" />;
      default:
        return <Placeholder title="Not Found" />;
    }
  };

  // DASHBOARD SECTION
  const renderDashboardSection = () => (
    <div className="dashboard-section">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row">
        {/* Some stats cards */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6>Total Appointments</h6>
              <h3>{appointments.length}</h3>
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
      {/* You can add charts or more stats here */}
    </div>
  );

  // APPOINTMENT SECTION
  const renderAppointmentSection = () => (
    <div className="appointment-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Appointment</h2>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => setShowTomorrow(!showTomorrow)}
          >
            {showTomorrow ? 'All' : 'Tomorrow'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Appointment
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Department</th>
              <th>Date</th>
              <th>Time</th>
              <th>Doctor</th>
              <th>Fees</th>
            </tr>
          </thead>
          <tbody>
            {appointmentsToRender.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No Appointments
                </td>
              </tr>
            ) : (
              appointmentsToRender.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.name}</td>
                  <td>{appt.age}</td>
                  <td>{appt.gender}</td>
                  <td>{appt.department}</td>
                  <td>{appt.date}</td>
                  <td>{appt.time}</td>
                  <td>{appt.doctor}</td>
                  <td>{appt.fees}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Book an Appointment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Patient Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3 row">
                    <div className="col-6">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option value="Eye Care">Eye Care</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Orthopedic">Orthopedic</option>
                        <option value="Dentistry">Dentistry</option>
                        <option value="Neurology">Neurology</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Doctor</label>
                      <select
                        className="form-select"
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleChange}
                      >
                        <option value="Dr. Calvin Carlo">Dr. Calvin Carlo</option>
                        <option value="Dr. Christine Murphy">Dr. Christine Murphy</option>
                        <option value="Dr. Kate Moody">Dr. Kate Moody</option>
                        <option value="Dr. Jessica Martinez">Dr. Jessica Martinez</option>
                        <option value="Dr. John Novak">Dr. John Novak</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <div className="col-6">
                      <label className="form-label">Your Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Your Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <div className="col-6">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Time</label>
                      <input
                        type="time"
                        className="form-control"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Comments / Message</label>
                    <textarea
                      className="form-control"
                      name="comments"
                      rows="2"
                      value={formData.comments}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Book An Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Simple placeholder for other items
  const Placeholder = ({ title }) => (
    <div>
      <h2>{title}</h2>
      <p>This is the {title} section (placeholder content).</p>
    </div>
  );

  return (
    <div className="container-fluid p-0">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#!">
            <span className="bg-primary p-2 rounded text-white me-2">
              {/* Example Logo */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 2V5" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V5" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.5 9.09H20.5" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.6947 13.7H15.7037" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.6947 16.7H15.7037" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.9955 13.7H12.0045" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.9955 16.7H12.0045" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.29431 13.7H8.30329" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.29431 16.7H8.30329" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="fw-bold fs-4">Doctris</span>
          </a>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item mx-2">
                <a className="nav-link fw-bold" href="#!">HOME</a>
              </li>
              <li className="nav-item mx-2">
                <a className="nav-link fw-bold" href="#!">DOCTORS</a>
              </li>
              <li className="nav-item mx-2">
                <a className="nav-link fw-bold" href="#!">PATIENTS</a>
              </li>
              <li className="nav-item mx-2">
                <a className="nav-link fw-bold" href="#!">PHARMACY</a>
              </li>
              <li className="nav-item mx-2">
                <a className="nav-link fw-bold" href="#!">PAGES</a>
              </li>
            </ul>

            <div className="d-flex">
              <button className="btn btn-primary rounded-circle me-2">
                <SettingsIcon style={{ color: 'white', fontSize: 20 }} />
              </button>
              <button className="btn btn-primary rounded-circle me-2">
                {/* Example search icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 22L20 20"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="ms-2">
                <img
                  src="/api/placeholder/40/40"
                  className="rounded-circle border border-primary"
                  alt="Doctor"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar + Main Content */}
      <div className="row m-0">
        {/* SIDEBAR */}
        <div className="col-md-3 col-lg-2 p-0 bg-white shadow-sm">
          <div className="position-sticky pt-3" style={{ minHeight: '100vh' }}>
            <div className="text-center p-4 border-bottom position-relative">
              <div
                className="position-absolute"
                style={{ top: '-40px', left: '50%', transform: 'translateX(-50%)' }}
              >
                <div
                  className="rounded-circle bg-white p-1 shadow"
                  style={{ width: '120px', height: '120px' }}
                >
                  <img
                    src="/api/placeholder/100/100"
                    className="rounded-circle"
                    alt="Dr. Calvin Carlo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
              <div className="pt-5 mt-3">
                <h5 className="mb-0">Dr. Calvin Carlo</h5>
                <p className="text-muted mb-0">Orthopedic</p>
              </div>
            </div>

            <ul className="nav flex-column p-3">
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${
                    isActive('Dashboard') ? 'fw-bold text-primary' : 'text-muted'
                  }`}
                  onClick={() => setActiveSidebarItem('Dashboard')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <DashboardIcon className="me-2" />
                  Dashboard
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${
                    isActive('Appointment') ? 'fw-bold text-primary' : 'text-muted'
                  }`}
                  onClick={() => setActiveSidebarItem('Appointment')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Event className="me-2" />
                  Appointment
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${
                    isActive('Schedule') ? 'fw-bold text-primary' : 'text-muted'
                  }`}
                  onClick={() => setActiveSidebarItem('Schedule')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Schedule className="me-2" />
                  Schedule Timing
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${
                    isActive('Invoices') ? 'fw-bold text-primary' : 'text-muted'
                  }`}
                  onClick={() => setActiveSidebarItem('Invoices')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Receipt className="me-2" />
                  Invoices
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${
                    isActive('Messages') ? 'fw-bold text-primary' : 'text-muted'
                  }`}
                  onClick={() => setActiveSidebarItem('Messages')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Message className="me-2" />
                  Messages
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${
                    isActive('Profile') ? 'fw-bold text-primary' : 'text-muted'
                  }`}
                  onClick={() => setActiveSidebarItem('Profile')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Person className="me-2" />
                  Profile
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${
                    isActive('ProfileSettings') ? 'fw-bold text-primary' : 'text-muted'
                  }`}
                  onClick={() => setActiveSidebarItem('ProfileSettings')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <SettingsIcon className="me-2" />
                  Profile Settings
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${
                    isActive('Patients') ? 'fw-bold text-primary' : 'text-muted'
                  }`}
                  onClick={() => setActiveSidebarItem('Patients')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <People className="me-2" />
                  Patients
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${
                    isActive('PatientsReview') ? 'fw-bold text-primary' : 'text-muted'
                  }`}
                  onClick={() => setActiveSidebarItem('PatientsReview')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Person className="me-2" />
                  Patients Review
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start ${
                    isActive('Chat') ? 'fw-bold text-primary' : 'text-muted'
                  }`}
                  onClick={() => setActiveSidebarItem('Chat')}
                  style={{ background: 'none', border: 'none' }}
                >
                  <Chat className="me-2" />
                  Chat
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="col-md-9 col-lg-10 p-4 bg-light">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
