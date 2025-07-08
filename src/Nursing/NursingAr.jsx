
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import Navbar from '../components/Nav';
import Footer from '../components/Footer';
import { useAuth } from '../Pages/AuthPage';
import '../ServicesConsultantions/css/OnlineBooking.css';

const API_BASE_URL = 'https://physiocareapp.runasp.net';
const VODAFONE_CASH_NUMBER = '+01091778920';

// Step Header Component
function StepHeader({ currentStep }) {
  const steps = ['Service', 'City', 'Nurse', 'Appointment', 'Patient Info'];

  return (
    <Row className="justify-content-center text-center my-4">
      {steps.map((step, index) => (
        <Col key={index}>
          <div
            className={`rounded-circle d-inline-flex justify-content-center align-items-center ${
              index + 1 <= currentStep ? 'bg-primary text-white' : 'bg-secondary text-white'
            }`}
            style={{ width: '50px', height: '50px' }}
          >
            {index + 1}
          </div>
          <p className={`mt-2 ${index + 1 <= currentStep ? 'text-primary' : 'text-secondary'}`}>
            {step}
          </p>
        </Col>
      ))}
    </Row>
  );
}

const NursingAr = () => {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const patientId = user?.id;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [nursingServices, setNursingServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [appointmentSlots, setAppointmentSlots] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [formData, setFormData] = useState({
    nursingId: '',
    cityId: '',
    nurseId: '',
    appointmentId: '',
    patientId: patientId || '',
    medicalCondition: '',
    totalPrice: 0,
    fullName: '',
    address: '',
    phoneNumber: '',
    image: null,
  });

  const [errors, setErrors] = useState({});

  const nurseImages = [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNmOGY5ZmEiLz48Y2lyY2xlIGNqPSIxMDAiIGN5PSI4NSIgcj0iMzUiIGZpbGw9IiM2MzY2ZjEiLz48cGF0aCBkPSJNNjUgMTQwYzAtMTkuMzMgMTUuNjctMzUgMzUtMzVzMzUgMTUuNjcgMzUgMzV2NDBINjV2LTQweiIgZmlsbD0iIzYzNjZmMSIvPjxjaXJjbGUgY3g9IjE3MCIgY3k9IjUwIiByPSI4IiBmaWxsPSIjZWY0NDQ0Ii8+PGxpbmUgeDE9IjE2NiIgeTE9IjUwIiB4Mj0iMTc0IiB5Mj0iNTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxNzAiIHkxPSI0NiIgeDI9IjE3MCIgeTI9IjU0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNmMGZkZjQiLz48Y2lyY2xlIGNqPSIxMDAiIGN5PSI4NSIgcj0iMzUiIGZpbGw9IiMxMGI5ODEiLz48cGF0aCBkPSJNNjUgMTQwYzAtMTkuMzMgMTUuNjctMzUgMzUtMzVzMzUgMTUuNjcgMzUgMzV2NDBINjV2LTQweiIgZmlsbD0iIzEwYjk4MSIvPjxjaXJjbGUgY3g9IjE3MCIgY3k9IjUwIiByPSI4IiBmaWxsPSIjZWY0NDQ0Ci8+PGxpbmUgeDE9IjE2NiIgeTE9IjUwIiB4Mj0iMTc0IiB5Mj0iNTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxNzAiIHkxPSI0NiIgeDI9IjE3MCIgeTI9IjU0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNmZWY3ZmYiLz48Y2lyY2xlIGNqPSIxMDAiIGN5PSI4NSIgcj0iMzUiIGZpbGw9IiMzYjgyZjYiLz48cGF0aCBkPSJNNjUgMTQwYzAtMTkuMzMgMTUuNjctMzUgMzUtMzVzMzUgMTUuNjcgMzUgMzV2NDBINjV2LTQweiIgZmlsbD0iIzNiODJmNiIvPjxjaXJjbGUgY3g9IjE3MCIgY3k9IjUwIiByPSI4IiBmaWxsPSIjZWY4NDQ0Ii8+PGxpbmUgeDE9IjE2NiIgeTE9IjUwIiB4Mj0iMTc0IiB5Mj0iNTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxNzAiIHkxPSI0NiIgeDI9IjE3MCIgeTI9IjU0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
  ];

  const displayValue = (value) => {
    return value === null || value === undefined || value === '' || value === 'null' ? 'N/A' : value;
  };

  const fetchNurseImage = async (fileName) => {
    if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
      return null;
    }
    try {
      const imageUrl = `${API_BASE_URL}/api/v1/Upload/image?filename=${encodeURIComponent(fileName)}&path=Actors/Nurse`;
      const response = await axios.get(imageUrl, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const contentType = response.headers['content-type'] || '';
      if (response.status === 200 && contentType.startsWith('image/')) {
        const blob = new Blob([response.data], { type: contentType });
        return URL.createObjectURL(blob);
      }
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

  useEffect(() => {
    if (step === 1 && accessToken) {
      setLoading(true);
      setError(null);
      axios
        .get(`${API_BASE_URL}/api/v1/Nursings/GetAll`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          setNursingServices(Array.isArray(response.data) ? response.data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching services:', err.message);
          setError('Failed to load nursing services.');
          setNursingServices([
            { id: 'nursing-1', name: 'IV Fluid Administration', description: 'Administer IV fluids safely.' },
            { id: 'nursing-2', name: 'Post-Surgery Care', description: 'Post-operative care and monitoring.' },
            { id: 'nursing-3', name: 'Home Care Service', description: 'In-home patient care and assistance.' },
          ]);
          setLoading(false);
        });
    }
  }, [step, accessToken]);

  useEffect(() => {
    if (step === 2 && accessToken) {
      setLoading(true);
      setError(null);
      axios
        .get(`${API_BASE_URL}/api/v1/Cities/GetAll`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          setCities(Array.isArray(response.data) ? response.data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching cities:', err.message);
          setError('Failed to load cities.');
          setCities([
            { id: 'city-1', cityName: 'Cairo', governorate: 'Cairo' },
            { id: 'city-2', cityName: 'Alexandria', governorate: 'Alexandria' },
          ]);
          setLoading(false);
        });
    }
  }, [step, accessToken]);

  useEffect(() => {
    if (step === 3 && formData.nursingId && formData.cityId && accessToken) {
      setLoading(true);
      setError(null);
      axios
        .get(`${API_BASE_URL}/api/v1/Nurses/SelectedNurseInfo`, {
          params: { nursingId: formData.nursingId, cityId: formData.cityId },
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then(async (response) => {
          const nurseData = Array.isArray(response.data) ? response.data : [];
          const normalizedNurses = await Promise.all(
            nurseData.map(async (nurse, index) => {
              const imageUrl = nurse.profilePicture ? await fetchNurseImage(nurse.profilePicture) : null;
              return {
                ...nurse,
                uniqueId: nurse.id ? `nurse-${nurse.id}-${index}` : `nurse-unknown-${index}`,
                imageUrl,
                hasImage: !!imageUrl,
              };
            })
          );
          setNurses(normalizedNurses);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching nurses:', error.message);
          setError('Failed to load nurses.');
          setNurses([]);
          setLoading(false);
        });
    }
  }, [step, formData.nursingId, formData.cityId, accessToken]);

  useEffect(() => {
    if (step === 4 && formData.nurseId && formData.nursingId && formData.cityId && accessToken) {
      setLoading(true);
      setError(null);
      axios
        .get(`${API_BASE_URL}/api/v1/NurseAppointment/get-all-nurse-nursing-city-appointment`, {
          params: { nurseId: formData.nurseId, nursingId: formData.nursingId, cityid: formData.cityId },
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          const slotsData = Array.isArray(response.data) ? response.data : [];
          setAppointmentSlots(slotsData.map(slot => ({
            ...slot,
            nurseId: formData.nurseId,
            nurseName: selectedNurse?.fullName || 'Unknown Nurse',
            nursePrice: selectedNurse?.price || 0,
          })));
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching appointment slots:', error.message);
          setError('Failed to load appointment slots.');
          setAppointmentSlots([]);
          setLoading(false);
        });
    }
  }, [step, formData.nurseId, formData.nursingId, formData.cityId, accessToken, selectedNurse]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name is required and must be at least 3 characters';
    }
    if (!formData.phoneNumber || !/^\d{10,15}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Valid phone number is required';
    }
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.medicalCondition) newErrors.medicalCondition = 'Medical condition is required';
    if (!formData.image) newErrors.image = 'Payment screenshot is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accessToken) {
      setError('Authentication token not found. Please log in.');
      return;
    }
    if (!validateForm()) {
      setError('Please correct the errors in the form before submitting.');
      return;
    }

    setLoading(true);
    const bookingData = new FormData();
    bookingData.append('PatientID', formData.patientId);
    bookingData.append('NurseID', formData.nurseId);
    bookingData.append('NurseNurseingAppointmentID', formData.appointmentId);
    bookingData.append('MedicalCondition', formData.medicalCondition);
    bookingData.append('Image', formData.image);
    bookingData.append('TotalPrice', formData.totalPrice);

    axios
      .post(`${API_BASE_URL}/api/v1/PatientBookNurse/addNewBooking`, bookingData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        setBookingSuccess(true);
        setStep(6);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error submitting booking:', error.message);
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
    if (file && !file.type.startsWith('image/')) {
      setError('Please upload an image file (e.g., PNG, JPEG).');
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }
    setFormData({ ...formData, image: file });
    if (errors.image) {
      setErrors({ ...errors, image: null });
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedCity(null);
    setSelectedNurse(null);
    setSelectedAppointment(null);
    setBookingSuccess(false);
    setErrors({});
    setFormData({
      nursingId: '',
      cityId: '',
      nurseId: '',
      appointmentId: '',
      patientId: patientId || '',
      medicalCondition: '',
      totalPrice: 0,
      fullName: '',
      address: '',
      phoneNumber: '',
      image: null,
    });
    setSuccessMessage(null);
    setError(null);
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set font and styles
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);

      // Header
      doc.setTextColor(0, 102, 204); // Primary blue color
      doc.text('Nursing Appointment Confirmation', 105, 20, { align: 'center' });

      // Line under header
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 204);
      doc.line(20, 25, 190, 25);

      // Booking Details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const startY = 35;
      const lineHeight = 10;
      const labelX = 20;
      const valueX = 70;

      const fields = [
        { label: 'Booking ID:', value: `BOOKING-${Math.random().toString(36).substr(2, 9)}` },
        { label: 'Service:', value: displayValue(selectedService?.name) },
        { label: 'Nurse:', value: displayValue(selectedNurse?.fullName) },
        { label: 'Date:', value: displayValue(selectedAppointment?.date) },
        { label: 'Time:', value: displayValue(selectedAppointment?.time) },
        { label: 'Patient:', value: displayValue(formData.fullName) },
        { label: 'Phone:', value: displayValue(formData.phoneNumber) },
        { label: 'Address:', value: displayValue(formData.address) },
        { label: 'Medical Condition:', value: displayValue(formData.medicalCondition) },
        { label: 'Total Price:', value: `${displayValue(formData.totalPrice)} EGP` },
        { label: 'Payment Method:', value: `Vodafone Cash (${VODAFONE_CASH_NUMBER})` },
      ];

      let currentY = startY;
      fields.forEach((field) => {
        doc.setFont('helvetica', 'bold');
        doc.text(field.label, labelX, currentY);
        doc.setFont('helvetica', 'normal');
        
        // Split text for long values like address or medical condition
        const splitValue = doc.splitTextToSize(field.value, 120); // Wrap text within 120mm
        doc.text(splitValue, valueX, currentY);
        currentY += lineHeight * Math.max(1, splitValue.length); // Adjust Y for multi-line text
      });

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 280);
      doc.text('Page 1 of 1', 190, 280, { align: 'right' });

      // Save the PDF
      doc.save('nursing-appointment.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const renderLoading = () => (
    <Alert variant="info" className="text-center">
      <Spinner animation="border" size="sm" className="me-2" />
      Loading...
    </Alert>
  );

  const renderSuccessMessage = () => (
    <Card className="mb-4 shadow border-0 rounded-lg confirmation-container">
      <Card.Header className="bg-success text-white py-3">
        <h3 className="mb-0 d-flex align-items-center">
          <i className="bi bi-check-circle-fill me-2"></i>Booking Confirmed
        </h3>
      </Card.Header>
      <Card.Body className="p-4 text-center">
        <div className="mb-4">
          <div className="success-icon-container mb-3">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
          </div>
          <h4>Thank you for your booking!</h4>
          <p>Your nursing appointment has been successfully scheduled.</p>
        </div>

        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Booking Details</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6} className="border-end">
                <dl className="row mb-0">
                  <dt className="col-sm-4">Service:</dt>
                  <dd className="col-sm-8">{selectedService?.name || 'N/A'}</dd>
                  <dt className="col-sm-4">Nurse:</dt>
                  <dd className="col-sm-8">{selectedNurse?.fullName || 'N/A'}</dd>
                  <dt className="col-sm-4">Status:</dt>
                  <dd className="col-sm-8">
                    <Badge bg="success">Confirmed</Badge>
                  </dd>
                </dl>
              </Col>
              <Col md={6}>
                <dl className="row mb-0">
                  <dt className="col-sm-4">Price:</dt>
                  <dd className="col-sm-8">{formData.totalPrice || 'N/A'} EGP</dd>
                  <dt className="col-sm-4">Date & Time:</dt>
                  <dd className="col-sm-8">{selectedAppointment?.date} at {selectedAppointment?.time}</dd>
                </dl>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Alert variant="info" className="d-flex align-items-center">
          <i className="bi bi-info-circle-fill me-2 fs-4"></i>
          <div>
            <p className="mb-0">
              A confirmation email has been sent to <strong>{formData.email || 'your email'}</strong> with all the details.
            </p>
          </div>
        </Alert>

        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <Button variant="outline-secondary" className="px-4 py-2" onClick={resetBooking}>
            <i className="bi bi-plus-circle me-2"></i>New Booking
          </Button>
          <Button variant="primary" className="px-4 py-2" onClick={downloadPDF}>
            <i className="bi bi-download me-2"></i>Download PDF
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const NavigationButtons = ({ onBack, onNext, backDisabled = false, nextDisabled = false, nextText = "Next", backText = "Back", isSubmit = false }) => (
    <div className="d-flex justify-content-between mt-4">
      <Button
        variant="outline-secondary"
        className="px-4 py-2 d-flex align-items-center"
        onClick={onBack}
        disabled={backDisabled}
      >
        <i className="bi bi-arrow-left me-2"></i> {backText}
      </Button>
      {isSubmit ? (
        <Button
          variant="success"
          type="submit"
          className="px-4 py-2 d-flex align-items-center"
          disabled={nextDisabled || loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            <>
              {nextText} <i className="bi bi-check-lg ms-2"></i>
            </>
          )}
        </Button>
      ) : (
        <Button
          variant="primary"
          className="px-4 py-2 d-flex align-items-center"
          onClick={onNext}
          disabled={nextDisabled}
          title={nextDisabled ? 'Please make a selection to continue' : ''}
        >
          {nextText} <i className="bi bi-arrow-right ms-2"></i>
        </Button>
      )}
    </div>
  );

  const renderStep = () => {
    if (!user) {
      return (
        <Card className="mx-auto shadow border-0 rounded-lg" style={{ maxWidth: '28rem' }}>
          <Card.Body className="text-center">
            <div className="mb-4">
              <i className="bi bi-person-lock fs-1 text-danger"></i>
            </div>
            <Card.Title className="fw-bold text-dark mb-4">Authentication Required</Card.Title>
            <Card.Text className="text-muted mb-4">Please log in to book nursing services.</Card.Text>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/login'}
              className="w-100"
            >
              Go to Login
            </Button>
          </Card.Body>
        </Card>
      );
    }

    if (loading) return renderLoading();
    if (bookingSuccess && step === 6) return renderSuccessMessage();

    switch (step) {
      case 1:
        return (
          <Card className="mb-4 shadow border-0 rounded-lg">
            <Card.Header className="bg-primary text-white py-3">
              <h3 className="mb-0">Select Nursing Service</h3>
            </Card.Header>
            <Card.Body className="p-4 d-flex flex-column justify-content-center align-items-center">
              {error && <Alert variant="danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</Alert>}
              {successMessage && <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
              {nursingServices.length === 0 && !loading && (
                <Alert variant="warning" className="text-center">
                  No nursing services available. Please try again later.
                </Alert>
              )}
              <Form.Group className="w-50" style={{ minWidth: '300px' }}>
                <Form.Label className="text-center d-block mb-2" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  Select a Nursing Service
                </Form.Label>
                <Form.Select
                  value={formData.nursingId}
                  onChange={(e) => {
                    const service = nursingServices.find((s) => s.id === e.target.value);
                    setSelectedService(service || null);
                    setFormData({ ...formData, nursingId: e.target.value });
                  }}
                  disabled={loading}
                  className="p-3"
                  style={{
                    fontSize: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderColor: '#ced4da',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <option value="">Select Nursing Service</option>
                  {nursingServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {displayValue(service.name)} - {displayValue(service.description)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="d-flex justify-content-between mt-5 w-50">
                <Button
                  variant="outline-secondary"
                  className="px-4 py-2 d-flex align-items-center"
                  onClick={() => window.location.href = '/'}
                >
                  <i className="bi bi-arrow-left me-2"></i> Home
                </Button>
                <Button
                  variant="primary"
                  className="px-4 py-2 d-flex align-items-center"
                  onClick={() => {
                    if (formData.nursingId) {
                      setStep(2);
                    }
                  }}
                  disabled={!formData.nursingId}
                  title={!formData.nursingId ? 'Please make a selection to continue' : ''}
                >
                  Next <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        );

      case 2:
        return (
          <Card className="mb-4 shadow border-0 rounded-lg">
            <Card.Header className="bg-primary text-white py-3">
              <h3 className="mb-0">Select City</h3>
            </Card.Header>
            <Card.Body className="p-4 d-flex flex-column justify-content-center align-items-center">
              {error && <Alert variant="danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</Alert>}
              {successMessage && <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
              {cities.length === 0 && !loading && (
                <Alert variant="warning" className="text-center">
                  No cities available. Please try again later.
                </Alert>
              )}
              <Form.Group className="w-50" style={{ minWidth: '300px' }}>
                <Form.Label className="text-center d-block mb-2" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  Select a City
                </Form.Label>
                <Form.Select
                  value={formData.cityId}
                  onChange={(e) => {
                    const city = cities.find((c) => c.id === e.target.value);
                    setSelectedCity(city || null);
                    setFormData({ ...formData, cityId: e.target.value });
                  }}
                  disabled={loading}
                  className="p-3"
                  style={{
                    fontSize: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderColor: '#ced4da',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {displayValue(city.cityName)} - {displayValue(city.governorate)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="d-flex justify-content-between mt-5 w-50">
                <Button
                  variant="outline-secondary"
                  className="px-4 py-2 d-flex align-items-center"
                  onClick={() => setStep(1)}
                >
                  <i className="bi bi-arrow-left me-2"></i> Back
                </Button>
                <Button
                  variant="primary"
                  className="px-4 py-2 d-flex align-items-center"
                  onClick={() => {
                    if (formData.cityId) {
                      setStep(3);
                    }
                  }}
                  disabled={!formData.cityId}
                  title={!formData.cityId ? 'Please make a selection to continue' : ''}
                >
                  Next <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        );

      case 3:
        return (
          <Card className="mb-4 shadow border-0 rounded-lg">
            <Card.Header className="bg-primary text-white py-3">
              <h3 className="mb-0">Select Nurse</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</Alert>}
              {successMessage && <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
              {nurses.length === 0 && !loading && (
                <Alert variant="warning" className="text-center">
                  No nurses available for this service and city. Please try a different combination.
                </Alert>
              )}
              <Row className="g-3">
                {nurses.map((nurse, index) => (
                  <Col key={nurse.uniqueId} md={4} lg={3} className="mb-3">
                    <Card
                      className={`h-100 rounded-lg nurse-card ${
                        selectedNurse?.uniqueId === nurse.uniqueId ? 'border-primary shadow' : 'border-0 shadow-sm'
                      }`}
                      style={{
                        transition: 'all 0.3s ease',
                        transform: selectedNurse?.uniqueId === nurse.uniqueId ? 'scale(1.03)' : 'scale(1)',
                      }}
                    >
                      <div className="nurse-image-container" style={{ height: '150px', overflow: 'hidden' }}>
                        <img
                          src={nurse.hasImage ? nurse.imageUrl : nurseImages[index % nurseImages.length]}
                          alt={`${nurse.fullName || 'Nurse'} Avatar`}
                          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                          onError={(e) => {
                            e.target.src = nurseImages[index % nurseImages.length];
                          }}
                        />
                        {selectedNurse?.uniqueId === nurse.uniqueId && (
                          <div className="position-absolute top-0 end-0 p-2">
                            <Badge bg="success" pill>
                              <i className="bi bi-check-lg me-1"></i>Selected
                            </Badge>
                          </div>
                        )}
                      </div>
                      <Card.Body className="p-3">
                        <h6 className="card-title mb-2 text-truncate">{displayValue(nurse.fullName)}</h6>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-clipboard-pulse me-2 text-primary"></i>
                          <span className="small">Specialization: {displayValue(nurse.specialization)}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-briefcase me-2 text-primary"></i>
                          <span className="small">Experience: {displayValue(nurse.yearsOfExperience)} years</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-telephone me-2 text-primary"></i>
                          <span className="small">Phone: {displayValue(nurse.phoneNumber)}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-cash me-2 text-success"></i>
                          <span className="small">Price: {displayValue(nurse.price)} EGP</span>
                        </div>
                        <Button
                          variant={selectedNurse?.uniqueId === nurse.uniqueId ? "success" : "primary"}
                          size="sm"
                          className="w-100 mt-2"
                          onClick={() => {
                            setSelectedNurse(nurse);
                            setFormData({ ...formData, nurseId: nurse.id, totalPrice: nurse.price || 0 });
                          }}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          {selectedNurse?.uniqueId === nurse.uniqueId ? "Selected" : "Select"}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              <NavigationButtons
                onBack={() => setStep(2)}
                onNext={() => {
                  if (formData.nurseId) {
                    setStep(4);
                  }
                }}
                nextDisabled={!formData.nurseId}
              />
            </Card.Body>
          </Card>
        );

      case 4:
        return (
          <Card className="mb-4 shadow border-0 rounded-lg">
            <Card.Header className="bg-primary text-white py-3">
              <h3 className="mb-0">Select Appointment Time</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</Alert>}
              {successMessage && <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
              {appointmentSlots.length === 0 && !loading && (
                <Alert variant="warning" className="text-center">
                  No available appointments found. Please try a different nurse or contact us directly.
                </Alert>
              )}
              <Row className="g-3">
                {appointmentSlots.map((slot) => (
                  <Col key={slot.id} md={4} lg={3} className="mb-3">
                    <Card
                      className={`h-100 rounded-lg appointment-card ${
                        selectedAppointment?.id === slot.id ? 'border-primary shadow' : 'border-0 shadow-sm'
                      }`}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: selectedAppointment?.id === slot.id ? 'scale(1.03)' : 'scale(1)',
                      }}
                      onClick={() => {
                        setSelectedAppointment(slot);
                        setFormData({ ...formData, appointmentId: slot.id });
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedAppointment(slot);
                          setFormData({ ...formData, appointmentId: slot.id });
                        }
                      }}
                    >
                      <Card.Body className="p-3">
                        <h6 className="card-title mb-2">
                          <i className="bi bi-calendar-check me-2 text-primary"></i>
                          {displayValue(slot.date)}
                        </h6>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-clock me-2 text-primary"></i>
                          <span className="small">Time: {displayValue(slot.time)}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-hourglass-split me-2 text-primary"></i>
                          <span className="small">Duration: {displayValue(slot.duration)} minutes</span>
                        </div>
                        {selectedAppointment?.id === slot.id && (
                          <Badge bg="success" pill>
                            <i className="bi bi-check-lg me-1"></i>Selected
                          </Badge>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              <NavigationButtons
                onBack={() => setStep(3)}
                onNext={() => {
                  if (formData.appointmentId) {
                    setStep(5);
                  }
                }}
                nextDisabled={!formData.appointmentId}
              />
            </Card.Body>
          </Card>
        );

      case 5:
        return (
          <Card className="mb-4 shadow border-0 rounded-lg">
            <Card.Header className="bg-primary text-white py-3">
              <h3 className="mb-0 d-flex align-items-center">
                <i className="bi bi-person-lines-fill me-2"></i>Patient Information & Confirmation
              </h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</Alert>}
              {successMessage && <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="shadow-sm h-100">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">
                        <i className="bi bi-info-circle me-2"></i>Booking Summary
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex mb-3">
                        <div className="fw-bold text-muted me-2">Service:</div>
                        <div>{selectedService?.name || 'N/A'}</div>
                      </div>
                      <div className="d-flex mb-3">
                        <div className="fw-bold text-muted me-2">City:</div>
                        <div>{selectedCity?.cityName || 'N/A'}</div>
                      </div>
                      <div className="d-flex mb-3">
                        <div className="fw-bold text-muted me-2">Nurse:</div>
                        <div>{selectedNurse?.fullName || 'N/A'}</div>
                      </div>
                      <div className="d-flex mb-3">
                        <div className="fw-bold text-muted me-2">Date & Time:</div>
                        <div>{selectedAppointment?.date} at {selectedAppointment?.time}</div>
                      </div>
                      <div className="d-flex mb-3">
                        <div className="fw-bold text-muted me-2">Price:</div>
                        <div className="text-success fw-bold">{formData.totalPrice || 'N/A'} EGP</div>
                      </div>
                      <div className="bg-light p-3 rounded">
                        <h6 className="fw-bold">Payment Options</h6>
                        <p className="small mb-2">Please transfer the exact amount to the following account:</p>
                        <ul className="small mb-0">
                          <li>VodafonCash: {VODAFONE_CASH_NUMBER}</li>
                        </ul>
                        <p className="small mt-2 mb-0 text-danger">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i>
                          Upload your payment receipt below to confirm booking
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="shadow-sm h-100">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">
                        <i className="bi bi-person-fill me-2"></i>Your Information
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Full Name <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            isInvalid={!!errors.fullName}
                            required
                            placeholder="Enter your full name"
                          />
                          <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Phone Number <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            isInvalid={!!errors.phoneNumber}
                            required
                            placeholder="e.g., +20 123 456 7890"
                          />
                          <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Address <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            isInvalid={!!errors.address}
                            required
                            placeholder="Enter your complete address"
                          />
                          <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Medical Condition <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="medicalCondition"
                            value={formData.medicalCondition}
                            onChange={handleInputChange}
                            isInvalid={!!errors.medicalCondition}
                            required
                            placeholder="Describe your medical condition or reason for nursing service"
                          />
                          <Form.Control.Feedback type="invalid">{errors.medicalCondition}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Payment Proof <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="file"
                            name="image"
                            onChange={handleImageChange}
                            isInvalid={!!errors.image}
                            required
                            accept="image/jpeg,image/png,image/gif"
                          />
                          <Form.Text className="text-muted">
                            Upload a screenshot of your Vodafone Cash payment receipt (JPEG, PNG, max 5MB)
                          </Form.Text>
                          <Form.Control.Feedback type="invalid">{errors.image}</Form.Control.Feedback>
                        </Form.Group>
                        <NavigationButtons
                          onBack={() => setStep(4)}
                          onNext={() => {}}
                          nextText="Confirm Booking"
                          isSubmit={true}
                          nextDisabled={loading}
                        />
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      default:
        return (
          <Card className="mx-auto shadow border-0 rounded-lg" style={{ maxWidth: '28rem' }}>
            <Card.Body className="text-center">
              <div className="mb-4">
                <i className="bi bi-exclamation-triangle-fill fs-1 text-danger"></i>
              </div>
              <Card.Title className="fw-bold text-dark mb-4">Invalid Step</Card.Title>
              <Card.Text className="text-muted mb-4">Something went wrong. Please start over.</Card.Text>
              <Button variant="primary" onClick={() => setStep(1)}>
                Start Over
              </Button>
            </Card.Body>
          </Card>
        );
    }
  };

  return (
    <div className="nursing-booking-page bg-light min-vh-100">
      <Navbar />
      <Container className="pt-3">
        <h1 className="text-center mb-4">Nursing Booking</h1>
        <StepHeader currentStep={step} />
        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}
        {renderStep()}
      </Container>
      <Footer />
    </div>
  );
};

export default NursingAr;
