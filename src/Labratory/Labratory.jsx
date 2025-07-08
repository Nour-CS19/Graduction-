
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Home as Building, Check, ArrowLeft, MapPin, Star, Calendar, Clock, Download, User, Phone, Mail, Trash2 } from 'react-feather';
import axios from 'axios';
import NavBar from '../components/Nav';
import Footer from '../components/Footer';
import './lab.css';
import { useAuth } from '../Pages/AuthPage';

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
  const [isAtHome, setIsAtHome] = useState(true); // Set to true based on your input
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
  const [filterStatus, setFilterStatus] = useState(true); // Set to true (Completed) based on your input
  const [filterIsAtHome, setFilterIsAtHome] = useState(true); // Set to true based on your input

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

  useEffect(() => {
    if (!isAuthenticated || !user?.accessToken || !user?.id) return;

    const fetchUserBookings = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const response = await axios.get(`${API_BASE_URL}/PatientBookLab/get-all-booking-lab-by-Patient-id`, {
          params: {
            PatientId: user.id,
            status: filterStatus, // Set to true (Completed)
            isAtHome: filterIsAtHome, // Set to true (Home)
          },
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const bookingsData = response.data?.data || response.data;

        if (Array.isArray(bookingsData)) {
          const transformedBookings = bookingsData.map(booking => ({
            id: booking.id || booking.bookingId || 'BK' + Math.floor(Math.random() * 10000),
            labName: booking.labName || booking.laboratory?.name || 'Unknown Lab',
            cityName: booking.cityName || booking.city?.name || 'Unknown City',
            day: booking.day ? new Date(booking.day).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : 'N/A',
            time: booking.time ? formatTime(booking.time) : 'N/A',
            status: booking.status === true ? 'Completed' : booking.status === false ? 'Pending' : 'Unknown',
            type: booking.isAtHome ? 'Home Visit' : 'Lab Visit',
            total: (booking.totalPrice || booking.total || 0).toFixed(2),
            tax: (booking.tax || 0).toFixed(2),
          }));
          setUserBookings(transformedBookings);
        } else {
          throw new Error('Invalid bookings data format');
        }
      } catch (error) {
        console.error('Error fetching user bookings:', error);
        setErrorMessage('Failed to load booking history. Using offline data.');
        setUserBookings([]); // Clear bookings on error to avoid stale data
        setTimeout(() => setErrorMessage(''), 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [isAuthenticated, user, filterStatus, filterIsAtHome]);

  useEffect(() => {
    if (!isAuthenticated || !bookingComplete || !bookingId || !user?.accessToken) return;

    const fetchBookedAnalyses = async () => {
      try {
        setAnalysesLoading(true);
        setErrorMessage('');
        const response = await axios.get(`${API_BASE_URL}/PatientBookLab/get-all-booking-lab-by-Patient-id`, {
          params: {
            PatientId: user.id,
            status: true, // Set to true (Completed)
            isAtHome: true, // Set to true (Home)
          },
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const analysesData = response.data?.data || response.data;

        if (Array.isArray(analysesData)) {
          const transformedAnalyses = analysesData.map(analysis => ({
            id: analysis.id,
            name: analysis.nameEN || 'Unknown Analysis',
            price: isAtHome ? (analysis.athomePrice || analysis.price || 0) : (analysis.price || 0),
          }));
          setBookedAnalyses(transformedAnalyses);
        } else {
          throw new Error('Invalid booked analyses data format');
        }
      } catch (error) {
        console.error('Error fetching booked analyses:', error);
        setErrorMessage('Failed to load booked analyses.');
        setTimeout(() => setErrorMessage(''), 5000);
      } finally {
        setAnalysesLoading(false);
      }
    };
    fetchBookedAnalyses();
  }, [bookingComplete, bookingId, isAtHome, isAuthenticated, user]);

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

      const newBookingId = response.data?.bookingId || 'BK' + Math.floor(Math.random() * 10000);
      setBookingId(newBookingId);
      setBookingComplete(true);
      setCurrentStep(5);

      const selectedCityName = labCities.find(city => city.id === selectedCity)?.name || 'Unknown';
      const selectedLabData = laboratories.find(lab => lab.id === selectedLab);
      const bookingDay = isAtHome ? new Date(selectedDay).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : selectedLabData?.openingHours.split(' - ')[0];
      const bookingTime = isAtHome ? selectedTime : selectedLabData?.openingHours.split(' - ')[1];
      const bookingStatus = 'Pending';

      const newBooking = {
        id: newBookingId,
        labName: selectedLabData?.name,
        cityName: selectedCityName,
        day: bookingDay,
        time: bookingTime,
        status: bookingStatus,
        type: isAtHome ? 'Home Visit' : 'Lab Visit',
        total: calculateTotal(),
        tax: isAtHome ? (selectedLabData?.tax || 0.0) : 0.0,
      };
      setUserBookings([newBooking, ...userBookings]);
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
    setPatientInfo({ name: '', phone: '', email: '', address: '' });
    setIsAtHome(true); // Reset to true based on your input
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
    const booking = userBookings.find(b => b.id === bookingId);
    const selectedLabData = laboratories.find(lab => lab.id === selectedLab);
    const selectedCityName = labCities.find(city => city.id === selectedCity)?.name || 'Unknown';
    const taxPrice = isAtHome ? (selectedLabData?.tax || 0.0) : 0.0;
    const subtotal = selectedAnalyses.reduce((total, analysisId) => {
      const analysis = labAnalyses.find(a => a.id === analysisId);
      return total + (isAtHome ? (analysis?.athomePrice || 0) : (analysis?.price || 0));
    }, 0);
    const totalTax = taxPrice;

    let bookingDay, bookingTime;
    if (isAtHome) {
      bookingDay = new Date(selectedDay).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      bookingTime = selectedTime;
    } else {
      const openingHours = selectedLabData?.openingHours || 'N/A';
      if (openingHours !== 'N/A') {
        const [openTime, closeTime] = openingHours.split(' - ');
        bookingDay = 'Visit during operating hours';
        bookingTime = `${openTime} - ${closeTime}`;
      } else {
        bookingDay = 'Unknown';
        bookingTime = 'Unknown';
      }
    }

    const text = `
      Laboratory: ${selectedLabData?.name || 'Unknown'}
      City: ${selectedCityName}
      Day: ${bookingDay}
      Time: ${bookingTime}
      Service Type: ${isAtHome ? 'Home Visit' : 'Lab Visit'}
      Patient: ${patientInfo.name}
      Phone: ${patientInfo.phone}
      Email: ${patientInfo.email}
      ${isAtHome ? `Address: ${patientInfo.address}\n` : ''}
      Analyses:
      ${selectedAnalyses.map(id => {
        const a = labAnalyses.find(a => a.id === id);
        const basePrice = isAtHome ? (a?.athomePrice || 0) : (a?.price || 0);
        return `- ${a?.name || 'Unknown'}: ${basePrice.toFixed(2)} EGP`;
      }).join('\n')}
      Subtotal: ${subtotal.toFixed(2)} EGP
      ${isAtHome && taxPrice > 0 ? `Total Tax: ${totalTax.toFixed(2)} EGP\n` : ''}
      Total: ${calculateTotal()} EGP
    `;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${bookingId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
              {isAuthenticated && userBookings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBookingHistory(!showBookingHistory)}
                  className="btn btn-outline-light"
                >
                  {showBookingHistory ? 'Hide Booking History' : 'View Booking History'}
                </button>
              )}
            </div>
          </div>
          <div className="card-body p-4">
            {showBookingHistory && userBookings.length > 0 && (
              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Your Booking History</h6>
                  <div>
                    <select
                      className="form-select form-select-sm me-2"
                      value={filterStatus === null ? '' : filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value === '' ? null : e.target.value === 'true')}
                      style={{ width: 'auto', display: 'inline-block' }}
                    >
                      <option value="">All Statuses</option>
                      <option value="true">Completed</option>
                      <option value="false">Pending</option>
                    </select>
                    <select
                      className="form-select form-select-sm"
                      value={filterIsAtHome === null ? '' : filterIsAtHome}
                      onChange={(e) => setFilterIsAtHome(e.target.value === '' ? null : e.target.value === 'true')}
                      style={{ width: 'auto', display: 'inline-block' }}
                    >
                      <option value="">All Types</option>
                      <option value="true">Home Visit</option>
                      <option value="false">Lab Visit</option>
                    </select>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Laboratory</th>
                        <th>Day & Time</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userBookings.map((booking) => {
                        const matchesStatus = filterStatus === null || (booking.status === 'Completed' ? true : false) === filterStatus;
                        const matchesType = filterIsAtHome === null || booking.type === (filterIsAtHome ? 'Home Visit' : 'Lab Visit');
                        if (matchesStatus && matchesType) {
                          return (
                            <tr key={booking.id}>
                              <td>{booking.labName}</td>
                              <td>{booking.day} at {booking.time}</td>
                              <td>
                                {booking.type === 'Home Visit' ? (
                                  <span className="text-primary d-flex align-items-center">
                                    <Building size={14} className="me-1" />
                                    Home Visit
                                  </span>
                                ) : (
                                  <span>{booking.type}</span>
                                )}
                              </td>
                              <td>{booking.status}</td>
                              <td>{booking.total} EGP</td>
                            </tr>
                          );
                        }
                        return null;
                      })}
                    </tbody>
                  </table>
                </div>
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
                                    <p className="mb-0 fw-bold">Vodafon Cash</p>
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
                          <p className="mb-4">
                            {isAtHome ? (
                              <>
                                Our team will visit you on <strong>{new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> at <strong>{selectedTime}</strong>
                              </>
                            ) : (
                              <>
                                Please visit during lab hours: <strong>{laboratories.find(lab => lab.id === selectedLab)?.openingHours || 'N/A'}</strong>
                              </>
                            )}
                          </p>
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
                          {userBookings.length > 0 && (
                            <div className="card mb-4 border-0 shadow-sm">
                              <div className="card-header bg-light">
                                <h6 className="mb-0">All Your Bookings</h6>
                              </div>
                              <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Laboratory</th>
                                      <th>Day & Time</th>
                                      <th>Type</th>
                                      <th>Status</th>
                                      <th>Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {userBookings.map((booking) => {
                                      const matchesStatus = filterStatus === null || (booking.status === 'Completed' ? true : false) === filterStatus;
                                      const matchesType = filterIsAtHome === null || booking.type === (filterIsAtHome ? 'Home Visit' : 'Lab Visit');
                                      if (matchesStatus && matchesType) {
                                        return (
                                          <tr key={booking.id}>
                                            <td>{booking.labName}</td>
                                            <td>{booking.day} at {booking.time}</td>
                                            <td>
                                              {booking.type === 'Home Visit' ? (
                                                <span className="text-primary d-flex align-items-center">
                                                  <Building size={14} className="me-1" />
                                                  Home Visit
                                                </span>
                                              ) : (
                                                <span>{booking.type}</span>
                                              )}
                                            </td>
                                            <td>{booking.status}</td>
                                            <td>{booking.total} EGP</td>
                                          </tr>
                                        );
                                      }
                                      return null;
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              onClick={downloadBooking}
                              className="btn btn-outline-primary py-2 px-4"
                              type="button"
                            >
                              <Download size={14} className="me-1" /> Download Details
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
