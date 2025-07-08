import { useState, useEffect } from 'react';
import { useAuth } from '../Pages/AuthPage';

export default function ViewLabAppointments() {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const labId = user?.id;

  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [appointments, setAppointments] = useState([]);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState({
    cities: false,
    appointments: false,
    deleting: null
  });

  const API_BASE = 'https://physiocareapp.runasp.net/api/v1';
  const ENDPOINTS = {
    getCities: `${API_BASE}/LaboratoryCity/get-cities-with-initial-phAnalyses-by-lab-id?labId=${labId}`,
    getAppointments: (labId, cityId) =>
      `${API_BASE}/LaboratoryCityAppointment/getAllLabCityAppointment?labId=${labId}&cityId=${cityId}`,
    deleteAppointment: id =>
      `${API_BASE}/LaboratoryCityAppointment/DeleteLaboratoryCityAppointment/${id}`
  };

  useEffect(() => {
    if (!labId || !accessToken) return;

    setLoading(prev => ({ ...prev, cities: true }));
    fetch(ENDPOINTS.getCities, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        const cityList = data.map(c => ({ id: c.id, name: c.cityName }));
        setCities(cityList);
      })
      .catch(() => {
        setMessage('Error loading cities');
        setMessageType('danger');
      })
      .finally(() => setLoading(prev => ({ ...prev, cities: false })));
  }, [labId, accessToken]);

  const fetchAppointments = () => {
    if (!labId || !accessToken || !selectedCityId) return;

    setLoading(prev => ({ ...prev, appointments: true }));
    setMessage('');
    setMessageType('');

    fetch(ENDPOINTS.getAppointments(labId, selectedCityId), {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        // Sort appointments by date and time
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(`${a.day}T${a.time}`);
          const dateB = new Date(`${b.day}T${b.time}`);
          return dateA - dateB;
        });
        setAppointments(sortedData);
      })
      .catch(() => {
        setMessage('Error loading appointments');
        setMessageType('danger');
        setAppointments([]);
      })
      .finally(() => setLoading(prev => ({ ...prev, appointments: false })));
  };

  const handleDelete = async (id, appointmentInfo) => {
    if (!window.confirm(`Are you sure you want to delete the appointment on ${appointmentInfo}?`)) {
      return;
    }

    setLoading(prev => ({ ...prev, deleting: id }));

    try {
      const response = await fetch(ENDPOINTS.deleteAppointment(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      setMessage('Appointment deleted successfully!');
      setMessageType('success');
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete appointment', error);
      setMessage('Failed to delete appointment. Please try again.');
      setMessageType('danger');
    } finally {
      setLoading(prev => ({ ...prev, deleting: null }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateFormatted = date.toLocaleDateString('en-GB');
    return `${dayName} - ${dateFormatted}`;
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Auto-fetch appointments when city is selected
  useEffect(() => {
    if (selectedCityId) {
      fetchAppointments();
    } else {
      setAppointments([]);
    }
  }, [selectedCityId]);

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          {message && (
            <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
              {message}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {setMessage(''); setMessageType('');}}
                aria-label="Close"
              ></button>
            </div>
          )}

          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0 text-center">
                <i className="fas fa-calendar-check me-2"></i>
                View & Manage Appointments
              </h4>
            </div>
            <div className="card-body p-4">
              {/* City Selection */}
              <div className="mb-4">
                <label className="form-label fw-bold">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Select City to View Appointments
                </label>
                <select
                  className="form-select"
                  value={selectedCityId}
                  onChange={e => setSelectedCityId(e.target.value)}
                  disabled={loading.cities}
                >
                  <option value="">-- Select City --</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {loading.cities && (
                  <div className="text-muted mt-1">
                    <small>Loading cities...</small>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {loading.appointments && (
                <div className="text-center py-4">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading appointments...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading appointments...</p>
                </div>
              )}

              {/* Appointments List */}
              {!loading.appointments && selectedCityId && (
                <>
                  {appointments.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">No appointments found</h5>
                      <p className="text-muted">No appointments are scheduled for the selected city.</p>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                          <i className="fas fa-list me-2"></i>
                          Scheduled Appointments ({appointments.length})
                        </h5>
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={fetchAppointments}
                          disabled={loading.appointments}
                        >
                          <i className="fas fa-sync-alt me-1"></i>
                          Refresh
                        </button>
                      </div>
                      
                      <div className="row g-3">
                        {appointments.map(appointment => (
                          <div key={appointment.id} className="col-12">
                            <div className="card border-start border-success border-3">
                              <div className="card-body">
                                <div className="row align-items-center">
                                  <div className="col-md-8">
                                    <div className="d-flex align-items-center mb-2">
                                      <i className="fas fa-map-marker-alt text-success me-2"></i>
                                      <strong className="text-primary">{appointment.cityName}</strong>
                                    </div>
                                    <div className="d-flex align-items-center mb-1">
                                      <i className="fas fa-calendar-day text-muted me-2"></i>
                                      <span>{formatDate(appointment.day)}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <i className="fas fa-clock text-muted me-2"></i>
                                      <span>{formatTime(appointment.time)}</span>
                                    </div>
                                  </div>
                                  <div className="col-md-4 text-md-end">
                                    <button
                                      className="btn btn-danger"
                                      onClick={() => handleDelete(
                                        appointment.id, 
                                        `${formatDate(appointment.day)} at ${formatTime(appointment.time)}`
                                      )}
                                      disabled={loading.deleting === appointment.id}
                                    >
                                      {loading.deleting === appointment.id ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" />
                                          Deleting...
                                        </>
                                      ) : (
                                        <>
                                          <i className="fas fa-trash me-2"></i>
                                          Delete
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* No City Selected State */}
              {!selectedCityId && !loading.cities && (
                <div className="text-center py-5">
                  <i className="fas fa-city fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Select a City</h5>
                  <p className="text-muted">Please select a city to view its appointments.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}