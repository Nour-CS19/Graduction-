
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import Navbar from '../components/Nav';
import Footer from '../components/Footer';
import '../ServicesConsultantions/css/AtHomeConsultantion.css';
import { useAuth } from '../Pages/AuthPage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function AtHomeConsultantion() {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const patientId = user?.id;
  const [step, setStep] = useState(1);
  const [specializations, setSpecializations] = useState([]);
  const [cities, setCities] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedSpecializationName, setSelectedSpecializationName] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
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

  useEffect(() => {
    if (accessToken) {
      fetchSpecializations();
    } else {
      setError('Authentication token not found. Please log in.');
    }
  }, [accessToken]);

  useEffect(() => {
    return () => {
      doctors.forEach((doctor) => {
        if (doctor.imageUrl) {
          URL.revokeObjectURL(doctor.imageUrl);
        }
      });
    };
  }, [doctors]);

  const fetchSpecializations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/Specializations/GetAll`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format: Expected an array of specializations');
      }
      setSpecializations(response.data);
    } catch (error) {
      console.error('Fetch Specializations Error:', error);
      setError(
        error.response?.status === 401
          ? 'Session expired. Please log in again.'
          : error.response?.data?.message || 'Failed to load specializations. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/Cities/GetAll`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format: Expected an array of cities');
      }
      setCities(response.data);
    } catch (error) {
      console.error('Fetch Cities Error:', error);
      setError(
        error.response?.status === 401
          ? 'Session expired. Please log in again.'
          : error.response?.data?.message || 'Failed to load cities. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    if (!selectedSpecialization || !selectedCity) {
      setError('Please select both a specialization and a city.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setDoctors([]);
      const response = await axios.get(`${API_BASE_URL}/DoctorCityAtHomes/GetAllDoctorAtHome`, {
        params: {
          specialId: selectedSpecialization,
          cityId: selectedCity,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format: Expected an array of doctors');
      }

      if (response.data.length === 0) {
        setError(`No doctors found for ${selectedSpecializationName} in ${selectedCityName}.`);
        return;
      }

      const normalizedDoctors = response.data.map((doctor) => ({
        id: doctor.doctorId,
        doctorClinicId: doctor.doctorClinicId,
        fullName: doctor.fullName || 'Unknown Doctor',
        phoneNumber: doctor.phoneNumber || 'N/A',
        address: doctor.address || 'N/A',
        experienceYears: doctor.experienceYears || 0,
        evaluation: doctor.evaluation || 0,
        image: doctor.fileName,
        specialty: selectedSpecializationName,
        rating: doctor.evaluation || 0,
        experience: doctor.experienceYears || 0,
        isAvailable: true,
      }));

      const doctorsWithImages = await Promise.all(
        normalizedDoctors.map(async (doctor) => {
          if (doctor.image && typeof doctor.image === 'string' && doctor.image.trim() !== '') {
            try {
              const imageUrl = `${API_BASE_URL}/Upload/image?filename=${encodeURIComponent(doctor.image)}&path=Actors/Doctor/`;
              const imageResponse = await axios.get(imageUrl, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              const blob = new Blob([imageResponse.data], { type: imageResponse.data.type });
              doctor.imageUrl = URL.createObjectURL(blob);
            } catch (imageError) {
              console.error('Fetch Doctor Image Error:', imageError);
              doctor.imageUrl = null;
            }
          } else {
            doctor.imageUrl = null;
          }
          return doctor;
        })
      );

      setDoctors(doctorsWithImages);
    } catch (error) {
      console.error('Fetch Doctors Error:', error);
      setError(
        error.response?.status === 401
          ? 'Session expired. Please log in again.'
          : error.response?.data?.message || 'Failed to load doctors. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  
  const fetchAppointments = async (doctorClinicId) => {
    if (!doctorClinicId) {
      setError('Doctor clinic ID is missing. Please select a doctor.');
      return;
    }
  
    try {
      setLoading(true);
      setError('');
      setAppointments([]);
      
      const response = await axios.get(
        `${API_BASE_URL}/DoctorAppointmentAtHomes/GetAll/${doctorClinicId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
  
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format: Expected an array of appointments');
      }
  
      if (response.data.length === 0) {
        setError('No available appointments for this doctor in the selected city.');
        return;
      }
  
      const normalizedAppointments = response.data.map((appointment) => {
        const appointmentId = appointment.appointmentAtHomeId || appointment.Id || appointment.id;
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
          price: appointment.price !== undefined ? Number(appointment.price) : (appointment.Price || 0.0),
        };
      });
  
      const validAppointments = normalizedAppointments.filter((appt) => appt !== null && appt.id);
      
      if (validAppointments.length === 0) {
        setError('No valid appointments found. Please try another doctor.');
        return;
      }
  
      console.log('Appointments:', validAppointments); // Debug log
      setAppointments(validAppointments);
      
    } catch (error) {
      console.error('Fetch Appointments Error:', error);
      
      let errorMessage = 'Failed to load appointments.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'An internal server error occurred. Please try again later or contact support.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setError('');
    switch (step) {
      case 1:
        if (!selectedSpecialization) {
          setError('Please select a specialization');
          return;
        }
        await fetchCities();
        setStep(2);
        break;
      case 2:
        if (!selectedCity) {
          setError('Please select a city.');
          return;
        }
        await fetchDoctors();
        setStep(3);
        break;
      case 3:
        if (!selectedDoctor) {
          setError('Please select a doctor.');
          return;
        }
        if (!selectedDoctor.isAvailable) {
          setError('Selected doctor is unavailable.');
          return;
        }
        if (!selectedDoctor.doctorClinicId) {
          setError('Doctor clinic ID is missing. Please select another doctor.');
          return;
        }
        await fetchAppointments(selectedDoctor.doctorClinicId);
        setStep(4);
        break;
      case 4:
        if (!selectedAppointment || !selectedAppointment.time) {
          setError('Please select an appointment.');
          return;
        }
        setStep(5);
        break;
      default:
        break;
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    setError('');
    switch (step) {
      case 2:
        setSelectedCity('');
        setSelectedCityName('');
        setDoctors([]);
        setAppointments([]);
        setSelectedDoctor(null);
        setSelectedAppointment(null);
        setStep(1);
        break;
      case 3:
        setDoctors([]);
        setAppointments([]);
        setSelectedDoctor(null);
        setSelectedAppointment(null);
        setStep(2);
        break;
      case 4:
        setAppointments([]);
        setSelectedAppointment(null);
        setStep(3);
        break;
      case 5:
        setStep(4);
        break;
      default:
        break;
    }
  };

  const handleSpecializationSelect = (e) => {
    const specialId = e.target.value;
    const spec = specializations.find((s) => s.id === specialId);
    setSelectedSpecialization(spec ? spec.id : '');
    setSelectedSpecializationName(spec ? spec.nameEN : '');
    setDoctors([]);
    setAppointments([]);
    setSelectedDoctor(null);
    setSelectedAppointment(null);
    setError('');
  };

  const handleCitySelect = (e) => {
    const cityId = e.target.value;
    const city = cities.find((c) => c.id === cityId);
    setSelectedCity(city ? city.id : '');
    setSelectedCityName(city ? city.cityName : '');
    setDoctors([]);
    setAppointments([]);
    setSelectedDoctor(null);
    setSelectedAppointment(null);
    setError('');
  };

  const handleDoctorSelect = (doctor, e) => {
    e.preventDefault();
    if (!doctor || !doctor.id) {
      setError('Failed to select doctor: Invalid doctor data.');
      return;
    }
    setSelectedDoctor(doctor);
    setSelectedAppointment(null);
    setAppointments([]);
    setError('');
  };

  const handleAppointmentSelect = (appointment, e) => {
    e.preventDefault();
    if (!appointment || !appointment.id) {
      setError('Invalid appointment selected. Please try again.');
      return;
    }
    setSelectedAppointment(appointment);
    setError('');
    console.log('Selected Appointment:', appointment); // Debug log
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

  const handleFileUpload = async (e) => {
    e.preventDefault();
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
    if (!accessToken) {
      setError('Authentication required to submit booking. Please log in.');
      return;
    }
    if (!patientId) {
      setError('User ID not found. Please log in again.');
      return;
    }
    if (!validateForm()) {
      setError('Please correct the errors in the form before submitting.');
      return;
    }
    if (!selectedDoctor || !selectedDoctor.id || !selectedDoctor.doctorClinicId || !selectedAppointment || !selectedAppointment.id) {
      setError('Please complete all required selections and ensure a valid appointment is selected.');
      return;
    }
    const totalPrice = selectedAppointment.price ?? 0.0;
    if (totalPrice === null || isNaN(totalPrice)) {
      setError('Unable to determine appointment price. Please try again.');
      return;
    }
    try {
      await fetchAppointments(selectedDoctor.doctorClinicId);
      const isAppointmentStillValid = appointments.some((appt) => appt.id === selectedAppointment.id);
      if (!isAppointmentStillValid) {
        setError('The selected appointment is no longer available. Please choose another.');
        setSelectedAppointment(null);
        setStep(4);
        return;
      }
    } catch (error) {
      console.error('Validate Appointment Error:', error);
      setError('Failed to validate appointment. Please try again.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('PatientId', patientId);
      formData.append('DoctorId', selectedDoctor.id);
      formData.append('DoctorAppointmentAtHomeId', selectedAppointment.id);
      formData.append('MedicalCondition', bookFormData.medicalCondition || '');
      if (bookFormData.paymentImage instanceof File) {
        formData.append('Image', bookFormData.paymentImage, bookFormData.paymentImage.name);
      }
      formData.append('TotalPrice', Number(totalPrice).toString());

      console.log('Booking FormData:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${typeof value === 'string' ? value.slice(0, 50) : '[Binary Data]'}`);
      }

      const response = await axios.post(`${API_BASE_URL}/PatientBookingDoctorAtHomes`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log('Booking Response:', response.data);
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
      console.error('Booking Error:', error);
      let errorMessage =
        error.response?.status === 401
          ? 'Session expired. Please log in again.'
          : error.response?.status === 400
          ? error.response?.data?.message || 'Invalid booking data. Please check your selections and try again.'
          : error.response?.data?.message || 'Failed to submit booking.';
      if (errorMessage.includes('FOREIGN KEY') || errorMessage.includes('FK_PatientBookingDoctorAtHomes')) {
        errorMessage = 'The selected appointment is no longer available. Please choose a different appointment.';
        setStep(4);
        setSelectedAppointment(null);
        await fetchAppointments(selectedDoctor.doctorClinicId);
      } else if (error.response?.status === 500) {
        errorMessage = 'An internal server error occurred. Please try again later or contact support.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setSelectedSpecialization('');
    setSelectedSpecializationName('');
    setSelectedCity('');
    setSelectedCityName('');
    setDoctors([]);
    setSelectedDoctor(null);
    setAppointments([]);
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
    setStep(1);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const renderFallbackContent = (message) => (
    <div className="text-center py-5">
      <Alert variant="warning">{message || 'No data available. Please try again later.'}</Alert>
      {step > 1 && (
        <Button
          variant="outline-secondary"
          className="px-4 py-2 d-flex align-items-center mt-3"
          onClick={handleBack}
        >
          <i className="bi bi-arrow-left me-2"></i> Back
        </Button>
      )}
    </div>
  );

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  const downloadBookingPDF = (e) => {
    e.preventDefault();
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('At-Home Consultation Booking Confirmation', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 195, 20, { align: 'right' });

    const tableColumns = ['Field', 'Details'];
    const tableData = [
      ['Doctor', `Dr. ${selectedDoctor?.fullName || 'N/A'}`],
      ['Specialization', selectedSpecializationName || 'N/A'],
      ['Date', formatDate(selectedAppointment?.date)],
      ['Time', selectedAppointment?.time || 'N/A'],
      ['Location', `${selectedCityName || 'N/A'} (At Home)`],
      ['Price', `EGP ${selectedAppointment?.price?.toFixed(2) || 'N/A'}`],
      ['Medical Condition', bookFormData.medicalCondition || 'N/A'],
      ['Address', bookFormData.address || 'N/A'],
    ];

    autoTable(doc, {
      head: [tableColumns],
      body: tableData,
      startY: 25,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `PhysioCare At-Home Booking - Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`athome_booking_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar />
      <div className="flex-grow-1 py-5">
        <Container>
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-primary">At Home Consultation</h1>
            <p className="lead text-muted">Get expert medical care in the comfort of your home</p>
          </div>

          {error && <Alert variant="danger" className="shadow-sm">{error}</Alert>}
          {bookingSuccess && <Alert variant="success" className="shadow-sm">Booking completed successfully!</Alert>}

          <div className="mb-5">
            <Row className="text-center">
              <Col>
                <div className={step >= 1 ? 'step-circle active' : 'step-circle'}>
                  <i className="bi bi-list-check"></i>
                </div>
                <div className="step-label">Select Specialization</div>
              </Col>
              <Col>
                <div className={step >= 2 ? 'step-circle active' : 'step-circle'}>
                  <i className="bi bi-geo-alt"></i>
                </div>
                <div className="step-label">Select City</div>
              </Col>
              <Col>
                <div className={step >= 3 ? 'step-circle active' : 'step-circle'}>
                  <i className="bi bi-person-badge"></i>
                </div>
                <div className="step-label">Choose Doctor</div>
              </Col>
              <Col>
                <div className={step >= 4 ? 'step-circle active' : 'step-circle'}>
                  <i className="bi bi-calendar-check"></i>
                </div>
                <div className="step-label">Select Appointment</div>
              </Col>
              <Col>
                <div className={step >= 5 ? 'step-circle active' : 'step-circle'}>
                  <i className="bi bi-pencil-square"></i>
                </div>
                <div className="step-label">Book & Pay</div>
              </Col>
              <Col>
                <div className={step >= 6 ? 'step-circle active' : 'step-circle'}>
                  <i className="bi bi-check2-circle"></i>
                </div>
                <div className="step-label">Confirmation</div>
              </Col>
            </Row>
          </div>

          {step === 1 && (
            <Card className="mb-4 shadow border-0 rounded-lg">
              <Card.Header className="bg-primary text-white py-3">
                <h3 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-list-check me-2"></i>Step 1: Select Specialization
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                {loading ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading data...</p>
                  </div>
                ) : specializations.length > 0 ? (
                  <>
                    <Row className="g-4 mb-4">
                      <Col md={6} className="mx-auto">
                        <Form.Group controlId="specializationSelect">
                          <Form.Label>Select Specialization</Form.Label>
                          <Form.Select
                            value={selectedSpecialization}
                            onChange={handleSpecializationSelect}
                            aria-label="Select a specialization"
                          >
                            <option value="">Choose a specialization...</option>
                            {specializations.map((spec) => (
                              <option key={spec.id} value={spec.id}>
                                {spec.nameEN} ({spec.nameAR})
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-end mt-4">
                      <Button
                        variant="primary"
                        className="px-4 py-2 d-flex align-items-center"
                        onClick={handleNext}
                        disabled={!selectedSpecialization}
                      >
                        Next <i className="bi bi-arrow-right ms-2"></i>
                      </Button>
                    </div>
                  </>
                ) : (
                  renderFallbackContent('No specializations available.')
                )}
              </Card.Body>
            </Card>
          )}

          {step === 2 && (
            <Card className="mb-4 shadow border-0 rounded-lg">
              <Card.Header className="bg-primary text-white py-3">
                <h3 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-geo-alt me-2"></i>Step 2: Select City
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                {loading ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading cities...</p>
                  </div>
                ) : cities.length > 0 ? (
                  <>
                    <Row className="g-4 mb-4">
                      <Col md={6} className="mx-auto">
                        <Form.Group controlId="citySelect">
                          <Form.Label>Select City</Form.Label>
                          <Form.Select
                            value={selectedCity}
                            onChange={handleCitySelect}
                            aria-label="Select a city"
                          >
                            <option value="">Choose a city...</option>
                            {cities.map((city) => (
                              <option key={city.id} value={city.id}>
                                {city.cityName || 'Unknown City'} ({city.governorate || 'N/A'})
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-between mt-4">
                      <Button
                        variant="outline-secondary"
                        className="px-4 py-2 d-flex align-items-center"
                        onClick={handleBack}
                      >
                        <i className="bi bi-arrow-left me-2"></i> Back
                      </Button>
                      <Button
                        variant="primary"
                        className="px-4 py-2 d-flex align-items-center"
                        onClick={handleNext}
                        disabled={!selectedCity}
                      >
                        Next <i className="bi bi-arrow-right ms-2"></i>
                      </Button>
                    </div>
                  </>
                ) : (
                  renderFallbackContent('No cities available.')
                )}
              </Card.Body>
            </Card>
          )}

          {step === 3 && (
            <Card className="mb-4 shadow border-0 rounded-lg">
              <Card.Header className="bg-primary text-white py-3">
                <h3 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-person-badge me-2"></i>Step 3: Choose Doctor
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                {loading ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading doctors...</p>
                  </div>
                ) : doctors.length > 0 ? (
                  <>
                    <Row className="g-4">
                      {doctors.map((doctor) => (
                        <Col key={doctor.id} lg={4} md={6} className="mb-4">
                          <Card
                            className={`h-100 rounded-lg ${
                              selectedDoctor?.id === doctor.id ? 'border-primary shadow' : 'border-0 shadow-sm'
                            }`}
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              transform: selectedDoctor?.id === doctor.id ? 'scale(1.03)' : 'scale(1)',
                            }}
                            onClick={(e) => handleDoctorSelect(doctor, e)}
                            onKeyDown={(e) => handleKeyDown(e, () => handleDoctorSelect(doctor, e))}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                              {doctor.imageUrl ? (
                                <Card.Img
                                  variant="top"
                                  src={doctor.imageUrl}
                                  alt={doctor.fullName}
                                  style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="bg-light d-flex align-items-center justify-content-center h-100">
                                  <i className="bi bi-person-circle fs-1 text-secondary"></i>
                                </div>
                              )}
                              {selectedDoctor?.id === doctor.id && (
                                <div className="position-absolute top-0 end-0 p-2">
                                  <Badge bg="success" pill className="px-3 py-2">
                                    <i className="bi bi-check-lg me-1"></i>Selected
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <Card.Body className="p-3">
                              <Card.Title className="mb-2 fs-5 fw-bold">
                                {doctor.fullName}
                                {doctor.isAvailable ? (
                                  <Badge bg="success" className="ms-2 fs-6">
                                    Available
                                  </Badge>
                                ) : (
                                  <Badge bg="danger" className="ms-2 fs-6">
                                    Unavailable
                                  </Badge>
                                )}
                              </Card.Title>
                              <div className="mb-2 text-muted">
                                <i className="bi bi-prescription2 me-2"></i>
                                {doctor.specialty}
                              </div>
                              <div className="mb-2 small">
                                <i className="bi bi-geo-alt me-2"></i>
                                {doctor.address}
                              </div>
                              <div className="mb-2 small">
                                <i className="bi bi-star-fill me-1 text-warning"></i>
                                <span>{doctor.rating} (N/A reviews)</span>
                              </div>
                              <div className="mb-2 small">
                                <i className="bi bi-calendar-check me-2"></i>
                                {doctor.experienceYears || 'N/A'} years experience
                              </div>
                            </Card.Body>
                            <Card.Footer className="bg-white border-top-0 p-3">
                              <div className="d-grid">
                                <Button
                                  variant={selectedDoctor?.id === doctor.id ? 'primary' : 'outline-primary'}
                                  size="sm"
                                  className="rounded-pill"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDoctorSelect(doctor, e);
                                  }}
                                >
                                  {selectedDoctor?.id === doctor.id ? (
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
                    {selectedDoctor && (
                      <div className="mt-4 pt-3 border-top">
                        <h5 className="mb-3">Selected Doctor</h5>
                        <div className="d-flex align-items-center">
                          <div className="me-3" style={{ width: '60px', height: '60px' }}>
                            {selectedDoctor.imageUrl ? (
                              <img
                                src={selectedDoctor.imageUrl}
                                alt={selectedDoctor.fullName}
                                className="rounded-circle"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="bg-light d-flex align-items-center justify-content-center rounded-circle h-100">
                                <i className="bi bi-person-circle fs-1 text-secondary"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <h6 className="mb-1">{selectedDoctor.fullName}</h6>
                            <p className="mb-0 text-muted small">{selectedDoctor.specialty}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="d-flex justify-content-between mt-4">
                      <Button
                        variant="outline-secondary"
                        className="px-4 py-2 d-flex align-items-center"
                        onClick={handleBack}
                      >
                        <i className="bi bi-arrow-left me-2"></i> Back
                      </Button>
                      <Button
                        variant="primary"
                        className="px-4 py-2 d-flex align-items-center"
                        onClick={handleNext}
                        disabled={!selectedDoctor || !selectedDoctor.isAvailable || !selectedDoctor.doctorClinicId}
                      >
                        Next <i className="bi bi-arrow-right ms-2"></i>
                      </Button>
                    </div>
                  </>
                ) : (
                  renderFallbackContent('No doctors found. Try adjusting your search criteria or check back later.')
                )}
              </Card.Body>
            </Card>
          )}

          {step === 4 && (
            <Card className="mb-4 shadow border-0 rounded-lg">
              <Card.Header className="bg-primary text-white py-3">
                <h3 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-calendar-check me-2"></i>Step 4: Select Appointment
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                {loading ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading appointments...</p>
                  </div>
                ) : appointments.length > 0 ? (
                  <>
                    <div className="mb-4 p-3 bg-light rounded-3 border">
                      <Row>
                        <Col md={4} className="d-flex align-items-center">
                          {selectedDoctor?.imageUrl ? (
                            <img
                              src={selectedDoctor.imageUrl}
                              alt={selectedDoctor.fullName}
                              className="rounded-circle me-3"
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                              style={{ width: '60px', height: '60px' }}
                            >
                              <i className="bi bi-person-fill fs-4"></i>
                            </div>
                          )}
                          <div>
                            <h5 className="mb-0">Dr. {selectedDoctor?.fullName}</h5>
                            <div className="text-muted small">{selectedSpecializationName}</div>
                          </div>
                        </Col>
                        <Col md={4} className="d-flex align-items-center">
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <i className="bi bi-star-fill text-warning me-2"></i>
                              <span>{selectedDoctor?.evaluation || 'N/A'} Rating</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-briefcase me-2"></i>
                              <span>{selectedDoctor?.experienceYears || 'N/A'} years</span>
                            </div>
                          </div>
                        </Col>
                        <Col md={4} className="d-flex align-items-center">
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <i className="bi bi-geo-alt-fill me-2"></i>
                              <span>{selectedCityName}</span>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                    <h5 className="mb-3">Available Appointments</h5>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group controlId="dateSelect">
                          <Form.Label>Select Date</Form.Label>
                          <Form.Select
                            value={selectedAppointment?.date || ''}
                            onChange={(e) => {
                              const date = e.target.value;
                              const appt = appointments.find((a) => a.date === date);
                              if (appt) setSelectedAppointment({ ...appt, time: '', price: null });
                              else setSelectedAppointment(null);
                            }}
                            aria-label="Select a date"
                          >
                            <option value="">Select Date</option>
                            {[...new Set(appointments.map((a) => a.date))].map((date) => (
                              <option key={date} value={date}>
                                {formatDate(date)}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="timeSelect">
                          <Form.Label>Select Time</Form.Label>
                          <Form.Select
                            value={selectedAppointment?.time || ''}
                            onChange={(e) => {
                              const time = e.target.value;
                              const appt = appointments.find(
                                (a) => a.time === time && a.date === selectedAppointment?.date
                              );
                              if (appt) handleAppointmentSelect(appt, e);
                            }}
                            disabled={!selectedAppointment?.date}
                            aria-label="Select a time"
                          >
                            <option value="">Select Time</option>
                            {appointments
                              .filter((a) => a.date === selectedAppointment?.date)
                              .map((a) => ({
                                time: a.time,
                                price: a.price,
                                id: a.id,
                              }))
                              .filter((v, i, self) => self.findIndex((t) => t.time === v.time) === i)
                              .map(({ time, price, id }) => (
                                <option key={id} value={time}>
                                  {time} (EGP {price.toFixed(2)})
                                </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    {selectedAppointment && selectedAppointment.time && (
                      <div className="mt-3">
                        <strong>Price: </strong> EGP {selectedAppointment.price?.toFixed(2) || 'N/A'}
                      </div>
                    )}
                    <div className="d-flex justify-content-between mt-4">
                      <Button
                        variant="outline-secondary"
                        className="px-4 py-2 d-flex align-items-center"
                        onClick={handleBack}
                      >
                        <i className="bi bi-arrow-left me-2"></i> Back
                      </Button>
                      <Button
                        variant="primary"
                        className="px-4 py-2 d-flex align-items-center"
                        onClick={handleNext}
                        disabled={!selectedAppointment || !selectedAppointment.time}
                      >
                        Next <i className="bi bi-arrow-right ms-2"></i>
                      </Button>
                    </div>
                  </>
                ) : (
                  renderFallbackContent('No appointments available for this doctor in the selected city.')
                )}
              </Card.Body>
            </Card>
          )}

          {step === 5 && (
            <Card className="mb-4 shadow border-0 rounded-lg">
              <Card.Header className="bg-primary text-white py-3">
                <h3 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-pencil-square me-2"></i>Step 5: Book & Pay
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-4 p-3 bg-light rounded-3 border">
                  <h5 className="mb-3">Appointment Summary</h5>
                  <Row>
                    <Col md={4}>
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
                            className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                            style={{ width: '50px', height: '50px' }}
                          >
                            <i className="bi bi-person-fill fs-4"></i>
                          </div>
                        )}
                        <div>
                          <div className="fw-bold">Doctor:</div>
                          Dr. {selectedDoctor?.fullName}
                        </div>
                      </div>
                      <div>
                        <div className="fw-bold">Specialization:</div>
                        {selectedSpecializationName}
                      </div>
                    </Col>
                    <Col md={4}>
                      <div>
                        <div className="fw-bold">Date:</div>
                        {formatDate(selectedAppointment?.date)}
                      </div>
                      <div>
                        <div className="fw-bold">Time:</div>
                        {selectedAppointment?.time}
                      </div>
                    </Col>
                    <Col md={4}>
                      <div>
                        <div className="fw-bold">Location:</div>
                        {selectedCityName} (At Home)
                      </div>
                      <div>
                        <div className="fw-bold">Price:</div>
                        EGP {selectedAppointment?.price?.toFixed(2) || 'N/A'}
                      </div>
                    </Col>
                  </Row>
                </div>
                <h5 className="mb-3">Patient Information</h5>
                <Form onSubmit={handleBookSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="formName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="Enter your full name"
                          value={bookFormData.name}
                          onChange={handleBookFormChange}
                          isInvalid={!!formErrors.name}
                          aria-label="Full name"
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="formPhone">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phoneNumber"
                          placeholder="Enter your phone number"
                          value={bookFormData.phoneNumber}
                          onChange={handleBookFormChange}
                          isInvalid={!!formErrors.phoneNumber}
                          aria-label="Phone number"
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.phoneNumber}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="formEmail">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="Enter your email address"
                          value={bookFormData.email}
                          onChange={handleBookFormChange}
                          isInvalid={!!formErrors.email}
                          aria-label="Email address"
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="formAddress">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          placeholder="Enter your home address for the visit"
                          value={bookFormData.address}
                          onChange={handleBookFormChange}
                          isInvalid={!!formErrors.address}
                          aria-label="Home address"
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.address}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="formMedicalCondition">
                        <Form.Label>Medical Condition</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="medicalCondition"
                          placeholder="Describe your medical condition or reason for consultation"
                          value={bookFormData.medicalCondition}
                          onChange={handleBookFormChange}
                          isInvalid={!!formErrors.medicalCondition}
                          aria-label="Medical condition"
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.medicalCondition}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="formPaymentImage">
                        <Form.Label>Payment Proof</Form.Label>
                        <Form.Control
                          type="file"
                          name="paymentImage"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={handleFileUpload}
                          isInvalid={!!formErrors.paymentImage}
                          aria-label="Upload payment proof"
                        />
                        <Form.Text className="text-muted mt-2">
                          Please send payment to Vodafone Cash number: +201234567890 and upload the receipt (JPG, PNG, or GIF, max 5MB).
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">{formErrors.paymentImage}</Form.Control.Feedback>
                        {bookFormData.paymentImage && (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(bookFormData.paymentImage)}
                              alt="Payment Proof"
                              style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                            />
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-between mt-4">
                    <Button
                      variant="outline-secondary"
                      className="px-4 py-2 d-flex align-items-center"
                      onClick={handleBack}
                      type="button"
                    >
                      <i className="bi bi-arrow-left me-2"></i> Back
                    </Button>
                    <Button
                      variant="success"
                      className="px-4 py-2 d-flex align-items-center"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete Booking <i className="bi bi-check-lg ms-2"></i>
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {step === 6 && (
            <Card className="mb-4 shadow border-0 rounded-lg">
              <Card.Header className="bg-success text-white py-3">
                <h3 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-check2-circle me-2"></i>Step 6: Booking Confirmation
                </h3>
              </Card.Header>
              <Card.Body className="p-4 text-center">
                <div>
                  <div className="mb-4">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
                  </div>
                  <h3 className="mb-3">Your appointment has been successfully booked!</h3>
                  <p className="lead mb-4">
                    A confirmation email has been sent to your email address with all the details.
                  </p>
                  <div className="bg-light p-4 rounded mb-4 w-75 mx-auto">
                    <h5 className="border-bottom pb-2 mb-3">Appointment Details</h5>
                    <Row className="text-start g-3">
                      <Col md={6}>
                        <div className="fw-bold">Doctor:</div>
                        <div>Dr. {selectedDoctor?.fullName}</div>
                      </Col>
                      <Col md={6}>
                        <div className="fw-bold">Specialization:</div>
                        <div>{selectedSpecializationName}</div>
                      </Col>
                      <Col md={6}>
                        <div className="fw-bold">Date:</div>
                        <div>{formatDate(selectedAppointment?.date)}</div>
                      </Col>
                      <Col md={6}>
                        <div className="fw-bold">Time:</div>
                        <div>{selectedAppointment?.time}</div>
                      </Col>
                      <Col md={6}>
                        <div className="fw-bold">Location:</div>
                        <div>{selectedCityName} (At Home)</div>
                      </Col>
                      <Col md={6}>
                        <div className="fw-bold">Price:</div>
                        <div>EGP {selectedAppointment?.price?.toFixed(2) || 'N/A'}</div>
                      </Col>
                    </Row>
                  </div>
                  <p className="mb-4">
                    Our doctor will arrive at your location at the scheduled time. Please ensure someone is available to receive them.
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <Button
                      variant="primary"
                      className="px-5 py-2"
                      onClick={handleReset}
                    >
                      Book Another Appointment
                    </Button>
                    <Button
                      variant="success"
                      className="px-5 py-2"
                      onClick={downloadBookingPDF}
                    >
                      Download PDF
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>
      <Footer />
    </div>
  );
}

export default AtHomeConsultantion;
