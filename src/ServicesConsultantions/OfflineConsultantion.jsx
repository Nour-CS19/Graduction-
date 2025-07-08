import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, ListGroup, Badge, Table } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import jsPDF from 'jspdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowLeft, faArrowRight, faStethoscope, faCity, faUserMd, faHospital, faCalendarCheck, faClipboard } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Nav';
import Footer from '../components/Footer';
import './css/BookingSystem.css';
import { useAuth } from '../Pages/AuthPage';

const API_BASE_URL = 'https://physiocareapp.runasp.net';

const BookingSystem = () => {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const patientId = user?.id;
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [specializations, setSpecializations] = useState([]);
  const [cities, setCities] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [formData, setFormData] = useState({
    specializationId: '',
    cityId: '',
    cityName: '',
    doctorId: '',
    clinicId: '',
    doctorClinicId: '',
    appointmentId: '',
    patientId: patientId || '',
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

  // Function to fetch doctor image
  const fetchDoctorImage = async (fileName) => {
    if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
      return null;
    }
    try {
      const imageUrl = `${API_BASE_URL}/api/v1/Upload/image?filename=${encodeURIComponent(fileName)}&path=Actors/Doctor`;
      const response = await axios.get(imageUrl, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const contentType = response.headers['content-type'] || '';
      if (response.status === 200 && contentType.startsWith('image/')) {
        const blob = new Blob([response.data], { type: contentType });
        return URL.createObjectURL(blob);
      }
      console.warn(`Image not available for ${fileName}`);
      return null;
    } catch (error) {
      console.warn(`Failed to fetch image for ${fileName}:`, error.message);
      return null;
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      patientId: patientId || '',
    }));
  }, [patientId]);

  // Fetch specializations and cities
  useEffect(() => {
    if (step === 1 && accessToken) {
      setLoading(true);
      setError(null);
      Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/Specializations/GetAll`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`${API_BASE_URL}/api/v1/Cities/GetAll`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ])
        .then(([specResponse, cityResponse]) => {
          setSpecializations(Array.isArray(specResponse.data) ? specResponse.data : []);
          setCities(Array.isArray(cityResponse.data) ? cityResponse.data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching data:', err.message, err.response?.data);
          setError('Failed to load specializations or cities.');
          setLoading(false);
        });
    }
  }, [step, accessToken]);

  // Fetch doctors and attempt image fetching
  useEffect(() => {
    if (step === 3 && formData.specializationId && formData.cityName && accessToken) {
      setLoading(true);
      setError(null);
      axios
        .get(`${API_BASE_URL}/api/v1/DoctorSpecializationAtClinics/GetDoctorsAtClinic`, {
          params: {
            specialId: formData.specializationId,
            cityName: formData.cityName,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then(async (response) => {
          const doctorData = Array.isArray(response.data) ? response.data : [];
          if (doctorData.length === 0) {
            setDoctors([]);
            setLoading(false);
            return;
          }
          const normalizedDoctors = await Promise.all(
            doctorData.map(async (doctor, index) => {
              const fileName = doctor.fileName || doctor.imageUrl;
              const imageUrl = fileName ? await fetchDoctorImage(fileName) : null;
              return {
                id: doctor.doctorId || `temp-${index}`,
                fullName: doctor.fullName || 'Unknown Doctor',
                phoneNumber: doctor.phoneNumber || 'N/A',
                address: doctor.address || 'N/A',
                experienceYears: doctor.experienceYears || 0,
                evaluation: doctor.evaluation || 0,
                price: doctor.price || 0,
                imageUrl,
                hasImage: !!imageUrl,
              };
            })
          );
          setDoctors(normalizedDoctors);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching doctors:', error.message, error.response?.data);
          setError('Failed to load doctors.');
          setDoctors([]);
          setLoading(false);
        });
    }
  }, [step, formData.specializationId, formData.cityName, accessToken]);

  // Fetch clinics and doctorClinicId
  useEffect(() => {
    if (step === 4 && formData.doctorId && formData.cityName && accessToken) {
      setLoading(true);
      setError(null);
      axios
        .get(`${API_BASE_URL}/api/v1/DoctorClinics/GetAllDoctorClinic/${formData.doctorId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          const clinicData = Array.isArray(response.data) ? response.data : [];
          console.log('Clinics API Response:', clinicData);
          console.log('Selected City (formData.cityName):', formData.cityName);
          if (clinicData.length === 0) {
            setClinics([]);
            setError('No clinics found for this doctor.');
            setLoading(false);
            return;
          }
          const filteredClinics = clinicData.filter(clinic => {
            const clinicCity = clinic.city ? clinic.city.trim().toLowerCase() : '';
            const selectedCity = formData.cityName ? formData.cityName.trim().toLowerCase() : '';
            console.log(`Comparing clinic city: "${clinicCity}" with selected city: "${selectedCity}"`);
            return clinicCity === selectedCity || !clinicCity;
          });
          const normalizedClinics = filteredClinics.map(clinic => ({
            id: clinic.id || clinic.doctorClinicId || `temp-${Date.now()}`,
            clinicName: clinic.clinicName || 'Unknown Clinic',
            governorate: clinic.governorate || 'N/A',
            city: clinic.city || formData.cityName || 'N/A',
            area: clinic.area || 'N/A',
            street: clinic.street || 'N/A',
            phone: clinic.phone || 'N/A',
            price: clinic.price || 0,
            doctorId: formData.doctorId,
          }));
          console.log('Filtered Clinics:', normalizedClinics);
          if (normalizedClinics.length === 0) {
            setError(`No clinics found in ${formData.cityName}. Please select a different city or doctor.`);
          }
          setClinics(normalizedClinics);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching clinics:', error.message, error.response?.data);
          setError('Failed to load clinics. Please try again.');
          setClinics([]);
          setLoading(false);
        });
    }
  }, [step, formData.doctorId, formData.cityName, accessToken]);

  // Fetch appointments using doctorClinicId
  useEffect(() => {
    if (step === 5 && formData.doctorClinicId && accessToken) {
      setLoading(true);
      setError(null);
      axios
        .get(`${API_BASE_URL}/api/v1/AppointmentAtClinics/GetDoctorClinicAppointments`, {
          params: {
            doctorClinicId: formData.doctorClinicId,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          const appointmentData = Array.isArray(response.data) ? response.data : [];
          console.log('Appointments API Response:', appointmentData);
          if (appointmentData.length === 0) {
            setAppointments([]);
            setError('No appointments available for this clinic.');
            setLoading(false);
            return;
          }
          const normalizedAppointments = appointmentData.map(appt => ({
            id: appt.id || `temp-appt-${Date.now()}`,
            day: appt.day || 'N/A',
            openAt: appt.openAt || 'N/A',
            closedAt: appt.closedAt || 'N/A',
            doctorClinicId: appt.doctorClinicId || formData.doctorClinicId,
          }));
          console.log('Normalized Appointments:', normalizedAppointments);
          setAppointments(normalizedAppointments);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching appointments:', error.message, error.response?.data);
          setError('Failed to load appointments. Please try again.');
          setAppointments([]);
          setLoading(false);
        });
    }
  }, [step, formData.doctorClinicId, accessToken]);

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
    if (!accessToken) {
      setError('Authentication token not found. Please log in.');
      return;
    }
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

    axios
      .post(`${API_BASE_URL}/api/v1/PatientBookingDoctorAtClinics`, bookingData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setBookedAppointments((prev) => [
          ...prev,
          {
            id: response.data.id || `booking-${Date.now()}`,
            specialization: selectedSpecialization?.nameEN,
            city: selectedCity?.cityName,
            doctor: selectedDoctor?.fullName,
            clinic: selectedClinic?.clinicName,
            appointment: selectedAppointment
              ? `${isValid(parseISO(selectedAppointment.day)) ? format(parseISO(selectedAppointment.day), 'PPPP') : selectedAppointment.day} ${selectedAppointment.openAt} - ${selectedAppointment.closedAt}`
              : 'N/A',
            totalPrice: formData.totalPrice,
            patientName: formData.fullName,
            email: formData.email,
          },
        ]);
        setBookingSuccess(true);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error submitting booking:', error.message, error.response?.data);
        setError('Failed to complete booking.');
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
    setStep(1);
    setSelectedSpecialization(null);
    setSelectedCity(null);
    setSelectedDoctor(null);
    setSelectedClinic(null);
    setSelectedAppointment(null);
    setBookingSuccess(false);
    setErrors({});
    setFormData({
      specializationId: '',
      cityId: '',
      cityName: '',
      doctorId: '',
      clinicId: '',
      doctorClinicId: '',
      appointmentId: '',
      patientId: patientId || '',
      medicalCondition: '',
      totalPrice: 0,
      fullName: '',
      address: '',
      email: '',
      image: null,
    });
  };

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  const downloadPDF = (booking) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('PhysioCare Appointment Confirmation', 20, 20);
    doc.setFontSize(12);
    doc.text(`Patient Name: ${booking.patientName}`, 20, 40);
    doc.text(`Email: ${booking.email}`, 20, 50);
    doc.text(`Specialization: ${booking.specialization || 'N/A'}`, 20, 60);
    doc.text(`Doctor: ${booking.doctor || 'N/A'}`, 20, 70);
    doc.text(`Clinic: ${booking.clinic || 'N/A'}`, 20, 80);
    doc.text(`City: ${booking.city || 'N/A'}`, 20, 90);
    doc.text(`Appointment: ${booking.appointment || 'N/A'}`, 20, 100);
    doc.text(`Total Price: ${booking.totalPrice} EGP`, 20, 110);
    doc.save(`appointment-${booking.id}.pdf`);
  };

  const renderLoading = () => (
    <div className="text-center my-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3">Loading...</p>
    </div>
  );

  const renderSuccessMessage = () => (
    <div className="success-container text-center py-5">
      <FontAwesomeIcon icon={faCheckCircle} size="5x" className="text-success mb-4" />
      <h2 className="mb-3">Booking Successful!</h2>
      <p className="lead mb-4">Your appointment has been successfully booked. We'll send you a confirmation email with all the details.</p>
      {bookedAppointments.length > 0 && (
        <div className="booked-appointments mt-5">
          <h4>Booked Appointments</h4>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Specialization</th>
                <th>City</th>
                <th>Doctor</th>
                <th>Clinic</th>
                <th>Appointment</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookedAppointments.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.specialization}</td>
                  <td>{booking.city}</td>
                  <td>{booking.doctor}</td>
                  <td>{booking.clinic}</td>
                  <td>{booking.appointment}</td>
                  <td>{booking.totalPrice} EGP</td>
                  <td>
                    <Button variant="outline-primary" size="sm" onClick={() => downloadPDF(booking)}>
                      Download PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      <Button variant="primary" size="lg" onClick={resetBooking}>
        Book Another Appointment
      </Button>
    </div>
  );

  const NavigationButtons = ({ onBack, onNext, backDisabled = false, nextDisabled = false, nextText = "Next", backText = "Back", isSubmit = false }) => (
    <div className="navigation-buttons d-flex justify-content-between mt-4">
      <Button variant="outline-secondary" onClick={onBack} disabled={backDisabled} className="left-aligned-button">
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> {backText}
      </Button>
      {isSubmit ? (
        <Button variant="success" type="submit" className="right-aligned-button px-4" disabled={nextDisabled || loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              Processing...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" /> {nextText}
            </>
          )}
        </Button>
      ) : (
        <Button variant="primary" onClick={onNext} disabled={nextDisabled} title={nextDisabled ? 'Please make a selection to continue' : ''} className="right-aligned-button">
          {nextText} <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
        </Button>
      )}
    </div>
  );

  const renderStep = () => {
    if (loading) return renderLoading();
    if (bookingSuccess === true) return renderSuccessMessage();

    switch (step) {
      case 1:
        return (
          <div className="step-container">
            <h2 className="step-title text-center">Select Specialization</h2>
            <p className="step-description text-center">Choose your medical specialization for the appointment</p>
            {error && <Alert variant="danger">{error}</Alert>}
            {(specializations.length === 0) && !loading && (
              <Alert variant="warning" className="text-center">
                No specializations found. Please try again later.
              </Alert>
            )}
            <Row className="justify-content-center align-items-center">
              <Col md={6} className="text-center">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Specialization</Form.Label>
                  <Form.Select
                    value={formData.specializationId}
                    onChange={(e) => {
                      const spec = specializations.find((s) => s.id === e.target.value);
                      setSelectedSpecialization(spec || null);
                      setFormData({ ...formData, specializationId: e.target.value });
                    }}
                    size="lg"
                    className="w-100"
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {displayValue(spec.nameEN)} ({displayValue(spec.nameAR)})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <NavigationButtons
              onBack={() => navigate('/servicedoctoronlineofflineathome')}
              onNext={() => setStep(2)}
              backDisabled={false}
              nextDisabled={!selectedSpecialization}
            />
          </div>
        );

      case 2:
        return (
          <div className="step-container">
            <h2 className="step-title text-center">Select City</h2>
            <p className="step-description text-center">Confirm your preferred city for the appointment</p>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="justify-content-center align-items-center">
              <Col md={6} className="text-center">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">City</Form.Label>
                  <Form.Select
                    value={formData.cityId}
                    onChange={(e) => {
                      const city = cities.find((c) => c.id === e.target.value);
                      setSelectedCity(city || null);
                      setFormData({ ...formData, cityId: e.target.value, cityName: city?.cityName || '' });
                      console.log('Selected City in Step 2:', city?.cityName);
                    }}
                    size="lg"
                    className="w-100"
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {displayValue(city.cityName)} ({displayValue(city.governorate)})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <NavigationButtons onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!selectedCity} />
          </div>
        );

      case 3:
        return (
          <div className="step-container">
            <h2 className="step-title text-center">Select Doctor</h2>
            <p className="step-description text-center">Choose a doctor for your consultation</p>
            {error && <Alert variant="danger">{error}</Alert>}
            {doctors.length === 0 && !loading && (
              <Alert variant="warning" className="text-center">
                No doctors found for the selected specialization and city. Please try different options.
              </Alert>
            )}
            <Row className="g-4">
              {doctors.map((doctor) => (
                <Col key={doctor.id} lg={3} md={6} sm={12} className="mb-4">
                  <Card
                    className={`doctor-card h-100 rounded-lg ${
                      selectedDoctor && selectedDoctor.id === doctor.id ? 'border-primary shadow' : 'border-0 shadow-sm'
                    }`}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: selectedDoctor && selectedDoctor.id === doctor.id ? 'scale(1.03)' : 'scale(1)',
                    }}
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setFormData({
                        ...formData,
                        doctorId: doctor.id,
                        totalPrice: doctor.price,
                      });
                    }}
                    onKeyDown={(e) =>
                      handleKeyDown(e, () => {
                        setSelectedDoctor(doctor);
                        setFormData({
                          ...formData,
                          doctorId: doctor.id,
                          totalPrice: doctor.price,
                        });
                      })
                    }
                    role="button"
                    tabIndex={0}
                  >
                    <div className="position-relative doctor-image-container">
                      {doctor.hasImage && doctor.imageUrl ? (
                        <Card.Img
                          variant="top"
                          src={doctor.imageUrl}
                          alt={`Dr. ${doctor.fullName}`}
                          style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: 'center' }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f8f9fa"/><circle cx="100" cy="70" r="40" fill="%23dee2e6"/><path d="M100,120 C65,120 40,150 40,190 L160,190 C160,150 135,120 100,120 Z" fill="%23dee2e6"/></svg>';
                          }}
                        />
                      ) : (
                        <div
                          className="bg-light d-flex align-items-center justify-content-center"
                          style={{ width: '100%', height: '200px' }}
                        >
                          <i className="bi bi-person-circle fs-1 text-secondary" style={{ fontSize: '4rem' }}></i>
                        </div>
                      )}
                      {selectedDoctor && selectedDoctor.id === doctor.id && (
                        <div className="position-absolute top-0 end-0 p-2">
                          <Badge bg="success" pill className="px-3 py-2">
                            <i className="bi bi-check-lg me-1"></i>Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Card.Body className="p-3">
                      <Card.Title className="mb-2 fs-5 fw-bold">{displayValue(doctor.fullName)}</Card.Title>
                      <div className="doctor-details mb-2 small">
                        <div className="mb-2">
                          <i className="bi bi-telephone me-2"></i>
                          {displayValue(doctor.phoneNumber)}
                        </div>
                        <div className="mb-2">
                          <i className="bi bi-geo-alt me-2"></i>
                          {displayValue(doctor.address)}
                        </div>
                        <div className="mb-2">
                          <i className="bi bi-calendar-check me-2"></i>
                          {displayValue(doctor.experienceYears)} years experience
                        </div>
                        <div className="mb-2">
                          <i className="bi bi-star-fill me-2"></i>
                          {displayValue(doctor.evaluation)} / 5
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white border-top-0 p-3">
                      <div className="d-grid">
                        <Button
                          variant={selectedDoctor && selectedDoctor.id === doctor.id ? 'primary' : 'outline-primary'}
                          className="rounded-pill"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoctor(doctor);
                            setFormData({
                              ...formData,
                              doctorId: doctor.id,
                              totalPrice: doctor.price,
                            });
                          }}
                        >
                          {selectedDoctor && selectedDoctor.id === doctor.id ? (
                            <>
                              <i className="bi bi-check-circle-fill me-2"></i>Selected
                            </>
                          ) : (
                            <>
                              <i className="bi bi-person-plus me-2"></i>Select Doctor
                            </>
                          )}
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
            <NavigationButtons onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={!selectedDoctor} />
          </div>
        );

      case 4:
        return (
          <div className="step-container">
            <h2 className="step-title text-center">Select Clinic</h2>
            <p className="step-description text-center">Choose a clinic for your appointment</p>
            {error && <Alert variant="danger">{error}</Alert>}
            {clinics.length === 0 && !loading && (
              <Alert variant="warning" className="text-center">
                No clinics found for the selected doctor and city ({formData.cityName}). Please try a different city or doctor.
              </Alert>
            )}
            <Row className="g-4">
              {clinics.map((clinic) => (
                <Col key={clinic.id} lg={4} md={6} sm={12} className="mb-4">
                  <Card className={`clinic-card h-100 ${selectedClinic && selectedClinic.id === clinic.id ? 'selected' : ''}`}>
                    <Card.Body className="d-flex flex-column justify-content-between p-4">
                      <div>
                        <div className="clinic-icon mb-3 d-flex justify-content-center align-items-center">
                          <FontAwesomeIcon icon={faHospital} size="3x" className="text-primary" />
                        </div>
                        <Card.Title className="mb-3 text-center">{displayValue(clinic.clinicName)}</Card.Title>
                        <ListGroup variant="flush" className="clinic-details">
                          <ListGroup.Item className="border-0 ps-0">
                            <i className="bi bi-geo-alt me-2 text-primary"></i>
                            {displayValue(clinic.governorate)}, {displayValue(clinic.city)}
                            {clinic.area && `, ${displayValue(clinic.area)}`}
                            {clinic.street && `, ${displayValue(clinic.street)}`}
                          </ListGroup.Item>
                          <ListGroup.Item className="border-0 ps-0">
                            <i className="bi bi-telephone me-2 text-primary"></i>
                            {displayValue(clinic.phone)}
                          </ListGroup.Item>
                          <ListGroup.Item className="border-0 ps-0">
                            <i className="bi bi-currency-dollar me-2 text-primary"></i>
                            {displayValue(clinic.price)} EGP
                          </ListGroup.Item>
                        </ListGroup>
                      </div>
                      <Button
                        variant={selectedClinic && selectedClinic.id === clinic.id ? 'primary' : 'outline-primary'}
                        className="mt-3 select-button"
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
                        {selectedClinic && selectedClinic.id === clinic.id ? 'Selected' : 'Select'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <NavigationButtons onBack={() => setStep(3)} onNext={() => setStep(5)} nextDisabled={!selectedClinic} />
          </div>
        );

      case 5:
        return (
          <div className="step-container">
            <h2 className="step-title text-center">Select Appointment</h2>
            <p className="step-description text-center">Choose an available appointment time</p>
            {error && <Alert variant="danger">{error}</Alert>}
            {appointments.length === 0 && !loading && (
              <Alert variant="warning" className="text-center">
                No appointments available for the selected clinic and doctor. Please try different options.
              </Alert>
            )}
            <Row className="justify-content-center">
              <Col lg={8} md={10} sm={12}>
                <Card className="appointment-card">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">Available Appointment Times</h5>
                  </Card.Header>
                  <ListGroup variant="flush">
                    <Row>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Select Date</Form.Label>
                          <Form.Select
                            value={selectedAppointment ? selectedAppointment.day : ''}
                            onChange={(e) => {
                              const day = e.target.value;
                              const appt = appointments.find(
                                (a) => a.day === day && a.doctorClinicId === formData.doctorClinicId
                              );
                              if (appt) {
                                setSelectedAppointment(appt);
                                setFormData({
                                  ...formData,
                                  appointmentId: appt.id,
                                  doctorClinicId: appt.doctorClinicId,
                                });
                              } else {
                                setSelectedAppointment(null);
                                setFormData({
                                  ...formData,
                                  appointmentId: '',
                                });
                              }
                            }}
                          >
                            <option value="">Select Date</option>
                            {[
                              ...new Set(
                                appointments
                                  .filter(
                                    (a) =>
                                      a.doctorClinicId === formData.doctorClinicId &&
                                      a.day
                                  )
                                  .map((a) => a.day)
                              ),
                            ].map((day) => (
                              <option key={day} value={day}>
                                {isValid(parseISO(day)) ? format(parseISO(day), 'PPPP') : day}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Select Time</Form.Label>
                          <Form.Select
                            value={selectedAppointment ? selectedAppointment.openAt : ''}
                            onChange={(e) => {
                              const openAt = e.target.value;
                              const appt = appointments.find(
                                (a) =>
                                  a.day === selectedAppointment?.day &&
                                  a.openAt === openAt &&
                                  a.doctorClinicId === formData.doctorClinicId
                              );
                              if (appt) {
                                setSelectedAppointment(appt);
                                setFormData({
                                  ...formData,
                                  appointmentId: appt.id,
                                  doctorClinicId: appt.doctorClinicId,
                                });
                              }
                            }}
                            disabled={!selectedAppointment}
                          >
                            <option value="">Select Time</option>
                            {appointments
                              .filter(
                                (a) =>
                                  a.day === selectedAppointment?.day &&
                                  a.doctorClinicId === formData.doctorClinicId
                              )
                              .map((appt) => (
                                <option key={appt.id} value={appt.openAt}>
                                  {appt.openAt} - {appt.closedAt}
                                </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Price</Form.Label>
                          <Form.Control
                            type="text"
                            value={selectedClinic ? `${selectedClinic.price || 0} EGP` : 'N/A'}
                            readOnly
                          />
                        </Form.Group>
                      </Col>
                    </Row>
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
          <div className="step-container">
            <h2 className="step-title text-center">Patient Information</h2>
            <p className="step-description text-center">Please provide your personal information to complete the booking</p>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="justify-content-center">
              <Col lg={8} md={10} sm={12}>
                <Card className="patient-form-card">
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
                      <div className="booking-summary mt-4 mb-3">
                        <h5 className="mb-3">Booking Summary</h5>
                        <Card className="bg-light">
                          <Card.Body>
                            <ListGroup variant="flush" className="bg-light">
                              <ListGroup.Item className="bg-light d-flex justify-content-between align-items-center px-0">
                                <span>Specialization:</span>
                                <span className="fw-bold">{selectedSpecialization?.nameEN || 'N/A'}</span>
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-light d-flex justify-content-between align-items-center px-0">
                                <span>Doctor:</span>
                                <span className="fw-bold">{selectedDoctor?.fullName || 'N/A'}</span>
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-light d-flex justify-content-between align-items-center px-0">
                                <span>Clinic:</span>
                                <span className="fw-bold">{selectedClinic?.clinicName || 'N/A'}</span>
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-light d-flex justify-content-between align-items-center px-0">
                                <span>City:</span>
                                <span className="fw-bold">{selectedCity?.cityName || 'N/A'}</span>
                              </ListGroup.Item>
                              {selectedAppointment && (
                                <ListGroup.Item className="bg-light d-flex justify-content-between align-items-center px-0">
                                  <span>Appointment:</span>
                                  <span className="fw-bold">
                                    {isValid(parseISO(selectedAppointment.day)) ? format(parseISO(selectedAppointment.day), 'PPPP') : selectedAppointment.day} {selectedAppointment.openAt} - {selectedAppointment.closedAt}
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

  const renderProgressBar = () => {
    const steps = [
      { name: 'Specialization', icon: faStethoscope },
      { name: 'City', icon: faCity },
      { name: 'Doctor', icon: faUserMd },
      { name: 'Clinic', icon: faHospital },
      { name: 'Appointment', icon: faCalendarCheck },
      { name: 'Information', icon: faClipboard },
    ];

    return (
      <div className="booking-progress-container mb-5">
        <div className="booking-progress d-flex justify-content-between">
          {steps.map((stepItem, index) => (
            <div
              key={index}
              className={`progress-step ${step > index + 1 ? 'completed' : ''} ${step === index + 1 ? 'active' : ''}`}
              onClick={() => {
                if (index + 1 < step) {
                  setStep(index + 1);
                }
              }}
              style={{ cursor: index + 1 < step ? 'pointer' : 'default' }}
            >
              <div className="step-icon">
                <FontAwesomeIcon icon={stepItem.icon} />
              </div>
              <div className="step-label">{stepItem.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <Container fluid className="booking-system py-5">
        <Container>
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold">Book Your Appointment</h1>
            <p className="lead">
              Find and book an appointment with a specialized doctor in a few simple steps
            </p>
          </div>
          {!bookingSuccess && renderProgressBar()}
          <Card className="booking-card shadow-sm border-0">
            <Card.Body className="p-4">{renderStep()}</Card.Body>
          </Card>
        </Container>
      </Container>
      <Footer />
    </>
  );
};

export default BookingSystem;