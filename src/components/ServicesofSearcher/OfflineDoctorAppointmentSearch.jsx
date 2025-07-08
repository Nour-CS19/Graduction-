import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function AtHomeConsultation() {
  // States
  const [step, setStep] = useState(4); // Starting from step 4 (Select Appointment)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor] = useState({
    id: 1,
    doctorClinicId: 'clinic123',
    fullName: 'Ahmed Hassan',
    phoneNumber: '+201234567890',
    address: 'Cairo Medical Center',
    experienceYears: 10,
    evaluation: 4.8,
    imageUrl: null,
    specialty: 'Cardiology',
    isAvailable: true
  });
  const [selectedSpecializationName] = useState('Cardiology');
  const [selectedCityName] = useState('Cairo');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookFormData, setBookFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    medicalCondition: '',
    address: '',
    paymentImage: null,
  });
  const [formErrors, setFormErrors] = useState({});

  // Constants
  const PATIENT_ID = 'bfed4d32-601f-4142-dbbe-08dd91940729';
  const API_BASE_URL = 'https://physiocareapp.runasp.net/api/v1';

  const validateForm = () => {
    const errors = {};
    const { name, phoneNumber, email, medicalCondition, address, paymentImage } = bookFormData;

    if (!name.trim()) errors.name = 'Name is required';
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?\d{10,15}$/.test(phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Invalid phone number format';
    }
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = 'Invalid email address format';
    }
    if (!medicalCondition.trim()) errors.medicalCondition = 'Medical condition is required';
    if (!address.trim()) errors.address = 'Address is required';
    if (!paymentImage) errors.paymentImage = 'Payment proof is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch appointments on component mount
  useEffect(() => {
    if (selectedDoctor?.doctorClinicId) {
      fetchAppointments(selectedDoctor.doctorClinicId);
    }
  }, []);

  const fetchAppointments = async (doctorClinicId) => {
    if (!doctorClinicId) {
      setError('Doctor clinic ID is missing. Please select another doctor.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setAppointments([]);

      const response = await fetch(`${API_BASE_URL}/DoctorAppointmentAtHomes/GetAll/${doctorClinicId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format: Expected an array of appointments');
      }

      if (data.length === 0) {
        setError('No available appointments for this doctor in the selected city.');
        setLoading(false);
        return;
      }

      const normalizedAppointments = data.map((appointment) => {
        const appointmentId = appointment.Id || appointment.id || appointment.appointmentAtHomeId;
        if (!appointmentId) {
          console.warn('Appointment missing valid ID:', appointment);
          return null;
        }
        return {
          id: appointmentId,
          doctorId: appointment.doctorId || appointment.drId || appointment.DoctorId,
          cityId: appointment.cityId || appointment.CityId,
          date: appointment.date || appointment.Date || appointment.appointmentDate || 'N/A',
          time: appointment.time || appointment.Time || appointment.appointmentTime || 'N/A',
          price: appointment.price !== undefined ? appointment.price : appointment.Price || 0.0,
        };
      });

      const validAppointments = normalizedAppointments.filter((appt) => appt !== null && appt.id);
      if (validAppointments.length === 0) {
        setError('No valid appointments found. Please try another doctor.');
        setAppointments([]);
        setLoading(false);
        return;
      }

      setAppointments(validAppointments);
    } catch (error) {
      const errorMessage = error.message || 'Failed to load appointments.';
      if (error.message.includes('500')) {
        setError('An internal server error occurred. Please try again later or contact support.');
      } else {
        setError(errorMessage);
      }
      console.error('Fetch Appointments Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation Handlers
  const handleNext = async () => {
    setError('');
    if (step === 4) {
      if (!selectedAppointment) {
        setError('Please select an appointment.');
        return;
      }
      setStep(5);
    }
  };

  const handleBack = () => {
    setError('');
    if (step === 5) {
      setSelectedAppointment(null);
      setStep(4);
    }
  };

  // Handler Functions
  const handleAppointmentSelect = (appointment) => {
    if (!appointment || !appointment.id) {
      setError('Invalid appointment selected. Please try again.');
      return;
    }
    setSelectedAppointment(appointment);
    setError('');
  };

  const handleBookFormChange = (e) => {
    const { name, value } = e.target;
    setBookFormData({
      ...bookFormData,
      [name]: value,
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, paymentImage: 'File size exceeds 5MB' });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setFormErrors({ ...formErrors, paymentImage: 'Only JPEG, PNG, or GIF files are allowed' });
        return;
      }
      setBookFormData({
        ...bookFormData,
        paymentImage: file,
      });
      if (formErrors.paymentImage) {
        setFormErrors({ ...formErrors, paymentImage: null });
      }
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please correct the errors in the form before submitting.');
      return;
    }

    if (!selectedDoctor || !selectedAppointment || !selectedAppointment.id) {
      setError('Please complete all required selections and ensure a valid appointment is selected.');
      return;
    }

    const totalPrice = selectedAppointment.price ?? 0.0;
    if (totalPrice === null || isNaN(totalPrice)) {
      setError('Unable to determine appointment price. Please try again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('PatientId', PATIENT_ID);
      formData.append('DoctorId', selectedDoctor.id.toString());
      formData.append('DoctorAppointmentAtHomeId', selectedAppointment.id.toString());
      formData.append('MedicalCondition', bookFormData.medicalCondition || '');
      formData.append('Image', bookFormData.paymentImage);
      formData.append('TotalPrice', totalPrice.toString());

      const response = await fetch(`${API_BASE_URL}/PatientBookingDoctorAtHomes`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setBookingSuccess(true);
      setBookFormData({
        name: '',
        phoneNumber: '',
        email: '',
        medicalCondition: '',
        address: '',
        paymentImage: null,
      });
      setStep(6);
    } catch (error) {
      const errorMessage = error.message || 'Failed to submit booking.';
      if (errorMessage.includes('FOREIGN KEY') || errorMessage.includes('FK_PatientBookingDoctorAtHomes')) {
        setError('The selected appointment is no longer available. Please choose a different appointment.');
        setStep(4);
        setSelectedAppointment(null);
        await fetchAppointments(selectedDoctor.doctorClinicId);
      } else {
        setError(errorMessage);
      }
      console.error('Booking Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedAppointment(null);
    setBookingSuccess(false);
    setError('');
    setFormErrors({});
    setBookFormData({
      name: '',
      phoneNumber: '',
      email: '',
      medicalCondition: '',
      address: '',
      paymentImage: null,
    });
    setStep(4);
    if (selectedDoctor?.doctorClinicId) {
      fetchAppointments(selectedDoctor.doctorClinicId);
    }
  };

  // Utility Functions
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary">At Home Consultation</h1>
          <p className="lead text-muted">Get expert medical care in the comfort of your home</p>
        </div>

        {error && (
          <div className="alert alert-danger shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
        
        {bookingSuccess && (
          <div className="alert alert-success shadow-sm" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            Booking completed successfully!
          </div>
        )}

        {/* Step Progress Indicator */}
        <div className="mb-5">
          <div className="row text-center">
            <div className="col">
              <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{width: '50px', height: '50px'}}>
                <i className="bi bi-list-check"></i>
              </div>
              <div className="mt-2 small">Select Specialization</div>
            </div>
            <div className="col">
              <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 2 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{width: '50px', height: '50px'}}>
                <i className="bi bi-geo-alt"></i>
              </div>
              <div className="mt-2 small">Select City</div>
            </div>
            <div className="col">
              <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 3 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{width: '50px', height: '50px'}}>
                <i className="bi bi-person-badge"></i>
              </div>
              <div className="mt-2 small">Choose Doctor</div>
            </div>
            <div className="col">
              <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 4 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{width: '50px', height: '50px'}}>
                <i className="bi bi-calendar-check"></i>
              </div>
              <div className="mt-2 small">Select Appointment</div>
            </div>
            <div className="col">
              <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 5 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{width: '50px', height: '50px'}}>
                <i className="bi bi-pencil-square"></i>
              </div>
              <div className="mt-2 small">Book Appointment</div>
            </div>
            <div className="col">
              <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 6 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{width: '50px', height: '50px'}}>
                <i className="bi bi-check2-circle"></i>
              </div>
              <div className="mt-2 small">Confirmation</div>
            </div>
          </div>
        </div>

        {/* Step 4: Select Appointment */}
        {step === 4 && (
          <div className="card mb-4 shadow border-0 rounded-lg">
            <div className="card-header bg-primary text-white py-3">
              <h3 className="mb-0 d-flex align-items-center">
                <i className="bi bi-calendar-check me-2"></i>Step 4: Select Appointment
              </h3>
            </div>
            <div className="card-body p-4">
              {loading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading appointments...</p>
                </div>
              ) : appointments.length > 0 ? (
                <>
                  <div className="mb-4 p-3 bg-light rounded-3 border">
                    <div className="row">
                      <div className="col-md-4 d-flex align-items-center">
                        {selectedDoctor?.imageUrl ? (
                          <img
                            src={selectedDoctor.imageUrl}
                            alt={selectedDoctor.fullName}
                            className="rounded-circle me-3"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
                            style={{ width: '60px', height: '60px' }}
                          >
                            <i className="bi bi-person-fill text-white fs-3"></i>
                          </div>
                        )}
                        <div>
                          <h5 className="mb-0">Dr. {selectedDoctor?.fullName}</h5>
                          <div className="text-muted small">{selectedSpecializationName}</div>
                        </div>
                      </div>
                      <div className="col-md-4 d-flex align-items-center">
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            <span>{selectedDoctor?.evaluation || 'N/A'} Rating</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-briefcase-fill text-primary me-1"></i>
                            <span>{selectedDoctor?.experienceYears || 'N/A'} Years Experience</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 d-flex align-items-center">
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                            <span>{selectedCityName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h5 className="mb-3">Available Appointments</h5>
                  <div className="row g-3">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="col-md-4 col-sm-6">
                        <div
                          className={`card h-100 rounded-lg ${
                            selectedAppointment?.id === appointment.id ? 'border-primary shadow' : 'border-0 shadow-sm'
                          }`}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            transform: selectedAppointment?.id === appointment.id ? 'scale(1.03)' : 'scale(1)',
                          }}
                          onClick={() => handleAppointmentSelect(appointment)}
                          onKeyDown={(e) => handleKeyDown(e, () => handleAppointmentSelect(appointment))}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="bi bi-calendar2-week text-primary fs-4 me-2"></i>
                              <div>
                                <div className="fw-bold">{formatDate(appointment.date)}</div>
                                <div className="text-muted">{appointment.time}</div>
                              </div>
                            </div>
                            <div className="d-flex align-items-center text-success fw-bold">
                              <span>EGP {appointment.price?.toFixed(2) || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="card-footer bg-white border-0 p-0">
                            <button
                              className={`btn w-100 rounded-0 rounded-bottom ${
                                selectedAppointment?.id === appointment.id ? 'btn-primary' : 'btn-outline-primary'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAppointmentSelect(appointment);
                              }}
                            >
                              {selectedAppointment?.id === appointment.id ? (
                                <>
                                  <i className="bi bi-check-lg me-1"></i>Selected
                                </>
                              ) : (
                                <>Select</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <div className="alert alert-warning">No appointments available for this doctor in the selected city.</div>
                </div>
              )}
              <div className="d-flex justify-content-between mt-4">
                <button
                  className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center"
                  onClick={handleBack}
                >
                  <i className="bi bi-arrow-left me-2"></i> Back
                </button>
                <button
                  className="btn btn-primary px-4 py-2 d-flex align-items-center"
                  onClick={handleNext}
                  disabled={!selectedAppointment}
                >
                  Next <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Book Appointment */}
        {step === 5 && (
          <div className="card mb-4 shadow border-0 rounded-lg">
            <div className="card-header bg-primary text-white py-3">
              <h3 className="mb-0 d-flex align-items-center">
                <i className="bi bi-pencil-square me-2"></i>Step 5: Book Appointment
              </h3>
            </div>
            <div className="card-body p-4">
              <div className="mb-4 p-3 bg-light rounded-3 border">
                <h5 className="mb-3">Appointment Summary</h5>
                <div className="row">
                  <div className="col-md-4">
                    <div className="d-flex align-items-center mb-3">
                      {selectedDoctor?.imageUrl ? (
                        <img
                          src={selectedDoctor.imageUrl}
                          alt={selectedDoctor.fullName}
                          className="rounded-circle me-3"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
                          style={{ width: '50px', height: '50px' }}
                        >
                          <i className="bi bi-person-fill text-white fs-4"></i>
                        </div>
                      )}
                      <div>
                        <div className="fw-bold">Dr. {selectedDoctor?.fullName}</div>
                        <div className="text-muted small">{selectedSpecializationName}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-2">
                      <span className="fw-bold text-primary">Date:</span> {formatDate(selectedAppointment?.date)}
                    </div>
                    <div>
                      <span className="fw-bold text-primary">Time:</span> {selectedAppointment?.time}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-2">
                      <span className="fw-bold text-primary">Location:</span> {selectedCityName} (At Home)
                    </div>
                    <div>
                      <span className="fw-bold text-primary">Price:</span> EGP{' '}
                      {selectedAppointment?.price?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <h5 className="mb-3">Personal Information</h5>
              <form onSubmit={handleBookSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="formName" className="form-label">Full Name</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                        id="formName"
                        name="name"
                        placeholder="Enter your full name"
                        value={bookFormData.name}
                        onChange={handleBookFormChange}
                      />
                      {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="formPhone" className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className={`form-control ${formErrors.phoneNumber ? 'is-invalid' : ''}`}
                        id="formPhone"
                        name="phoneNumber"
                        placeholder="Enter your phone number"
                        value={bookFormData.phoneNumber}
                        onChange={handleBookFormChange}
                      />
                      {formErrors.phoneNumber && <div className="invalid-feedback">{formErrors.phoneNumber}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="formEmail" className="form-label">Email Address</label>
                      <input
                        type="email"
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        id="formEmail"
                        name="email"
                        placeholder="Enter your email address"
                        value={bookFormData.email}
                        onChange={handleBookFormChange}
                      />
                      {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="formAddress" className="form-label">Home Address</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                        id="formAddress"
                        name="address"
                        placeholder="Enter your home address for the visit"
                        value={bookFormData.address}
                        onChange={handleBookFormChange}
                      />
                      {formErrors.address && <div className="invalid-feedback">{formErrors.address}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="formMedicalCondition" className="form-label">Medical Condition</label>
                      <textarea
                        className={`form-control ${formErrors.medicalCondition ? 'is-invalid' : ''}`}
                        id="formMedicalCondition"
                        name="medicalCondition"
                        rows="3"
                        placeholder="Describe your medical condition or reason for consultation"
                        value={bookFormData.medicalCondition}
                        onChange={handleBookFormChange}
                      ></textarea>
                      {formErrors.medicalCondition && <div className="invalid-feedback">{formErrors.medicalCondition}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="formPaymentImage" className="form-label">Payment Proof</label>
                      <input
                        type="file"
                        className={`form-control ${formErrors.paymentImage ? 'is-invalid' : ''}`}
                        id="formPaymentImage"
                        name="paymentImage"
                        accept=".jpg,.jpeg,.png,.gif"
                        onChange={handleFileUpload}
                      />
                      <div className="form-text">
                        Upload proof of payment (JPG, PNG, or GIF, max 5MB)
                      </div>
                      {formErrors.paymentImage && <div className="invalid-feedback">{formErrors.paymentImage}</div>}
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center"
                    onClick={handleBack}
                  >
                    <i className="bi bi-arrow-left me-2"></i> Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success px-4 py-2 d-flex align-items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Booking <i className="bi bi-check-lg ms-2"></i>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Step 6: Confirmation */}
        {step === 6 && (
          <div className="card mb-4 shadow border-0 rounded-lg">
            <div className="card-header bg-success text-white py-3">
              <h3 className="mb-0 d-flex align-items-center">
                <i className="bi bi-check2-circle me-2"></i>Step 6: Booking Confirmed
              </h3>
            </div>
            <div className="card-body p-4 text-center">
              <div className="py-4">
                <div className="mb-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
                </div>
                <h3 className="mb-3">Your appointment has been successfully booked!</h3>
                <p className="lead mb-4">
                  A confirmation email has been sent to your email address with all the details.
                </p>

                <div className="bg-light p-4 rounded mb-4" style={{maxWidth: '600px', margin: '0 auto'}}>
                  <h5 className="border-bottom pb-2 mb-3">Appointment Details</h5>
                  <div className="row text-start g-3">
                    <div className="col-md-6">
                      <div className="fw-bold">Doctor:</div>
                      <div>Dr. {selectedDoctor?.fullName}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="fw-bold">Specialization:</div>
                      <div>{selectedSpecializationName}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="fw-bold">Date:</div>
                      <div>{formatDate(selectedAppointment?.date)}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="fw-bold">Time:</div>
                      <div>{selectedAppointment?.time}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="fw-bold">Location:</div>
                      <div>{selectedCityName} (At Home)</div>
                    </div>
                    <div className="col-md-6">
                      <div className="fw-bold">Total Price:</div>
                      <div className="text-success fw-bold">EGP {selectedAppointment?.price?.toFixed(2) || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info mb-4">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>What's Next?</strong>
                  <ul className="mb-0 mt-2">
                    <li>The doctor will contact you before the appointment</li>
                    <li>Please ensure someone is available at the provided address</li>
                    <li>Have your medical history and any relevant documents ready</li>
                    <li>Payment confirmation will be processed within 24 hours</li>
                  </ul>
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-primary px-4 py-2"
                    onClick={handleReset}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Book Another Appointment
                  </button>
                  <button
                    className="btn btn-outline-secondary px-4 py-2"
                    onClick={() => window.print()}
                  >
                    <i className="bi bi-printer me-2"></i>
                    Print Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AtHomeConsultation;