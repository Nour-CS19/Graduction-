import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Form, Badge, Modal, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './css/OnlineBooking.css';

const BASE_URL = 'https://physiocareapp.runasp.net/api/v1';
const PATIENT_ID = 'e345b65a-dd02-4527-8456-4f80da5713c7';

// Step Header Component
function StepHeader({ currentStep }) {
  const steps = ['Specialization', 'Doctor', 'Appointment', 'Patient Info'];

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

// Main OnlineBook Component
function OnlineBook() {
  const [currentStep, setCurrentStep] = useState(1);
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    specialization: null,
    doctor: null,
    appointment: null,
    patientInfo: {
      name: '',
      medicalCondition: '',
      phone: '',
      email: '',
      paymentProof: null,
      time: '',
    },
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Fetch specializations
  useEffect(() => {
    const fetchSpecializations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BASE_URL}/Specializations/GetAll`);
        console.log('Specializations Response:', response.data);
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid specializations data format');
        }
        
        const formattedSpecializations = response.data.map((spec) => ({
          id: spec.id,
          nameEnglish: spec.nameEN || spec.nameEnglish || 'Unknown Specialization',
          nameArabic: spec.nameAR || spec.nameArabic || '',
        }));
        
        setSpecializations(formattedSpecializations);
      } catch (err) {
        console.error('Specializations fetch error:', err);
        setError('Failed to load specializations. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchSpecializations();
  }, []);

  // Fetch doctors when specialization is selected
  useEffect(() => {
    if (bookingData.specialization) {
      const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`${BASE_URL}/DoctorSpecializationOnlines/GetDoctorsOnline`, {
            params: { specialId: bookingData.specialization },
          });
          
          console.log('Doctors Response:', response.data);
          
          if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid doctors data format');
          }
          
          if (response.data.length === 0) {
            setError('No doctors available for this specialization.');
            setDoctors([]);
            return;
          }
          
          // Process doctors data more carefully
          const processedDoctors = response.data
            .filter(doctor => doctor.doctorId && doctor.fullName)
            .map(doctor => ({
              doctorId: doctor.doctorId,
              fullName: doctor.fullName.trim(),
              phoneNumber: doctor.phoneNumber || 'Not provided',
              address: doctor.address || 'Not provided',
              experienceYears: parseInt(doctor.experienceYears) || 0,
              evaluation: parseFloat(doctor.evaluation) || 0,
              fileName: doctor.fileName,
              price: parseFloat(doctor.price) || 300,
              specializationId: doctor.specializationId,
              specializationName: doctor.specializationName || 
                                specializations.find(s => s.id === doctor.specializationId)?.nameEnglish || 
                                'Unknown',
              email: doctor.email || 'Not provided',
              isAvailable: doctor.isAvailable !== false, // Default to true if not specified
              imageUrl: null // Will be set below
            }));

          // Fetch images for doctors
          const doctorsWithImages = await Promise.all(
            processedDoctors.map(async (doctor) => {
              if (doctor.fileName) {
                try {
                  const imageUrl = `${BASE_URL}/Upload/image?filename=${encodeURIComponent(doctor.fileName)}&path=Actors/Doctor`;
                  const imageResponse = await axios.get(imageUrl, { 
                    responseType: 'blob',
                    timeout: 5000 // 5 second timeout for images
                  });
                  
                  if (imageResponse.data && imageResponse.data.type?.startsWith('image/')) {
                    const imageBlobUrl = URL.createObjectURL(imageResponse.data);
                    return { ...doctor, imageUrl: imageBlobUrl };
                  }
                } catch (imageError) {
                  console.warn(`Failed to load image for doctor ${doctor.fullName}:`, imageError);
                }
              }
              return { ...doctor, imageUrl: null };
            })
          );

          setDoctors(doctorsWithImages);
          
        } catch (err) {
          console.error('Doctors fetch error:', err);
          setError('Failed to load doctors. Please try selecting another specialization.');
          setDoctors([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchDoctors();

      // Cleanup function to revoke blob URLs
      return () => {
        doctors.forEach((doctor) => {
          if (doctor.imageUrl && doctor.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(doctor.imageUrl);
          }
        });
      };
    }
  }, [bookingData.specialization, specializations]);

  // Fetch appointments when doctor is selected
  useEffect(() => {
    if (bookingData.doctor) {
      const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`${BASE_URL}/DoctorAppointmentOnlines/GetAll`, {
            params: { drId: bookingData.doctor },
          });

          console.log('Appointments Response:', response.data);

          if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid appointments data format');
          }

          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0); // Reset time to start of day

          const validAppointments = response.data
            .filter(appointment => {
              // Filter for available appointments
              if (appointment.state !== 'Available') return false;
              
              // Check if appointment has required fields
              if (!appointment.id || !appointment.date || !appointment.time) return false;
              
              // Parse and validate date
              const appointmentDate = new Date(appointment.date);
              if (isNaN(appointmentDate.getTime())) return false;
              
              // Only show future appointments
              appointmentDate.setHours(0, 0, 0, 0);
              return appointmentDate >= currentDate;
            })
            .map(appointment => {
              const appointmentDate = new Date(appointment.date);
              const selectedDoctor = doctors.find(d => d.doctorId === bookingData.doctor);
              
              return {
                appointmentOnlineId: appointment.id,
                doctorId: appointment.doctorId || bookingData.doctor,
                state: appointment.state,
                price: parseFloat(appointment.price) || parseFloat(selectedDoctor?.price) || 300,
                date: appointmentDate,
                time: appointment.time,
                dayOfWeek: appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }),
                formattedDate: appointmentDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              };
            })
            .sort((a, b) => a.date - b.date); // Sort by date

          if (validAppointments.length === 0) {
            setError('No available appointments found for this doctor. Please select another doctor.');
          }

          setAppointments(validAppointments);
          
        } catch (err) {
          console.error('Appointments fetch error:', err);
          setError('Failed to load appointments. Please try selecting another doctor.');
          setAppointments([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAppointments();
    }
  }, [bookingData.doctor, doctors]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    const { name, medicalCondition, phone, email, paymentProof } = bookingData.patientInfo;

    // Name validation
    if (!name || !name.trim()) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      errors.name = 'Name should only contain letters and spaces';
    }

    // Medical condition validation
    if (!medicalCondition || !medicalCondition.trim()) {
      errors.medicalCondition = 'Medical condition description is required';
    } else if (medicalCondition.trim().length < 10) {
      errors.medicalCondition = 'Please provide more details (at least 10 characters)';
    }

    // Phone validation
    if (!phone || !phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^(\+20|0)?1[0-9]{9}$/; // Egyptian phone number format
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        errors.phone = 'Please enter a valid Egyptian phone number (e.g., 01234567890)';
      }
    }

    // Email validation
    if (!email || !email.trim()) {
      errors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Payment proof validation
    if (!paymentProof) {
      errors.paymentProof = 'Payment proof is required';
    } else {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(paymentProof.type)) {
        errors.paymentProof = 'Please upload a valid image file (JPEG, PNG, or GIF)';
      } else if (paymentProof.size > 5 * 1024 * 1024) { // 5MB limit
        errors.paymentProof = 'File size must be less than 5MB';
      }
    }

    // Appointment validation
    if (!bookingData.appointment) {
      errors.appointment = 'Please select an appointment time';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Event handlers
  const handleSpecializationSelect = (id, e) => {
    if (e) e.preventDefault();
    setBookingData({
      ...bookingData,
      specialization: id,
      doctor: null,
      appointment: null,
      patientInfo: { ...bookingData.patientInfo, time: '' },
    });
    setDoctors([]);
    setAppointments([]);
    setError(null);
  };

  const handleDoctorSelect = (id, e) => {
    if (e) e.preventDefault();
    const selectedDoctor = doctors.find((d) => d.doctorId === id);
    if (!selectedDoctor) {
      setError('Invalid doctor selection. Please try again.');
      return;
    }
    setBookingData({
      ...bookingData,
      doctor: id,
      appointment: null,
      patientInfo: { ...bookingData.patientInfo, time: '' },
    });
    setAppointments([]);
    setError(null);
  };

  const handleTimeSelect = (appointmentId, e) => {
    if (e) e.preventDefault();
    const selectedAppointment = appointments.find((a) => a.appointmentOnlineId === appointmentId);
    if (!selectedAppointment) {
      setError('Invalid appointment selection. Please try again.');
      return;
    }
    
    const formattedTime = `${selectedAppointment.formattedDate} at ${selectedAppointment.time}`;
    
    setBookingData({
      ...bookingData,
      appointment: selectedAppointment.appointmentOnlineId,
      patientInfo: {
        ...bookingData.patientInfo,
        time: formattedTime,
      },
    });
    setError(null);
    if (formErrors.appointment) {
      setFormErrors({ ...formErrors, appointment: null });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      patientInfo: { ...bookingData.patientInfo, [name]: value },
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file immediately
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setFormErrors({ ...formErrors, paymentProof: 'Please upload a valid image file (JPEG, PNG, or GIF)' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, paymentProof: 'File size must be less than 5MB' });
        return;
      }
      
      setBookingData({
        ...bookingData,
        patientInfo: { ...bookingData.patientInfo, paymentProof: file },
      });
      
      // Clear error
      if (formErrors.paymentProof) {
        setFormErrors({ ...formErrors, paymentProof: null });
      }
    }
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    
    // Validation for each step
    if (currentStep === 1 && !bookingData.specialization) {
      setError('Please select a specialization to continue.');
      return;
    }
    if (currentStep === 2 && !bookingData.doctor) {
      setError('Please select a doctor to continue.');
      return;
    }
    if (currentStep === 3 && !bookingData.appointment) {
      setError('Please select an appointment time to continue.');
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = (e) => {
    if (e) e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please correct the errors in the form before submitting.');
      return;
    }
    
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      // Get selected data
      const selectedDoctor = doctors.find((d) => d.doctorId === bookingData.doctor);
      const selectedAppointment = appointments.find((a) => a.appointmentOnlineId === bookingData.appointment);
      
      if (!selectedDoctor || !selectedAppointment) {
        throw new Error('Invalid selection. Please go back and select again.');
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('PatientId', PATIENT_ID);
      formData.append('DoctorId', bookingData.doctor);
      formData.append('DoctorAppointmentOnlineId', bookingData.appointment);
      formData.append('MedicalCondition', bookingData.patientInfo.medicalCondition.trim());
      formData.append('TotalPrice', selectedAppointment.price);
      formData.append('Image', bookingData.patientInfo.paymentProof);

      console.log('Submitting booking with data:', {
        PatientId: PATIENT_ID,
        DoctorId: bookingData.doctor,
        DoctorAppointmentOnlineId: bookingData.appointment,
        MedicalCondition: bookingData.patientInfo.medicalCondition.trim(),
        TotalPrice: selectedAppointment.price,
        ImageName: bookingData.patientInfo.paymentProof?.name
      });

      const response = await axios.post(`${BASE_URL}/PatientBookingDoctorOnlines`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // 30 second timeout
      });

      console.log('Booking response:', response.data);

      if (response.status === 200 || response.status === 201) {
        setBookingSuccess(true);
        setCurrentStep(5);
      }
      
    } catch (err) {
      console.error('Booking submission error:', err);
      
      let errorMessage = 'Failed to create booking. ';
      
      if (err.response?.status === 400) {
        errorMessage += 'Please check your information and try again.';
      } else if (err.response?.status === 409) {
        errorMessage = 'This appointment is no longer available. Please select a different time.';
        setCurrentStep(3); // Go back to appointment selection
      } else if (err.response?.status === 500) {
        errorMessage += 'Server error. Please try again later.';
      } else if (err.code === 'ENETWORK' || err.message.includes('timeout')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else {
        errorMessage += err.response?.data?.message || 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNewBooking = (e) => {
    if (e) e.preventDefault();
    setCurrentStep(1);
    setBookingData({
      specialization: null,
      doctor: null,
      appointment: null,
      patientInfo: {
        name: '',
        medicalCondition: '',
        phone: '',
        email: '',
        paymentProof: null,
        time: '',
      },
    });
    setBookingSuccess(false);
    setError(null);
    setFormErrors({});
    setDoctors([]);
    setAppointments([]);
  };

  const downloadBookingPDF = (e) => {
    if (e) e.preventDefault();
    try {
      const doc = new jsPDF();
      const selectedDoctor = doctors.find((d) => d.doctorId === bookingData.doctor) || {};
      const selectedSpecialization = specializations.find((s) => s.id === bookingData.specialization) || {};
      const selectedAppointment = appointments.find((a) => a.appointmentOnlineId === bookingData.appointment) || {};
      
      // Header
      doc.setFontSize(20);
      doc.text('PhysioCare - Booking Confirmation', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 200, 30, { align: 'right' });
      
      // Booking details table
      const tableColumns = ['Field', 'Details'];
      const tableData = [
        ['Patient Name', bookingData.patientInfo.name],
        ['Doctor', selectedDoctor.fullName || 'N/A'],
        ['Specialization', selectedSpecialization.nameEnglish || 'N/A'],
        ['Date & Time', bookingData.patientInfo.time],
        ['Price', `${selectedAppointment.price?.toFixed(2) || '300.00'} EGP`],
        ['Medical Condition', bookingData.patientInfo.medicalCondition],
        ['Phone', bookingData.patientInfo.phone],
        ['Email', bookingData.patientInfo.email],
        ['Status', 'Confirmed - Pending Doctor Review'],
      ];

      autoTable(doc, {
        head: [tableColumns],
        body: tableData,
        startY: 40,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `PhysioCare Booking System - Page ${i} of ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save(`physicare_booking_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const handleShowDoctorModal = (doctor, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedDoctor(doctor);
    setShowDoctorModal(true);
  };

  const handleCloseDoctorModal = () => {
    setShowDoctorModal(false);
    setSelectedDoctor(null);
  };

  // Render functions for each step
  const renderSpecializationStep = () => (
    <Card className="mb-4 shadow border-0 rounded-lg">
      <Card.Header className="bg-primary text-white py-3">
        <h3 className="mb-0 d-flex align-items-center">
          <i className="bi bi-list-check me-2"></i>Select Specialization
        </h3>
      </Card.Header>
      <Card.Body className="p-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading specializations...</p>
          </div>
        ) : specializations.length === 0 ? (
          <Alert variant="warning" className="text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            No specializations available. Please refresh the page and try again.
          </Alert>
        ) : (
          <Row className="g-4">
            {specializations.map((spec) => (
              <Col key={spec.id} md={4} sm={6} className="mb-3">
                <Card
                  className={`h-100 rounded-lg ${
                    bookingData.specialization === spec.id ? 'border-primary shadow' : 'border-0 shadow-sm'
                  }`}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: bookingData.specialization === spec.id ? 'scale(1.03)' : 'scale(1)',
                  }}
                  onClick={(e) => handleSpecializationSelect(spec.id, e)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSpecializationSelect(spec.id, e);
                    }
                  }}
                >
                  <Card.Body className="p-3 text-center">
                    <i className="bi bi-clipboard-pulse fs-1 mb-2 text-primary"></i>
                    <h5 className="card-title">{spec.nameEnglish}</h5>
                    {spec.nameArabic && (
                      <p className="card-text text-muted">{spec.nameArabic}</p>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-white border-0 p-0">
                    <Button
                      variant={bookingData.specialization === spec.id ? 'primary' : 'outline-primary'}
                      className="w-100 rounded-0 rounded-bottom"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpecializationSelect(spec.id, e);
                      }}
                    >
                      {bookingData.specialization === spec.id ? (
                        <>
                          <i className="bi bi-check-lg me-1"></i>Selected
                        </>
                      ) : (
                        'Select'
                      )}
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        <div className="d-flex justify-content-end mt-4">
          <Button
            variant="primary"
            className="px-4 py-2 d-flex align-items-center"
            onClick={handleNext}
            disabled={!bookingData.specialization || loading}
          >
            Next <i className="bi bi-arrow-right ms-2"></i>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const renderDoctorStep = () => (
    <>
      <Card className="mb-4 shadow border-0 rounded-lg">
        <Card.Header className="bg-primary text-white py-3">
          <h3 className="mb-0 d-flex align-items-center">
            <i className="bi bi-person-badge me-2"></i>Select Doctor
          </h3>
        </Card.Header>
        <Card.Body className="p-4">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <Alert variant="warning" className="text-center">
              <i className="bi bi-exclamation-triangle me-2"></i>
              No doctors available for this specialization. Please try selecting another specialization.
            </Alert>
          ) : (
            <Row className="g-3">
              {doctors.map((doctor) => (
                <Col key={doctor.doctorId} md={6} lg={4} className="mb-3">
                  <Card
                    className={`h-100 rounded-lg doctor-card ${
                      bookingData.doctor === doctor.doctorId ? 'border-primary shadow' : 'border-0 shadow-sm'
                    }`}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: bookingData.doctor === doctor.doctorId ? 'scale(1.03)' : 'scale(1)',
                    }}
                    onClick={(e) => handleDoctorSelect(doctor.doctorId, e)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDoctorSelect(doctor.doctorId, e);
                      }
                    }}
                  >
                    <div className="doctor-image-container position-relative" style={{ height: '200px' }}>
                      {doctor.imageUrl ? (
                        <Card.Img
                          variant="top"
                          src={doctor.imageUrl}
                          alt={doctor.fullName}
                          className="doctor-image"
                          style={{ 
                            height: '100%', 
                            objectFit: 'cover',
                            borderTopLeftRadius: '0.375rem',
                            borderTopRightRadius: '0.375rem'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="bg-light d-flex align-items-center justify-content-center h-100"
                        style={{ 
                          display: doctor.imageUrl ? 'none' : 'flex',
                          borderTopLeftRadius: '0.375rem',
                          borderTopRightRadius: '0.375rem'
                        }}
                      >
                        <i className="bi bi-person-circle fs-1 text-secondary"></i>
                      </div>
                      {!doctor.isAvailable && (
                        <Badge 
                          bg="danger" 
                          className="position-absolute top-0 end-0 m-2"
                        >
                          Unavailable
                        </Badge>
                      )}
                      <Button
                        variant="light"
                        size="sm"
                        className="position-absolute bottom-0 end-0 m-2"
                        onClick={(e) => handleShowDoctorModal(doctor, e)}
                      >
                        <i className="bi bi-info-circle"></i>
                      </Button>
                    </div>
                    <Card.Body className="p-3">
                      <h5 className="card-title text-truncate">{doctor.fullName}</h5>
                      <p className="card-text">
                        <small className="text-muted">{doctor.specializationName}</small>
                      </p>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          <span>{doctor.evaluation.toFixed(1)}</span>
                        </div>
                        <Badge bg="secondary">{doctor.experienceYears} years</Badge>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="text-primary">{doctor.price} EGP</strong>
                        <small className="text-muted">per session</small>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white border-0 p-0">
                      <Button
                        variant={bookingData.doctor === doctor.doctorId ? 'primary' : 'outline-primary'}
                        className="w-100 rounded-0 rounded-bottom"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDoctorSelect(doctor.doctorId, e);
                        }}
                        disabled={!doctor.isAvailable}
                      >
                        {bookingData.doctor === doctor.doctorId ? (
                          <>
                            <i className="bi bi-check-lg me-1"></i>Selected
                          </>
                        ) : doctor.isAvailable ? (
                          'Select Doctor'
                        ) : (
                          'Unavailable'
                        )}
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="outline-secondary"
              className="px-4 py-2 d-flex align-items-center"
              onClick={handleBack}
            >
              <i className="bi bi-arrow-left me-2"></i>Back
            </Button>
            <Button
              variant="primary"
              className="px-4 py-2 d-flex align-items-center"
              onClick={handleNext}
              disabled={!bookingData.doctor || loading}
            >
              Next <i className="bi bi-arrow-right ms-2"></i>
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Doctor Details Modal */}
      <Modal show={showDoctorModal} onHide={handleCloseDoctorModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Doctor Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor && (
            <Row>
              <Col md={4}>
                <div className="text-center mb-3">
                  {selectedDoctor.imageUrl ? (
                    <img
                      src={selectedDoctor.imageUrl}
                      alt={selectedDoctor.fullName}
                      className="img-fluid rounded-circle"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="bg-light d-flex align-items-center justify-content-center rounded-circle mx-auto"
                      style={{ width: '150px', height: '150px' }}
                    >
                      <i className="bi bi-person-circle fs-1 text-secondary"></i>
                    </div>
                  )}
                </div>
              </Col>
              <Col md={8}>
                <h4>{selectedDoctor.fullName}</h4>
                <p className="text-muted mb-1">{selectedDoctor.specializationName}</p>
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-star-fill text-warning me-2"></i>
                    <span>{selectedDoctor.evaluation.toFixed(1)} Rating</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-briefcase me-2 text-primary"></i>
                    <span>{selectedDoctor.experienceYears} years of experience</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-currency-dollar me-2 text-success"></i>
                    <span>{selectedDoctor.price} EGP per session</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-telephone me-2 text-info"></i>
                    <span>{selectedDoctor.phoneNumber}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-envelope me-2 text-secondary"></i>
                    <span>{selectedDoctor.email}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-geo-alt me-2 text-danger"></i>
                    <span>{selectedDoctor.address}</span>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDoctorModal}>
            Close
          </Button>
          {selectedDoctor && selectedDoctor.isAvailable && (
            <Button
              variant="primary"
              onClick={() => {
                handleDoctorSelect(selectedDoctor.doctorId);
                handleCloseDoctorModal();
              }}
            >
              Select This Doctor
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );

  const renderAppointmentStep = () => (
    <Card className="mb-4 shadow border-0 rounded-lg">
      <Card.Header className="bg-primary text-white py-3">
        <h3 className="mb-0 d-flex align-items-center">
          <i className="bi bi-calendar-check me-2"></i>Select Appointment
        </h3>
      </Card.Header>
      <Card.Body className="p-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading available appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Alert variant="warning" className="text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            No available appointments found for this doctor. Please select another doctor.
          </Alert>
        ) : (
          <>
            <div className="mb-3">
              <h5>Available Time Slots</h5>
              <p className="text-muted">Select your preferred appointment time</p>
            </div>
            <Row className="g-3">
              {appointments.map((appointment) => (
                <Col key={appointment.appointmentOnlineId} md={6} lg={4} className="mb-3">
                  <Card
                    className={`h-100 appointment-card ${
                      bookingData.appointment === appointment.appointmentOnlineId
                        ? 'border-primary shadow'
                        : 'border-light shadow-sm'
                    }`}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: bookingData.appointment === appointment.appointmentOnlineId ? 'scale(1.02)' : 'scale(1)',
                    }}
                    onClick={(e) => handleTimeSelect(appointment.appointmentOnlineId, e)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTimeSelect(appointment.appointmentOnlineId, e);
                      }
                    }}
                  >
                    <Card.Body className="p-3 text-center">
                      <div className="mb-2">
                        <i className="bi bi-calendar-day fs-3 text-primary"></i>
                      </div>
                      <h6 className="card-title">{appointment.dayOfWeek}</h6>
                      <p className="card-text mb-1">{appointment.formattedDate}</p>
                      <Badge bg="primary" className="mb-2">{appointment.time}</Badge>
                      <div className="text-success fw-bold">
                        {appointment.price} EGP
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white border-0 p-0">
                      <Button
                        variant={
                          bookingData.appointment === appointment.appointmentOnlineId
                            ? 'primary'
                            : 'outline-primary'
                        }
                        className="w-100 rounded-0 rounded-bottom"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTimeSelect(appointment.appointmentOnlineId, e);
                        }}
                      >
                        {bookingData.appointment === appointment.appointmentOnlineId ? (
                          <>
                            <i className="bi bi-check-lg me-1"></i>Selected
                          </>
                        ) : (
                          'Select Time'
                        )}
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="outline-secondary"
            className="px-4 py-2 d-flex align-items-center"
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left me-2"></i>Back
          </Button>
          <Button
            variant="primary"
            className="px-4 py-2 d-flex align-items-center"
            onClick={handleNext}
            disabled={!bookingData.appointment || loading}
          >
            Next <i className="bi bi-arrow-right ms-2"></i>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const renderPatientInfoStep = () => (
    <Card className="mb-4 shadow border-0 rounded-lg">
      <Card.Header className="bg-primary text-white py-3">
        <h3 className="mb-0 d-flex align-items-center">
          <i className="bi bi-person-lines-fill me-2"></i>Patient Information
        </h3>
      </Card.Header>
      <Card.Body className="p-4">
        <form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-person me-2"></i>Full Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={bookingData.patientInfo.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  isInvalid={!!formErrors.name}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-telephone me-2"></i>Phone Number *
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={bookingData.patientInfo.phone}
                  onChange={handleInputChange}
                  placeholder="01234567890"
                  isInvalid={!!formErrors.phone}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-envelope me-2"></i>Email Address *
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={bookingData.patientInfo.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              isInvalid={!!formErrors.email}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-clipboard-pulse me-2"></i>Medical Condition *
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="medicalCondition"
              value={bookingData.patientInfo.medicalCondition}
              onChange={handleInputChange}
              placeholder="Please describe your medical condition and symptoms in detail..."
              isInvalid={!!formErrors.medicalCondition}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.medicalCondition}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Provide detailed information about your condition to help the doctor prepare for your consultation.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-receipt me-2"></i>Payment Proof *
            </Form.Label>
            <Form.Control
              type="file"
              name="paymentProof"
              onChange={handleFileChange}
              accept="image/*"
              isInvalid={!!formErrors.paymentProof}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.paymentProof}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Upload a screenshot or photo of your payment confirmation (JPEG, PNG, or GIF, max 5MB).
            </Form.Text>
          </Form.Group>

          {/* Booking Summary */}
          <Card className="bg-light border-0 mb-4">
            <Card.Header className="bg-transparent border-0">
              <h5 className="mb-0">
                <i className="bi bi-clipboard-check me-2"></i>Booking Summary
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Specialization:</strong> {specializations.find(s => s.id === bookingData.specialization)?.nameEnglish}</p>
                  <p><strong>Doctor:</strong> {doctors.find(d => d.doctorId === bookingData.doctor)?.fullName}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Date & Time:</strong> {bookingData.patientInfo.time}</p>
                  <p><strong>Price:</strong> <span className="text-success fw-bold">{appointments.find(a => a.appointmentOnlineId === bookingData.appointment)?.price} EGP</span></p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-between">
            <Button
              variant="outline-secondary"
              className="px-4 py-2 d-flex align-items-center"
              onClick={handleBack}
              disabled={loading}
            >
              <i className="bi bi-arrow-left me-2"></i>Back
            </Button>
            <Button
              type="submit"
              variant="success"
              className="px-4 py-2 d-flex align-items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Booking...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>Confirm Booking
                </>
              )}
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );

  const renderSuccessStep = () => (
    <Card className="mb-4 shadow border-0 rounded-lg">
      <Card.Body className="p-5 text-center">
        <div className="mb-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
        </div>
        <h2 className="text-success mb-3">Booking Confirmed!</h2>
        <p className="lead mb-4">
          Your appointment has been successfully booked. You will receive a confirmation email shortly.
        </p>
        
        <Alert variant="info" className="text-start">
          <h6><i className="bi bi-info-circle me-2"></i>Next Steps:</h6>
          <ul className="mb-0">
            <li>Check your email for appointment details</li>
            <li>The doctor will review your booking and payment</li>
            <li>You'll be contacted to confirm the appointment</li>
            <li>Join the video call at your scheduled time</li>
          </ul>
        </Alert>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button
            variant="primary"
            className="px-4 py-2 d-flex align-items-center"
            onClick={downloadBookingPDF}
          >
            <i className="bi bi-download me-2"></i>Download PDF
          </Button>
          <Button
            variant="outline-primary"
            className="px-4 py-2 d-flex align-items-center"
            onClick={handleNewBooking}
          >
            <i className="bi bi-plus-circle me-2"></i>New Booking
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  // Main render
  return (
    <div className="min-vh-100 bg-light">
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 text-primary mb-3">
            <i className="bi bi-calendar-plus me-3"></i>
            Online Consultation Booking
          </h1>
          <p className="lead text-muted">
            Book your physiotherapy consultation with our experienced doctors
          </p>
        </div>

        {currentStep < 5 && <StepHeader currentStep={currentStep} />}

        {error && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {currentStep === 1 && renderSpecializationStep()}
        {currentStep === 2 && renderDoctorStep()}
        {currentStep === 3 && renderAppointmentStep()}
        {currentStep === 4 && renderPatientInfoStep()}
        {currentStep === 5 && renderSuccessStep()}
      </Container>
    </div>
  );
}

export default OnlineBook;
