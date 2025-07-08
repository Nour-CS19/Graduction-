import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Pages/AuthPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const AppointmentManagement = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAppointmentId, setDeleteAppointmentId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newAppointmentData, setNewAppointmentData] = useState({
    date: '',
    time: '',
    price: ''
  });
  const [updateFormData, setUpdateFormData] = useState({
    date: '',
    time: '',
    price: '',
    status: ''
  });

  const API_BASE_URL = 'https://physiocareapp.runasp.net/api/v1';

  const getAuthHeaders = useCallback((isFormData = false) => {
    const token = user?.accessToken || localStorage.getItem('accessToken');
    if (!token) throw new Error('Authentication token not found');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }, [user?.accessToken]);

  const showAlert = useCallback((type, message, duration = 5000) => {
    if (type === 'error') {
      setError(message);
      setSuccess('');
    } else if (type === 'success') {
      setSuccess(message);
      setError('');
    }
    if (duration && message) {
      setTimeout(() => {
        if (type === 'error') setError('');
        else if (type === 'success') setSuccess('');
      }, duration);
    }
  }, []);

  const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    return uuidRegex.test(uuid);
  };

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

  const validateForm = useCallback((formData, isUpdate = false, currentAppointmentId = null) => {
    const trimmedData = {
      date: formData.date?.trim() || '',
      time: formData.time?.trim() || '',
      price: formData.price?.toString().trim() || '',
      status: formData.status?.trim() || ''
    };

    if (!isUpdate) {
      // Validation for POST (create)
      if (!trimmedData.date) return { valid: false, message: 'Date is required' };
      if (!trimmedData.time) return { valid: false, message: 'Time is required' };
      if (trimmedData.price === '') return { valid: false, message: 'Price is required' };
      if (!isValidDate(trimmedData.date)) {
        return { valid: false, message: 'Please enter a valid date (YYYY-MM-DD) starting from June 10, 2025.' };
      }
      if (!isValidTime(trimmedData.time)) {
        return { valid: false, message: 'Please enter a valid time (HH:MM).' };
      }
      if (!isValidPrice(trimmedData.price)) {
        return { valid: false, message: 'Please enter a valid price (non-negative number).' };
      }
      const isDuplicate = appointments.some(app =>
        app.date === trimmedData.date &&
        (app.time === trimmedData.time || app.time === formatTimeForAPI(trimmedData.time))
      );
      if (isDuplicate) {
        return { valid: false, message: 'An appointment already exists for this date and time.' };
      }
    } else {
      // Validation for PUT (update)
      if (!trimmedData.date) return { valid: false, message: 'Date is required' };
      if (!trimmedData.time) return { valid: false, message: 'Time is required' };
      if (trimmedData.price === '') return { valid: false, message: 'Price is required' };
      if (!isValidDate(trimmedData.date)) {
        return { valid: false, message: 'Please enter a valid date (YYYY-MM-DD) starting from June 10, 2025.' };
      }
      if (!isValidTime(trimmedData.time)) {
        return { valid: false, message: 'Please enter a valid time (HH:MM).' };
      }
      if (!isValidPrice(trimmedData.price)) {
        return { valid: false, message: 'Please enter a valid price (non-negative number).' };
      }
      const isDuplicate = appointments.some(app =>
        app.id !== currentAppointmentId &&
        app.date === trimmedData.date &&
        (app.time === trimmedData.time || app.time === formatTimeForAPI(trimmedData.time))
      );
      if (isDuplicate) {
        return { valid: false, message: 'An appointment already exists for this date and time.' };
      }
    }

    return { valid: true, data: trimmedData };
  }, [appointments]);

  const parseAppointmentData = (data) => {
    if (!data) return [];
    let appointmentsArray = [];
    if (Array.isArray(data)) {
      appointmentsArray = data;
    } else if (data.data && Array.isArray(data.data)) {
      appointmentsArray = data.data;
    } else if (data.items && Array.isArray(data.items)) {
      appointmentsArray = data.items;
    } else if (data.value && Array.isArray(data.value)) {
      appointmentsArray = data.value;
    }

    return appointmentsArray.map((appointment) => ({
      id: appointment.id || appointment.Id || '',
      doctorId: appointment.doctorId || appointment.DoctorId || appointment.drId || '',
      date: appointment.date || appointment.Date || 'N/A',
      time: appointment.time || appointment.Time || 'N/A',
      price: Number(appointment.price || appointment.Price || 0).toFixed(2),
      status: appointment.status || appointment.Status || 'Available',
    }));
  };

  const fetchAppointments = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !isValidUUID(user.id)) {
      showAlert('error', 'Invalid or missing authentication. Please login again.');
      return;
    }

    try {
      setLoading(true);
      showAlert('error', '');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${API_BASE_URL}/DoctorAppointmentOnlines/GetAll?drId=${user.id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) throw new Error('Session expired. Please login again.');
        if (response.status === 403) throw new Error('Access denied. You do not have permission.');
        if (response.status === 404) throw new Error('Appointments endpoint not found.');
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();
      const normalizedAppointments = parseAppointmentData(data);

      setAppointments(normalizedAppointments);
      showAlert('success', `Successfully loaded ${normalizedAppointments.length} appointments`);
    } catch (error) {
      console.error('Fetch appointments error:', error);
      showAlert('error', error.name === 'AbortError'
        ? 'Connection timed out. Please check your internet connection.'
        : error.message || 'Failed to load online appointments.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, getAuthHeaders, showAlert]);

  const createAppointment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user?.id || !isValidUUID(user.id)) {
      showAlert('error', 'Invalid authentication. Please login again.');
      return;
    }

    const validation = validateForm(newAppointmentData);
    if (!validation.valid) {
      showAlert('error', validation.message);
      return;
    }

    const { date, time, price } = validation.data;
    const formattedTime = formatTimeForAPI(time);

    try {
      setLoading(true);
      showAlert('error', '');

      const formData = new FormData();
      formData.append('DoctorId', user.id);
      formData.append('Date', date);
      formData.append('Time', formattedTime);
      formData.append('Price', Number(price).toString());

      console.log('Creating appointment with data:', Object.fromEntries(formData));

      const response = await fetch(`${API_BASE_URL}/DoctorAppointmentOnlines`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        if (response.status === 401) errorMessage = 'Session expired. Please login again.';
        else if (response.status === 403) errorMessage = 'Access denied. You do not have permission.';
        else if (response.status === 400) errorMessage = `Invalid data: ${errorText}`;
        else if (response.status === 500) {
          if (errorText.includes('DoctorId') && errorText.includes('foreign key')) {
            errorMessage = 'Doctor account not properly set up. Please contact support.';
          } else if (errorText.includes('unknown when attempting to save')) {
            errorMessage = 'Database relationship error. Please ensure your doctor profile is complete.';
          } else {
            errorMessage = `Server error: ${errorText}`;
          }
        }
        throw new Error(errorMessage);
      }

      await fetchAppointments();
      setShowCreateModal(false);
      setNewAppointmentData({ date: '', time: '', price: '' });
      showAlert('success', 'Online appointment created successfully');
    } catch (error) {
      console.error('Create appointment error:', error);
      showAlert('error', error.message || 'Failed to create online appointment.');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user?.id || !isValidUUID(user.id) || !selectedAppointment?.id) {
      showAlert('error', 'Invalid authentication or appointment ID.');
      return;
    }

    const validation = validateForm(updateFormData, true, selectedAppointment.id);
    if (!validation.valid) {
      showAlert('error', validation.message);
      return;
    }

    try {
      setLoading(true);
      showAlert('error', '');

      const { date, time, price } = validation.data;
      const formattedTime = formatTimeForAPI(time);

      const requestBody = {
        id: selectedAppointment.id,
        date: date,
        time: formattedTime,
        price: Number(price)
      };

      console.log('Updating appointment with data:', requestBody);

      const response = await fetch(`${API_BASE_URL}/DoctorAppointmentOnlines/update-appointment`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        if (response.status === 401) errorMessage = 'Session expired. Please login again.';
        else if (response.status === 403) errorMessage = 'Access denied. You do not have permission.';
        else if (response.status === 404) errorMessage = 'Appointment not found.';
        else if (response.status === 400) errorMessage = `Invalid data: ${errorText}`;
        else if (response.status === 500) errorMessage = `Server error: ${errorText}`;
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log('Update response text:', responseText);

      let updatedAppointment;
      if (responseText.trim()) {
        try {
          updatedAppointment = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse update response:', parseError);
          updatedAppointment = {
            ...selectedAppointment,
            date: date,
            time: formattedTime,
            price: Number(price).toFixed(2),
            status: selectedAppointment.status // Preserve server-managed status
          };
        }
      } else {
        updatedAppointment = {
          ...selectedAppointment,
          date: date,
          time: formattedTime,
          price: Number(price).toFixed(2),
          status: selectedAppointment.status // Preserve server-managed status
        };
      }

      setAppointments(prev =>
        prev.map(app => app.id === selectedAppointment.id ? updatedAppointment : app)
      );
      setShowUpdateModal(false);
      setSelectedAppointment(null);
      setUpdateFormData({ date: '', time: '', price: '', status: '' });
      showAlert('success', 'Appointment updated successfully');
      setTimeout(() => fetchAppointments(), 1000);
    } catch (error) {
      console.error('Update appointment error:', error);
      showAlert('error', error.message || 'Failed to update appointment.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async () => {
    if (!deleteAppointmentId || !isAuthenticated || !isValidUUID(user.id)) {
      showAlert('error', 'Invalid authentication or appointment ID.');
      return;
    }

    try {
      setLoading(true);
      showAlert('error', '');

      const response = await fetch(`${API_BASE_URL}/DoctorAppointmentOnlines/${deleteAppointmentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) throw new Error('Session expired. Please login again.');
        if (response.status === 403) throw new Error('Access denied. You do not have permission.');
        if (response.status === 404) throw new Error('Appointment not found.');
        throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
      }

      setAppointments(prev => prev.filter(app => app.id !== deleteAppointmentId));
      setShowDeleteModal(false);
      setDeleteAppointmentId(null);
      showAlert('success', 'Appointment deleted successfully');
    } catch (error) {
      console.error('Delete appointment error:', error);
      showAlert('error', error.message || 'Failed to delete appointment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id && !authLoading) {
      fetchAppointments();
    }
  }, [isAuthenticated, user?.id, authLoading, fetchAppointments]);

  const handleDeleteClick = (id) => {
    setDeleteAppointmentId(id);
    setShowDeleteModal(true);
  };

  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setUpdateFormData({
      date: appointment.date,
      time: appointment.time.split(':').length === 3 ? appointment.time.slice(0, 5) : appointment.time,
      price: appointment.price,
      status: appointment.status
    });
    setShowUpdateModal(true);
  };

  const handleNewAppointmentChange = (e) => {
    const { name, value } = e.target;
    setNewAppointmentData(prev => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? '' : Number(value) || 0) : value,
    }));
  };

  const handleUpdateAppointmentChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? '' : Number(value) || 0) : value,
    }));
  };

  const resetUpdateState = () => {
    setSelectedAppointment(null);
    setUpdateFormData({ date: '', time: '', price: '', status: '' });
    setShowUpdateModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    try {
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
      }
      return timeString;
    } catch (e) {
      return timeString;
    }
  };

  const LoadingSpinner = () => (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 1050 }}>
      <div className="bg-white p-4 rounded-3 d-flex flex-column align-items-center shadow-lg" style={{ minWidth: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted fw-semibold">Loading your appointments...</p>
      </div>
    </div>
  );

  if (authLoading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return (
      <div className="container-fluid p-5">
        <div className="alert alert-warning text-center rounded-pill py-4" role="alert">
          <h4 className="alert-heading fw-bold">Authentication Required</h4>
          <p className="mb-0">Please login to access the appointment management system.</p>
          <button className="btn btn-primary mt-3 rounded-pill px-4" onClick={() => window.location.href = '/login'}>
            <i className="bi bi-box-arrow-in-right me-2"></i> Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'Doctor' && user.Role !== 'Doctor') {
    return (
      <div className="container-fluid p-5">
        <div className="alert alert-danger text-center rounded-pill py-4" role="alert">
          <h4 className="alert-heading fw-bold">Access Denied</h4>
          <p className="mb-0">Only doctors can access the appointment management system.</p>
          <p className="mb-0">Your current role: <strong>{user.role || user.Role}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-3 shadow-sm">
            <div>
              <h1 className="text-primary fw-bold mb-0">Online Appointments</h1>
              <p className="text-muted mb-0">
                Welcome, Dr. <span className="fw-semibold text-dark">{user.name || user.email}</span>
              </p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-success rounded-pill px-4" onClick={() => setShowCreateModal(true)}>
                <i className="bi bi-plus-circle-fill me-2"></i> Add New Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 py-3" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3"></i>
            <div>{error}</div>
          </div>
          <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show rounded-3 py-3" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-3"></i>
            <div>{success}</div>
          </div>
          <button type="button" className="btn-close" onClick={() => setSuccess('')} aria-label="Close"></button>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-12">
        </div>
      </div>

      <div className="card shadow-lg border-0 rounded-3">
        <div className="card-header bg-white border-bottom rounded-top-3">
          <h2 className="h4 mb-0 text-primary fw-bold">My Appointments ({appointments.length})</h2>
        </div>
        <div className="card-body p-0">
          {loading && !appointments.length ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading appointments...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped mb-0 rounded-3 overflow-hidden">
                <thead className="table-light">
                  <tr>
                    <th className="bg-white"><i className="bi bi-calendar-event me-2"></i>Date</th>
                    <th className="bg-white"><i className="bi bi-clock me-2"></i>Time</th>
                    <th className="bg-white">Price</th>
                    <th className="bg-white"><i className="bi bi-info-circle me-2"></i>Status</th>
                    <th className="bg-white"><i className="bi bi-gear me-2"></i>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <i className="bi bi-calendar-x display-1 text-muted"></i>
                        <h4 className="mt-3">No appointments</h4>
                        <p className="text-muted">Create your first appointment to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    appointments.map(appointment => (
                      <tr key={appointment.id} className="align-middle">
                        <td className="fw-medium">{formatDate(appointment.date)}</td>
                        <td>{formatTime(appointment.time)}</td>
                        <td>{appointment.price}</td>
                        <td>
                          <span className={`badge ${appointment.status === 'Available' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill px-2 py-1`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-outline-primary btn-sm rounded-circle"
                              onClick={() => handleEditClick(appointment)}
                              title="Update Appointment"
                              disabled={loading}
                              style={{ width: '36px', height: '36px' }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm rounded-circle"
                              onClick={() => handleDeleteClick(appointment.id)}
                              title="Delete Appointment"
                              disabled={appointment.status !== 'Available' || loading}
                              style={{ width: '36px', height: '36px' }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg rounded-4">
              <form onSubmit={createAppointment}>
                <div className="modal-header bg-gradient bg-primary text-white rounded-top-4">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-calendar-plus me-2"></i>
                    Create New Online Appointment
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <div className="form-floating">
                        <input
                          type="date"
                          name="date"
                          value={newAppointmentData.date}
                          onChange={handleNewAppointmentChange}
                          className="form-control border-2 shadow-sm"
                          min="2025-06-10"
                          required
                        />
                        <label className="form-label">
                          <i className="bi bi-calendar3 me-2"></i>
                          Appointment Date
                        </label>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="form-floating">
                        <input
                          type="time"
                          name="time"
                          value={newAppointmentData.time}
                          onChange={handleNewAppointmentChange}
                          className="form-control border-2 shadow-sm"
                          step="60"
                          required
                        />
                        <label className="form-label">
                          <i className="bi bi-clock me-2"></i>
                          Appointment Time
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <input
                          type="number"
                          name="price"
                          value={newAppointmentData.price}
                          onChange={handleNewAppointmentChange}
                          className="form-control border-2 shadow-sm"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          required
                        />
                        <label className="form-label">
                          Consultation EGP
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowCreateModal(false)}>
                    <i className="bi bi-x-circle me-2"></i>Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Create Appointment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedAppointment && (
        <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg rounded-4">
              <form onSubmit={updateAppointment}>
                <div className="modal-header bg-gradient bg-primary text-white rounded-top-4">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-pencil-square me-2"></i>
                    Update Appointment
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={resetUpdateState} aria-label="Close"></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <div className="form-floating">
                        <input
                          type="date"
                          name="date"
                          value={updateFormData.date}
                          onChange={handleUpdateAppointmentChange}
                          className="form-control border-2 shadow-sm"
                          min="2025-06-10"
                          required
                        />
                        <label className="form-label">
                          <i className="bi bi-calendar3 me-2"></i>
                          Appointment Date
                        </label>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="form-floating">
                        <input
                          type="time"
                          name="time"
                          value={updateFormData.time}
                          onChange={handleUpdateAppointmentChange}
                          className="form-control border-2 shadow-sm"
                          step="60"
                          required
                        />
                        <label className="form-label">
                          <i className="bi bi-clock me-2"></i>
                          Appointment Time
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <input
                          type="number"
                          name="price"
                          value={updateFormData.price}
                          onChange={handleUpdateAppointmentChange}
                          className="form-control border-2 shadow-sm"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          required
                        />
                        <label className="form-label">
                          Consultation EGP
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <select
                          name="status"
                          value={updateFormData.status}
                          onChange={handleUpdateAppointmentChange}
                          className="form-control border-2 shadow-sm"
                          disabled
                        >
                          <option value="Available">Available</option>
                          <option value="Booked">Booked</option>
                        </select>
                        <label className="form-label">
                          Status (read-only)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={resetUpdateState}>
                    <i className="bi bi-x-circle me-2"></i>Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update Appointment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg rounded-4">
              <div className="modal-header bg-gradient bg-danger text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Confirm Deletion
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body p-4 text-center">
                <div className="mb-3">
                  <i className="bi bi-trash3 text-danger" style={{ fontSize: '3rem' }}></i>
                </div>
                <p className="mb-0 fw-medium fs-5">Are you sure you want to delete this appointment?</p>
                <p className="text-muted mt-2">This action cannot be undone.</p>
              </div>
              <div className="modal-footer bg-light rounded-bottom-4">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowDeleteModal(false)}>
                  <i className="bi bi-x-circle me-2"></i>Cancel
                </button>
                <button type="button" className="btn btn-danger rounded-pill px-4" onClick={deleteAppointment} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash3 me-2"></i>
                      Delete Appointment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && appointments.length > 0 && <LoadingSpinner />}
    </div>
  );
};

export default AppointmentManagement;