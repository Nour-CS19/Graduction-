import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://physiocareapp.runasp.net/api/v1/DoctorAppointment';

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showTomorrow, setShowTomorrow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form data structure matching API requirements
  const [formData, setFormData] = useState({
    typeService: '',
    status: 'Scheduled',
    date: '',
    time: '',
    doctorsID: '' // UUID for doctor
  });

  // Fetch all appointments and doctors on component mount
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  // Fetch Appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/GetAll`);
      setAppointments(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch appointments: ' + err.message);
      setLoading(false);
    }
  };

  // Fetch Doctors (assuming there's an endpoint for this)
  const fetchDoctors = async () => {
    try {
      // Update this URL to match your actual doctors endpoint
      const response = await axios.get('https://physiocareapp.runasp.net/api/v1/Doctors/GetAll');
      setDoctors(response.data);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    }
  };

  // Filter for tomorrow's appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const filteredAppointments = showTomorrow
    ? appointments.filter((a) => a.date === tomorrowStr)
    : appointments;

  // Form input handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create Appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.typeService || !formData.date || !formData.time || !formData.doctorsID) {
        throw new Error('Please fill in all required fields');
      }

      // Create appointment
      await axios.post(`${API_BASE_URL}/CreateAppointment`, formData);
      
      // Refresh appointments
      await fetchAppointments();

      // Reset form
      setFormData({
        typeService: '',
        status: 'Scheduled',
        date: '',
        time: '',
        doctorsID: ''
      });

      setShowModal(false);
      setLoading(false);
    } catch (err) {
      setError('Appointment Creation Failed: ' + err.message);
      setLoading(false);
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/DeleteAppointment`, { 
        data: { id } 
      });
      
      // Refresh appointments
      await fetchAppointments();
    } catch (err) {
      setError('Failed to delete appointment: ' + err.message);
    }
  };

  return (
    <div className="container-fluid">
      {/* Error Handling */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Appointments Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Manage Appointments</h2>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => setShowTomorrow(!showTomorrow)}
          >
            {showTomorrow ? 'All Appointments' : 'Tomorrow\'s Appointments'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowModal(true)}
          >
            + New Appointment
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-light">
                <tr>
                  <th>Service Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No Appointments Found
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>{appt.typeService}</td>
                      <td>
                        <span className={`badge ${
                          appt.status === 'Scheduled' ? 'bg-success' : 
                          appt.status === 'Cancelled' ? 'bg-danger' : 'bg-warning'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td>{appt.date}</td>
                      <td>{appt.time}</td>
                      <td>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteAppointment(appt.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Book New Appointment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Service Type */}
                  <div className="mb-3">
                    <label className="form-label">Service Type</label>
                    <input
                      type="text"
                      className="form-control"
                      name="typeService"
                      value={formData.typeService}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Doctor Selection */}
                  <div className="mb-3">
                    <label className="form-label">Select Doctor</label>
                    <select
                      className="form-select"
                      name="doctorsID"
                      value={formData.doctorsID}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose a Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date and Time */}
                  <div className="row">
                    <div className="col-6 mb-3">
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
                    <div className="col-6 mb-3">
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
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointment;