import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, ListGroup, Badge, Form, Row, Col, Container } from 'react-bootstrap';

const API_BASE_URL = 'https://physiocareapp.runasp.net';

const BookingSystemSteps = () => {
  const [step, setStep] = useState(4); // Starting from clinic selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Data arrays
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Selected items
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Previous selections - these should be passed from parent component or context
  const [previousSelections] = useState({
    specialization: { id: '', nameEN: 'Selected Specialization' },
    city: { id: '', cityName: 'Selected City' },
    doctor: { 
      id: '', 
      fullName: 'Selected Doctor', 
      price: 0,
      experienceYears: 0 
    }
  });

  const [formData, setFormData] = useState({
    specializationId: '',
    cityId: '',
    cityName: '',
    doctorId: '',
    clinicId: '',
    doctorClinicId: '',
    appointmentId: '',
    patientId: 'e345b65a-dd02-4527-8456-4f80da5713c7',
    medicalCondition: '',
    totalPrice: 0,
    fullName: '',
    address: '',
    email: '',
    image: null,
  });

  const [errors, setErrors] = useState({});

  const displayValue = (value) => {
    return value === null || value === undefined || value === '' || value === 'null' ? 'N/A' : value;
  };

  // Fetch clinics when step 4 loads
  useEffect(() => {
    if (step === 4 && formData.doctorId && formData.cityName) {
      setLoading(true);
      setError(null);
      
      fetch(`${API_BASE_URL}/api/v1/DoctorClinics/GetDoctorClinics?drId=${formData.doctorId}&cityName=${encodeURIComponent(formData.cityName)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setClinics(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching clinics:', error);
          setError('Failed to load clinics. Please try again.');
          setLoading(false);
        });
    }
  }, [step, formData.doctorId, formData.cityName]);

  // Fetch appointments when step 5 loads
  useEffect(() => {
    if (step === 5 && formData.doctorClinicId) {
      setLoading(true);
      setError(null);
      
      fetch(`${API_BASE_URL}/api/v1/AppointmentAtClinics/GetDoctorClinicAppointments?doctorClinicId=${formData.doctorClinicId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setAppointments(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching appointments:', error);
          setError('Failed to load appointments. Please try again.');
          setLoading(false);
        });
    }
  }, [step, formData.doctorClinicId]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.medicalCondition) newErrors.medicalCondition = 'Medical condition is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    const bookingData = new FormData();
    bookingData.append('PatientId', formData.patientId);
    bookingData.append('DoctorId', formData.doctorId);
    bookingData.append('SpecializationId', formData.specializationId);
    bookingData.append('AppointmentAtClinicId', formData.appointmentId);
    bookingData.append('DoctorClinicId', formData.doctorClinicId);
    bookingData.append('MedicalCondition', formData.medicalCondition);
    bookingData.append('TotalPrice', formData.totalPrice);
    if (formData.image) {
      bookingData.append('Image', formData.image);
    }

    fetch(`${API_BASE_URL}/api/v1/PatientBookingDoctorAtClinics`, {
      method: 'POST',
      body: bookingData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setBookingSuccess(true);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error submitting booking:', error);
        setError('Failed to complete booking. Please try again.');
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const resetBooking = () => {
    setStep(4);
    setSelectedClinic(null);
    setSelectedAppointment(null);
    setBookingSuccess(false);
    setErrors({});
    setFormData({
      ...formData,
      clinicId: '',
      doctorClinicId: '',
      appointmentId: '',
      medicalCondition: '',
      fullName: '',
      address: '',
      email: '',
      image: null,
    });
  };

  const NavigationButtons = ({ onBack, onNext, backDisabled = false, nextDisabled = false, nextText = "Next", isSubmit = false }) => {
    return (
      <div className="d-flex justify-content-between mt-4">
        <Button 
          variant="outline-secondary" 
          onClick={onBack} 
          disabled={backDisabled}
        >
          <i className="bi bi-arrow-left me-2"></i> Back
        </Button>
        {isSubmit ? (
          <Button
            variant="success"
            type="submit"
            disabled={nextDisabled || loading}
            className="px-4"
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i> {nextText}
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onNext}
            disabled={nextDisabled}
          >
            {nextText} <i className="bi bi-arrow-right ms-2"></i>
          </Button>
        )}
      </div>
    );
  };

  const renderLoading = () => (
    <div className="text-center my-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3">Loading...</p>
    </div>
  );

  const renderSuccessMessage = () => (
    <div className="text-center py-5">
      <div className="mb-4">
        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
      </div>
      <h2 className="mb-3">Booking Successful!</h2>
      <p className="lead mb-4">Your appointment has been successfully booked. We'll send you a confirmation email with all the details.</p>
      <Button variant="primary" size="lg" onClick={resetBooking}>
        Book Another Appointment
      </Button>
    </div>
  );

  const renderProgressBar = () => {
    const steps = [
      { name: 'Specialization', icon: 'bi-heart-pulse' },
      { name: 'City', icon: 'bi-geo-alt' },
      { name: 'Doctor', icon: 'bi-person' },
      { name: 'Clinic', icon: 'bi-hospital' },
      { name: 'Appointment', icon: 'bi-calendar-check' },
      { name: 'Information', icon: 'bi-clipboard' },
    ];

    return (
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center">
          {steps.map((stepItem, index) => (
            <div
              key={index}
              className={`d-flex flex-column align-items-center ${
                step > index + 1 ? 'text-success' : step === index + 1 ? 'text-primary' : 'text-muted'
              }`}
              style={{ cursor: index + 1 < step ? 'pointer' : 'default' }}
              onClick={() => {
                if (index + 1 < step) {
                  setStep(index + 1);
                }
              }}
            >
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                  step > index + 1 ? 'bg-success text-white' : step === index + 1 ? 'bg-primary text-white' : 'bg-light text-muted'
                }`}
                style={{ width: '40px', height: '40px' }}
              >
                <i className={stepItem.icon}></i>
              </div>
              <small className="text-center">{stepItem.name}</small>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep = () => {
    if (loading) return renderLoading();
    if (bookingSuccess) return renderSuccessMessage();

    switch (step) {
      case 4:
        return (
          <div>
            <h2 className="mb-3">Select Clinic</h2>
            <p className="text-muted mb-4">Choose a clinic for your appointment</p>

            {error && <Alert variant="danger">{error}</Alert>}

            {clinics.length === 0 && !loading && (
              <Alert variant="warning">
                No clinics found for the selected doctor and city. Please try different options.
              </Alert>
            )}

            <Row className="g-4">
              {clinics.map((clinic) => (
                <Col key={clinic.id} lg={4} md={6} sm={12}>
                  <Card
                    className={`h-100 ${selectedClinic && selectedClinic.id === clinic.id ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedClinic(clinic);
                      setFormData({
                        ...formData,
                        clinicId: clinic.id,
                        doctorId: clinic.doctorId,
                        doctorClinicId: clinic.id,
                        totalPrice: clinic.price,
                      });
                    }}
                  >
                    <Card.Body>
                      <div className="text-center mb-3">
                        <i className="bi bi-hospital text-primary" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <Card.Title className="text-center mb-3">{displayValue(clinic.clinicName)}</Card.Title>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="border-0 px-0">
                          <i className="bi bi-geo-alt me-2 text-primary"></i>
                          {displayValue(clinic.governorate)}, {displayValue(clinic.city)}
                          {clinic.area && `, ${displayValue(clinic.area)}`}
                          {clinic.street && `, ${displayValue(clinic.street)}`}
                        </ListGroup.Item>
                        <ListGroup.Item className="border-0 px-0">
                          <i className="bi bi-telephone me-2 text-primary"></i> {displayValue(clinic.phone)}
                        </ListGroup.Item>
                        <ListGroup.Item className="border-0 px-0">
                          <i className="bi bi-currency-dollar me-2 text-primary"></i> {displayValue(clinic.price)} EGP
                        </ListGroup.Item>
                      </ListGroup>
                      <div className="text-center mt-3">
                        <Button
                          variant={selectedClinic && selectedClinic.id === clinic.id ? 'primary' : 'outline-primary'}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClinic(clinic);
                            setFormData({
                              ...formData,
                              clinicId: clinic.id,
                              doctorId: clinic.doctorId,
                              doctorClinicId: clinic.id,
                              totalPrice: clinic.price,
                            });
                          }}
                        >
                          {selectedClinic && selectedClinic.id === clinic.id ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <NavigationButtons 
              onBack={() => setStep(3)} 
              onNext={() => setStep(5)} 
              nextDisabled={!selectedClinic} 
            />
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="mb-3">Select Appointment</h2>
            <p className="text-muted mb-4">Choose an available appointment time</p>

            {error && <Alert variant="danger">{error}</Alert>}

            {appointments.length === 0 && !loading && (
              <Alert variant="warning">
                No appointments available for the selected clinic and doctor. Please try different options.
              </Alert>
            )}

            <Row className="justify-content-center">
              <Col lg={8} md={10}>
                <Card>
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">Available Appointment Times</h5>
                  </Card.Header>
                  <ListGroup variant="flush">
                    {appointments.map((appointment) => {
                      const appointmentDate = new Date(appointment.date);
                      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                      
                      return (
                        <ListGroup.Item 
                          key={appointment.id}
                          action
                          active={selectedAppointment && selectedAppointment.id === appointment.id}
                          className="d-flex justify-content-between align-items-center p-3"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setFormData({
                              ...formData,
                              appointmentId: appointment.id
                            });
                          }}
                        >
                          <div>
                            <div className="fw-bold">{formattedDate}</div>
                            <div className="text-muted">
                              <i className="bi bi-clock me-1"></i>
                              {appointment.fromTime} - {appointment.toTime}
                            </div>
                          </div>
                          <div>
                            {selectedAppointment && selectedAppointment.id === appointment.id ? (
                              <Badge bg="success" pill>
                                <i className="bi bi-check-lg me-1"></i>
                                Selected
                              </Badge>
                            ) : (
                              <Button size="sm" variant="outline-primary" className="rounded-pill">
                                Select
                              </Button>
                            )}
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </Card>
              </Col>
            </Row>

            <NavigationButtons 
              onBack={() => setStep(4)} 
              onNext={() => setStep(6)} 
              nextDisabled={!selectedAppointment} 
            />
          </div>
        );

      case 6:
        return (
          <div>
            <h2 className="mb-3">Patient Information</h2>
            <p className="text-muted mb-4">Please provide your personal information to complete the booking</p>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="justify-content-center">
              <Col lg={8} md={10}>
                <Card>
                  <Card.Body>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              isInvalid={!!errors.fullName}
                              placeholder="Enter your full name"
                            />
                            <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              isInvalid={!!errors.email}
                              placeholder="Enter your email"
                            />
                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          isInvalid={!!errors.address}
                          placeholder="Enter your address"
                        />
                        <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Medical Condition</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="medicalCondition"
                          value={formData.medicalCondition}
                          onChange={handleInputChange}
                          isInvalid={!!errors.medicalCondition}
                          placeholder="Describe your medical condition or reason for visit"
                        />
                        <Form.Control.Feedback type="invalid">{errors.medicalCondition}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Upload Medical Documents (Optional)</Form.Label>
                        <Form.Control
                          type="file"
                          name="image"
                          onChange={handleImageChange}
                          accept="image/*,.pdf"
                        />
                        <Form.Text className="text-muted">
                          Upload any relevant medical documents or images (JPG, PNG, PDF)
                        </Form.Text>
                      </Form.Group>

                      <div className="mt-4 mb-3">
                        <h5 className="mb-3">Booking Summary</h5>
                        <Card className="bg-light">
                          <Card.Body>
                            <ListGroup variant="flush" className="bg-light">
                              <ListGroup.Item className="bg-light d-flex justify-content-between align-items-center px-0">
                                <span>Specialization:</span>
                                <span className="fw-bold">{previousSelections.specialization?.nameEN || 'N/A'}</span>
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-light d-flex justify-content-between align-items-center px-0">
                                <span>Doctor:</span>
                                <span className="fw-bold">{previousSelections.doctor?.fullName || 'N/A'}</span>
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-light d-flex justify-content-between align-items-center px-0">
                                <span>Clinic:</span>
                                <span className="fw-bold">{selectedClinic?.clinicName || 'N/A'}</span>
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-light d-flex justify-content-between align-items-center px-0">
                                <span>City:</span>
                                <span className="fw-bold">{previousSelections.city?.cityName || 'N/A'}</span>
                              </ListGroup.Item>
                              {selectedAppointment && (
                                <ListGroup.Item className="bg-light d-flex justify-content-between align-items-center px-0">
                                  <span>Appointment:</span>
                                  <span className="fw-bold">
                                    {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}, {selectedAppointment.fromTime} - {selectedAppointment.toTime}
                                  </span>
                                </ListGroup.Item>
                              )}
                              <ListGroup.Item className="bg-light d-flex justify-content-between align-items-center px-0 border-top pt-2">
                                <span className="fw-bold fs-5">Total Price:</span>
                                <span className="fw-bold fs-5 text-primary">{formData.totalPrice} EGP</span>
                              </ListGroup.Item>
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </div>

                      <NavigationButtons 
                        onBack={() => setStep(5)} 
                        onNext={() => {}} 
                        nextText="Confirm Booking" 
                        isSubmit={true} 
                      />
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">Complete Your Booking</h1>
        <p className="lead text-muted">
          Follow the remaining steps to finalize your appointment
        </p>
      </div>

      {!bookingSuccess && renderProgressBar()}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          {renderStep()}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BookingSystemSteps;