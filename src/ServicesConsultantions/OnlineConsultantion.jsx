import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Form, Badge, Modal, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from '../components/Nav';
import Footer from '../components/Footer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './css/OnlineBooking.css';
import { useAuth } from '../Pages/AuthPage';

const BASE_URL = 'https://physiocareapp.runasp.net/api/v1';

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
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const [currentStep, setCurrentStep] = useState(1);
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
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
  const [searchMonth, setSearchMonth] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // New state for temporary date selection
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    console.log('OnlineBook mounted, currentStep:', currentStep);
    return () => console.log('OnlineBook unmounted');
  }, [currentStep]);

  useEffect(() => {
    const fetchSpecializations = async () => {
      if (!accessToken) {
        setError('Authentication token not found. Please log in.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BASE_URL}/Specializations/GetAll`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response format: Expected an array of specializations');
        }
        const formattedSpecializations = response.data.map((spec) => ({
          id: spec.id,
          nameEnglish: spec.nameEN,
          nameArabic: spec.nameAR,
        }));
        setSpecializations(formattedSpecializations);
      } catch (err) {
        console.error('Specializations fetch error:', err);
        setError(err.response?.data?.message || 'Failed to fetch specializations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSpecializations();
  }, [accessToken]);

  useEffect(() => {
    if (bookingData.specialization && accessToken) {
      const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`${BASE_URL}/DoctorSpecializationOnlines/GetDoctorsOnline`, {
            params: { specialId: bookingData.specialization },
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!Array.isArray(response.data)) {
            throw new Error('Invalid response format: Expected an array of doctors');
          }
          if (response.data.length === 0) {
            setError('No doctors available for this specialization.');
            setDoctors([]);
            setLoading(false);
            return;
          }
          const validDoctors = response.data
            .filter((d) => d.doctorId && typeof d.fullName === 'string')
            .map((d) => ({
              doctorId: d.doctorId,
              fullName: d.fullName || 'Unknown',
              phoneNumber: d.phoneNumber || 'N/A',
              address: d.address || 'N/A',
              experienceYears: d.experienceYears || 0,
              evaluation: d.evaluation || 0,
              fileName: d.fileName,
              price: d.price || 300,
              specializationId: d.specializationId,
              specializationName:
                d.specializationName ||
                specializations.find((s) => s.id === d.specializationId)?.nameEnglish ||
                'Unknown',
              email: d.email || 'N/A',
              isAvailable: d.isAvailable !== undefined ? d.isAvailable : true,
            }));

          const doctorsWithImages = await Promise.all(
            validDoctors.map(async (doctor) => {
              if (doctor.fileName) {
                try {
                  const imageUrl = `${BASE_URL}/Upload/image?filename=${encodeURIComponent(
                    doctor.fileName
                  )}&path=Actors/Doctor`;
                  const imageResponse = await axios.get(imageUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    responseType: 'blob',
                  });
                  if (imageResponse.data.type.startsWith('image/')) {
                    const imageBlobUrl = URL.createObjectURL(imageResponse.data);
                    return { ...doctor, imageUrl: imageBlobUrl };
                  }
                } catch {
                  return { ...doctor, imageUrl: null };
                }
              }
              return { ...doctor, imageUrl: null };
            })
          );
          setDoctors(doctorsWithImages);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch doctors. Please try again.');
          setDoctors([]);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctors();

      return () => {
        doctors.forEach((doctor) => {
          if (doctor.imageUrl) {
            URL.revokeObjectURL(doctor.imageUrl);
          }
        });
      };
    }
  }, [bookingData.specialization, specializations, accessToken]);

  useEffect(() => {
    if (bookingData.doctor && accessToken) {
      const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`${BASE_URL}/DoctorAppointmentOnlines/GetAll`, {
            params: { drId: bookingData.doctor },
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!response.data || response.data === '') {
            throw new Error('Empty response from appointment API');
          }
          if (!Array.isArray(response.data)) {
            throw new Error('Invalid response format: Expected an array of appointments');
          }
          const selectedDoctor = doctors.find((d) => d.doctorId === bookingData.doctor);
          const validAppointments = response.data
            .filter((a) => a.id && a.date && a.time && a.state === 'Available')
            .map((a) => {
              let parsedDate;
              try {
                parsedDate = new Date(a.date);
                if (isNaN(parsedDate.getTime())) {
                  throw new Error('Invalid date format');
                }
              } catch {
                parsedDate = null;
              }
              return {
                appointmentOnlineId: a.id,
                doctorId: a.doctorId || bookingData.doctor,
                state: a.state || 'Available',
                price: a.price !== undefined ? a.price : selectedDoctor.price || 300,
                date: parsedDate,
                time: a.time,
              };
            });

          if (validAppointments.length === 0) {
            setError('No available appointments for this doctor.');
          }
          setAppointments(validAppointments);
        } catch (err) {
          console.error('Appointments fetch error:', err);
          setError(
            err.response?.data?.message || 'Failed to fetch appointments. Please check the API response.'
          );
          setAppointments([]);
        } finally {
          setLoading(false);
        }
      };
      fetchAppointments();
    }
  }, [bookingData.doctor, doctors, accessToken]);

  useEffect(() => {
    if (user?.id && accessToken) {
      const fetchPatientInfo = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`${BASE_URL}/Patients/BasicPatientInfo`, {
            params: { id: user.id },
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.data && typeof response.data === 'object') {
            setBookingData((prev) => ({
              ...prev,
              patientInfo: {
                ...prev.patientInfo,
                name: response.data.fullName || '',
                email: response.data.email || '',
                phone: response.data.phoneNumber || '',
              },
            }));
          }
        } catch (err) {
          console.error('Patient info fetch error:', err);
          setError('Failed to fetch patient information. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchPatientInfo();
    }
  }, [user?.id, accessToken]);

  useEffect(() => {
    if (user?.id && accessToken && bookingSuccess) {
      const fetchPastBookings = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/PatientBookingDoctorOnlines/Paging`, {
            params: { PageNumber: pageNumber, PageSize: pageSize },
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setPastBookings(response.data.data || []);
          setTotalBookings(response.data.totalCount || 0);
        } catch (err) {
          console.error('Past bookings fetch error:', err);
          setError('Failed to fetch past bookings.');
        }
      };
      fetchPastBookings();
    }
  }, [user, accessToken, bookingSuccess, pageNumber, pageSize]);

  const validateAppointment = async (appointmentId, doctorId) => {
    if (!accessToken) {
      setError('Authentication token not found. Please log in.');
      return false;
    }
    try {
      const response = await axios.get(`${BASE_URL}/DoctorAppointmentOnlines/GetAll`, {
        params: { drId: doctorId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: Expected an array of appointments');
      }
      const appointmentExists = response.data.some(
        (a) => a.id === appointmentId && a.state === 'Available'
      );
      return appointmentExists;
    } catch (err) {
      setError('Failed to validate appointment availability. Please try again.');
      return false;
    }
  };

  const validateForm = () => {
    const errors = {};
    const { name, medicalCondition, phone, email, paymentProof } = bookingData.patientInfo;

    if (!name.trim()) errors.name = 'Name is required';
    else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters long';

    if (!medicalCondition.trim()) errors.medicalCondition = 'Medical condition is required';
    else if (medicalCondition.trim().length < 5)
      errors.medicalCondition = 'Medical condition must be at least 5 characters';

    if (!phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''))) errors.phone = 'Invalid phone number format';

    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';

    if (!paymentProof)
      errors.paymentProof = 'Payment proof is required';
    else if (!['image/jpeg', 'image/png', 'image/gif'].includes(paymentProof.type))
      errors.paymentProof = 'Only JPEG, PNG, or GIF files are allowed';
    else if (paymentProof.size > 5 * 1024 * 1024) errors.paymentProof = 'File size exceeds 5MB';

    if (!bookingData.appointment) errors.appointment = 'Please select an appointment time';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSpecializationSelect = (id, e) => {
    e?.preventDefault();
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
    e?.preventDefault();
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

  const handleTimeSelect = (appointmentId, price, date, time, e) => {
    e?.preventDefault();
    const selectedAppointment = appointments.find((a) => a.appointmentOnlineId === appointmentId);
    if (!selectedAppointment) {
      setError('Invalid appointment selection. Please try again.');
      return;
    }
    setBookingData({
      ...bookingData,
      appointment: selectedAppointment.appointmentOnlineId,
      doctor: selectedAppointment.doctorId,
      patientInfo: {
        ...bookingData.patientInfo,
        time: `${date.toLocaleDateString('en-US')} ${time}`,
      },
    });
    setError(null);
    if (formErrors.appointment) {
      setFormErrors({ ...formErrors, appointment: null });
    }
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      patientInfo: { ...bookingData.patientInfo, [name]: value },
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, paymentProof: 'File size exceeds 5MB' });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setFormErrors({ ...formErrors, paymentProof: 'Only JPEG, PNG, or GIF files are allowed' });
        return;
      }
      setBookingData({
        ...bookingData,
        patientInfo: { ...bookingData.patientInfo, paymentProof: file },
      });
      if (formErrors.paymentProof) {
        setFormErrors({ ...formErrors, paymentProof: null });
      }
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1 && !bookingData.specialization) {
      setError('Please select a specialization.');
      return;
    }
    if (currentStep === 2 && !bookingData.doctor) {
      setError('Please select a doctor.');
      return;
    }
    if (currentStep === 3 && !bookingData.appointment) {
      setError('Please select an appointment time.');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setError('Please log in to book an appointment.');
      return;
    }
    if (!accessToken) {
      setError('Authentication token not found. Please log in.');
      return;
    }
    if (!validateForm()) {
      setError('Please correct the errors in the form before submitting.');
      return;
    }
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const selectedDoctor = doctors.find((d) => d.doctorId === bookingData.doctor);
      if (!selectedDoctor) {
        throw new Error('Invalid doctor selected. Please try again.');
      }
      const selectedAppointment = appointments.find((a) => a.appointmentOnlineId === bookingData.appointment);
      if (!selectedAppointment) {
        throw new Error('Invalid appointment selected. Please try again.');
      }

      const isAppointmentAvailable = await validateAppointment(bookingData.appointment, bookingData.doctor);
      if (!isAppointmentAvailable) {
        setCurrentStep(3);
        throw new Error('The selected appointment is no longer available. Please choose another time.');
      }

      const price = selectedAppointment.price || 300;

      const formData = new FormData();
      formData.append('PatientId', user.id);
      formData.append('DoctorId', bookingData.doctor);
      formData.append('DoctorAppointmentOnlineId', bookingData.appointment);
      formData.append('MedicalCondition', bookingData.patientInfo.medicalCondition);
      formData.append('TotalPrice', Number(price));
      formData.append('Image', bookingData.patientInfo.paymentProof);

      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      const response = await axios.post(`${BASE_URL}/PatientBookingDoctorOnlines`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setBookingSuccess(true);
        setCurrentStep(5);
      }
    } catch (err) {
      let errorMessage = 'Failed to create booking: ';
      if (err.response?.data?.message?.includes('Violation of PRIMARY KEY constraint')) {
        errorMessage = 'This appointment is already booked. Please select a different appointment time.';
        setCurrentStep(3);
      } else if (err.response?.data?.message?.includes('FOREIGN KEY constraint')) {
        errorMessage = 'The selected appointment is no longer available. Please choose another time.';
        setCurrentStep(3);
      } else {
        errorMessage += err.response?.data?.message || 'Please try again.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId, e) => {
    e.preventDefault();
    if (!user?.id) {
      setError('Please log in to delete a booking.');
      return;
    }
    if (!accessToken) {
      setError('Authentication token not found. Please log in.');
      return;
    }
    try {
      await axios.delete(`${BASE_URL}/PatientBookingDoctorOnlines/${bookingId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setPastBookings(pastBookings.filter((b) => b.id !== bookingId));
      alert('Booking deleted successfully');
    } catch (err) {
      setError('Failed to delete booking: ' + (err.response?.data?.message || 'Please try again.'));
    }
  };

  const handleNewBooking = (e) => {
    e.preventDefault();
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
    e.preventDefault();
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Booking Confirmation', 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 195, 20, { align: 'right' });

      const selectedDoctor = doctors.find((d) => d.doctorId === bookingData.doctor) || {};
      const selectedSpecialization = specializations.find((s) => s.id === bookingData.specialization) || {};
      const selectedAppointment = appointments.find((a) => a.appointmentOnlineId === bookingData.appointment) || {};
      const tableColumns = ['Field', 'Details'];
      const tableData = [
        ['Doctor', selectedDoctor.fullName || 'N/A'],
        ['Specialization', selectedSpecialization.nameEnglish || 'N/A'],
        ['Date & Time', bookingData.patientInfo.time || 'N/A'],
        ['Price', `${(selectedAppointment.price || 300).toFixed(2)} EGP`],
        ['Medical Condition', bookingData.patientInfo.medicalCondition || 'N/A'],
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
          `PhysioCare Booking System - Page ${i} of ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save(`physicare_booking_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      setError('Failed to generate PDF: ' + err.message);
    }
  };

  const handleEditBooking = (e) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handleShowDoctorModal = (doctor, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDoctor(doctor);
    setShowDoctorModal(true);
  };

  const handleCloseDoctorModal = () => {
    setShowDoctorModal(false);
    setSelectedDoctor(null);
  };

  const renderSpecializationStep = () => (
    <Card className="mb-4 shadow border-0 rounded-lg">
      <Card.Header className="bg-primary text-white py-3">
        <h3 className="mb-0">Select Specialization</h3>
      </Card.Header>
      <Card.Body className="p-4 d-flex flex-column justify-content-center align-items-center">
        {loading ? (
          <Alert variant="info" className="text-center">
            Loading specializations...
          </Alert>
        ) : specializations.length === 0 ? (
          <Alert variant="warning" className="text-center">
            No specializations available. Please try again later.
          </Alert>
        ) : (
          <Form.Group className="w-50" style={{ minWidth: '300px' }}>
            <Form.Label className="text-center d-block mb-2" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              Select a Specialization
            </Form.Label>
            <Form.Select
              value={bookingData.specialization || ''}
              onChange={(e) => {
                const id = e.target.value;
                handleSpecializationSelect(id, e);
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
              <option value="">Select a Specialization</option>
              {specializations.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {`${spec.nameEnglish} (${spec.nameArabic})`}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}
        <div className="w-100 mt-4 d-flex justify-content-end">
          <Button
            variant="primary"
            className="px-4 py-2 d-flex align-items-center"
            onClick={handleNext}
            disabled={!bookingData.specialization || loading}
          >
            Next <i className="bi bi-arrow-right ms-2"></i>
          </Button>
        </div>
        {error && (
          <div className="w-100 mt-3 d-flex justify-content-start">
            <Button
              variant="outline-secondary"
              className="px-4 py-2 d-flex align-items-center"
              onClick={handleBack}
            >
              <i className="bi bi-arrow-left me-2"></i> Back
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );

  const renderDoctorStep = () => (
    <>
      <Card className="mb-4 shadow border-0 rounded-lg">
        <Card.Header className="bg-primary text-white py-3">
          <h3 className="mb-0">Select Doctor</h3>
        </Card.Header>
        <Card.Body className="p-4">
          {loading ? (
            <Alert variant="info" className="text-center">
              Loading doctors...
            </Alert>
          ) : doctors.length === 0 ? (
            <Alert variant="warning" className="text-center">
              No doctors available for this specialization. Please try another specialization.
            </Alert>
          ) : (
            <Row className="g-3">
              {doctors.map((doctor) => (
                <Col key={doctor.doctorId} md={4} lg={3} className="mb-3">
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
                    <div className="doctor-image-container" style={{ height: '150px', overflow: 'hidden' }}>
                      {doctor.imageUrl ? (
                        <Card.Img
                          variant="top"
                          src={doctor.imageUrl}
                          alt={doctor.fullName}
                          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                        />
                      ) : null}
                      {bookingData.doctor === doctor.doctorId && (
                        <div className="position-absolute top-0 end-0 p-2">
                          <Badge bg="success" pill>
                            <i className="bi bi-check-lg me-1"></i>Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Card.Body className="p-3">
                      <h6 className="card-title mb-2 text-truncate">{doctor.fullName}</h6>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-cash me-2 text-success"></i>
                        <span className="small">Price: {doctor.price.toFixed(2)} EGP</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-briefcase me-2 text-primary"></i>
                        <span className="small">Experience: {doctor.experienceYears} Years</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-star-fill text-warning me-2"></i>
                        <span className="small">Rating: {doctor.evaluation || 'N/A'}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-geo-alt me-2 text-secondary"></i>
                        <span className="small text-truncate">Address: {doctor.address || 'N/A'}</span>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white border-0 p-3 pt-0">
                      <div className="d-flex gap-2">
                        <Button
                          variant={bookingData.doctor === doctor.doctorId ? 'primary' : 'outline-primary'}
                          className="flex-grow-1 rounded-pill btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDoctorSelect(doctor.doctorId, e);
                          }}
                        >
                          {bookingData.doctor === doctor.doctorId ? (
                            <>
                              <i className="bi bi-check-lg me-1"></i>Selected
                            </>
                          ) : (
                            <>Select</>
                          )}
                        </Button>
                        <Button
                          variant="outline-info"
                          className="rounded-pill btn-sm"
                          onClick={(e) => handleShowDoctorModal(doctor, e)}
                        >
                          <i className="bi bi-info-circle me-1"></i>View Details
                        </Button>
                      </div>
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
              <i className="bi bi-arrow-left me-2"></i> Back
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

      <Modal show={showDoctorModal} onHide={handleCloseDoctorModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Doctor Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor && (
            <div>
              {selectedDoctor.imageUrl && (
                <div className="text-center mb-3">
                  <img
                    src={selectedDoctor.imageUrl}
                    alt={selectedDoctor.fullName}
                    className="img-fluid rounded"
                    style={{ maxHeight: '150px', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-person me-2 fs-5"></i>
                <div>
                  <strong>Name:</strong> {selectedDoctor.fullName || 'N/A'}
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-geo-alt me-2 fs-5"></i>
                <div>
                  <strong>Address:</strong> {selectedDoctor.address || 'N/A'}
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-briefcase me-2 fs-5"></i>
                <div>
                  <strong>Experience:</strong> {selectedDoctor.experienceYears} Years
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-star-fill me-2 fs-5 text-warning"></i>
                <div>
                  <strong>Rating:</strong> {selectedDoctor.evaluation || 'N/A'}
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-clipboard-pulse me-2 fs-5"></i>
                <div>
                  <strong>Specialization:</strong> {selectedDoctor.specializationName || 'N/A'}
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-envelope me-2 fs-5"></i>
                <div>
                  <strong>Email:</strong> {selectedDoctor.email || 'N/A'}
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-telephone me-2 fs-5"></i>
                <div>
                  <strong>Phone:</strong> {selectedDoctor.phoneNumber || 'N/A'}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDoctorModal}>
            Close
          </Button>
          {selectedDoctor && (
            <Button
              variant="primary"
              onClick={(e) => {
                handleDoctorSelect(selectedDoctor.doctorId, e);
                handleCloseDoctorModal();
              }}
            >
              Select Doctor
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );

  const renderAppointmentStep = () => {
    const validAppointments = appointments.filter(
      (appointment) =>
        appointment.appointmentOnlineId &&
        appointment.time &&
        typeof appointment.price === 'number' &&
        appointment.date
    );

    const appointmentsByMonth = validAppointments.reduce((acc, appointment) => {
      if (!appointment.date) return acc;
      const monthYear = appointment.date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(appointment);
      return acc;
    }, {});

    const availableMonths = Object.keys(appointmentsByMonth).sort((a, b) => new Date(a) - new Date(b));

    const filteredAppointments = validAppointments.filter((appointment) => {
      if (!appointment.date) return false;
      const appointmentDate = appointment.date.toISOString().split('T')[0];
      const appointmentMonth = appointment.date.toLocaleString('default', { month: 'long', year: 'numeric' });
      const matchesMonth = searchMonth ? appointmentMonth === searchMonth : true;
      const matchesDate = searchDate ? appointmentDate === searchDate : true;
      return matchesMonth && matchesDate;
    });

    // Get the currently selected appointment for pre-filling
    const selectedAppointment = filteredAppointments.find((a) => a.appointmentOnlineId === bookingData.appointment);

    return (
      <Card className="mb-4 shadow border-0 rounded-lg">
        <Card.Header className="bg-primary text-white py-3">
          <h3 className="mb-0">Select Appointment Time</h3>
        </Card.Header>
        <Card.Body className="p-4">
          {loading ? (
            <Alert variant="info" className="text-center">
              Loading appointments...
            </Alert>
          ) : validAppointments.length === 0 ? (
            <Alert variant="warning" className="text-center">
              No available appointments for this doctor. Please select another doctor.
            </Alert>
          ) : (
            <>
              <Row className="mb-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Select Date</Form.Label>
                    <Form.Select
                      value={selectedDate || ''}
                      onChange={(e) => {
                        const date = e.target.value;
                        setSelectedDate(date);
                        setBookingData({
                          ...bookingData,
                          appointment: null,
                          patientInfo: { ...bookingData.patientInfo, time: '' },
                        });
                      }}
                    >
                      <option value="">Select Date</option>
                      {[...new Set(filteredAppointments.map(a => a.date.toISOString().split('T')[0]))].map(date => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US')}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Select Time</Form.Label>
                    <Form.Select
                      value={selectedAppointment ? selectedAppointment.time : ''}
                      onChange={(e) => {
                        const time = e.target.value;
                        const appt = filteredAppointments.find(a => a.date.toISOString().split('T')[0] === selectedDate && a.time === time);
                        if (appt) {
                          handleTimeSelect(appt.appointmentOnlineId, appt.price, appt.date, appt.time, e);
                        }
                      }}
                      disabled={!selectedDate}
                    >
                      <option value="">Select Time</option>
                      {filteredAppointments
                        .filter(a => a.date.toISOString().split('T')[0] === selectedDate)
                        .map(a => a.time)
                        .filter((time, index, self) => self.indexOf(time) === index)
                        .map(time => (
                          <option key={time} value={time}>
                            {time}
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
                      value={selectedAppointment ? `${selectedAppointment.price.toFixed(2)} EGP` : 'N/A'}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
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
              disabled={loading || !bookingData.appointment}
            >
              Next <i className="bi bi-arrow-right ms-2"></i>
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderPatientInfoStep = () => {
    const selectedDoctor = doctors.find((d) => d.doctorId === bookingData.doctor) || {};
    const selectedSpecialization = specializations.find((s) => s.id === bookingData.specialization) || {};
    const selectedAppointment = appointments.find((a) => a.appointmentOnlineId === bookingData.appointment) || {};

    return (
      <Card className="mb-4 shadow border-0 rounded-lg">
        <Card.Header className="bg-primary text-white py-3">
          <h3 className="mb-0 d-flex align-items-center">
            <i className="bi bi-person-lines-fill me-2"></i>Patient Information & Confirmation
          </h3>
        </Card.Header>
        <Card.Body className="p-4">
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
                    <div className="fw-bold text-muted me-2">Doctor:</div>
                    <div>{selectedDoctor.fullName || 'N/A'}</div>
                  </div>
                  <div className="d-flex mb-3">
                    <div className="fw-bold text-muted me-2">Specialization:</div>
                    <div>{selectedSpecialization.nameEnglish || 'N/A'}</div>
                  </div>
                  <div className="d-flex mb-3">
                    <div className="fw-bold text-muted me-2">Date & Time:</div>
                    <div>{bookingData.patientInfo.time || 'N/A'}</div>
                  </div>
                  <div className="d-flex mb-3">
                    <div className="fw-bold text-muted me-2">Price:</div>
                    <div className="text-success fw-bold">
                      {(selectedAppointment.price || 300).toFixed(2)} EGP
                    </div>
                  </div>
                  <div className="bg-light p-3 rounded">
                    <h6 className="fw-bold">Payment Options</h6>
                    <p className="small mb-2">Please transfer the exact amount to one of the following accounts:</p>
                    <ul className="small mb-0">
                      <li>Vodafone Cash: 01223126694</li>
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
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Full Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={bookingData.patientInfo.name}
                        onChange={handleInputChange}
                        isInvalid={!!formErrors.name}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Email <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={bookingData.patientInfo.email}
                        onChange={handleInputChange}
                        isInvalid={!!formErrors.email}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Phone Number <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={bookingData.patientInfo.phone}
                        onChange={handleInputChange}
                        isInvalid={!!formErrors.phone}
                        required
                        placeholder="e.g., +20 123 456 7890"
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.phone}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Medical Condition <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="medicalCondition"
                        value={bookingData.patientInfo.medicalCondition}
                        onChange={handleInputChange}
                        isInvalid={!!formErrors.medicalCondition}
                        required
                        placeholder="Please describe your medical condition or reason for the appointment"
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.medicalCondition}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Payment Proof <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="file"
                        name="paymentProof"
                        onChange={handleFileChange}
                        isInvalid={!!formErrors.paymentProof}
                        required
                        accept="image/jpeg,image/png,image/gif"
                      />
                      <Form.Text className="text-muted">
                        Upload a screenshot of your payment receipt (JPEG, PNG, GIF, max 5MB)
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">{formErrors.paymentProof}</Form.Control.Feedback>
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-between">
            <Button
              variant="outline-secondary"
              className="px-4 py-2 d-flex align-items-center"
              onClick={handleBack}
            >
              <i className="bi bi-arrow-left me-2"></i> Back
            </Button>
            <Button
              variant="success"
              className="px-4 py-2 d-flex align-items-center"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Booking <i className="bi bi-check-lg ms-2"></i>
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderSuccessStep = () => {
    const selectedDoctor = doctors.find((d) => d.doctorId === bookingData.doctor) || {};
    const selectedSpecialization = specializations.find((s) => s.id === bookingData.specialization) || {};
    const selectedAppointment = appointments.find((a) => a.appointmentOnlineId === bookingData.appointment) || {};

    return (
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
            <p>Your appointment has been successfully scheduled.</p>
          </div>

          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Booking Details</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="border-end">
                  <dl className="row mb-0">
                    <dt className="col-sm-4">Doctor:</dt>
                    <dd className="col-sm-8">{selectedDoctor.fullName || 'N/A'}</dd>

                    <dt className="col-sm-4">Specialization:</dt>
                    <dd className="col-sm-8">{selectedSpecialization.nameEnglish || 'N/A'}</dd>

                    <dt className="col-sm-4">Status:</dt>
                    <dd className="col-sm-8">
                      <Badge bg="success">Confirmed</Badge>
                    </dd>
                  </dl>
                </Col>
                <Col md={6}>
                  <dl className="row mb-0">
                    <dt className="col-sm-4">Price:</dt>
                    <dd className="col-sm-8">{(selectedAppointment.price || 300).toFixed(2)} EGP</dd>

                    <dt className="col-sm-4">Date & Time:</dt>
                    <dd className="col-sm-8">{bookingData.patientInfo.time || 'N/A'}</dd>          
                  </dl>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {pastBookings.length > 0 && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Past Bookings</h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {pastBookings.map((booking) => (
                    <Col key={booking.id} md={6}>
                      <Card className="h-100">
                        <Card.Body>
                          <div className="d-flex mb-2">
                            <strong className="me-2">Doctor:</strong>
                            <span>{booking.doctorName || 'N/A'}</span>
                          </div>
                          <div className="d-flex mb-2">
                            <strong className="me-2">Date & Time:</strong>
                            <span>{booking.dateTime || 'N/A'}</span>
                          </div>
                          <div className="d-flex mb-2">
                            <strong className="me-2">Price:</strong>
                            <span>{booking.totalPrice?.toFixed(2) || 'N/A'} EGP</span>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => handleDeleteBooking(booking.id, e)}
                          >
                            <i className="bi bi-trash me-1"></i>Delete
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <div className="d-flex justify-content-between mt-3">
                  <Button
                    variant="outline-secondary"
                    disabled={pageNumber === 1}
                    onClick={() => setPageNumber(pageNumber - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline-secondary"
                    disabled={pageNumber * pageSize >= totalBookings}
                    onClick={() => setPageNumber(pageNumber + 1)}
                  >
                    Next
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          <Alert variant="info" className="d-flex align-items-center">
            <i className="bi bi-info-circle-fill me-2 fs-4"></i>
            <div>
              <p className="mb-0">
                A confirmation email has been sent to <strong>{bookingData.patientInfo.email}</strong> with all the
                details.
              </p>
            </div>
          </Alert>

          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
            <Button variant="outline-secondary" className="px-4 py-2" onClick={handleNewBooking}>
              <i className="bi bi-plus-circle me-2"></i>New Booking
            </Button>
            <Button variant="primary" className="px-4 py-2" onClick={downloadBookingPDF}>
              <i className="bi bi-download me-2"></i>Download PDF
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="online-booking py-5 bg-light min-vh-100">
      <Navbar />
      <Container className="py-5">
        <h1 className="text-center mb-5">Online Booking</h1>
        <StepHeader currentStep={currentStep} />
        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}
        {currentStep === 1 && renderSpecializationStep()}
        {currentStep === 2 && renderDoctorStep()}
        {currentStep === 3 && renderAppointmentStep()}
        {currentStep === 4 && renderPatientInfoStep()}
        {bookingSuccess && currentStep === 5 && renderSuccessStep()}
      </Container>
      <Footer />
    </div>
  );
}

export default OnlineBook;