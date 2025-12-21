import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Home as Building, Check, ArrowLeft, MapPin, Star, Calendar, Clock, Download, User, Phone, Mail, Trash2 } from 'react-feather';
import axios from 'axios';
import NavBar from '../components/Nav';
import Footer from '../components/Footer';
import './lab.css';
import { useAuth } from '../Pages/AuthPage';
import jsPDF from 'jspdf';

const API_BASE_URL = 'https://physiocareapp.runasp.net/api/v1';
const IMAGE_BASE_URL = 'https://physiocareapp.runasp.net/api/v1';
const VODAFONE_CASH_NUMBER = '+01091778920';

const VIRTUAL_DATA = {
  laboratories: [
    { id: 1, name: 'Central Lab', rating: 4.5, hasHomeService: true, image: 'https://via.placeholder.com/80/FF0000', openingHours: '09:00 AM - 05:00 PM', tax: 10.0, price: 100, bookedCount: 88, discount: 0, experienceYears: 5 },
    { id: 2, name: 'Alpha Diagnostics', rating: 4.7, hasHomeService: true, image: 'https://via.placeholder.com/80/00FF00', openingHours: '08:00 AM - 04:00 PM', tax: 0.0, price: 120, bookedCount: 92, discount: 0, experienceYears: 8 },
    { id: 3, name: 'MedLab', rating: 4.6, hasHomeService: false, image: 'https://via.placeholder.com/80/0000FF', openingHours: '10:00 AM - 06:00 PM', tax: 0.0, price: 110, bookedCount: 75, discount: 0, experienceYears: 3 },
    { id: 4, name: 'HealthScope', rating: 4.3, hasHomeService: true, image: 'https://via.placeholder.com/80/FFFF00', openingHours: '09:00 AM - 05:00 PM', tax: 0.0, price: 130, bookedCount: 60, discount: 0, experienceYears: 10 },
    { id: 5, name: 'Express Analytics', rating: 4.8, hasHomeService: false, image: 'https://via.placeholder.com/80/FF00FF', openingHours: '08:00 AM - 04:00 PM', tax: 0.0, price: 90, bookedCount: 95, discount: 0, experienceYears: 7 },
  ],
  cities: [
    { id: 1, name: 'Cairo' },
    { id: 2, name: 'Alexandria' },
    { id: 3, name: 'Giza' },
    { id: 4, name: 'Sharm El Sheikh' },
    { id: 5, name: 'Hurghada' },
  ],
  patient: {
    fullName: 'Abdullah Ali',
    phoneNumber: '01234567890',
    address: '123 Tala Street, Cairo'
  }
};

const findKeyInObject = (obj, possibleKeys) => {
  let value = '';
  possibleKeys.forEach(key => {
    if (obj[key] && typeof obj[key] === 'string') {
      value = obj[key];
    } else {
      for (let prop in obj) {
        if (typeof obj[prop] === 'object' && obj[prop] !== null) {
          const nestedValue = findKeyInObject(obj[prop], possibleKeys);
          if (nestedValue) {
            value = nestedValue;
            break;
          }
        }
      }
    }
  });
  return value;
};

const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return str && uuidRegex.test(str);
};

const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && date.toISOString().split('T')[0] === dateStr;
};

const isValidTime = (timeStr) => {
  if (!timeStr) return false;
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
};

