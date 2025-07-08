
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCalendarCheck,
  faStethoscope,
  faUsers,
  faUserPlus,
  faClipboardCheck,
  faSignOutAlt,
  faCog,
  faBell,
  faCalendarPlus,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

const DashNurse = () => {
  // Active view: dashboard, appointments, consultations, patients, settings, notifications, logout
  const [activeView, setActiveView] = useState('dashboard');

  // Sample analytics (replace with real data)
  const [dischargeList] = useState(5);
  const [newPatients] = useState(12);
  const [totalPatients] = useState(200);

  // Data arrays
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [patients, setPatients] = useState([]);

  // Appointment modal and edit state
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editAppointmentMode, setEditAppointmentMode] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  // Added extra fields: doctor, location, notes
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    age: '',
    gender: 'Female',
    date: '',
    time: '',
    reason: '',
    department: '',
    doctor: '',
    location: '',
    notes: '',
    status: 'Scheduled',
  });
  const [appointmentSearch, setAppointmentSearch] = useState('');

  // Consultation modal and deletion state
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [consultationSearch, setConsultationSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Settings state (simulate some options)
  const [settings, setSettings] = useState({ theme: 'light', notifications: true });

  // Simulate data fetch (replace with real API calls)
  useEffect(() => {
    setAppointments([
      {
        id: 1,
        patientName: 'John Doe',
        age: 45,
        gender: 'Male',
        date: '2025-04-20',
        time: '10:00 AM',
        reason: 'Routine Checkup',
        department: 'General',
        doctor: 'Dr. Smith',
        location: 'Room 101',
        notes: 'Follow-up in 6 months',
        status: 'Scheduled',
      },
      {
        id: 2,
        patientName: 'Mary Smith',
        age: 30,
        gender: 'Female',
        date: '2025-04-21',
        time: '11:30 AM',
        reason: 'Physical Therapy',
        department: 'Physio',
        doctor: 'Dr. Adams',
        location: 'Therapy Center',
        notes: 'Initial assessment',
        status: 'Completed',
      },
    ]);
    setConsultations([
      {
        id: 1,
        patient: { name: 'Robert Brown', age: 60, gender: 'Male' },
        time: '09:00 AM',
        reason: 'Post-surgery check',
        status: 'Accepted',
      },
      {
        id: 2,
        patient: { name: 'Lisa Davis', age: 40, gender: 'Female' },
        time: '01:00 PM',
        reason: 'Knee pain evaluation',
        status: 'Pending',
      },
    ]);
    setNotifications([
      { id: 1, message: 'New appointment scheduled for John Doe.', read: false },
      { id: 2, message: 'Consultation update: Lisa Davis is pending.', read: false },
    ]);
    // Derive patients (or fetch separately)
    setPatients([
      { id: 1, name: 'John Doe', age: 45, gender: 'Male' },
      { id: 2, name: 'Mary Smith', age: 30, gender: 'Female' },
      { id: 3, name: 'Robert Brown', age: 60, gender: 'Male' },
      { id: 4, name: 'Lisa Davis', age: 40, gender: 'Female' },
    ]);
  }, []);

  // Appointment handlers
  const handleAddAppointment = (e) => {
    e.preventDefault();
    const newId = Math.max(...appointments.map(a => a.id), 0) + 1;
    const appointmentToAdd = { id: newId, ...newAppointment };
    setAppointments([...appointments, appointmentToAdd]);
    setNewAppointment({
      patientName: '',
      age: '',
      gender: 'Female',
      date: '',
      time: '',
      reason: '',
      department: '',
      doctor: '',
      location: '',
      notes: '',
      status: 'Scheduled',
    });
    setShowAddAppointmentModal(false);
  };

  const handleUpdateAppointmentStatus = (id, newStatus) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
    setShowAppointmentDetails(false);
    setEditAppointmentMode(false);
  };

  const handleDeleteAppointment = (id) => {
    setAppointments(appointments.filter(a => a.id !== id));
    setShowAppointmentDetails(false);
    setEditAppointmentMode(false);
  };

  const handleSaveAppointmentEdit = () => {
    setAppointments(appointments.map(a => a.id === selectedAppointment.id ? selectedAppointment : a));
    setEditAppointmentMode(false);
  };

  // Consultation handlers
  const acceptConsultation = (id) => {
    setConsultations(consultations.map(c => c.id === id ? { ...c, status: 'Accepted' } : c));
    setShowConsultationModal(false);
  };

  const rejectConsultation = (id) => {
    setConsultations(consultations.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
    setShowConsultationModal(false);
  };

  const handleRemoveConsultation = () => {
    if (selectedConsultation) {
      setConsultations(consultations.filter(c => c.id !== selectedConsultation.id));
    }
    setShowDeleteModal(false);
    setSelectedConsultation(null);
  };

  // Notification handler
  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Render functions for each view
  const renderDashboard = () => (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner p-4 mb-4 rounded">
        <h5 className="fw-bold mb-2">Welcome, Nurse Jeniffer Turner!</h5>
        <p>
          Track your tasks, manage <strong>Appointments</strong> &amp; <strong>Consultations</strong>, and monitor patient analytics.
        </p>
      </div>
      {/* Analytics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card stats-card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="icon-circle bg-primary text-white me-3">
                <FontAwesomeIcon icon={faClipboardCheck} />
              </div>
              <div>
                <p className="mb-1 text-muted">Today’s Discharge List</p>
                <h5 className="mb-0 fw-bold">{dischargeList}</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stats-card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="icon-circle bg-danger text-white me-3">
                <FontAwesomeIcon icon={faUserPlus} />
              </div>
              <div>
                <p className="mb-1 text-muted">New Patients</p>
                <h5 className="mb-0 fw-bold">{newPatients}</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stats-card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="icon-circle bg-info text-white me-3">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div>
                <p className="mb-1 text-muted">Total Patients</p>
                <h5 className="mb-0 fw-bold">{totalPatients}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Chart Placeholders */}
      <div className="row g-3 mb-4">
        <div className="col-md-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-bold">Activity</h6>
              <div className="chart-placeholder mt-3">
                <p>Weekly/Monthly Activity Chart</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-bold">Process</h6>
              <div className="ring-chart-placeholder mt-3">
                <p>Ring Chart (Treatment Status)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Combined Appointments & Consultations */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center bg-white">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-primary me-2" />
                <h6 className="mb-0 fw-bold">Appointments</h6>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddAppointmentModal(true)}>
                <FontAwesomeIcon icon={faCalendarPlus} className="me-1" /> Add Appointment
              </button>
            </div>
            <div className="card-body">
              <input
                type="text"
                placeholder="Search Appointments..."
                className="form-control mb-3"
                value={appointmentSearch}
                onChange={(e) => setAppointmentSearch(e.target.value)}
              />
              {appointments.filter(a => a.patientName.toLowerCase().includes(appointmentSearch.toLowerCase())).length === 0 ? (
                <p className="text-muted">No appointments scheduled.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {appointments
                    .filter(a => a.patientName.toLowerCase().includes(appointmentSearch.toLowerCase()))
                    .map((apt) => (
                      <li
                        key={apt.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setEditAppointmentMode(false);
                          setShowAppointmentDetails(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <strong>{apt.patientName}</strong>
                          <small className="text-muted"> ({apt.age}, {apt.gender})</small>
                          <br />
                          <small className="text-muted">{apt.time} | {apt.date}</small>
                        </div>
                        <span
                          className={`badge ${
                            apt.status === 'Scheduled'
                              ? 'bg-primary'
                              : apt.status === 'Completed'
                              ? 'bg-success'
                              : 'bg-secondary'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
  
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex align-items-center">
              <FontAwesomeIcon icon={faStethoscope} className="text-primary me-2" />
              <h6 className="mb-0 fw-bold">Consultations</h6>
            </div>
            <div className="card-body">
              <input
                type="text"
                placeholder="Search Consultations..."
                className="form-control mb-3"
                value={consultationSearch}
                onChange={(e) => setConsultationSearch(e.target.value)}
              />
              {consultations.filter(c => c.patient.name.toLowerCase().includes(consultationSearch.toLowerCase())).length === 0 ? (
                <p className="text-muted">No consultations available.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {consultations
                    .filter(c => c.patient.name.toLowerCase().includes(consultationSearch.toLowerCase()))
                    .map((cons) => (
                      <li
                        key={cons.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        onClick={() => {
                          setSelectedConsultation(cons);
                          setShowConsultationModal(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <strong>{cons.patient.name}</strong>
                          <small className="text-muted"> ({cons.patient.age}, {cons.patient.gender})</small>
                          <br />
                          <small className="text-muted">{cons.time} | {cons.reason}</small>
                        </div>
                        <span
                          className={`badge ${
                            cons.status === 'Pending'
                              ? 'bg-warning text-dark'
                              : cons.status === 'Accepted'
                              ? 'bg-success'
                              : cons.status === 'Rejected'
                              ? 'bg-danger'
                              : 'bg-secondary'
                          }`}
                        >
                          {cons.status}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div>
      <h5 className="mb-3">Appointments</h5>
      <input
        type="text"
        placeholder="Search Appointments..."
        className="form-control mb-3"
        value={appointmentSearch}
        onChange={(e) => setAppointmentSearch(e.target.value)}
      />
      {appointments.filter(a => a.patientName.toLowerCase().includes(appointmentSearch.toLowerCase())).length === 0 ? (
        <p className="text-muted">No appointments scheduled.</p>
      ) : (
        <ul className="list-group">
          {appointments
            .filter(a => a.patientName.toLowerCase().includes(appointmentSearch.toLowerCase()))
            .map((apt) => (
              <li
                key={apt.id}
                className="list-group-item d-flex justify-content-between align-items-center"
                onClick={() => {
                  setSelectedAppointment(apt);
                  setEditAppointmentMode(false);
                  setShowAppointmentDetails(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <strong>{apt.patientName}</strong>
                  <small className="text-muted"> ({apt.age}, {apt.gender})</small>
                  <br />
                  <small className="text-muted">{apt.time} | {apt.date}</small>
                </div>
                <span
                  className={`badge ${
                    apt.status === 'Scheduled'
                      ? 'bg-primary'
                      : apt.status === 'Completed'
                      ? 'bg-success'
                      : 'bg-secondary'
                  }`}
                >
                  {apt.status}
                </span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );

  const renderConsultations = () => (
    <div>
      <h5 className="mb-3">Consultations</h5>
      <input
        type="text"
        placeholder="Search Consultations..."
        className="form-control mb-3"
        value={consultationSearch}
        onChange={(e) => setConsultationSearch(e.target.value)}
      />
      {consultations.filter(c => c.patient.name.toLowerCase().includes(consultationSearch.toLowerCase())).length === 0 ? (
        <p className="text-muted">No consultations available.</p>
      ) : (
        <ul className="list-group">
          {consultations
            .filter(c => c.patient.name.toLowerCase().includes(consultationSearch.toLowerCase()))
            .map((cons) => (
              <li
                key={cons.id}
                className="list-group-item d-flex justify-content-between align-items-center"
                onClick={() => {
                  setSelectedConsultation(cons);
                  setShowConsultationModal(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <strong>{cons.patient.name}</strong>
                  <small className="text-muted"> ({cons.patient.age}, {cons.patient.gender})</small>
                  <br />
                  <small className="text-muted">{cons.time} | {cons.reason}</small>
                </div>
                <span
                  className={`badge ${
                    cons.status === 'Pending'
                      ? 'bg-warning text-dark'
                      : cons.status === 'Accepted'
                      ? 'bg-success'
                      : cons.status === 'Rejected'
                      ? 'bg-danger'
                      : 'bg-secondary'
                  }`}
                >
                  {cons.status}
                </span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );

  const renderPatients = () => (
    <div>
      <h5 className="mb-3">Patients</h5>
      {patients.length === 0 ? (
        <p className="text-muted">No patients data available.</p>
      ) : (
        <ul className="list-group">
          {patients.map((p) => (
            <li key={p.id} className="list-group-item">
              <strong>{p.name}</strong> - {p.age} years old, {p.gender}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderSettings = () => (
    <div>
      <h5 className="mb-3">Settings</h5>
      <form onSubmit={(e) => { e.preventDefault(); alert("Settings saved!"); }}>
        <div className="mb-3">
          <label className="form-label">Theme</label>
          <select className="form-select" value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })} />
          <label className="form-check-label">Enable Notifications</label>
        </div>
        <button className="btn btn-primary" type="submit">Save Settings</button>
      </form>
    </div>
  );

  const renderNotifications = () => (
    <div>
      <h5 className="mb-3">Notifications</h5>
      {notifications.length === 0 ? (
        <p className="text-muted">No notifications.</p>
      ) : (
        <ul className="list-group">
          {notifications.map((n) => (
            <li key={n.id} className="list-group-item d-flex justify-content-between align-items-center">
              {n.message}
              {!n.read && (
                <button className="btn btn-sm btn-outline-primary" onClick={() => markNotificationAsRead(n.id)}>
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderLogout = () => (
    <div>
      <h5 className="mb-3">Logout</h5>
      <p>Are you sure you want to logout?</p>
      <button className="btn btn-danger" onClick={() => { window.location.href = '/login'; }}>
        Logout
      </button>
    </div>
  );

  // Appointment Details Modal Content
  const renderAppointmentModalContent = () => {
    if (!selectedAppointment) return null;
    if (editAppointmentMode) {
      return (
        <>
          <div className="modal-header">
            <h5 className="modal-title">Edit Appointment</h5>
            <button type="button" className="btn-close" onClick={() => { setShowAppointmentDetails(false); setEditAppointmentMode(false); }}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Patient Name</label>
              <input type="text" className="form-control" value={selectedAppointment.patientName}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, patientName: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Age</label>
              <input type="number" className="form-control" value={selectedAppointment.age}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, age: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Gender</label>
              <select className="form-select" value={selectedAppointment.gender}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, gender: e.target.value })}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={selectedAppointment.date}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, date: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Time</label>
              <input type="time" className="form-control" value={selectedAppointment.time}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, time: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Reason</label>
              <input type="text" className="form-control" value={selectedAppointment.reason}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, reason: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Department</label>
              <input type="text" className="form-control" value={selectedAppointment.department}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, department: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-success" onClick={handleSaveAppointmentEdit}>Save</button>
            <button className="btn btn-secondary" onClick={() => setEditAppointmentMode(false)}>Cancel</button>
          </div>
        </>
      );
    }
    return (
      <>
        <div className="modal-header">
          <h5 className="modal-title">Appointment Details</h5>
          <button type="button" className="btn-close" onClick={() => setShowAppointmentDetails(false)}></button>
        </div>
        <div className="modal-body">
          <p>
            <strong>Patient:</strong> {selectedAppointment.patientName} ({selectedAppointment.age}, {selectedAppointment.gender})
          </p>
          <p>
            <strong>Date/Time:</strong> {selectedAppointment.date} at {selectedAppointment.time}
          </p>
          <p>
            <strong>Reason:</strong> {selectedAppointment.reason}
          </p>
          <p>
            <strong>Department:</strong> {selectedAppointment.department}
          </p>
          <p>
            <strong>Doctor:</strong> {selectedAppointment.doctor}
          </p>
          <p>
            <strong>Location:</strong> {selectedAppointment.location}
          </p>
          <p>
            <strong>Notes:</strong> {selectedAppointment.notes}
          </p>
          <p>
            <strong>Status:</strong> <span className={`badge ${selectedAppointment.status === 'Scheduled' ? 'bg-primary' : selectedAppointment.status === 'Completed' ? 'bg-success' : 'bg-secondary'}`}>{selectedAppointment.status}</span>
          </p>
        </div>
        <div className="modal-footer">
          {selectedAppointment.status === 'Scheduled' && (
            <button className="btn btn-success" onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, 'Completed')}>
              Mark as Completed
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setEditAppointmentMode(true)}>
            <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit
          </button>
          <button className="btn btn-danger" onClick={() => handleDeleteAppointment(selectedAppointment.id)}>
            <FontAwesomeIcon icon={faTrash} className="me-2" /> Delete
          </button>
          <button className="btn btn-secondary" onClick={() => setShowAppointmentDetails(false)}>Close</button>
        </div>
      </>
    );
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Inline CSS */}
      <style>{`
        .sidebar {
          width: 240px;
          padding: 1rem 0;
          background-color: #fff;
          box-shadow: 0 0 5px rgba(0,0,0,0.1);
        }
        .sidebar-header .logo img {
          max-width: 100%;
        }
        .sidebar .nav-link {
          color: #333;
          font-weight: 500;
          margin-bottom: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .sidebar .nav-link.active,
        .sidebar .nav-link:hover {
          background-color: #f1f5f9;
          color: #009da5;
        }
        .main-content {
          background-color: #f8f9fb;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .main-content header {
          background-color: #fff;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        .welcome-banner {
          background: linear-gradient(135deg, #e0f7fa 0%, #fff 100%);
          border: 1px solid #ddd;
        }
        .icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stats-card {
          border: none;
          border-radius: 8px;
        }
        .chart-placeholder,
        .ring-chart-placeholder {
          height: 200px;
          background: #f1f1f1;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 0.9rem;
        }
        .list-group-item {
          border: 0;
          padding-left: 0;
          padding-right: 0;
        }
        .modal.show.d-block {
          background: rgba(0,0,0,0.4);
        }
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header text-center my-4">
          <div className="logo mb-2">
            <img src="https://via.placeholder.com/120x60?text=PhysioCare+Logo" alt="PhysioCare Logo" />
          </div>
          <h6 className="text-muted">Nurse Panel</h6>
        </div>
        <nav className="nav flex-column px-3">
          <a className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
            <FontAwesomeIcon icon={faClipboardCheck} className="me-2" /> Dashboard
          </a>
          <a className={`nav-link ${activeView === 'appointments' ? 'active' : ''}`} onClick={() => setActiveView('appointments')}>
            <FontAwesomeIcon icon={faCalendarCheck} className="me-2" /> Appointments
          </a>
          <a className={`nav-link ${activeView === 'consultations' ? 'active' : ''}`} onClick={() => setActiveView('consultations')}>
            <FontAwesomeIcon icon={faStethoscope} className="me-2" /> Consultations
          </a>
          <a className={`nav-link ${activeView === 'patients' ? 'active' : ''}`} onClick={() => setActiveView('patients')}>
            <FontAwesomeIcon icon={faUsers} className="me-2" /> Patients
          </a>
          <a className={`nav-link ${activeView === 'settings' ? 'active' : ''}`} onClick={() => setActiveView('settings')}>
            <FontAwesomeIcon icon={faCog} className="me-2" /> Settings
          </a>
          <a className={`nav-link ${activeView === 'notifications' ? 'active' : ''}`} onClick={() => setActiveView('notifications')}>
            <FontAwesomeIcon icon={faBell} className="me-2" /> Notifications
          </a>
          <a className={`nav-link ${activeView === 'logout' ? 'active' : ''}`} onClick={() => setActiveView('logout')}>
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="d-flex align-items-center justify-content-between px-4 py-3 shadow-sm">
          <h4 className="mb-0 fw-bold">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h4>
          <div className="d-flex align-items-center">
            <div className="me-3 text-end">
              <small className="text-muted d-block">Welcome!</small>
              <strong>Nurse Jeniffer Turner</strong>
            </div>
            <div className="avatar bg-primary text-white d-flex align-items-center justify-content-center">
              <FontAwesomeIcon icon={faUser} />
            </div>
          </div>
        </header>
        <div className="p-4">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'appointments' && renderAppointments()}
          {activeView === 'consultations' && renderConsultations()}
          {activeView === 'patients' && renderPatients()}
          {activeView === 'settings' && renderSettings()}
          {activeView === 'notifications' && renderNotifications()}
          {activeView === 'logout' && renderLogout()}
        </div>
      </main>

      {/* Appointment Details Modal */}
      <div className={`modal fade ${showAppointmentDetails ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {renderAppointmentModalContent()}
          </div>
        </div>
      </div>

      {/* Add Appointment Modal with extra fields */}
      <div className={`modal fade ${showAddAppointmentModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">New Appointment</h5>
              <button type="button" className="btn-close" onClick={() => setShowAddAppointmentModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddAppointment}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Patient Name</label>
                    <input type="text" className="form-control" value={newAppointment.patientName}
                      onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-control" value={newAppointment.age}
                      onChange={(e) => setNewAppointment({ ...newAppointment, age: e.target.value })} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={newAppointment.gender}
                      onChange={(e) => setNewAppointment({ ...newAppointment, gender: e.target.value })}>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Time</label>
                    <input type="time" className="form-control" value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Reason</label>
                    <input type="text" className="form-control" value={newAppointment.reason}
                      onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-control" value={newAppointment.department}
                      onChange={(e) => setNewAppointment({ ...newAppointment, department: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Doctor</label>
                    <input type="text" className="form-control" value={newAppointment.doctor}
                      onChange={(e) => setNewAppointment({ ...newAppointment, doctor: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-control" value={newAppointment.location}
                      onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })} required />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" rows="3" value={newAppointment.notes}
                      onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="mt-4 text-end">
                  <button className="btn btn-secondary me-2" onClick={() => setShowAddAppointmentModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Appointment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Details Modal */}
      <div className={`modal fade ${showConsultationModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {selectedConsultation && (
              <>
                <div className="modal-header">
                  <h5 className="modal-title">Consultation Details</h5>
                  <button type="button" className="btn-close" onClick={() => setShowConsultationModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Patient:</strong> {selectedConsultation.patient.name} ({selectedConsultation.patient.age}, {selectedConsultation.patient.gender})
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedConsultation.time}
                  </p>
                  <p>
                    <strong>Reason:</strong> {selectedConsultation.reason}
                  </p>
                  <p>
                    <strong>Status:</strong> <span className={`badge ${selectedConsultation.status === 'Pending' ? 'bg-warning text-dark' : selectedConsultation.status === 'Accepted' ? 'bg-success' : selectedConsultation.status === 'Rejected' ? 'bg-danger' : 'bg-secondary'}`}>{selectedConsultation.status}</span>
                  </p>
                </div>
                <div className="modal-footer">
                  {selectedConsultation.status === 'Pending' && (
                    <>
                      <button className="btn btn-primary" onClick={() => acceptConsultation(selectedConsultation.id)}>Accept</button>
                      <button className="btn btn-danger" onClick={() => rejectConsultation(selectedConsultation.id)}>Reject</button>
                    </>
                  )}
                  <button className="btn btn-outline-danger" onClick={() => { setShowDeleteModal(true); setShowConsultationModal(false); }}>Remove</button>
                  <button className="btn btn-secondary" onClick={() => setShowConsultationModal(false)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Consultation Modal */}
      <div className={`modal fade ${showDeleteModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Remove Consultation</h5>
              <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove this consultation?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleRemoveConsultation}>Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashNurse;
