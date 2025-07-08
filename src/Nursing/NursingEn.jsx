import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Nav';
import Footer from '../components/Footer';
import { jsPDF } from 'jspdf';
import { useAuth } from '../Pages/AuthPage';

function NursingAr() {
  const { user, logout } = useAuth();

  // Helper: Retrieve city name
  const getCityName = (city) => city?.cityName || city?.name || 'Unknown City';

  // Helper: Get icon for a field
  const getIconForField = (field) => {
    const iconMap = {
      fullName: 'bi bi-person',
      phoneNumber: 'bi bi-telephone',
      evaluation: 'bi bi-star',
      experienceYears: 'bi bi-briefcase',
      price: 'bi bi-cash',
      medicalCondition: 'bi bi-file-medical',
      address: 'bi bi-geo-alt',
      governorate: 'bi bi-map',
    };
    return iconMap[field] || 'bi bi-info-circle';
  };

  // Steps definition
  const stepsArray = [
    { label: 'Service' },
    { label: 'City' },
    { label: 'Nurse' },
    { label: 'Patient Info' },
    { label: 'Payment' },
    { label: 'Confirmation' },
  ];

  // State declarations
  const [step, setStep] = useState(1);
  const [nursingServices, setNursingServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [fetchedNurses, setFetchedNurses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedNurseData, setSelectedNurseData] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppNurseId, setSelectedAppNurseId] = useState(null);
  const [appointmentSlots, setAppointmentSlots] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientCondition, setPatientCondition] = useState('');
  const [address, setAddress] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState(null);
  const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Validation errors
  const [errors, setErrors] = useState({
    patientName: '',
    patientPhone: '',
    patientCondition: '',
    address: '',
  });

  const baseUrl = 'https://physiocareapp.runasp.net';
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  // Helper: Validate UUID format
  const isValidUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return typeof id === 'string' && uuidRegex.test(id);
  };

  // Helper: Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken') || null;
  };

  // Helper: Refresh token
  const attemptRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await axios.post(`${baseUrl}/api/v1/Account/refresh-token`, {
        refreshToken,
      });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    }
  };

  // STEP 1: Fetch nursing services
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const authToken = getAuthToken();
        const response = await axios.get(`${baseUrl}/api/v1/Nursings/GetAll`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        setNursingServices(response.data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load nursing services.');
        setNursingServices([
          { id: 'nursing-1', name: 'Injection Service', description: 'Administer injections safely.' },
          { id: 'nursing-2', name: 'Home Care', description: 'Patient monitoring & assistance.' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  // STEP 2: Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const authToken = getAuthToken();
        const response = await axios.get(`${baseUrl}/api/v1/Cities/GetAll`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        setCities(response.data);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Failed to load cities.');
        setCities([
          { id: 'city-1', cityName: 'Cairo', governorate: 'Cairo' },
          { id: 'city-2', cityName: 'Alexandria', governorate: 'Alexandria' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    if (step === 2) fetchCities();
  }, [step]);

  // STEP 3: Fetch nurses and their slots
  useEffect(() => {
    const fetchNursesAndSlots = async (isRetry = false) => {
      if (!selectedService || !selectedCity) {
        setError('Please select a service and city before proceeding.');
        return;
      }
      setIsLoading(true);
      setError(null);
      let authToken = getAuthToken();

      if (!authToken && !isRetry) {
        setError('Please log in to proceed.');
        setIsLoading(false);
        return;
      }

      try {
        if (isRetry) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }

        console.log('Fetching nurses with params:', { nursingId: selectedService.id, cityId: selectedCity.id });
        const nursesResponse = await axios.get(`${baseUrl}/api/v1/Nurses/SelectedNurseInfo`, {
          params: { nursingId: selectedService.id, cityId: selectedCity.id },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('Nurses API response:', nursesResponse.data);

        const uniqueNurses = nursesResponse.data.map((nurse, i) => ({
          ...nurse,
          uniqueId: nurse.id ? `nurse-${nurse.id}-${i}` : `nurse-unknown-${i}`,
        }));

        // Fetch slots for each nurse
        const slotsData = await fetchAppointmentSlots(uniqueNurses, selectedService.id, selectedCity.id, isRetry);

        // Filter nurses to only include those with available slots
        const nursesWithSlots = uniqueNurses.filter(nurse =>
          slotsData.some(slot => slot.nurseUniqueId === nurse.uniqueId)
        );

        setFetchedNurses(nursesWithSlots);
        setAppointmentSlots(slotsData);
        setSelectedNurseData(null);
        setSelectedTime('');
        setSelectedDate('');
        setTotalPrice('');
        setRetryCount(0);

        if (nursesWithSlots.length === 0) {
          setError('No nurses with available slots found for the selected service and city.');
        }
      } catch (err) {
        console.error('Error fetching nurses:', err);
        if (err.response?.status === 401 && retryCount < MAX_RETRIES && !isRetry) {
          const newAccessToken = await attemptRefreshToken();
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            setRetryCount(prev => prev + 1);
            return fetchNursesAndSlots(true);
          } else {
            setError('Session expired. Please log in again.');
            logout();
          }
        } else {
          let errorMessage = 'Failed to load nurses. Please try again or contact support at support@physiocareapp.com.';
          if (err.response) {
            errorMessage = `Failed to load nurses: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
            console.log('Error response headers:', err.response.headers);
            console.log('Error response data:', err.response.data);
          } else if (err.message) {
            errorMessage = `Failed to load nurses: ${err.message}`;
          }
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (step === 3) fetchNursesAndSlots();
  }, [selectedService, selectedCity, step]);

  // Fetch appointment slots
  const fetchAppointmentSlots = async (nurses, nursingId, cityId, isRetry = false) => {
    let authToken = getAuthToken();
    const headers = { Authorization: `Bearer ${authToken}` };

    try {
      const allSlots = [];
      for (const nurse of nurses) {
        if (!isValidUUID(nurse.id) || !isValidUUID(nursingId) || !isValidUUID(cityId)) {
          console.warn(`Invalid UUIDs for nurse ${nurse.id}, nursing ${nursingId}, or city ${cityId}`);
          continue;
        }
        try {
          console.log(`Fetching slots for nurse ${nurse.id}...`);
          const response = await axios.get(
            `${baseUrl}/api/v1/NurseAppointment/get-all-nurse-nursing-city-appointment`,
            {
              params: { nurseId: nurse.id, nursingId, cityid: cityId },
              headers,
            }
          );
          console.log(`Slots response for nurse ${nurse.id}:`, {
            headers: response.headers,
            data: response.data,
          });

          // Validate Content-Type
          const contentType = response.headers['content-type'] || '';
          if (!contentType.includes('application/json')) {
            console.error(`Unexpected Content-Type: ${contentType}`);
            throw new Error(
              `Unexpected response format from server. Expected JSON, but received ${contentType}. Response: ${JSON.stringify(response.data)}`
            );
          }

          // Validate response data is an array
          if (!Array.isArray(response.data)) {
            console.error('Response data is not an array:', response.data);
            throw new Error('Invalid response format: Expected an array of appointment slots.');
          }

          const nurseSlotsWithInfo = response.data.map((slot) => ({
            ...slot,
            nurseId: nurse.id,
            nurseUniqueId: nurse.uniqueId,
            nurseName: `${nurse.fullName}`,
            nursePrice: nurse.price || 0,
          }));
          allSlots.push(...nurseSlotsWithInfo);
        } catch (err) {
          console.error(`Error fetching slots for nurse ${nurse.id}:`, err);
          if (err.response?.status === 401 && retryCount < MAX_RETRIES && !isRetry) {
            const newAccessToken = await attemptRefreshToken();
            if (newAccessToken) {
              localStorage.setItem('accessToken', newAccessToken);
              setRetryCount(prev => prev + 1);
              return fetchAppointmentSlots(nurses, nursingId, cityId, true);
            } else {
              throw new Error('Session expired during slot fetch. Please log in again.');
            }
          }
          // Skip nurses with errors; they won't have slots
        }
      }

      console.log('Fetched appointment slots:', allSlots);
      return allSlots;
    } catch (err) {
      console.error('Error fetching appointment slots:', err);
      let errorMessage = 'Failed to load appointment slots.';
      if (err.response) {
        errorMessage = `Failed to load slots: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
        console.log('Response headers:', err.response.headers);
        console.log('Response data:', err.response.data);
      } else if (err.message) {
        errorMessage = `Failed to load slots: ${err.message}`;
      }
      throw new Error(errorMessage);
    }
  };

  // STEP 4: Fetch patient data
  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (step !== 4 || !user?.id) return;
      setIsLoading(true);
      setError(null);
      try {
        const authToken = getAuthToken();
        const response = await axios.get(`${baseUrl}/api/v1/Patients/BasicPatientInfo`, {
          params: { id: user.id },
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        const patientData = response.data;
        setPatientName(patientData.fullName || '');
        setPatientPhone(patientData.phoneNumber || '');
        setAddress(patientData.address || '');
        setSelectedPatient({ id: user.id, fullName: patientData.fullName });
        setErrors({
          patientName: '',
          patientPhone: '',
          patientCondition: '',
          address: '',
        });
      } catch (err) {
        console.error('Error fetching patient details:', err);
        setError('Failed to load patient details.');
      } finally {
        setIsLoading(false);
      }
    };
    if (step === 4) fetchPatientDetails();
  }, [step, user]);

  // Fetch patient booking history
  useEffect(() => {
    const fetchBookings = async () => {
      if (step !== 6 || !user?.id) return;
      setIsLoading(true);
      setError(null);
      try {
        const authToken = getAuthToken();
        const response = await axios.get(
          `${baseUrl}/api/v1/PatientBookNurse/get-all-booking-for-patient/${user.id}`,
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          }
        );
        console.log('Patient bookings API response:', response.data);
        if (!response.data) {
          console.warn('Patient bookings API returned null or undefined data');
          setBookings([]);
          setError('No bookings found for this patient.');
          return;
        }
        if (!Array.isArray(response.data)) {
          console.error('Patient bookings API returned non-array data:', response.data);
          throw new Error('Invalid bookings data format');
        }
        const validBookings = response.data
          .filter((booking) => {
            if (!booking.bookingId || typeof booking.bookingId !== 'string' || booking.bookingId.trim() === '') {
              console.warn('Invalid booking filtered out:', booking);
              return false;
            }
            return true;
          })
          .map((booking) => ({
            id: booking.bookingId,
            nurseId: booking.nurseId,
            nurseName: booking.nurseName || 'N/A',
            nursingId: booking.nursingId,
            nursingName: booking.nursingName || 'N/A',
            appointmentId: booking.appointmentId,
            date: booking.date,
            time: booking.time,
            totalPrice: booking.totalPrice != null ? booking.totalPrice : 'N/A',
            patientName: booking.patientName || 'N/A',
            patientPhone: booking.patientPhone || 'N/A',
            address: booking.address || 'N/A',
            cityName: booking.cityName || 'N/A',
            medicalCondition: booking.medicalCondition || 'N/A',
          }));
        console.log('Valid patient bookings:', validBookings);
        const completeBookings = validBookings.filter((booking) =>
          [
            booking.nurseName,
            booking.nursingName,
            booking.date,
            booking.time,
            booking.totalPrice,
          ].every((field) => field != null && field !== 'N/A' && field !== '')
        );
        console.log('Complete patient bookings:', completeBookings);
        setBookings(completeBookings);
        if (completeBookings.length === 0 && response.data.length > 0) {
          setError('No bookings with complete data found.');
        } else if (completeBookings.length === 0) {
          setError('No bookings found for this patient.');
        }
      } catch (err) {
        console.error('Error fetching patient bookings:', err);
        let errorMessage = 'Failed to load booking history.';
        if (err.response) {
          errorMessage = `Failed to load bookings: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
        }
        setError(errorMessage);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (step === 6) fetchBookings();
  }, [step, user]);

  // Appointment slot selection
  const handleSelectAppointmentSlot = (nurse, slot) => {
    setSelectedNurseData(nurse);
    setSelectedDate(slot.date);
    setSelectedTime(slot.time);
    if (nurse.price) setTotalPrice(nurse.price.toString());
    setSelectedAppNurseId(slot.id || null);
  };

  // Toggle description for service
  const toggleServiceDescription = (serviceId) => {
    setExpandedServiceId((prev) => (prev === serviceId ? null : serviceId));
  };

  // Navigation functions
  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  // Patient form validation
  const validatePatientName = (value) => (value.trim().length < 3 ? 'At least 3 characters required' : '');
  const validatePatientPhone = (value) =>
    !/^\d{10,15}$/.test(value.replace(/\D/g, '')) ? 'Invalid phone number' : '';
  const validatePatientCondition = (value) => (!value.trim() ? 'Medical condition is required' : '');
  const validateAddress = (value) => (!value.trim() ? 'Address is required' : '');

  const handlePatientNameChange = (e) => {
    const value = e.target.value;
    setPatientName(value);
    setErrors({ ...errors, patientName: validatePatientName(value) });
  };

  const handlePatientPhoneChange = (e) => {
    const value = e.target.value;
    setPatientPhone(value);
    setErrors({ ...errors, patientPhone: validatePatientPhone(value) });
  };

  const handlePatientConditionChange = (e) => {
    const value = e.target.value;
    setPatientCondition(value);
    setErrors({ ...errors, patientCondition: validatePatientCondition(value) });
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    setErrors({ ...errors, address: validateAddress(value) });
  };

  const handlePatientFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      patientName: validatePatientName(patientName),
      patientPhone: validatePatientPhone(patientPhone),
      patientCondition: validatePatientCondition(patientCondition),
      address: validateAddress(address),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).every((err) => err === '')) {
      handleNext();
    }
  };

  // Payment screenshot handling
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    setPaymentScreenshot(file);
    if (file) setPaymentScreenshotPreview(URL.createObjectURL(file));
  };

  // STEP 5: Confirm appointment
  const handleConfirmAppointment = async () => {
    if (!paymentScreenshot) {
      setError('Please upload a payment screenshot.');
      return;
    }
    if (!selectedService || !selectedNurseData || !selectedPatient || !selectedAppNurseId) {
      setError('Missing required booking information.');
      return;
    }
    if (!user?.id) {
      setError('User not authenticated. Please log in again.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const authToken = getAuthToken();
      const formData = new FormData();
      formData.append('NurseID', selectedNurseData.id);
      formData.append('NurseNurseingAppointmentID', selectedAppNurseId);
      formData.append('MedicalCondition', patientCondition || '');
      formData.append('Image', paymentScreenshot);
      formData.append('TotalPrice', parseFloat(totalPrice) || 0);

      console.log('Sending booking data (FormData):', {
        NurseID: selectedNurseData.id,
        NurseNurseingAppointmentID: selectedAppNurseId,
        MedicalCondition: patientCondition,
        TotalPrice: totalPrice,
      });

      const response = await axios.post(
        `${baseUrl}/api/v1/PatientBookNurse/addNewBooking`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log('Booking successful:', response.data);
      setBookingId(response.data.bookingId || 'BOOKING-' + Math.random().toString(36).substr(2, 9));
      setAppointmentConfirmed(true);
      handleNext();
    } catch (err) {
      console.error('Error in booking:', err);
      let errorMessage = 'Booking failed. Please try again.';
      if (err.response) {
        errorMessage = `Booking failed: ${err.response.status} ${err.response.statusText}`;
        if (err.response.data && err.response.data.message) {
          errorMessage += ` - ${err.response.data.message}`;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete appointment
  const handleRejectAppointment = async (bookingIdToDelete) => {
    if (!bookingIdToDelete || typeof bookingIdToDelete !== 'string' || bookingIdToDelete.trim() === '') {
      setError('Invalid or missing booking ID.');
      return;
    }
    if (!isValidUUID(bookingIdToDelete)) {
      setError('Invalid booking ID format.');
      return;
    }
    if (!user?.id) {
      setError('User not authenticated. Please log in again.');
      return;
    }
    const bookingExists = bookings.some((booking) => booking.id === bookingIdToDelete);
    if (!bookingExists) {
      setError('Booking ID not found in your bookings.');
      return;
    }
    const confirmDelete = window.confirm('Are you sure you want to delete this booking?');
    if (!confirmDelete) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    const authToken = getAuthToken();
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    try {
      const response = await axios.delete(
        `${baseUrl}/api/v1/PatientBookNurse/DeleteBooking`,
        {
          data: { id: bookingIdToDelete },
          headers,
        }
      );
      console.log('Booking deleted successfully:', response.data);
      setBookings(bookings.filter((booking) => booking.id !== bookingIdToDelete));
      setSuccessMessage('Booking deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error deleting booking:', err);
      let errorMessage = 'Failed to delete booking.';
      if (err.response) {
        errorMessage = `Deletion failed: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit appointment
  const handleEditAppointment = (booking) => {
    setSelectedService({ id: booking.nursingId, name: booking.nursingName });
    setSelectedCity({ id: booking.cityId, cityName: booking.cityName || 'N/A' });
    setSelectedNurseData({
      id: booking.nurseId,
      uniqueId: `nurse-${booking.nurseId}`,
      fullName: booking.nurseName,
      price: booking.totalPrice,
    });
    setSelectedDate(booking.date);
    setSelectedTime(booking.time);
    setSelectedAppNurseId(booking.appointmentId);
    setPatientName(booking.patientName || '');
    setPatientPhone(booking.patientPhone || '');
    setPatientCondition(booking.medicalCondition);
    setAddress(booking.address || '');
    setTotalPrice(booking.totalPrice.toString());
    setBookingId(booking.id);
    setStep(3);
  };

  // View appointment details
  const handleViewAppointment = (booking) => {
    alert(`
      Nurse: ${booking.nurseName || 'N/A'}
      Service: ${booking.nursingName || 'N/A'}
      Date: ${new Date(booking.date).toLocaleDateString()}
      Time: ${booking.time || 'N/A'}
      Price: E£ ${booking.totalPrice || '0'}
    `);
  };

  // PDF Download
  const handleDownloadPDF = () => {
    if (!selectedNurseData) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Appointment Details', 14, 22);
    doc.setFontSize(12);
    let yPos = 32;
    const lineHeight = 8;
    const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString() : 'N/A';
    doc.text(`Date: ${formattedDate} | Time: ${selectedTime || 'N/A'}`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Nurse: ${selectedNurseData.fullName || 'N/A'}`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Service: ${selectedService?.name || 'N/A'}`, 14, yPos);
    yPos += lineHeight;
    doc.text(`City: ${getCityName(selectedCity)}`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Patient: ${patientName || 'N/A'}`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Phone: ${patientPhone || 'N/A'}`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Medical Condition: ${patientCondition || 'N/A'}`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Address: ${address || 'N/A'}`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Total Price: E£ ${totalPrice || '0'}`, 14, yPos);
    doc.save('AppointmentDetails.pdf');
  };

  // Get nurse slots
  const getNurseSlotsFromAppointmentSlots = (nurseUniqueId) => {
    const slots = appointmentSlots.filter((slot) => slot.nurseUniqueId === nurseUniqueId);
    console.log(`Slots for nurse ${nurseUniqueId}:`, slots);
    return slots;
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="step-indicator">
      {stepsArray.map((item, index) => {
        const currentStep = index + 1;
        return (
          <div key={index} className="step">
            <div className={`circle ${currentStep === step ? 'active' : ''}`}>{currentStep}</div>
            {index < stepsArray.length - 1 && <div className="line"></div>}
          </div>
        );
      })}
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="card p-4 shadow border-0">
            <h4 className="mb-3 text-center">Nursing Service</h4>
            <p className="text-muted text-center">Choose a service:</p>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading nursing services...</p>
              </div>
            ) : error && nursingServices.length === 0 ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <div className="d-flex flex-column align-items-center">
                {nursingServices.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  const isExpanded = expandedServiceId === service.id;
                  return (
                    <div key={service.id} className="mb-2" style={{ maxWidth: '500px', width: '100%' }}>
                      <button
                        className={`btn btn-custom w-100 text-start service-btn ${
                          isSelected ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <strong>{service.name}</strong>
                        {service.description && (
                          <div className="small mt-2">
                            {isExpanded ? (
                              <>
                                <span className={isSelected ? 'text-white' : 'text-muted'}>
                                  {service.description}
                                </span>
                                <div
                                  className={`more-link ${isSelected ? 'text-white' : 'text-muted'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleServiceDescription(service.id);
                                  }}
                                >
                                  Show less
                                </div>
                              </>
                            ) : (
                              <div
                                className={`more-link ${isSelected ? 'text-white' : 'text-muted'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleServiceDescription(service.id);
                                  setSelectedService(service);
                                }}
                              >
                                More
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="nav-buttons">
              <button className="btn btn-custom btn-secondary" disabled>
                Back
              </button>
              <button
                className="btn btn-custom btn-primary"
                disabled={!selectedService || isLoading}
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="card p-4 shadow border-0">
            <h4 className="mb-3 text-center">City</h4>
            <p className="text-muted text-center">Select your city:</p>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading cities...</p>
              </div>
            ) : error && cities.length === 0 ? (
              <div className="alert alert-danger">{error}</div>
            ) : cities.length === 0 ? (
              <div className="alert alert-warning">No cities available.</div>
            ) : (
              <div className="d-flex justify-content-center">
                <div style={{ maxWidth: '500px', width: '100%' }}>
                  <select
                    className="form-select"
                    value={selectedCity?.id || ''}
                    onChange={(e) => {
                      const city = cities.find((c) => c.id === e.target.value);
                      setSelectedCity(city || null);
                    }}
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.cityName} ({city.governorate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="nav-buttons">
              <button className="btn btn-custom btn-secondary" onClick={handleBack}>
                Back
              </button>
              <button
                className="btn btn-custom btn-primary"
                disabled={!selectedCity || isLoading}
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 3:
        console.log('Step 3 state:', { fetchedNurses, appointmentSlots, selectedNurseData });
        if (isLoading) {
          return (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2">Loading nurse information...</div>
            </div>
          );
        }
        if (error) {
          return (
            <div className="card p-4 shadow border-0">
              <div className="alert alert-danger">{error}</div>
              <div className="nav-buttons">
                <button className="btn btn-custom btn-secondary" onClick={handleBack}>
                  Back
                </button>
                <button className="btn btn-custom btn-primary" disabled>
                  Next
                </button>
              </div>
            </div>
          );
        }
        if (!fetchedNurses || fetchedNurses.length === 0) {
          return (
            <div className="card p-4 text-center shadow border-0">
              <div>No nurses with available slots found for the selected service and city. Please try a different service or city, or contact support at <a href="mailto:support@physiocareapp.com">support@physiocareapp.com</a>.</div>
              <div className="nav-buttons">
                <button className="btn btn-custom btn-secondary" onClick={handleBack}>
                  Back
                </button>
                <button className="btn btn-custom btn-primary" disabled>
                  Next
                </button>
              </div>
            </div>
          );
        }
        const filteredNurses = fetchedNurses
          .filter((nurse) => {
            const fullName = `${nurse.fullName || ''}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
          })
          .slice(0, 4);
        console.log('Filtered nurses:', filteredNurses);
        return (
          <div className="card p-4 shadow border-0">
            <h4 className="mb-3 text-center">Select Nurse</h4>
            <div className="text-muted text-center mb-3">
              <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                <i className="bi bi-geo-alt me-1"></i>
                {getCityName(selectedCity)} | <i className="bi bi-heart-pulse mx-1"></i>
                {selectedService?.name || 'N/A'}
              </span>
            </div>
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search nurses by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="nurses-list">
              {filteredNurses.map((nurse) => {
                const nurseUniqueId = nurse.uniqueId;
                const isSelected = selectedNurseData && selectedNurseData.uniqueId === nurseUniqueId;
                const nurseSlots = getNurseSlotsFromAppointmentSlots(nurseUniqueId);
                return (
                  <div
                    key={nurseUniqueId}
                    className={`card mb-3 ${isSelected ? 'border-primary shadow' : 'border-light'}`}
                    style={{
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 10px rgba(13, 110, 253, 0.2)' : '0 0 5px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="card-title m-0 d-flex align-items-center">
                          <i className="bi bi-person-circle fs-4 me-2 text-primary"></i>
                          {nurse.fullName || 'Unknown Nurse'}
                        </h5>
                        <button
                          className={`btn ${isSelected ? 'btn-success' : 'btn-primary'} btn-sm`}
                          onClick={() => handleSelectAppointmentSlot(nurse, nurseSlots[0])}
                        >
                          {isSelected ? (
                            <>
                              <i className="bi bi-check-circle me-1"></i>Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </button>
                      </div>
                      <div className="nurse-info mb-2">
                        <div className="card bg-light p-2">
                          {Object.entries(nurse).map(([key, value]) => {
                            if (['id', 'uniqueId'].includes(key) || !value) return null;
                            return (
                              <div key={key} className="d-flex align-items-center mb-1">
                                <i className={`${getIconForField(key)} me-2 text-primary`}></i>
                                <span className="text-capitalize fw-bold badge bg-light text-dark">{key}:</span>
                                <span className="ms-2">
                                  {key === 'price' ? `EGP ${value}` : value}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h6 className="mb-2">Available Slots:</h6>
                        <div className="available-slots d-flex flex-wrap gap-2">
                          {nurseSlots.map((slot, index) => {
                            const isSlotSelected =
                              selectedNurseData?.uniqueId === nurseUniqueId &&
                              selectedDate === slot.date &&
                              selectedTime === slot.time;
                            const slotDate = new Date(slot.date);
                            const formattedDate = slotDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            });
                            return (
                              <button
                                key={`${nurseUniqueId}-slot-${index}`}
                                className={`btn btn-sm ${isSlotSelected ? 'btn-success' : 'btn-outline-primary'}`}
                                onClick={() => handleSelectAppointmentSlot(nurse, slot)}
                              >
                                {formattedDate || 'N/A'} • {slot.time || 'N/A'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredNurses.length === 0 && (
                <div className="text-center py-4">
                  <i className="bi bi-search fs-1 text-muted"></i>
                  <div className="mt-2">No nurses found matching "{searchTerm}"</div>
                </div>
              )}
            </div>
            <div className="nav-buttons">
              <button className="btn btn-custom btn-secondary" onClick={handleBack}>
                Back
              </button>
              <button
                className="btn btn-custom btn-primary"
                disabled={!selectedNurseData || !selectedDate || !selectedTime}
                onClick={handleNext}
              >
                Next
              </button>
            </div>
            {error && (
              <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
            {successMessage && (
              <div className="alert alert-success alert-dismissible fade show mt-3" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {successMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccessMessage(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="card p-4 shadow border-0">
            <h4 className="mb-3 text-center">Patient Information</h4>
            <div className="patient-info mb-4">
              <div className="card bg-light mb-3">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-person-badge fs-5 me-2 text-primary"></i>
                        <span className="text-muted">Selected Nurse:</span>
                        <span className="ms-2 fw-bold">{selectedNurseData?.fullName || 'N/A'}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-heart-pulse fs-5 me-2 text-primary"></i>
                        <span className="text-muted">Service:</span>
                        <span className="ms-2 fw-bold">{selectedService?.name || 'N/A'}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-geo-alt fs-5 me-2 text-primary"></i>
                        <span className="text-muted">City:</span>
                        <span className="ms-2 fw-bold">{getCityName(selectedCity)}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-calendar-date fs-5 me-2 text-primary"></i>
                        <span className="text-muted">Appointment Date:</span>
                        <span className="ms-2 fw-bold">
                          {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-clock fs-5 me-2 text-primary"></i>
                        <span className="text-muted">Time:</span>
                        <span className="ms-2 fw-bold">{selectedTime || 'N/A'}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-cash fs-5 me-2 text-primary"></i>
                        <span className="text-muted">Price:</span>
                        <span className="ms-2 badge bg-primary text-white">EGP {totalPrice || '0'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <form onSubmit={handlePatientFormSubmit}>
              <div className="mb-3">
                <label htmlFor="patientName" className="form-label d-flex align-items-center">
                  <i className="bi bi-person me-2 text-primary"></i>Patient Full Name
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.patientName ? 'is-invalid' : ''}`}
                  id="patientName"
                  value={patientName}
                  onChange={handlePatientNameChange}
                  required
                />
                {errors.patientName && <div className="invalid-feedback">{errors.patientName}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="patientPhone" className="form-label d-flex align-items-center">
                  <i className="bi bi-telephone me-2 text-primary"></i>Phone Number
                </label>
                <input
                  type="tel"
                  className={`form-control ${errors.patientPhone ? 'is-invalid' : ''}`}
                  id="patientPhone"
                  value={patientPhone}
                  onChange={handlePatientPhoneChange}
                  required
                />
                {errors.patientPhone && <div className="invalid-feedback">{errors.patientPhone}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="patientCondition" className="form-label d-flex align-items-center">
                  <i className="bi bi-file-medical me-2 text-primary"></i>Medical Condition
                </label>
                <textarea
                  className={`form-control ${errors.patientCondition ? 'is-invalid' : ''}`}
                  id="patientCondition"
                  rows="3"
                  value={patientCondition}
                  onChange={handlePatientConditionChange}
                  required
                  placeholder="Please describe your medical condition for this appointment"
                ></textarea>
                {errors.patientCondition && <div className="invalid-feedback">{errors.patientCondition}</div>}
                <small className="form-text text-muted">
                  This information will be shared with the nurse to prepare for your appointment.
                </small>
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label d-flex align-items-center">
                  <i className="bi bi-house-door me-2 text-primary"></i>Full Address
                </label>
                <textarea
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  id="address"
                  rows="3"
                  value={address}
                  onChange={handleAddressChange}
                  required
                ></textarea>
                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
              </div>
              <div className="form-check mb-4">
                <input className="form-check-input" type="checkbox" id="termsCheck" required />
                <label className="form-check-label" htmlFor="termsCheck">
                  I agree to the terms and conditions
                </label>
              </div>
              <div className="nav-buttons">
                <button type="button" className="btn btn-custom btn-secondary" onClick={handleBack}>
                  Back
                </button>
                <button type="submit" className="btn btn-custom btn-primary">
                  Next
                </button>
              </div>
            </form>
          </div>
        );

      case 5:
        return (
          <div className="card p-4 shadow border-0">
            <h4 className="mb-3 text-center">Payment Details</h4>
            <div className="patient-info mb-4">
              <div className="card bg-light mb-3">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-person-badge fs-5 me-2 text-primary"></i>
                        <span className="text-muted">Selected Nurse:</span>
                        <span className="ms-2 fw-bold">{selectedNurseData?.fullName || 'N/A'}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-heart-pulse fs-5 me-2 text-primary"></i>
                        <span className="text-muted">Service:</span>
                        <span className="ms-2 fw-bold">{selectedService?.name || 'N/A'}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-geo-alt fs-5 me-2 text-primary"></i>
                        <span className="text-muted">City:</span>
                        <span className="ms-2 fw-bold">{getCityName(selectedCity)}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-calendar-date fs-5 me-2 text-primary"></i>
                        <span className="text-muted">Appointment Date:</span>
                        <span className="ms-2 fw-bold">
                          {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-clock fs-5 me-2 text-primary"></i>
                        <span className="text-muted">Time:</span>
                        <span className="ms-2 fw-bold">{selectedTime || 'N/A'}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-person fs-5 me-2 text-primary"></i>
                        <span className="text-muted">Patient:</span>
                        <span className="ms-2 fw-bold">{patientName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card border-primary mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Payment Information</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Total Amount:</h5>
                  <h4 className="text-primary mb-0 badge bg-primary text-white fs-4 px-3 py-2">
                    EGP {totalPrice || '0'}
                  </h4>
                </div>
                <hr />
                <div className="mb-3">
                  <h6>Payment Methods:</h6>
                  <div className="list-group">
                    <div className="list-group-item">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-credit-card me-2 fs-5"></i>
                        <div>
                          <h6 className="mb-0">Payment</h6>
                          <small className="text-muted">Online payment via Vodafone Cash</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="form-label d-flex align-items-center">
                    <i className="bi bi-upload me-2 text-primary"></i>Upload Payment Receipt/Screenshot
                  </label>
                  <div className="mb-3">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      required
                    />
                    <small className="form-text text-muted">
                      Please upload a screenshot or receipt of your payment
                    </small>
                  </div>
                  {paymentScreenshotPreview && (
                    <div className="text-center mb-3">
                      <img
                        src={paymentScreenshotPreview}
                        alt="Payment Screenshot"
                        className="img-thumbnail"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="nav-buttons">
              <button className="btn btn-custom btn-secondary" onClick={handleBack}>
                Back
              </button>
              <button
                className="btn btn-custom btn-primary"
                disabled={!paymentScreenshot || isLoading}
                onClick={handleConfirmAppointment}
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
            {error && (
              <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
          </div>
        );

      case 6:
        console.log('Bookings in Step 6:', bookings);
        return (
          <div className="card p-4 shadow border-0">
            <div className="text-center mb-4">
              <div className="confirmation-icon mb-3">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
              </div>
              <h3 className="mb-2">Booking Confirmed!</h3>
              <div className="badge bg-success text-white px-3 py-2 mb-2">
                Your appointment has been successfully booked and is awaiting confirmation.
              </div>
            </div>
            <div className="card bg-light mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Appointment Details</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-person-check me-2 text-primary"></i>
                      <span className="text-muted">Nurse:</span>
                      <span className="ms-2 fw-bold">{selectedNurseData?.fullName || 'N/A'}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-heart-pulse me-2 text-primary"></i>
                      <span className="text-muted">Service:</span>
                      <span className="ms-2 fw-bold">{selectedService?.name || 'N/A'}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-geo-alt me-2 text-primary"></i>
                      <span className="text-muted">City:</span>
                      <span className="ms-2 fw-bold">{getCityName(selectedCity)}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-calendar-event me-2 text-primary"></i>
                      <span className="text-muted">Date:</span>
                      <span className="ms-2 fw-bold">
                        {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-clock me-2 text-primary"></i>
                      <span className="text-muted">Time:</span>
                      <span className="ms-2 fw-bold">{selectedTime || 'N/A'}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-cash me-2 text-primary"></i>
                      <span className="text-muted">Price:</span>
                      <span className="ms-2 badge bg-primary text-white">EGP {totalPrice || '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {successMessage && (
              <div className="alert alert-success alert-dismissible fade show mt-3" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {successMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccessMessage(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
            <section className="booking-history mb-4" aria-labelledby="booking-history-title">
              <h2 id="booking-history-title" className="mb-4 text-center">Your Booking History</h2>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="alert alert-info text-center">
                  <i className="bi bi-info-circle me-2"></i>
                  No bookings found. Create a new booking to get started or contact support at{' '}
                  <a href="mailto:support@physiocareapp.com">support@physiocareapp.com</a>.
                  <div className="mt-3">
                    <button className="btn btn-primary" onClick={() => setStep(1)}>
                      Start New Booking
                    </button>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-bordered" aria-describedby="booking-history-title">
                    <thead className="table-primary">
                      <tr>
                        <th scope="col">Nurse</th>
                        <th scope="col">Service</th>
                        <th scope="col">Date</th>
                        <th scope="col">Time</th>
                        <th scope="col">Price</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.nurseName}</td>
                          <td>{booking.nursingName}</td>
                          <td>{new Date(booking.date).toLocaleDateString()}</td>
                          <td>{booking.time}</td>
                          <td>EGP {booking.totalPrice}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleViewAppointment(booking)}
                                aria-label={`View details for booking ${booking.id}`}
                              >
                                <i className="bi bi-eye"></i> View
                              </button>
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => handleEditAppointment(booking)}
                                aria-label={`Edit booking ${booking.id}`}
                              >
                                <i className="bi bi-pencil"></i> Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRejectAppointment(booking.id)}
                                disabled={isLoading}
                                aria-label={`Delete booking ${booking.id}`}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mb-3">
              <button className="btn btn-custom btn-outline-primary" onClick={handleDownloadPDF}>
                <i className="bi bi-file-pdf me-2"></i>Download PDF
              </button>
              <a href="/" className="btn btn-custom btn-success">
                <i className="bi bi-house me-2"></i>Back to Home
              </a>
            </div>
            <div className="alert alert-info mt-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                <div>
                  <span className="mb-0">
                    You will receive a confirmation email shortly. For any questions, please contact our support team at{' '}
                    <a href="mailto:support@physiocareapp.com">support@physiocareapp.com</a>.
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="nursing-booking">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="step-wrapper">
              {renderStepIndicator()}
              <div className="step-content mt-4">{renderStepContent()}</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default NursingAr;