import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import { useAuth } from '../Pages/AuthPage';

const API_BASE_URL = 'https://physiocareapp.runasp.net/api/v1';

function AppointmentAtClinic() {
  const { user } = useAuth();
  
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    doctorClinicId: '',
    day: '',
    openAt: '',
    closedAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('create');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    if (user?.id) {
      fetchClinics();
      if (viewMode === 'view') {
        fetchAllAppointments();
      }
    }
  }, [viewMode, user?.id]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (deleteSuccess) {
      const timer = setTimeout(() => setDeleteSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess]);

  const formatDayName = (dayString) => {
    if (!dayString) return 'Unknown Date';
    
    try {
      const date = new Date(dayString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(dayString)) {
        return dayString;
      }
      return 'Unknown Date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date(2025, 0, 1, hours, minutes);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      if (timeString.includes(':') && timeString.split(':').length === 2) {
        return `${timeString}:00`;
      }
      return timeString;
    }
  };

  const getClinicName = (doctorClinicId) => {
    const clinic = clinics.find(c => c.id === doctorClinicId);
    return clinic ? clinic.clinicName : 'Unknown Clinic';
  };

  const fetchClinics = async () => {
    if (!user?.id) {
      setError('Doctor ID not found. Please ensure you are logged in.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setClinics([]);
      
      const response = await axios.get(`${API_BASE_URL}/DoctorClinics/GetAllDoctorClinic/${user.id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!Array.isArray(response.data)) throw new Error('Invalid response format');
      
      if (response.data.length === 0) {
        setError('No clinics found for this doctor.');
        return;
      }
      
      setClinics(response.data);
    } catch (error) {
      console.error('Fetch clinics error:', error);
      setError(error.response?.data?.message || 'Failed to load clinics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAppointments = async () => {
    if (!user?.id) {
      setError('Doctor ID not found. Please ensure you are logged in.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setAppointments([]); // Clear existing appointments
      
      // Fetch appointments for each clinic
      const allAppointments = [];
      for (const clinic of clinics) {
        const response = await axios.get(`${API_BASE_URL}/AppointmentAtClinics/GetDoctorClinicAppointments`, {
          headers: getAuthHeaders(),
          params: { doctorClinicId: clinic.id },
        });
        if (Array.isArray(response.data)) {
          allAppointments.push(...response.data);
        }
      }
      
      setAppointments(allAppointments);
    } catch (error) {
      console.error('Fetch all appointments error:', error);
      setError(error.response?.data?.message || 'Failed to load your appointments.');
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async () => {
    if (!appointmentData.doctorClinicId || !appointmentData.day || !appointmentData.openAt || !appointmentData.closedAt) {
      setError('Please select a clinic and fill in all appointment details.');
      return;
    }
    
    if (appointmentData.openAt >= appointmentData.closedAt) {
      setError('Start time must be before end time.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('DoctorClinicId', appointmentData.doctorClinicId);
      formData.append('Day', appointmentData.day);
      formData.append('OpenAt', appointmentData.openAt); // Use raw input without formatTime
      formData.append('ClosedAt', appointmentData.closedAt); // Use raw input without formatTime
      
      console.log('FormData contents:', {
        DoctorClinicId: appointmentData.doctorClinicId,
        Day: appointmentData.day,
        OpenAt: appointmentData.openAt,
        ClosedAt: appointmentData.closedAt,
      });
      
      const response = await axios.post(`${API_BASE_URL}/AppointmentAtClinics`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders(),
        },
      });
      
      console.log('Create appointment response:', response.data);
      setBookingSuccess(true);
      fetchAllAppointments();
    } catch (error) {
      console.error('Appointment creation error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to create appointment. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (!appointmentId) {
      setError('Invalid appointment ID.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await axios.delete(`${API_BASE_URL}/AppointmentAtClinics/${appointmentId}`, {
        headers: getAuthHeaders(),
      });
      
      setAppointments(appointments.filter((appointment) => appointment.id !== appointmentId));
      setDeleteSuccess(true);
    } catch (error) {
      console.error('Appointment deletion error:', error);
      setError(error.response?.data?.message || 'Failed to delete appointment.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'view') {
      fetchAllAppointments();
    } else if (mode === 'create' && user?.id) {
      fetchClinics();
    }
  };

  const handleReset = () => {
    setClinics([]);
    setAppointments([]);
    setSelectedClinic(null);
    setAppointmentData({ doctorClinicId: '', day: '', openAt: '', closedAt: '' });
    setBookingSuccess(false);
    setDeleteSuccess(false);
    setError('');
  };

  const handleClinicChange = (e) => {
    const clinic = clinics.find((c) => c.id === e.target.value);
    setSelectedClinic(clinic || null);
    if (clinic) {
      setAppointmentData((prev) => ({ ...prev, doctorClinicId: clinic.id }));
    }
  };

  if (!user) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="alert alert-warning">
          <h4>Authentication Required</h4>
          <p>Please log in to access the appointment system.</p>
        </div>
      </div>
    );
  }

  const today = new Date('2025-06-24T08:08:00Z').toISOString().split('T')[0]; // Updated to current time

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary">Clinic Appointment</h1>
          <p className="lead text-muted">
            Welcome Dr. {user.name || user.email}, manage your clinic appointments
          </p>
          <div className="mb-4 d-flex justify-content-center">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <button
                  className={`nav-link ${viewMode === 'create' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('create')}
                  aria-label="Create Appointment"
                >
                  <i className="bi bi-plus-circle me-2"></i>Create Appointment
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${viewMode === 'view' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('view')}
                  aria-label="View My Appointments"
                >
                  <i className="bi bi-calendar3 me-2"></i>View My Appointments
                </button>
              </li>
            </ul>
          </div>
        </div>

        {error && <div className="alert alert-danger shadow-sm">{error}</div>}
        {bookingSuccess && (
          <div className="alert alert-success shadow-sm">Appointment created successfully!</div>
        )}
        {deleteSuccess && (
          <div className="alert alert-success shadow-sm">Appointment deleted successfully!</div>
        )}

        <div className="row justify-content-center">
          <div className="col-lg-8">
            {viewMode === 'create' ? (
              <div className="card shadow border-0 rounded-lg">
                <div className="card-header bg-primary text-white py-3">
                  <h3 className="mb-0 d-flex align-items-center">
                    <i className="bi bi-calendar-check me-2"></i>Create Clinic Appointment
                  </h3>
                </div>
                <div className="card-body p-4">
                  {bookingSuccess ? (
                    <div className="text-center">
                      <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
                      <h3>Appointment Created!</h3>
                      <p>Your appointment slot has been reserved.</p>
                      <button className="btn btn-primary" onClick={handleReset} aria-label="Book Another Appointment">
                        Book Another Appointment
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); createAppointment(); }}>
                      <div className="mb-4">
                        <label htmlFor="clinic" className="form-label fw-bold">
                          <i className="bi bi-building me-2"></i>Select Clinic
                        </label>
                        {loading && !clinics.length ? (
                          <div className="text-center my-3">
                            <div className="spinner-border text-primary" role="status" />
                            <p>Loading clinics...</p>
                          </div>
                        ) : clinics.length > 0 ? (
                          <>
                            <select
                              id="clinic"
                              className="form-select form-select-lg"
                              value={selectedClinic?.id || ''}
                              onChange={handleClinicChange}
                              required
                              aria-describedby="clinicHelp"
                            >
                              <option value="">Select a clinic</option>
                              {clinics.map((clinic) => (
                                <option key={clinic.id} value={clinic.id}>
                                  {`${clinic.clinicName} - ${clinic.city} (${clinic.price} EGP)`}
                                </option>
                              ))}
                            </select>
                            <div id="clinicHelp" className="form-text">Select the clinic where you want to book.</div>
                            {selectedClinic && (
                              <div className="mt-3 p-3 bg-light rounded">
                                <div className="d-flex align-items-center">
                                  <div
                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
                                    style={{ width: '50px', height: '50px' }}
                                  >
                                    <i className="bi bi-building text-white fs-4"></i>
                                  </div>
                                  <div>
                                    <h6>{selectedClinic.clinicName}</h6>
                                    <p className="mb-0 text-muted small">
                                      {selectedClinic.city} - {selectedClinic.price} EGP
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="alert alert-warning">No clinics available for this doctor.</div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label htmlFor="appointmentDetails" className="form-label fw-bold">
                          <i className="bi bi-calendar-event me-2"></i>Appointment Details
                        </label>
                        <div className="card">
                          <div className="card-body">
                            <div className="mb-3">
                              <label htmlFor="day" className="form-label">Day</label>
                              <input
                                type="date"
                                className="form-control"
                                id="day"
                                min={today}
                                value={appointmentData.day}
                                onChange={(e) =>
                                  setAppointmentData({ ...appointmentData, day: e.target.value })
                                }
                                disabled={!selectedClinic}
                                required
                                aria-describedby="dayHelp"
                              />
                              <div id="dayHelp" className="form-text">Choose the date for your appointment.</div>
                            </div>
                            <div className="mb-3">
                              <label htmlFor="openAt" className="form-label">Start Time</label>
                              <input
                                type="time"
                                className="form-control"
                                id="openAt"
                                value={appointmentData.openAt}
                                onChange={(e) =>
                                  setAppointmentData({ ...appointmentData, openAt: e.target.value })
                                }
                                disabled={!selectedClinic}
                                required
                                aria-describedby="openAtHelp"
                              />
                              <div id="openAtHelp" className="form-text">Select the start time.</div>
                            </div>
                            <div className="mb-3">
                              <label htmlFor="closedAt" className="form-label">End Time</label>
                              <input
                                type="time"
                                className="form-control"
                                id="closedAt"
                                value={appointmentData.closedAt}
                                onChange={(e) =>
                                  setAppointmentData({ ...appointmentData, closedAt: e.target.value })
                                }
                                disabled={!selectedClinic}
                                required
                                aria-describedby="closedAtHelp"
                              />
                              <div id="closedAtHelp" className="form-text">Select the end time.</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg"
                          disabled={
                            loading ||
                            !appointmentData.doctorClinicId ||
                            !appointmentData.day ||
                            !appointmentData.openAt ||
                            !appointmentData.closedAt
                          }
                          aria-label="Create Appointment"
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Creating Appointment...
                            </>
                          ) : (
                            <>
                              Create Appointment <i className="bi bi-check-lg ms-2"></i>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="card shadow border-0 rounded-lg">
                <div className="card-header bg-primary text-white py-3">
                  <h3 className="mb-0 d-flex align-items-center">
                    <i className="bi bi-calendar3 me-2"></i>My Appointments
                  </h3>
                </div>
                <div className="card-body p-4">
                  {loading && !appointments.length ? (
                    <div className="text-center my-3">
                      <div className="spinner-border text-primary" role="status" />
                      <p>Loading appointments...</p>
                    </div>
                  ) : appointments.length > 0 ? (
                    <div className="list-group">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="list-group-item list-group-item-action"
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="mb-2 fw-bold">
                                <i className="bi bi-building me-2 text-primary"></i>
                                {getClinicName(appointment.doctorClinicId)}
                              </h6>
                              <div className="row">
                                <div className="col-md-6">
                                  <p className="mb-1 text-muted">
                                    <i className="bi bi-calendar-day me-2"></i>
                                    <strong>Day:</strong> {formatDayName(appointment.day)}
                                  </p>
                                  <p className="mb-1 text-muted">
                                    <i className="bi bi-clock me-2"></i>
                                    <strong>Time:</strong> {formatTime(appointment.openAt)} - {formatTime(appointment.closedAt)}
                                  </p>
                                </div>
                                <div className="col-md-6">
                                  {appointment.patientName && (
                                    <p className="mb-1 text-muted">
                                      <i className="bi bi-person me-2"></i>
                                      <strong>Patient:</strong> {appointment.patientName}
                                    </p>
                                  )}
                                  {appointment.address && (
                                    <p className="mb-1 text-muted">
                                      <i className="bi bi-geo-alt me-2"></i>
                                      <strong>Address:</strong> {appointment.address}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="d-flex flex-column gap-2">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteAppointment(appointment.id)}
                                disabled={loading}
                                aria-label={`Delete appointment at ${getClinicName(appointment.doctorClinicId)}`}
                              >
                                <i className="bi bi-trash me-2"></i>Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      You have no appointments scheduled.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentAtClinic;