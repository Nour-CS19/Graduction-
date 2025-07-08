import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck, faCalendar, faMapMarkerAlt, faUserNurse, faTasks, faUsers,
  faChartLine, faHandSparkles, faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { useAuth } from '../Pages/AuthPage';

const NurseDashboardHome = ({ user }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalAppointments: 0,
    activePlaces: 0,
    nursingServices: 0,
    pendingTasks: 0,
    totalPatients: 0,
    monthlyGrowth: '0%'
  });
  const [appointments, setAppointments] = useState([]);
  const [showCreateAppointment, setShowCreateAppointment] = useState(false);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    nurseNursingCityId: '',
    date: new Date(),
    time: '',
    isAvailable: true
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' }));
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const token = user?.token || localStorage.getItem('token') || null;
  const nurseId = user?.id || user?.Id || null;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getAuthHeaders = () => {
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };
  };

  const fetchProfilePhoto = async () => {
    if (!nurseId || !token) {
      return; // No action if not authenticated, no error set
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
      // No error message displayed, fallback to default avatar
    } finally {
      setPhotoLoading(false);
    }
  };

  const fetchCities = async () => {
    if (!nurseId || !token) {
      setError('User not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `https://physiocareapp.runasp.net/api/v1/NurseNursingCities/get-all-nurse-nursing-city/${nurseId}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch nursing cities. Status: ${res.status}. Message: ${text}`);
      }
      const data = await res.json();
      setCities(data || []);
    } catch (err) {
      console.error('Fetch cities error:', err);
      setError(err.message || 'Failed to load cities data.');
    }
  };

  const fetchDashboardStats = async () => {
    if (!nurseId || !token) {
      setError('User not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [appointmentsResponse, nursingCitiesResponse, nurseNursingsResponse] = await Promise.all([
        fetch(`https://physiocareapp.runasp.net/api/v1/PatientBookNurse/get-all-booking-for-nurse/${nurseId}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`https://physiocareapp.runasp.net/api/v1/NurseNursingCities/get-all-nurse-nursing-city/${nurseId}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`https://physiocareapp.runasp.net/api/v1/NurseNursings/get-all-nurse-nursing/${nurseId}`, {
          headers: getAuthHeaders(),
        }),
      ]);

      if (!appointmentsResponse.ok || !nursingCitiesResponse.ok || !nurseNursingsResponse.ok) {
        const text = await Promise.all([
          appointmentsResponse.ok ? '' : appointmentsResponse.text(),
          nursingCitiesResponse.ok ? '' : nursingCitiesResponse.text(),
          nurseNursingsResponse.ok ? '' : nurseNursingsResponse.text()
        ]);
        throw new Error(`Failed to fetch dashboard data. Status: ${[appointmentsResponse.status, nursingCitiesResponse.status, nurseNursingsResponse.status].join(', ')}. Messages: ${text.join(', ')}`);
      }

      const [appointmentsData, nursingCities, nurseNursings] = await Promise.all([
        appointmentsResponse.json(),
        nursingCitiesResponse.json(),
        nurseNursingsResponse.json()
      ]);

      if (appointmentsData.length === 0 && nursingCities.length === 0 && nurseNursings.length === 0) {
        setDashboardStats({
          totalAppointments: 0,
          activePlaces: 0,
          nursingServices: 0,
          pendingTasks: 0,
          totalPatients: 0,
          monthlyGrowth: '0%'
        });
        setAppointments([]);
      } else {
        setDashboardStats({
          totalAppointments: appointmentsData.length,
          activePlaces: nursingCities.length,
          nursingServices: nurseNursings.length,
          pendingTasks: 0,
          totalPatients: [...new Set(appointmentsData.map(a => a.patientId))].length,
          monthlyGrowth: '0%'
        });

        const todayDate = new Date().toISOString().split('T')[0];
        setAppointments(
          appointmentsData
            .filter(a => (a.date || '').split('T')[0] === todayDate)
            .map(a => ({
              id: a.appointmentId || a.bookingId,
              patientName: a.patientName,
              patientPhone: a.patientPhone,
              patientAddress: a.patientAddress,
              nursingName: a.nursingName,
              nursingDescription: a.nursingDescription,
              date: a.date.split('T')[0],
              time: a.time?.slice(0, 5),
              medicalCondition: a.medicalCondition,
              totalPrice: a.totalPrice,
            }))
        );
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (nurseId && token) {
      fetchProfilePhoto();
      fetchCities();
      fetchDashboardStats();
    } else {
      setError('User not authenticated. Please log in.');
      setLoading(false);
    }
  }, [nurseId, token]);

  const handleCreateAppointment = () => {
    setShowCreateAppointment(true);
    setFormData({
      nurseNursingCityId: '',
      date: new Date(),
      time: '',
      isAvailable: true
    });
    setFormError(null);
    setFormSuccess(null);
  };

  const handleCloseModal = () => {
    setShowCreateAppointment(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.nurseNursingCityId || !formData.date || !formData.time) {
      setFormError('Please fill in all required fields: Nursing Service City, Date, Time.');
      return;
    }

    try {
      const formDataPayload = new FormData();
      formDataPayload.append('NurseNursingCityId', formData.nurseNursingCityId);
      formDataPayload.append('IsAvailable', formData.isAvailable.toString());
      formDataPayload.append('Date', formData.date.toISOString().split('T')[0]);
      formDataPayload.append('Time', `${formData.time}:00`);

      const response = await fetch(
        'https://physiocareapp.runasp.net/api/v1/NurseAppointment/add-nurse-nursing-city-appointment',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formDataPayload,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create appointment. Status: ${response.status}. Message: ${text}`);
      }

      setFormSuccess('Appointment created successfully!');
      fetchDashboardStats();
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      console.error('Submit appointment error:', err);
      setFormError(err.message || 'Failed to create appointment.');
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center my-5">{error}</div>;
  }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(90deg, #009DA5 0%, #00b7c2 100%)',
        padding: '20px 30px',
        borderRadius: '12px',
        marginBottom: '25px',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,157,165,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '15px' }}>
            {photoLoading ? (
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-border spinner-border-sm text-white" />
              </div>
            ) : profilePhoto ? (
              <img src={profilePhoto} alt="Nurse Profile" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }} />
            ) : (
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: '2rem', color: '#fff', opacity: 0.75 }} />
              </div>
            )}
          </div>
          <div>
            <h2 style={{ margin: 0, fontWeight: '700', fontSize: '1.8rem' }}>
              Welcome, {user?.name || 'Fared Dom'}!
            </h2>
            <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>
              {user?.email || 'nurse55@gmail.com'}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
            {today}
          </p>
          <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>
            {currentTime}
          </p>
        </div>
      </div>

      <Row className="mb-4">
        {dashboardStats.totalAppointments === 0 &&
          dashboardStats.activePlaces === 0 &&
          dashboardStats.nursingServices === 0 &&
          dashboardStats.pendingTasks === 0 &&
          dashboardStats.totalPatients === 0 ? (
          <Col xs={12}>
            <div className="text-center my-5" style={{ color: '#718096' }}>No data available.</div>
          </Col>
        ) : (
          [
            { title: 'Total Appointments', value: dashboardStats.totalAppointments, icon: faCalendarCheck, color: '#009DA5', bg: '#e6f7f8' },
            { title: 'Active Places', value: dashboardStats.activePlaces, icon: faMapMarkerAlt, color: '#28a745', bg: '#e8f5e9' },
            { title: 'Nursing Services', value: dashboardStats.nursingServices, icon: faUserNurse, color: '#ffc107', bg: '#fff8e1' },
            { title: 'Pending Tasks', value: dashboardStats.pendingTasks, icon: faTasks, color: '#dc3545', bg: '#ffebee' },
            { title: 'Total Patients', value: dashboardStats.totalPatients, icon: faUsers, color: '#6f42c1', bg: '#f3e5f5' },
            { title: 'Monthly Growth', value: dashboardStats.monthlyGrowth, icon: faChartLine, color: '#fd7e14', bg: '#fff3e0' },
          ].map((stat, index) => (
            <Col key={index} lg={4} md={6} className="mb-3">
              <Card style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%', borderRadius: '12px', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <Card.Body className="d-flex align-items-center">
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      backgroundColor: stat.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1.2rem'
                    }}
                  >
                    <FontAwesomeIcon
                      icon={stat.icon}
                      style={{ fontSize: '1.6rem', color: stat.color }}
                    />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#2d3748' }}>
                      {stat.value}
                    </h3>
                    <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem', fontWeight: '500' }}>
                      {stat.title}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%', borderRadius: '12px' }}>
            <Card.Header style={{ backgroundColor: '#ffffff', border: 'none', padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0, color: '#2d3748', fontWeight: '600' }}>Calendar</h5>
              <Button
                variant="primary"
                style={{ backgroundColor: '#009DA5', borderColor: '#009DA5', padding: '8px 16px', fontSize: '0.95rem' }}
                onClick={handleCreateAppointment}
              >
                Create Appointment
              </Button>
            </Card.Header>
            <Card.Body style={{ padding: '1.5rem' }}>
              <Calendar
                onChange={handleDateChange}
                value={formData.date}
                minDate={new Date()}
                tileClassName={({ date }) => {
                  const dateStr = date.toISOString().split('T')[0];
                  return appointments.some(a => a.date === dateStr) ? 'highlight' : null;
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%', borderRadius: '12px' }}>
            <Card.Header style={{ backgroundColor: '#ffffff', border: 'none', padding: '1.2rem 1.5rem' }}>
              <h5 style={{ margin: 0, color: '#2d3748', fontWeight: '600' }}>Today's Appointments</h5>
            </Card.Header>
            <Card.Body style={{ padding: '0' }}>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th style={{ color: '#2d3748', fontWeight: '600', padding: '1rem' }}>Patient</th>
                      <th style={{ color: '#2d3748', fontWeight: '600', padding: '1rem' }}>Time</th>
                      <th style={{ color: '#2d3748', fontWeight: '600', padding: '1rem' }}>Service</th>
                      <th style={{ color: '#2d3748', fontWeight: '600', padding: '1rem' }}>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length > 0 ? (
                      appointments.map(appointment => (
                        <tr key={appointment.id} style={{ transition: 'background-color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={{ padding: '1rem', color: '#2d3748' }}>{appointment.patientName}</td>
                          <td style={{ padding: '1rem', color: '#718096' }}>{appointment.time}</td>
                          <td style={{ padding: '1rem', color: '#718096' }}>{appointment.nursingName}</td>
                          <td style={{ padding: '1rem', color: '#718096' }}>📍 {appointment.patientAddress}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: '#718096' }}>
                          No data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showCreateAppointment} onHide={handleCloseModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <Modal.Title style={{ color: '#2d3748', fontWeight: '600' }}>Create New Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          {formError && <Alert variant="danger" onClose={() => setFormError(null)} dismissible>{formError}</Alert>}
          {formSuccess && <Alert variant="success" onClose={() => setFormSuccess(null)} dismissible>{formSuccess}</Alert>}
          <Form onSubmit={handleSubmitAppointment}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#2d3748', fontWeight: '500' }}>Nursing Service City</Form.Label>
              <Form.Select
                name="nurseNursingCityId"
                value={formData.nurseNursingCityId}
                onChange={handleFormChange}
                required
                style={{ borderRadius: '8px', padding: '10px' }}
              >
                <option value="">-- Select --</option>
                {cities.length > 0 ? (
                  cities.map(city => (
                    <option key={city.id} value={city.id}>{city.nursingName} - {city.cityName}</option>
                  ))
                ) : (
                  <option value="" disabled>No data available</option>
                )}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#2d3748', fontWeight: '500' }}>Availability</Form.Label>
              <div className="form-check">
                <Form.Check
                  type="radio"
                  id="available"
                  label="Available"
                  checked={formData.isAvailable}
                  onChange={() => setFormData(prev => ({ ...prev, isAvailable: true }))}
                />
              </div>
              <div className="form-check">
                <Form.Check
                  type="radio"
                  id="notAvailable"
                  label="Not Available"
                  checked={!formData.isAvailable}
                  onChange={() => setFormData(prev => ({ ...prev, isAvailable: false }))}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#2d3748', fontWeight: '500' }}>Date</Form.Label>
              <Calendar
                onChange={handleDateChange}
                value={formData.date}
                minDate={new Date()}
                style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#2d3748', fontWeight: '500' }}>Time</Form.Label>
              <Form.Control
                type="time"
                name="time"
                value={formData.time}
                onChange={handleFormChange}
                required
                style={{ borderRadius: '8px', padding: '10px' }}
              />
            </Form.Group>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button
                variant="outline-secondary"
                onClick={handleCloseModal}
                style={{ borderRadius: '8px', padding: '8px 16px' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                style={{ backgroundColor: '#009DA5', borderColor: '#009DA5', borderRadius: '8px', padding: '8px 16px' }}
              >
                Create
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style>
        {`
          .highlight {
            background-color: #e6f7f8 !important;
            border-radius: 4px;
          }
          .react-calendar {
            border: none !important;
            width: 100% !important;
            font-family: 'Inter', sans-serif !important;
          }
          .react-calendar__tile--active {
            background: #009DA5 !important;
            color: white !important;
            border-radius: 4px;
          }
        `}
      </style>
    </div>
  );
};

export default NurseDashboardHome;