const formatTime = (time) => {
  if (!time || typeof time !== 'string') return 'N/A';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export default function LabBookingSystem() {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [isAtHome, setIsAtHome] = useState(true);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [showBookingHistory, setShowBookingHistory] = useState(false);
  const [laboratories, setLaboratories] = useState([]);
  const [labCities, setLabCities] = useState([]);
  const [labAnalyses, setLabAnalyses] = useState([]);
  const [availableAppointments, setAvailableAppointments] = useState([]);
  const [usingVirtualData, setUsingVirtualData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedAnalyses, setBookedAnalyses] = useState([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);
  const [paymentImage, setPaymentImage] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterIsAtHome, setFilterIsAtHome] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setErrorMessage('Please log in to proceed with booking.');
      setUsingVirtualData(true);
      const fallbackData = VIRTUAL_DATA.patient;
      setPatientInfo({
        name: fallbackData.fullName,
        phone: fallbackData.phoneNumber,
        email: user?.email || '',
        address: fallbackData.address,
      });
      return;
    }

    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const response = await axios.get(`${API_BASE_URL}/Patients/BasicPatientInfo`, {
          params: { id: user.id },
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const data = Array.isArray(response.data) ? (response.data[0] || {}) : (response.data.data || response.data.patient || response.data);

        const nameKeys = ['fullName', 'name', 'FullName', 'fullname', 'patientName', 'displayName', 'PatientName', 'userName'];
        const phoneKeys = ['phoneNumber', 'phone', 'PhoneNumber', 'phonenumber', 'contactNumber', 'mobile', 'MobileNumber', 'contact'];
        const addressKeys = ['fullAddress', 'address', 'Address', 'location', 'patientAddress', 'homeAddress', 'Location', 'residence'];

        const fullName = findKeyInObject(data, nameKeys) || user.email || '';
        const phoneNumber = findKeyInObject(data, phoneKeys) || '';
        const address = findKeyInObject(data, addressKeys) || '';

        if (!fullName && !phoneNumber && !address) {
          const fallbackData = VIRTUAL_DATA.patient;
          setPatientInfo({
            name: fallbackData.fullName,
            phone: fallbackData.phoneNumber,
            email: user.email || '',
            address: fallbackData.address,
          });
          setUsingVirtualData(true);
          return;
        }

        setPatientInfo({
          name: fullName,
          phone: phoneNumber,
          email: user.email || '',
          address: address,
        });
        setUsingVirtualData(false);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setErrorMessage('Failed to load patient information. Using offline data.');
        const fallbackData = VIRTUAL_DATA.patient;
        setPatientInfo({
          name: fallbackData.fullName,
          phone: fallbackData.phoneNumber,
          email: user?.email || '',
          address: fallbackData.address,
        });
        setUsingVirtualData(true);
        setTimeout(() => setErrorMessage(''), 5000);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user?.accessToken) {
      setErrorMessage('Please log in to access laboratories.');
      setLaboratories(VIRTUAL_DATA.laboratories);
      setUsingVirtualData(true);
      return;
    }

    const fetchLabs = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const response = await axios.get(`${API_BASE_URL}/Laboratories/getAll`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const labsData = response.data?.data || response.data;

        if (Array.isArray(labsData)) {
          const transformedLabs = labsData.map(lab => {
            let imageUrl = lab.fileName && typeof lab.fileName === 'string' && lab.fileName.trim() !== ''
              ? `${IMAGE_BASE_URL}/Upload/image?filename=${encodeURIComponent(lab.fileName)}&path=Actors/Laboratory&t=${Date.now()}`
              : `https://via.placeholder.com/80/${lab.id % 2 === 0 ? 'FF0000' : '0000FF'}`;

            const openAt = lab.openAt && typeof lab.openAt === 'string' ? formatTime(lab.openAt) : '09:00 AM';
            const closedAt = lab.closedAt && typeof lab.closedAt === 'string' ? formatTime(lab.closedAt) : '05:00 PM';
            const openingHours = `${openAt} - ${closedAt}`;

            return {
              id: lab.id,
              name: lab.fullName || 'Unknown Lab',
              rating: typeof lab.evaluation === 'number' ? lab.evaluation : 0,
              hasHomeService: lab.hasHomeService !== undefined ? lab.hasHomeService : true,
              fileName: lab.fileName,
              image: imageUrl,
              openingHours: openingHours,
              tax: typeof lab.tax === 'number' ? lab.tax : 0.0,
              price: typeof lab.price === 'number' ? lab.price : 100,
              bookedCount: typeof lab.bookedCount === 'number' ? lab.bookedCount : 88,
              discount: typeof lab.discount === 'number' ? lab.discount : 0,
              experienceYears: typeof lab.experienceYears === 'number' ? lab.experienceYears : 0,
            };
          });
          setLaboratories(transformedLabs);
          setUsingVirtualData(false);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('Error fetching laboratories:', error);
        setErrorMessage('Failed to load laboratories. Using offline data.');
        setLaboratories(VIRTUAL_DATA.laboratories);
        setUsingVirtualData(true);
        setTimeout(() => setErrorMessage(''), 10000);
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user?.accessToken || !selectedLab || currentStep !== 2) return;

    const fetchCities = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const response = await axios.get(`${API_BASE_URL}/Cities/GetAll`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const citiesData = response.data?.data || response.data;

        if (Array.isArray(citiesData)) {
          const transformedCities = citiesData.map(city => ({
            id: city.id || city.cityId || city.Id || city.ID || '',
            name: city.name || city.city || city.cityName || city.locationName || 'Unknown City',
          }));
          setLabCities(transformedCities);
          setUsingVirtualData(false);
          if (transformedCities.length === 0) {
            setErrorMessage('No cities available.');
          }
        } else {
          throw new Error('Invalid cities data format');
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setErrorMessage('Failed to load cities. Using offline data.');
        setLabCities(VIRTUAL_DATA.cities);
        setUsingVirtualData(true);
        setTimeout(() => setErrorMessage(''), 5000);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, [selectedLab, currentStep, isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user?.accessToken || !selectedLab || currentStep !== 3) return;

    setSelectedAnalyses([]);
    const fetchAnalyses = async () => {
      if (!isValidUUID(selectedLab) || !isValidUUID(selectedCity)) {
        setErrorMessage('Invalid laboratory or city ID.');
        setLabAnalyses([]);
        setUsingVirtualData(true);
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage('');
        const response = await axios.get(`${API_BASE_URL}/LaboratoryCity/get-all-PhAnalyses-for-lab`, {
          params: { labId: selectedLab, cityId: selectedCity },
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const analysesData = response.data?.data || response.data;

        if (Array.isArray(analysesData)) {
          const transformedAnalyses = analysesData
            .filter(analysis => isValidUUID(analysis.id))
            .map(analysis => ({
              id: analysis.id,
              name: analysis.nameEN || 'Unknown Analysis',
              price: typeof analysis.price === 'number' ? analysis.price : 0,
              athomePrice: typeof analysis.athomePrice === 'number' ? analysis.athomePrice : analysis.price || 0,
            }));
          setLabAnalyses(transformedAnalyses);
          setUsingVirtualData(false);
          if (transformedAnalyses.length === 0) {
            setErrorMessage('No valid analyses available for this laboratory.');
          }
        } else {
          throw new Error('Invalid analyses data format');
        }
      } catch (error) {
        console.error('Error fetching analyses:', error);
        setErrorMessage('Failed to load analyses. Please try again or select a different laboratory.');
        setLabAnalyses([]);
        setUsingVirtualData(true);
        setTimeout(() => setErrorMessage(''), 5000);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyses();
  }, [selectedLab, selectedCity, currentStep, isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user?.accessToken || !selectedLab || !selectedCity) return;

    const fetchAppointments = async () => {
      if (!isValidUUID(selectedLab) || !isValidUUID(selectedCity)) {
        setErrorMessage('Invalid laboratory or city ID.');
        setAvailableAppointments([]);
        setSelectedAppointmentId('');
        setUsingVirtualData(true);
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage('');
        const response = await axios.get(`${API_BASE_URL}/LaboratoryCityAppointment/getAllLabCityAppointment`, {
          params: { labId: selectedLab, cityId: selectedCity },
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const appointmentsData = response.data?.data || response.data;
        console.log('Fetched appointments:', appointmentsData);

        if (Array.isArray(appointmentsData)) {
          const transformedAppointments = appointmentsData.map(appointment => {
            const day = appointment.day ? new Date(appointment.day).toISOString().split('T')[0] : '';
            const time = appointment.time ? appointment.time.split(':').slice(0, 2).join(':') : '';
            return {
              id: appointment.id || '',
              day: day,
              time: time,
              available: appointment.available !== undefined ? appointment.available : true,
            };
          });
          setAvailableAppointments(transformedAppointments);
          setUsingVirtualData(false);
          if (transformedAppointments.length === 0) {
            setErrorMessage('No appointments available for this laboratory and city.');
            setSelectedAppointmentId('');
          } else if (!isAtHome && !selectedAppointmentId && transformedAppointments.some(a => a.available)) {
            const firstAvailable = transformedAppointments.find(a => a.available);
            setSelectedAppointmentId(firstAvailable.id);
            setSelectedDay(firstAvailable.day);
            setSelectedTime(firstAvailable.time);
          }
        } else {
          throw new Error('Invalid appointments data format');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setErrorMessage('Failed to load appointments. Please try again later.');
        setAvailableAppointments([]);
        setSelectedAppointmentId('');
        setUsingVirtualData(true);
        setTimeout(() => setErrorMessage(''), 5000);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [selectedLab, selectedCity, isAtHome, isAuthenticated, user]);

  const fetchUserBookings = async () => {
    if (!isAuthenticated || !user?.accessToken || !user?.id) return;

    try {
      console.log('Fetching bookings for user:', user.id);
      setErrorMessage('');
      
      // Try fetching without filters first to get all bookings
      const response = await axios.get(`${API_BASE_URL}/PatientBookLab/get-all-booking-lab-by-Patient-id`, {
        params: {
          PatientId: user.id,
        },
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      
      console.log('Bookings API Response:', response.data);
      const bookingsData = response.data?.data || response.data;

      if (Array.isArray(bookingsData)) {
        console.log('Found bookings:', bookingsData.length);
        const transformedBookings = bookingsData.map(booking => {
          console.log('Processing booking:', booking);
          return {
            id: booking.id || booking.bookingId || booking.ID || 'BK' + Math.floor(Math.random() * 10000),
            labName: booking.labName || booking.laboratoryName || booking.laboratory?.name || booking.Laboratory?.FullName || 'Unknown Lab',
            cityName: booking.cityName || booking.city?.name || booking.City?.Name || 'Unknown City',
            day: booking.day || booking.appointmentDate || booking.Day ? 
              new Date(booking.day || booking.appointmentDate || booking.Day).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : 'N/A',
            time: (booking.time || booking.appointmentTime || booking.Time) ? 
              formatTime(booking.time || booking.appointmentTime || booking.Time) : 'N/A',
            status: booking.status === true || booking.Status === true ? 'Completed' : 
                   booking.status === false || booking.Status === false ? 'Pending' : 'Unknown',
            type: (booking.isAtHome === true || booking.IsAtHome === true) ? 'Home Visit' : 'Lab Visit',
            total: (booking.totalPrice || booking.total || booking.TotalPrice || 0).toFixed(2),
            tax: (booking.tax || booking.Tax || 0).toFixed(2),
          };
        });
        setUserBookings(transformedBookings);
        console.log('Transformed bookings:', transformedBookings);
      } else {
        console.log('No bookings array found');
        setUserBookings([]);
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      console.error('Error details:', error.response?.data);
      setUserBookings([]);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!bookingComplete || !selectedAnalyses.length) return;

    const transformedAnalyses = selectedAnalyses.map(analysisId => {
      const analysis = labAnalyses.find(a => a.id === analysisId);
      return {
        id: analysisId,
        name: analysis?.name || 'Unknown Analysis',
        price: isAtHome ? (analysis?.athomePrice || 0) : (analysis?.price || 0),
      };
    });
    setBookedAnalyses(transformedAnalyses);
    setAnalysesLoading(false);
  }, [bookingComplete, selectedAnalyses, labAnalyses, isAtHome]);

  const calculateTotal = () => {
    if (labAnalyses.length === 0 || !selectedLab) return 0;
    const selectedLabData = laboratories.find(lab => lab.id === selectedLab);
    if (!selectedLabData) return 0;
    const taxPrice = isAtHome ? (selectedLabData?.tax || 0.0) : 0.0;
    const analysesTotal = selectedAnalyses.reduce((sum, analysisId) => {
      const analysis = labAnalyses.find(a => a.id === analysisId);
      const basePrice = isAtHome ? (analysis?.athomePrice || 0) : (analysis?.price || 0);
      return sum + basePrice;
    }, 0);
    return (analysesTotal + taxPrice).toFixed(2);
  };

  const submitBooking = async () => {
    if (!validateForm(currentStep)) return;

    if (!isAuthenticated || !user?.id || !user?.accessToken) {
      setErrorMessage('Please log in to submit a booking.');
      return;
    }

    if (!selectedAppointmentId && isAtHome) {
      setErrorMessage('Please select a valid appointment for home visit.');
      return;
    }

    if (!isValidUUID(selectedLab) || !isValidUUID(user.id) || !isValidUUID(selectedAppointmentId)) {
      setErrorMessage('Invalid IDs provided for booking.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const checkExistingBooking = await axios.get(`${API_BASE_URL}/PatientBookLab/get-all-booking-lab-by-lab-id`, {
        params: { labId: selectedLab, patientId: user.id },
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const existingBookings = checkExistingBooking.data?.data || [];
      const hasDuplicate = existingBookings.some(booking =>
        booking.LabAppRelationID === selectedAppointmentId && booking.PatientID === user.id
      );
      if (hasDuplicate) {
        setErrorMessage('You have already booked this appointment. Please select a different time or lab.');
        setLoading(false);
        return;
      }

      if (!selectedLab || selectedAnalyses.length === 0) {
        throw new Error('Missing required fields: LaboratoryID or Analyses');
      }

      const invalidIds = selectedAnalyses.filter(id => !isValidUUID(id) || !labAnalyses.find(a => a.id === id));
      if (invalidIds.length > 0) {
        setErrorMessage(`Invalid analyses selected: ${invalidIds.join(', ')}. Please select valid analyses.`);
        setLoading(false);
        return;
      }

      if (isAtHome) {
        if (!isValidDate(selectedDay)) {
          setErrorMessage('Please select a valid appointment day.');
          setLoading(false);
          return;
        }
        if (!isValidTime(selectedTime)) {
          setErrorMessage('Please select a valid appointment time (HH:MM format).');
          setLoading(false);
          return;
        }
        if (!paymentImage) {
          setErrorMessage('Please upload a payment image for home visit.');
          setLoading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('LaboratoryID', selectedLab);
      formData.append('PatientID', user.id);
      formData.append('LabAppRelationID', selectedAppointmentId);
      formData.append('TotalPrice', parseFloat(calculateTotal()));
      if (isAtHome && paymentImage) {
        formData.append('image', paymentImage);
      }
      formData.append('IsAtHome', isAtHome.toString());
      selectedAnalyses.forEach((analysisId, index) => {
        formData.append(`PatientLabBookingPhAnalyses[${index}]`, analysisId);
      });
      if (isAtHome) {
        formData.append('AppointmentDate', selectedDay);
        formData.append('AppointmentTime', selectedTime);
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axios.post(`${API_BASE_URL}/PatientBookLab/addNewBooking`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      console.log('Booking response:', response.data);
      const newBookingId = response.data?.bookingId || response.data?.id || response.data?.data?.id || 'BK' + Math.floor(Math.random() * 10000);
      setBookingId(newBookingId);
      
      const selectedCityName = labCities.find(city => city.id === selectedCity)?.name || 'Unknown';
      const selectedLabData = laboratories.find(lab => lab.id === selectedLab);
      const bookingDay = isAtHome ? new Date(selectedDay).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : 'Visit during operating hours';
      const bookingTime = isAtHome ? formatTime(selectedTime) : selectedLabData?.openingHours || 'N/A';
      const bookingStatus = 'Pending';

      // Create the new booking object
      const newBooking = {
        id: newBookingId,
        labName: selectedLabData?.name || 'Unknown Lab',
        cityName: selectedCityName,
        day: bookingDay,
        time: bookingTime,
        status: bookingStatus,
        type: isAtHome ? 'Home Visit' : 'Lab Visit',
        total: calculateTotal(),
        tax: isAtHome ? (selectedLabData?.tax || 0.0).toFixed(2) : '0.00',
      };
      
      console.log('New booking created:', newBooking);
      
      // Add to the beginning of the bookings array
      setUserBookings(prevBookings => [newBooking, ...prevBookings]);
      
      // Set states for completion
      setBookingComplete(true);
      setCurrentStep(5);
      
      // Wait a moment then fetch updated bookings from server
      setTimeout(async () => {
        console.log('Fetching updated bookings from server...');
        await fetchUserBookings();
        // Auto-show booking history after successful booking
        setShowBookingHistory(true);
      }, 1000);
    } catch (error) {
      console.error('Booking error:', error);
      let errorMsg = 'Failed to submit booking.';
      if (error.response) {
        console.log('Response headers:', error.response.headers);
        console.log('Response data:', error.response.data);
        const contentType = error.response.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
          errorMsg = `Invalid server response format: ${contentType || 'empty'}. Received: "${error.response.data || 'no data'}"`;
          if (error.response.data && error.response.data.includes('IX_PatientBookingLabs_PatientId_LabAppRelationID')) {
            errorMsg += ' A booking with this Patient ID and Lab Appointment Relation ID already exists. Please select a different time.';
          } else if (error.response.data && error.response.data.includes('FK_PatientBookingLabs_Patients_PatientId')) {
            errorMsg += ' Check the Patient ID. It may not exist in the database.';
          }
        } else if (error.response.status === 400) {
          errorMsg = error.response.data?.message || 'Validation error occurred.';
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMsg = 'Authentication failed. Please log in again.';
        } else {
          errorMsg = error.response.data?.message || errorMsg;
        }
      } else if (error.request) {
        errorMsg = 'No response received from server. Please check your connection.';
      } else {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetBookingState = () => {
    setSelectedLab(null);
    setSelectedCity('');
    setSelectedAnalyses([]);
    setIsAtHome(true);
    setBookingComplete(false);
    setBookingId(null);
    setSelectedDay('');
    setSelectedTime('');
    setSelectedAppointmentId('');
    setCurrentStep(1);
    setBookedAnalyses([]);
    setPaymentImage(null);
  };

  const validateForm = (step) => {
    switch (step) {
      case 1:
        if (!selectedLab) {
          setErrorMessage('Please select a laboratory');
          return false;
        }
        return true;
      case 2:
        if (!selectedCity) {
          setErrorMessage('Please select a city');
          return false;
        }
        return true;
      case 3:
        if (selectedAnalyses.length === 0) {
          setErrorMessage('Please select at least one analysis');
          return false;
        }
        if (labAnalyses.length === 0) {
          setErrorMessage('No analyses available for this laboratory.');
          return false;
        }
        return true;
      case 4:
        const phoneRegex = /^[0-9]{11}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!patientInfo.name.trim()) {
          setErrorMessage('Please enter your full name');
          return false;
        }
        if (!phoneRegex.test(patientInfo.phone)) {
          setErrorMessage('Please select a valid 11-digit phone number');
          return false;
        }
        if (!emailRegex.test(patientInfo.email)) {
          setErrorMessage('Please enter a valid email address');
          return false;
        }
        if (isAtHome && !patientInfo.address.trim()) {
          setErrorMessage('Please enter your home address for home service');
          return false;
        }
        if (isAtHome) {
          if (!isValidDate(selectedDay)) {
            setErrorMessage('Please select a valid appointment day.');
            return false;
          }
          if (!isValidTime(selectedTime)) {
            setErrorMessage('Please select a valid appointment time (HH:MM format).');
            return false;
          }
          if (!paymentImage) {
            setErrorMessage('Please upload a payment image for home visit.');
            return false;
          }
        }
        if (!selectedAppointmentId) {
          setErrorMessage('Please select an appointment.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (validateForm(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleLabSelection = (labId) => {
    setSelectedLab(labId);
    setSelectedAnalyses([]);
    setSelectedAppointmentId('');
    setSelectedDay('');
    setSelectedTime('');
  };

  const handleAppointmentSelection = async (day, time) => {
    if (isValidDate(day) && isValidTime(time)) {
      const appointment = availableAppointments.find(appt => appt.day === day && appt.time === time && appt.available);
      if (appointment) {
        setSelectedDay(day);
        setSelectedTime(time);
        setSelectedAppointmentId(appointment.id);
        setErrorMessage('');
      } else {
        setErrorMessage('This appointment is no longer available. Please select another time.');
        setSelectedDay('');
        setSelectedTime('');
        setSelectedAppointmentId('');
      }
    } else {
      setErrorMessage('Invalid day or time selected.');
      setSelectedDay('');
      setSelectedTime('');
      setSelectedAppointmentId('');
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Select Laboratory';
      case 2: return 'Select City';
      case 3: return 'Select Analyses';
      case 4: return 'Patient Information';
      case 5: return 'Booking Confirmed';
      default: return '';
    }
  };

  const getAvailableDays = () => {
    const uniqueDays = [...new Set(availableAppointments.filter(a => a.available).map(appointment => appointment.day))];
    return uniqueDays.sort((a, b) => new Date(a) - new Date(b)).filter(isValidDate);
  };

  const getAvailableTimes = (day) => {
    if (!day || !isValidDate(day)) return [];
    const times = availableAppointments
      .filter(appointment => appointment.day === day && appointment.available)
      .map(appointment => appointment.time)
      .filter(isValidTime)
      .sort();
    if (times.length === 0) {
      console.warn(`No available times for day: ${day}`);
    }
    return times;
  };

  const handleImageError = (e) => {
    const labId = e.target.getAttribute('data-lab-id') || 1;
    e.target.src = `https://via.placeholder.com/80/${labId % 2 === 0 ? 'FF0000' : '0000FF'}`;
  };

  const downloadBooking = () => {
    const selectedLabData = laboratories.find(lab => lab.id === selectedLab);
    const selectedCityName = labCities.find(city => city.id === selectedCity)?.name || 'Unknown';
    const taxPrice = isAtHome ? (selectedLabData?.tax || 0.0) : 0.0;
    const subtotal = selectedAnalyses.reduce((total, analysisId) => {
      const analysis = labAnalyses.find(a => a.id === analysisId);
      return total + (isAtHome ? (analysis?.athomePrice || 0) : (analysis?.price || 0));
    }, 0);

    let bookingDay, bookingTime;
    if (isAtHome) {
      bookingDay = new Date(selectedDay).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      bookingTime = formatTime(selectedTime);
    } else {
      const openingHours = selectedLabData?.openingHours || 'N/A';
      if (openingHours !== 'N/A') {
        bookingDay = 'Visit during operating hours';
        bookingTime = openingHours;
      } else {
        bookingDay = 'Unknown';
        bookingTime = 'Unknown';
      }
    }

    const doc = new jsPDF();
    
    doc.setFont('helvetica');
    
    doc.setFontSize(20);
    doc.setTextColor(0, 123, 255);
    doc.text('Lab Booking Confirmation', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Booking ID: ${bookingId}`, 20, 35);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 40, 190, 40);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 123, 255);
    doc.text('Laboratory Details', 20, 50);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Laboratory: ${selectedLabData?.name || 'Unknown'}`, 20, 58);
    doc.text(`City: ${selectedCityName}`, 20, 65);
    doc.text(`Day: ${bookingDay}`, 20, 72);
    doc.text(`Time: ${bookingTime}`, 20, 79);
    doc.text(`Service Type: ${isAtHome ? 'Home Visit' : 'Lab Visit'}`, 20, 86);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 123, 255);
    doc.text('Patient Information', 20, 98);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${patientInfo.name}`, 20, 106);
    doc.text(`Phone: ${patientInfo.phone}`, 20, 113);
    doc.text(`Email: ${patientInfo.email}`, 20, 120);
    if (isAtHome) {
      doc.text(`Address: ${patientInfo.address}`, 20, 127);
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 123, 255);
    doc.text('Selected Analyses', 20, isAtHome ? 140 : 133);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let yPos = isAtHome ? 148 : 141;
    selectedAnalyses.forEach(id => {
      const a = labAnalyses.find(a => a.id === id);
      const basePrice = isAtHome ? (a?.athomePrice || 0) : (a?.price || 0);
      doc.text(`- ${a?.name || 'Unknown'}: ${basePrice.toFixed(2)} EGP`, 20, yPos);
      yPos += 7;
    });
    
    yPos += 5;
    doc.line(20, yPos, 190, yPos);
    
    yPos += 8;
    doc.setFontSize(12);
    doc.text(`Subtotal:`, 20, yPos);
    doc.text(`${subtotal.toFixed(2)} EGP`, 160, yPos);
    
    if (isAtHome && taxPrice > 0) {
      yPos += 7;
      doc.text(`Tax:`, 20, yPos);
      doc.text(`${taxPrice.toFixed(2)} EGP`, 160, yPos);
    }
    
    yPos += 7;
    doc.setFontSize(14);
    doc.setTextColor(0, 123, 255);
    doc.text(`Total:`, 20, yPos);
    doc.text(`${calculateTotal()} EGP`, 160, yPos);
    
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for choosing our service!', 105, 280, { align: 'center' });
    
    doc.save(`booking-${bookingId}.pdf`);
  };

  const filteredBookings = userBookings.filter(booking => {
    const matchesStatus = filterStatus === null || (booking.status === 'Completed' ? true : false) === filterStatus;
    const matchesType = filterIsAtHome === null || booking.type === (filterIsAtHome ? 'Home Visit' : 'Lab Visit');
    return matchesStatus && matchesType;
  });

  return (
    <div className="min-vh-100 d-flex flex-column lab-booking-system-wrapper">
      <NavBar />
      <div className="container my-5 flex-grow-1" style={{ maxWidth: '1200px', minHeight: 'calc(100vh - 200px)' }}>
        {usingVirtualData && (
          <div className="alert alert-warning alert-dismissible fade show d-flex align-items-center mb-4" role="alert">
            Using offline data due to server issues.
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setUsingVirtualData(false)}></button>
          </div>
        )}
        {!isAuthenticated && (
          <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center mb-4" role="alert">
            You must be logged in to book a lab appointment.
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setErrorMessage('')}></button>
          </div>
        )}
        <div className="card shadow border-0">
          <div className="card-header bg-primary bg-gradient text-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Lab Booking System</h3>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setShowBookingHistory(!showBookingHistory)}
                  className="btn btn-outline-light"
                >
                  {showBookingHistory ? 'Hide Booking History' : `View Booking History (${userBookings.length})`}
                </button>
              )}
            </div>
          </div>
          <div className="card-body p-4">
            {showBookingHistory && (
              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    Your Booking History 
                    {userBookings.length > 0 && (
                      <span className="badge bg-primary ms-2">{filteredBookings.length} of {userBookings.length}</span>
                    )}
                  </h6>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select form-select-sm"
                      value={filterStatus === null ? 'all' : filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value === 'all' ? null : e.target.value === 'true')}
                      style={{ width: 'auto' }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="true">Completed</option>
                      <option value="false">Pending</option>
                    </select>
                    <select
                      className="form-select form-select-sm"
                      value={filterIsAtHome === null ? 'all' : filterIsAtHome}
                      onChange={(e) => setFilterIsAtHome(e.target.value === 'all' ? null : e.target.value === 'true')}
                      style={{ width: 'auto' }}
                    >
                      <option value="all">All Types</option>
                      <option value="true">Home Visit</option>
                      <option value="false">Lab Visit</option>
                    </select>
                  </div>
                </div>
                {userBookings.length === 0 ? (
                  <div className="card-body text-center py-5">
                    <p className="text-muted mb-0">No bookings found. Complete your first booking to see it here!</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Booking ID</th>
                          <th>Laboratory</th>
                          <th>City</th>
                          <th>Day & Time</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              No bookings found matching the selected filters.
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map((booking) => (
                            <tr key={booking.id}>
                              <td><span className="badge bg-secondary">{booking.id}</span></td>
                              <td>{booking.labName}</td>
                              <td>{booking.cityName}</td>
                              <td>
                                <div className="small">
                                  <div>{booking.day}</div>
                                  <div className="text-muted">{booking.time}</div>
                                </div>
                              </td>
                              <td>
                                {booking.type === 'Home Visit' ? (
                                  <span className="text-primary d-flex align-items-center">
                                    <Building size={14} className="me-1" />
                                    Home Visit
                                  </span>
                                ) : (
                                  <span>Lab Visit</span>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${booking.status === 'Completed' ? 'bg-success' : 'bg-warning'}`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="fw-bold">{booking.total} EGP</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <div className="d-flex justify-content-between">
                {['Laboratory', 'City', 'Analyses', 'Patient Info', 'Confirm'].map((step, index) => (
                  <div key={index} className="text-center flex-grow-1">
                    <div className={`small ${currentStep === index + 1 ? 'text-primary fw-bold' : currentStep > index + 1 ? 'text-success fw-bold' : 'text-muted'}`}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
              <div className="progress mt-2" style={{ height: '2px' }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${(currentStep - 1) * 25}%` }}
                ></div>
              </div>
            </div>

            <h2 className="h4 text-center mb-4">{getStepTitle()}</h2>

            {errorMessage && (
              <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
                {errorMessage}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setErrorMessage('')}></button>
              </div>
            )}

            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading data...</p>
              </div>
            )}

            {!loading && (
              <>
                {currentStep === 1 && (
                  <div className="step-container">
                    <div className="row row-cols-1 row-cols-md-3 g-3">
                      {laboratories.length === 0 ? (
                        <div className="col-12 text-center py-5">
                          <p className="mb-0">No laboratories found.</p>
                        </div>
                      ) : (
                        laboratories.map(lab => (
                          <div key={lab.id} className="col">
                            <div
                              className={`card shadow-sm border h-100 lab-card ${selectedLab === lab.id ? 'border-primary' : ''}`}
                              onClick={() => handleLabSelection(lab.id)}
                              style={{ cursor: 'pointer' }}
                              role="button"
                              tabIndex={0}
                              onKeyPress={(e) => e.key === 'Enter' && handleLabSelection(lab.id)}
                            >
                              <div className="card-body p-3">
                                <div className="position-relative">
                                  <span className={`badge position-absolute top-0 end-0 mt-2 me-2 ${lab.discount > 0 ? 'bg-danger' : 'bg-secondary'}`}>
                                    {lab.discount}% off
                                  </span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={lab.image}
                                    alt={lab.name}
                                    className="rounded me-3"
                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                    onError={handleImageError}
                                    data-lab-id={lab.id}
                                    loading="lazy"
                                  />
                                  <div className="flex-grow-1">
                                    <h5 className="card-title mb-2 fw-bold">{lab.name || 'Unknown Lab'}</h5>
                                    <div className="d-flex align-items-center mb-2">
                                      <Star size={12} className="text-warning me-1" fill="currentColor" />
                                      <span>({lab.rating || 0})</span>
                                    </div>
                                    <div className="d-flex align-items-center text-muted small mb-2">
                                      <Clock size={12} className="me-1" />
                                      <span>{lab.openingHours || 'N/A'}</span>
                                    </div>
                                    <div className="d-flex align-items-center text-muted small mb-2">
                                      <User size={12} className="me-1" />
                                      <span>Experience: {lab.experienceYears || 0} years</span>
                                    </div>
                                    <div className="d-flex justify-content-end align-items-center">
                                      <button
                                        className={`btn btn-sm ${selectedLab === lab.id ? 'btn-success' : 'btn-primary'}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleLabSelection(lab.id);
                                        }}
                                        type="button"
                                      >
                                        {selectedLab === lab.id ? (
                                          <>
                                            <Check size={14} className="me-1" />
                                            Selected
                                          </>
                                        ) : (
                                          'Book'
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="button-bar bg-light py-3 px-4 d-flex justify-content-between align-items-center mt-4">
                      <button
                        className="btn btn-outline-secondary py-2 invisible"
                        type="button"
                        aria-hidden="true"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => goToNextStep()}
                        disabled={!selectedLab}
                        className="btn btn-primary py-2 px-4"
                        type="button"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                

{currentStep === 2 && (
  <div className="step-container">
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4 text-center">
        <label htmlFor="citySelect" className="form-label fw-bold">Select a City</label>
        <div className="d-flex justify-content-center">
          <div className="input-group w-50">
            <span className="input-group-text"><MapPin size={16} /></span>
            <select
              id="citySelect"
              className="form-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={labCities.length === 0}
            >
              <option value="">Select a city</option>
              {labCities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {labCities.length === 0 && (
          <div className="text-center py-3">
            <p>No cities available.</p>
          </div>
        )}
      </div>
    </div>
    <div className="button-bar bg-light py-3 px-4 d-flex justify-content-between align-items-center mt-4">
      <button
        onClick={() => setCurrentStep(1)}
        className="btn btn-primary py-2 px-4"
        type="button"
      >
        <ArrowLeft size={14} className="me-1" /> Back
      </button>
      <button
        onClick={() => goToNextStep()}
        disabled={!selectedCity}
        className="btn btn-primary py-2 px-4"
        type="button"
      >
        Next
      </button>
    </div>
  </div>
)}

{currentStep === 3 && (
  <div className="step-container">
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="homeVisitSwitch"
              checked={isAtHome}
              onChange={() => {
                setIsAtHome(!isAtHome);
                setSelectedAppointmentId('');
                setSelectedDay('');
                setSelectedTime('');
              }}
            />
            <label className="form-check-label" htmlFor="homeVisitSwitch">
              <span className={isAtHome ? 'fw-bold text-primary' : ''}>Home Visit</span>
            </label>
          </div>
          <div className="badge bg-info text-white">
            {isAtHome ? 'Home service fees apply' : 'Standard prices'}
          </div>
        </div>
        <div className="mb-3">
          <h6 className="text-muted mb-2">Appointment Details</h6>
          {isAtHome ? (
            <p className="mb-0">Select a day and time for your home visit below.</p>
          ) : (
            <p className="mb-0">
              Visit during lab hours: <strong>{laboratories.find(lab => lab.id === selectedLab)?.openingHours || 'N/A'}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body p-0">
        <div className="list-group list-group-flush" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {labAnalyses.length === 0 ? (
            <div className="list-group-item text-center py-5">
              <p className="mb-0">No analyses available for this laboratory</p>
            </div>
          ) : (
            labAnalyses.map(analysis => {
              const basePrice = isAtHome ? (analysis.athomePrice || 0) : (analysis.price || 0);
              return (
                <div
                  key={analysis.id}
                  className={`list-group-item d-flex justify-content-between align-items-center ${selectedAnalyses.includes(analysis.id) ? 'bg-light' : ''}`}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`analysis-${analysis.id}`}
                      checked={selectedAnalyses.includes(analysis.id)}
                      onChange={() => {
                        if (selectedAnalyses.includes(analysis.id)) {
                          setSelectedAnalyses(selectedAnalyses.filter(id => id !== analysis.id));
                        } else {
                          setSelectedAnalyses([...selectedAnalyses, analysis.id]);
                        }
                      }}
                    />
                    <label className="form-check-label" htmlFor={`analysis-${analysis.id}`}>
                      <div className="ms-2">
                        <h6 className="mb-1">{analysis.name}</h6>
                        <div className="d-flex align-items-center text-muted small">
                          <span className="fw-bold">
                            {basePrice.toFixed(2)} EGP
                          </span>
                          {isAtHome && analysis.athomePrice > analysis.price && (
                            <span className="ms-2 badge bg-primary bg-opacity-10 text-primary">
                              +{(analysis.athomePrice - analysis.price).toFixed(2)} EGP for home visit
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>

    {selectedAnalyses.length > 0 && (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="mb-3">Selected Analyses</h6>
          <div className="list-group">
            {selectedAnalyses.map(analysisId => {
              const analysis = labAnalyses.find(a => a.id === analysisId);
              const basePrice = isAtHome ? (analysis?.athomePrice || 0) : (analysis?.price || 0);
              return (
                <div key={analysisId} className="list-group-item d-flex justify-content-between align-items-center px-3 py-2">
                  <span>{analysis?.name}</span>
                  <div className="d-flex align-items-center">
                    <span className="fw-bold">{basePrice.toFixed(2)} EGP</span>
                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => setSelectedAnalyses(selectedAnalyses.filter(id => id !== analysisId))}
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="list-group-item d-flex justify-content-between align-items-center bg-light">
              <span className="fw-bold">Subtotal</span>
              <span className="fw-bold">
                {selectedAnalyses.reduce((sum, analysisId) => {
                  const analysis = labAnalyses.find(a => a.id === analysisId);
                  const basePrice = isAtHome ? (analysis?.athomePrice || 0) : (analysis?.price || 0);
                  return sum + basePrice;
                }, 0).toFixed(2)} EGP
              </span>
            </div>
            {isAtHome && laboratories.find(lab => lab.id === selectedLab)?.tax > 0 && (
              <div className="list-group-item d-flex justify-content-between align-items-center bg-light">
                <span className="fw-bold">Tax</span>
                <span className="fw-bold">
                  {(laboratories.find(lab => lab.id === selectedLab)?.tax || 0.0).toFixed(2)} EGP
                </span>
              </div>
            )}
            <div className="list-group-item d-flex justify-content-between align-items-center bg-light">
              <span className="fw-bold">Total</span>
              <span className="fw-bold text-primary">{calculateTotal()} EGP</span>
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="button-bar bg-light py-3 px-4 d-flex justify-content-between align-items-center mt-4">
      <button
        onClick={() => setCurrentStep(2)}
        className="btn btn-primary py-2 px-4"
        type="button"
      >
        <ArrowLeft size={14} className="me-1" /> Back
      </button>
      <button
        onClick={() => goToNextStep()}
        disabled={selectedAnalyses.length === 0 || !selectedLab}
        className="btn btn-primary py-2 px-4"
        type="button"
      >
        Next
      </button>
    </div>
  </div>
)}

{currentStep === 4 && (
  <div className="step-container">
    <div className="row g-4 justify-content-center">
      <div className={isAtHome ? "col-md-6" : "col-md-8 col-lg-6"}>
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-light py-3">
            <h6 className="mb-0">Patient Information</h6>
            {usingVirtualData && (
              <div className="text-muted small">Using offline patient data.</div>
            )}
          </div>
          <div className="card-body p-4">
            <div onSubmit={(e) => e.preventDefault()} role="form" aria-label="Patient Information Form">
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label fw-bold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text"><User size={16} /></span>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    placeholder="Enter your full name"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label fw-bold">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text"><Phone size={16} /></span>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    placeholder="e.g., 01234567890"
                    value={patientInfo.phone}
                    onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-text">11-digit mobile number</div>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-bold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text"><Mail size={16} /></span>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="example@email.com"
                    value={patientInfo.email}
                    onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-text">Required for booking confirmation.</div>
              </div>

              {isAtHome && (
                <>
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label fw-bold">Home Address</label>
                    <div className="input-group">
                      <span className="input-group-text"><MapPin size={16} /></span>
                      <textarea
                        className="form-control"
                        id="address"
                        placeholder="Enter your detailed address"
                        value={patientInfo.address}
                        onChange={(e) => setPatientInfo({ ...patientInfo, address: e.target.value })}
                        rows="2"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="paymentImage" className="form-label fw-bold">Upload Payment Image</label>
                    <div className="input-group">
                      <span className="input-group-text"><Download size={16} /></span>
                      <input
                        type="file"
                        className="form-control"
                        id="paymentImage"
                        accept="image/*"
                        onChange={(e) => setPaymentImage(e.target.files[0])}
                        required
                      />
                    </div>
                    <div className="form-text">Upload a photo of your Vodafone Cash payment.</div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="appointmentDay" className="form-label fw-bold">Appointment Day</label>
                      <div className="input-group">
                        <span className="input-group-text"><Calendar size={16} /></span>
                        <select
                          className="form-select"
                          id="appointmentDay"
                          value={selectedDay}
                          onChange={(e) => {
                            const day = e.target.value;
                            if (isValidDate(day)) {
                              setSelectedDay(day);
                              setSelectedTime('');
                              setSelectedAppointmentId('');
                            } else {
                              setErrorMessage('Invalid day selected.');
                              setSelectedDay('');
                            }
                          }}
                          required
                          disabled={getAvailableDays().length === 0}
                        >
                          <option value="">Select a day</option>
                          {getAvailableDays().map(day => (
                            <option key={day} value={day}>
                              {new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </option>
                          ))}
                        </select>
                      </div>
                      {getAvailableDays().length === 0 && (
                        <div className="form-text text-danger">No available days for this laboratory and city.</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="appointmentTime" className="form-label fw-bold">Appointment Time</label>
                      <div className="input-group">
                        <span className="input-group-text"><Clock size={16} /></span>
                        <select
                          className="form-select"
                          id="appointmentTime"
                          value={selectedTime}
                          onChange={(e) => handleAppointmentSelection(selectedDay, e.target.value)}
                          required
                          disabled={!selectedDay || getAvailableTimes(selectedDay).length === 0}
                        >
                          <option value="">Select time</option>
                          {getAvailableTimes(selectedDay).length > 0 ? (
                            getAvailableTimes(selectedDay).map(time => (
                              <option key={time} value={time}>{formatTime(time)}</option>
                            ))
                          ) : (
                            <option value="" disabled>No available times</option>
                          )}
                        </select>
                      </div>
                      {selectedDay && getAvailableTimes(selectedDay).length === 0 && (
                        <div className="form-text text-danger">No available times for the selected day.</div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {!isAtHome && (
                <div className="mb-3">
                  <label htmlFor="labHours" className="form-label fw-bold">Lab Operating Hours</label>
                  <div className="input-group">
                    <span className="input-group-text"><Clock size={16} /></span>
                    <input
                      type="text"
                      className="form-control"
                      value={laboratories.find(lab => lab.id === selectedLab)?.openingHours || 'N/A'}
                      readOnly
                      id="labHours"
                    />
                  </div>
                  <div className="form-text text-muted">An appointment has been automatically selected.</div>
                  {availableAppointments.length === 0 && (
                    <div className="form-text text-danger">No appointments available. Please select a different lab or city.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isAtHome && (
        <div className="col-md-6">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-light py-3">
              <h6 className="mb-0">Payment</h6>
            </div>
            <div className="card-body p-4">
              <div className="mb-3">
                <label htmlFor="total" className="form-label">Total Amount</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id="total"
                    value={`${calculateTotal()} EGP`}
                    readOnly
                  />
                </div>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-3">Pay via Vodafone Cash</h6>
                <div className="d-flex align-items-center mb-3">
                  <img
                    src="https://via.placeholder.com/80x60"
                    alt="Vodafone Cash"
                    style={{ width: '80px', height: '60px', marginRight: '10px' }}
                  />
                  <div>
                    <p className="mb-0 fw-bold">Vodafone Cash</p>
                    <p className="text-muted mb-0">Phone: <span className="fw-bold">{VODAFONE_CASH_NUMBER}</span></p>
                  </div>
                </div>
                <p className="form-text mb-0">
                  Please <strong>send the total amount to the number above.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="button-bar bg-light py-3 px-4 d-flex justify-content-between align-items-center mt-4">
      <button
        onClick={() => setCurrentStep(3)}
        className="btn btn-warning py-2 px-4"
        type="button"
      >
        <ArrowLeft size={14} className="me-1" /> Back
      </button>
      <button
        onClick={submitBooking}
        className="btn btn-primary py-2 px-4"
        disabled={loading}
        type="button"
      >
        {loading ? 'Submitting...' : 'Submit Booking'}
      </button>
    </div>
  </div>
)}

{currentStep === 5 && bookingComplete && (
  <div className="step-container">
    <div className="card mb-4 border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="text-center">
          <div className="mb-4">
            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '80px', height: '80px' }}>
              <Check size={40} />
            </div>
          </div>
          <h3 className="mb-3">Booking Confirmed!</h3>
          <p className="lead text-muted mb-4">Your booking was successfully submitted.</p>
          <div className="alert alert-info">
            <strong>Booking ID:</strong> {bookingId}
          </div>
          <p className="mb-4">
            {isAtHome ? (
              <>
                Our team will visit you on <strong>{new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> at <strong>{formatTime(selectedTime)}</strong>
              </>
            ) : (
              <>
                Please visit during lab hours: <strong>{laboratories.find(lab => lab.id === selectedLab)?.openingHours || 'N/A'}</strong>
              </>
            )}
          </p>
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0">Booking Details</h6>
            </div>
            <div className="card-body">
              <div className="row mb-2">
                <div className="col-6 text-start"><strong>Laboratory:</strong></div>
                <div className="col-6 text-end">{laboratories.find(lab => lab.id === selectedLab)?.name}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6 text-start"><strong>City:</strong></div>
                <div className="col-6 text-end">{labCities.find(city => city.id === selectedCity)?.name}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6 text-start"><strong>Type:</strong></div>
                <div className="col-6 text-end">{isAtHome ? 'Home Visit' : 'Lab Visit'}</div>
              </div>
              <div className="row">
                <div className="col-6 text-start"><strong>Status:</strong></div>
                <div className="col-6 text-end"><span className="badge bg-warning">Pending</span></div>
              </div>
            </div>
          </div>
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0">Booked Analyses</h6>
            </div>
            <div className="card-body p-0">
              {analysesLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : bookedAnalyses.length === 0 ? (
                <div className="list-group-item text-center py-3">
                  <p className="mb-0">No analyses details available.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {bookedAnalyses.map(analysis => (
                    <div key={analysis.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{analysis.name}</span>
                      <span className="fw-bold">{analysis.price.toFixed(2)} EGP</span>
                    </div>
                  ))}
                  <div className="list-group-item d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold text-primary">{calculateTotal()} EGP</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="d-flex justify-content-center gap-2">
            <button
              onClick={downloadBooking}
              className="btn btn-outline-primary py-2 px-4"
              type="button"
            >
              <Download size={14} className="me-1" /> Download PDF
            </button>
            <button
              onClick={resetBookingState}
              className="btn btn-primary py-2 px-4"
              type="button"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}