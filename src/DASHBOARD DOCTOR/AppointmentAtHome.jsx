import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../Pages/AuthPage';
import { Container, Row, Col, Card, Button, Alert, Modal, Form, Spinner, Badge, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const DoctorAtHomeAppointments = () => {
  const { user } = useAuth();
  const API_BASE_URL = 'https://physiocareapp.runasp.net/api/v1';

  // State Management
  const [appointments, setAppointments] = useState([]);
  const [doctorCities, setDoctorCities] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedDoctorCity, setSelectedDoctorCity] = useState('');
  const [formData, setFormData] = useState({
    Date: '',
    Time: '',
    Price: '',
  });
  const [loading, setLoading] = useState({
    initial: false,
    create: false,
    update: false,
    delete: false,
    doctorCities: false,
    cities: false,
  });
  const [alert, setAlert] = useState({ type: '', message: '', visible: false });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const selectedAppointmentRef = useRef(null);

  // Authentication Headers
  const getAuthHeaders = useCallback(() => {
    const token = user?.accessToken;
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };
  }, [user?.accessToken]);

  // Utility Functions
  const showAlert = useCallback((type, message, duration = 5000) => {
    console.log(`Alert: [${type}] ${message}`);
    setAlert({ type, message, visible: true });
    setTimeout(() => setAlert((prev) => ({ ...prev, visible: false })), duration);
  }, []);

  const resetForm = () => {
    setFormData({ Date: '', Time: '', Price: '' });
    setSelectedAppointment(null);
    selectedAppointmentRef.current = null;
  };

  const normalizeData = (data) => {
    if (!data) return {};
    const normalized = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      normalized[lowerKey] = value;
      if (lowerKey === 'appointmentathomeid' || lowerKey === 'appointmentid' || lowerKey === 'id') {
        normalized.appointmentId = value;
      }
      if (lowerKey === 'cityid' || lowerKey === 'cityId') {
        normalized.cityId = value;
      }
      if (lowerKey === 'state') {
        normalized.state = value;
        normalized.isbooked = typeof value === 'string' && value.toLowerCase() === 'booked';
      }
      if (lowerKey === 'name' || lowerKey === 'cityname') {
        normalized.cityname = value;
      }
    }
    console.log('Normalized appointment:', normalized);
    return normalized;
  };

  const isCityInServiceAreas = (cityId) => {
    if (!cityId || !doctorCities.length) return false;
    return doctorCities.some((dc) => (dc.cityId || dc.id) === cityId);
  };

  const isValidUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return typeof str === 'string' && uuidRegex.test(str);
  };

  // Validation
  const validateFormData = (data) => {
    const errors = [];
    if (!data.Date) errors.push('Date is required');
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.Date)) errors.push('Invalid date format (use YYYY-MM-DD)');
    if (!data.Time) errors.push('Time is required');
    else if (!/^\d{2}:\d{2}(?::\d{2})?$/.test(data.Time)) errors.push('Invalid time format (use HH:mm or HH:mm:ss)');
    const price = parseFloat(data.Price);
    if (isNaN(price) || price <= 0) errors.push('Price must be a number greater than 0');
    try {
      const selectedDateTime = new Date(`${data.Date}T${formatTimeForAPI(data.Time)}Z`);
      if (selectedDateTime <= new Date()) errors.push('Appointment must be in the future');
    } catch {
      errors.push('Invalid date or time format');
    }
    return errors;
  };

  // Time Formatting
  const formatTimeForAPI = (time) => {
    if (!time) return time;
    const parts = time.split(':');
    return parts.length === 2 ? `${time}:00` : time;
  };

  const formatTimeForDisplay = (time) => {
    if (!time) return 'N/A';
    try {
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return time;
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
      return time;
    }
  };

  // API Calls
  const fetchCities = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, cities: true }));
      console.log('Fetching cities...');
      const response = await fetch(`${API_BASE_URL}/Cities/GetAll`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      console.log(`Cities response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Cities error response: ${errorText}`);
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
        } else if (response.status === 404) {
          setCities([]);
          showAlert('info', 'No cities found.');
          return;
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to access cities.');
        }
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      const normalizedCities = Array.isArray(data)
        ? data.map(normalizeData).filter((city) => isValidUUID(city.id || city.cityId))
        : [];
      console.log('Normalized cities:', normalizedCities);
      setCities(normalizedCities);
      if (normalizedCities.length === 0) {
        showAlert('warning', 'No cities found. Contact support.');
      } else {
        showAlert('success', `Loaded ${normalizedCities.length} city(ies)`);
      }
    } catch (error) {
      console.error('Fetch cities error:', error);
      showAlert('danger', `Failed to load cities: ${error.message}`);
      setCities([]);
    } finally {
      setLoading((prev) => ({ ...prev, cities: false }));
    }
  }, [getAuthHeaders, showAlert]);

  const fetchDoctorCities = useCallback(async () => {
    if (!user?.id || !isValidUUID(user.id)) {
      console.warn(`Skipping fetchDoctorCities: Invalid or missing user ID: ${user?.id || 'undefined'}`);
      showAlert('danger', 'Invalid or missing user ID. Please log in.');
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, doctorCities: true }));
      console.log(`Fetching doctor cities for doctorId: ${user.id}`);
      const response = await fetch(
        `${API_BASE_URL}/DoctorCityAtHomes/Get-All-Doctor-Cities?doctorId=${user.id}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );
      console.log(`Doctor cities response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Doctor cities error response: ${errorText}`);
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
        } else if (response.status === 404) {
          setDoctorCities([]);
          setSelectedDoctorCity('');
          showAlert('info', 'No service areas found. Add cities in your profile settings.');
          return;
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to access service areas.');
        }
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      const normalizedCities = Array.isArray(data)
        ? data.map(normalizeData).filter((dc) => isValidUUID(dc.id || dc.cityId))
        : [];
      console.log('Normalized doctor cities:', normalizedCities);

      setDoctorCities(normalizedCities);
      if (normalizedCities.length > 0) {
        setSelectedDoctorCity(normalizedCities[0].id);
        showAlert('success', `Loaded ${normalizedCities.length} service area(s)`);
      } else {
        setSelectedDoctorCity('');
        showAlert('info', 'No service areas found. Add cities in your profile settings.');
      }
    } catch (error) {
      console.error('Fetch doctor cities error:', error);
      showAlert('danger', `Failed to load service areas: ${error.message}`);
      setDoctorCities([]);
      setSelectedDoctorCity('');
    } finally {
      setLoading((prev) => ({ ...prev, doctorCities: false }));
    }
  }, [user?.id, getAuthHeaders, showAlert]);

  const fetchAppointments = useCallback(async () => {
    if (!selectedDoctorCity || !isValidUUID(selectedDoctorCity)) {
      console.warn(`Skipping fetchAppointments: Invalid or missing selectedDoctorCity: ${selectedDoctorCity}`);
      setAppointments([]);
      showAlert('warning', 'Please select a valid service area.');
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, initial: true }));
      console.log(`Fetching appointments for doctorCityId: ${selectedDoctorCity}`);
      const response = await fetch(
        `${API_BASE_URL}/DoctorAppointmentAtHomes/GetAll/${selectedDoctorCity}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );
      console.log(`Appointments response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Appointments error response: ${errorText}`);
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
        } else if (response.status === 404) {
          console.log('No appointments found (404 response)');
          setAppointments([]);
          showAlert('info', 'No appointments found for this service area.');
          return;
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to access appointments.');
        }
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw appointments response:', data);
      const normalizedAppointments = Array.isArray(data)
        ? data.map(normalizeData).filter((apt) => apt.date && apt.time)
        : [];
      console.log('Normalized appointments:', normalizedAppointments);

      setAppointments(normalizedAppointments);
      showAlert('success', normalizedAppointments.length > 0
        ? `${normalizedAppointments.length} appointment(s) loaded`
        : 'No appointments found for this service area.');
    } catch (error) {
      console.error('Fetch appointments error:', error);
      showAlert('danger', `Failed to load appointments: ${error.message}`);
      setAppointments([]);
    } finally {
      setLoading((prev) => ({ ...prev, initial: false }));
    }
  }, [selectedDoctorCity, getAuthHeaders, showAlert]);

  const handleCreate = async () => {
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      showAlert('danger', validationErrors.join(', '));
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, create: true }));
      const formDataPayload = new FormData();
      formDataPayload.append('DoctorId', user.id);
      formDataPayload.append('CityId', selectedDoctorCity);
      formDataPayload.append('Date', formData.Date);
      formDataPayload.append('Time', formatTimeForAPI(formData.Time));
      formDataPayload.append('Price', parseFloat(formData.Price).toString());

      console.log('Creating appointment...');
      for (const [key, value] of formDataPayload.entries()) {
        console.log(`FormData [${key}]: ${value}`);
      }

      const response = await fetch(`${API_BASE_URL}/DoctorAppointmentAtHomes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formDataPayload,
      });
      console.log(`Create appointment response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Create appointment error response: ${errorText}`);
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP error! status: ${response.status}` };
        }
        if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid appointment data. Please check your inputs.');
        } else if (response.status === 401) {
          throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to create appointments.');
        } else if (response.status === 409) {
          throw new Error('An appointment already exists at this date and time.');
        } else if (errorData.message?.includes('FOREIGN KEY constraint')) {
          throw new Error('Selected city is not in your service areas.');
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Create appointment response:', data);

      showAlert('success', 'Appointment created successfully!');
      setShowCreateModal(false);
      resetForm();
      await fetchAppointments();
    } catch (error) {
      console.error('Create appointment error:', error);
      showAlert('danger', `Failed to create appointment: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, create: false }));
    }
  };

  const handleUpdate = async () => {
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      showAlert('danger', validationErrors.join(', '));
      return;
    }

    if (!selectedAppointment || !selectedAppointment.appointmentId || !isValidUUID(selectedAppointment.appointmentId)) {
      showAlert('danger', 'No valid appointment selected for update or invalid appointment ID');
      console.error('Selected appointment or appointmentId is invalid during update:', selectedAppointment);
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, update: true }));
      const updateData = {
        id: selectedAppointment.appointmentId,
        price: parseFloat(formData.Price),
        date: formData.Date,
        time: formatTimeForAPI(formData.Time),
      };

      console.log(`Updating appointment with payload:`, updateData);

      const response = await fetch(`${API_BASE_URL}/DoctorAppointmentAtHomes`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      console.log(`Update appointment response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Update appointment error response: ${errorText}`);
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP error! status: ${response.status}` };
        }
        if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid appointment data. Please check your inputs.');
        } else if (response.status === 401) {
          throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to update appointments.');
        } else if (response.status === 404) {
          throw new Error(`Appointment with ID ${selectedAppointment.appointmentId} not found.`);
        } else if (response.status === 409) {
          throw new Error('An appointment already exists at this date and time.');
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Update appointment response:', data);

      showAlert('success', 'Appointment updated successfully!');
      setShowUpdateModal(false);
      resetForm();
      await fetchAppointments();
    } catch (error) {
      console.error('Update appointment error:', error);
      showAlert('danger', `Failed to update appointment: ${error.message}. Check console logs for details.`);
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const handleDelete = async () => {
    if (!selectedAppointment || !isValidUUID(selectedAppointment.appointmentId)) {
      showAlert('danger', 'No valid appointment selected for deletion');
      console.error('Selected appointment or appointmentId is invalid during delete:', selectedAppointment);
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, delete: true }));
      console.log(`Deleting appointment with appointmentId: ${selectedAppointment.appointmentId}...`);
      const response = await fetch(
        `${API_BASE_URL}/DoctorAppointmentAtHomes?appointmentId=${selectedAppointment.appointmentId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      console.log(`Delete appointment response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Delete appointment error response: ${errorText}`);
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP error! status: ${response.status}` };
        }
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to delete appointments.');
        } else if (response.status === 404) {
          throw new Error('Appointment not found.');
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      showAlert('success', 'Appointment deleted successfully!');
      setShowDeleteModal(false);
      setSelectedAppointment(null);
      selectedAppointmentRef.current = null;
      await fetchAppointments();
    } catch (error) {
      console.error('Delete appointment error:', error);
      showAlert('danger', `Failed to delete appointment: ${error.message}. Check console logs for details.`);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoctorCityChange = (e) => {
    setSelectedDoctorCity(e.target.value);
  };

  // Effect Hooks
  useEffect(() => {
    console.log('useEffect: Fetching cities');
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (user?.id && isValidUUID(user.id)) {
      console.log('useEffect: Fetching doctor cities for user.id:', user.id);
      fetchDoctorCities();
    } else {
      console.warn('useEffect: Skipping fetchDoctorCities due to invalid user.id:', user?.id);
      showAlert('danger', 'User not authenticated. Please log in.');
    }
  }, [user?.id, fetchDoctorCities, showAlert]);

  useEffect(() => {
    if (selectedDoctorCity && isValidUUID(selectedDoctorCity)) {
      console.log('useEffect: Fetching appointments for selectedDoctorCity:', selectedDoctorCity);
      fetchAppointments();
    } else {
      console.log('useEffect: Skipping fetchAppointments, selectedDoctorCity:', selectedDoctorCity);
      setAppointments([]);
    }
  }, [selectedDoctorCity, fetchAppointments]);

  useEffect(() => {
    console.log('Selected appointment updated:', selectedAppointment);
    selectedAppointmentRef.current = selectedAppointment;
  }, [selectedAppointment]);

  // Formatters
  const formatDateTime = (date, time) => {
    try {
      const dateObj = new Date(`${date}T${formatTimeForAPI(time)}Z`);
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date/time format: ${date} ${time}`);
        return `${date} at ${formatTimeForDisplay(time)}`;
      }
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.warn(`Error formatting date/time: ${date} ${time}`, error);
      return `${date} at ${formatTimeForDisplay(time)}`;
    }
  };

  const getCityName = (cityId) => {
    if (!cityId) return 'Unknown City';
    const city = cities.find((c) => (c.id || c.cityId) === cityId);
    return city?.cityname || city?.name || `City ${cityId}`;
  };

  const getDoctorCityName = (doctorCityId) => {
    if (!doctorCityId) return 'Unknown Area';
    const doctorCity = doctorCities.find((dc) => dc.id === doctorCityId);
    if (!doctorCity) return `Service Area ${doctorCityId}`;
    const cityId = doctorCity.cityId || doctorCity.id;
    return getCityName(cityId);
  };

  const canCreateAppointment = () => cities.length > 0 && !loading.cities && doctorCities.length > 0;

  return (
    <Container fluid className="py-4">
      <Row>
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h3 mb-0 text-primary">
              <i className="bi bi-house-heart-fill me-2" />
              At-Home Appointments
            </h2>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              disabled={loading.create || !canCreateAppointment()}
              aria-label="Add new appointment"
            >
              <i className="bi bi-plus-lg me-2" />
              Add Appointment
            </Button>
          </div>

          {alert.visible && (
            <Alert
              variant={alert.type}
              dismissible
              onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
              className="mb-4"
            >
              {alert.message}
            </Alert>
          )}

          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>Select Your Service Area</Card.Title>
              <p className="text-muted mb-3">Choose a service area to view and manage appointments</p>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Service Area</Form.Label>
                    {loading.doctorCities ? (
                      <div className="text-center">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Loading service areas...
                      </div>
                    ) : doctorCities.length > 0 ? (
                      <Form.Select
                        value={selectedDoctorCity}
                        onChange={handleDoctorCityChange}
                        aria-label="Select service area"
                      >
                        <option value="">Select a service area...</option>
                        {doctorCities.map((dc) => (
                          <option key={dc.id} value={dc.id}>
                            {getDoctorCityName(dc.id)}
                          </option>
                        ))}
                      </Form.Select>
                    ) : (
                      <Alert variant="info" className="mb-0">
                        <i className="bi bi-info-circle me-2" />
                        No service areas found. Add service areas in your profile settings to manage appointments.
                      </Alert>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {loading.initial && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading appointments...</p>
            </div>
          )}

          {!loading.initial && selectedDoctorCity && (
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <Card.Title className="mb-0">
                  Your At-Home Appointments ({appointments.length})
                </Card.Title>
              </Card.Header>
              <Card.Body>
                {appointments.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-calendar-x display-4 text-muted" />
                    <h4 className="mt-3">No appointments scheduled</h4>
                    <p className="text-muted">Create your first at-home appointment to get started.</p>
                    <Button
                      variant="primary"
                      onClick={() => setShowCreateModal(true)}
                      disabled={loading.create || !canCreateAppointment()}
                    >
                      <i className="bi bi-plus-lg me-2" />
                      Add Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Date & Time</th>
                          <th>City</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appointment) => (
                          <tr key={appointment.appointmentId || Math.random().toString()}>
                            <td>
                              <i className="bi bi-calendar-event text-primary me-2" />
                              {formatDateTime(appointment.date, appointment.time)}
                            </td>
                            <td>
                              <i className="bi bi-geo-alt text-primary me-2" />
                              {getCityName(appointment.cityId)}
                            </td>
                            <td>
                              <Badge bg="success">{appointment.price || 'N/A'} EGP</Badge>
                            </td>
                            <td>
                              <Badge bg={appointment.isbooked ? 'warning' : 'primary'}>
                                {appointment.state || (appointment.isbooked ? 'Booked' : 'Available')}
                              </Badge>
                            </td>
                            <td>
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  console.log('Selecting appointment for update:', appointment);
                                  setSelectedAppointment({ ...appointment });
                                  selectedAppointmentRef.current = { ...appointment };
                                  setFormData({
                                    Date: appointment.date || '',
                                    Time: appointment.time ? appointment.time.split(':').slice(0, 2).join(':') : '',
                                    Price: appointment.price ? appointment.price.toString() : '',
                                  });
                                  setShowUpdateModal(true);
                                }}
                                disabled={loading.update || appointment.isbooked}
                                aria-label="Edit appointment"
                              >
                                <i className="bi bi-pencil" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  console.log('Selecting appointment for delete:', appointment);
                                  setSelectedAppointment({ ...appointment });
                                  selectedAppointmentRef.current = { ...appointment };
                                  setShowDeleteModal(true);
                                }}
                                disabled={loading.delete || appointment.isbooked}
                                aria-label="Delete appointment"
                              >
                                <i className="bi bi-trash" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New At-Home Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
            <Form.Group className="mb-3">
              <Form.Label>City <span className="text-danger">*</span></Form.Label>
              {loading.cities ? (
                <div className="text-center">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Loading cities...
                </div>
              ) : cities.length > 0 ? (
                <>
                  <Form.Select
                    name="CityId"
                    value={selectedDoctorCity}
                    onChange={handleDoctorCityChange}
                    required
                    aria-label="Select city"
                  >
                    <option value="">Select a city...</option>
                    {cities
                      .filter((city) => isCityInServiceAreas(city.id || city.cityId))
                      .map((city) => {
                        const cityId = city.id || city.cityId;
                        const cityName = city.cityname || city.name || `City ${cityId}`;
                        return (
                          <option key={cityId} value={cityId}>
                            {cityName}
                          </option>
                        );
                      })}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Only cities in your service areas are shown.
                  </Form.Text>
                </>
              ) : (
                <Alert variant="info" className="mb-0">
                  <i className="bi bi-info-circle me-2" />
                  No cities available. Contact support or add service areas in your profile settings.
                </Alert>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                name="Date"
                value={formData.Date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                aria-label="Select appointment date"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Time <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="time"
                name="Time"
                value={formData.Time}
                onChange={handleInputChange}
                step="1800"
                required
                aria-label="Select appointment time"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price (EGP) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="Price"
                value={formData.Price}
                onChange={handleInputChange}
                min="1"
                step="0.01"
                required
                placeholder="Enter price in EGP"
                aria-label="Enter appointment price"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            disabled={loading.create}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={loading.create}
          >
            {loading.create ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              <>
                <i className="bi bi-plus-lg me-2" />
                Create Appointment
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showUpdateModal}
        onHide={() => {
          setShowUpdateModal(false);
          resetForm();
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Date <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                name="Date"
                value={formData.Date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                aria-label="Select appointment date"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Time <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="time"
                name="Time"
                value={formData.Time}
                onChange={handleInputChange}
                step="1800"
                required
                aria-label="Select appointment time"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price (EGP) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="Price"
                value={formData.Price}
                onChange={handleInputChange}
                min="1"
                step="0.01"
                required
                placeholder="Enter price in EGP"
                aria-label="Enter appointment price"
              />
            </Form.Group>
            <Form.Group className="mb-3" hidden>
              <Form.Label>Appointment ID</Form.Label>
              <Form.Control value={selectedAppointment?.appointmentId || selectedAppointmentRef.current?.appointmentId || 'N/A'} readOnly />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowUpdateModal(false);
              resetForm();
            }}
            disabled={loading.update}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleUpdate}
            disabled={loading.update}
          >
            {loading.update ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2" />
                Update Appointment
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedAppointment(null);
          selectedAppointmentRef.current = null;
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle me-2" />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment ? (
            <div>
              <p className="mb-3">Are you sure you want to delete this appointment?</p>
              <div className="bg-light p-3 rounded">
                <div className="row">
                  <div className="col-6">
                    <strong>Date & Time:</strong>
                  </div>
                  <div className="col-6">
                    {formatDateTime(selectedAppointment.date, selectedAppointment.time)}
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-6">
                    <strong>City:</strong>
                  </div>
                  <div className="col-6">
                    {getCityName(selectedAppointment.cityId)}
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-6">
                    <strong>Price:</strong>
                  </div>
                  <div className="col-6">
                    {selectedAppointment.price || 'N/A'} EGP
                  </div>
                </div>
              </div>
              <Alert variant="warning" className="mt-3 mb-0">
                <i className="bi bi-exclamation-triangle me-2" />
                This action cannot be undone.
              </Alert>
            </div>
          ) : (
            <p>Loading appointment details...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedAppointment(null);
              selectedAppointmentRef.current = null;
            }}
            disabled={loading.delete}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading.delete}
          >
            {loading.delete ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2" />
                Delete Appointment
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DoctorAtHomeAppointments;