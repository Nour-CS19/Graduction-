import React, { useState, useEffect } from 'react';
import { useAuth } from '../Pages/AuthPage'; // Import the useAuth hook

// API base URL
const API_BASE_URL = 'https://physiocareapp.runasp.net';

export default function PatientBookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  // Get auth data from AuthContext
  const { user, isAuthenticated, logout } = useAuth();

  // Extract doctor ID and token from auth context
  const doctorId = user?.id;
  const token = user?.accessToken || localStorage.getItem('accessToken');

  // Fetch bookings for the specific doctor on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      // Check authentication
      if (!isAuthenticated) {
        setError('Please log in to access bookings.');
        return;
      }

      if (!doctorId) {
        setError('Doctor ID not found. Please log in again.');
        return;
      }

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch Clinic Bookings (Offline)
        const clinicResponse = await fetch(
          `${API_BASE_URL}/api/v1/PatientBookingDoctorAtClinics/get-all-booking-at-clinics/${doctorId}`,
          { headers }
        );
        
        if (clinicResponse.status === 401) {
          // Token expired or invalid, logout user
          logout();
          setError('Session expired. Please log in again.');
          return;
        }
        
        if (!clinicResponse.ok) {
          throw new Error(`Failed to fetch clinic bookings (Status: ${clinicResponse.status})`);
        }
        
        const clinicData = await clinicResponse.json();
        const clinicBookings = clinicData.map(booking => ({
          id: booking.bookingId,
          patientName: booking.patientName,
          specialization: booking.nameEN,
          type: 'Offline',
          day: booking.day,
          openAt: booking.openAt,
          closedAt: booking.closedAt,
          date: `${booking.day}`,
          time: `${booking.openAt} - ${booking.closedAt}`,
          medicalCondition: booking.medicalCondition,
          totalPrice: booking.totalPrice,
          filePath: booking.filePath,
          isAccepted: null, // Clinic bookings start as Pending
        }));

        // Fetch Online Bookings
        const onlineResponse = await fetch(
          `${API_BASE_URL}/api/v1/PatientBookingDoctorOnlines/get-all-booking-online/${doctorId}`,
          { headers }
        );
        
        if (onlineResponse.status === 401) {
          logout();
          setError('Session expired. Please log in again.');
          return;
        }
        
        if (!onlineResponse.ok) {
          throw new Error(`Failed to fetch online bookings (Status: ${onlineResponse.status})`);
        }
        
        const onlineData = await onlineResponse.json();
        const onlineBookings = onlineData.map(booking => ({
          id: booking.bookingId,
          patientName: booking.patientName,
          specialization: booking.nameEN,
          type: 'Online',
          date: booking.date,
          time: booking.time,
          medicalCondition: booking.medicalCondition,
          totalPrice: booking.totalPrice,
          notes: booking.notes || '',
          filePath: booking.filePath,
          isAccepted: booking.isAccepted, // true, false, or null
        }));

        // Fetch Home Bookings (At Home)
        const homeResponse = await fetch(
          `${API_BASE_URL}/api/v1/PatientBookingDoctorAtHomes/get-all-booking-at-homes/${doctorId}`,
          { headers }
        );
        
        if (homeResponse.status === 401) {
          logout();
          setError('Session expired. Please log in again.');
          return;
        }
        
        if (!homeResponse.ok) {
          throw new Error(`Failed to fetch home bookings (Status: ${homeResponse.status})`);
        }
        
        const homeData = await homeResponse.json();
        const homeBookings = homeData.map(booking => ({
          id: booking.bookingId,
          patientName: booking.patientName,
          specialization: booking.nameEN,
          type: 'At Home',
          date: booking.date,
          time: booking.time,
          medicalCondition: booking.medicalCondition,
          totalPrice: booking.totalPrice,
          notes: booking.notes || '',
          filePath: booking.filePath,
          isAccepted: booking.isAccepted, // true, false, or null
        }));

        // Combine all bookings
        const allBookings = [...clinicBookings, ...onlineBookings, ...homeBookings];
        setBookings(allBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError(`Error fetching bookings: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [doctorId, token, isAuthenticated, logout]);

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    if (activeTab === 'online') return booking.type === 'Online';
    if (activeTab === 'offline') return booking.type === 'Offline';
    if (activeTab === 'athome') return booking.type === 'At Home';
    return true;
  });

  // Handle booking status change
  const handleBookingStatus = async (id, status) => {
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      const booking = bookings.find(b => b.id === id);
      if (!booking) throw new Error('Booking not found');

      // Determine endpoint based on booking type
      switch (booking.type) {
        case 'Online':
          endpoint = `${API_BASE_URL}/api/v1/PatientBookingDoctorOnlines/${id}`;
          break;
        case 'At Home':
          endpoint = `${API_BASE_URL}/api/v1/PatientBookingDoctorAtHomes/${id}`;
          break;
        case 'Offline':
          endpoint = `${API_BASE_URL}/api/v1/PatientBookingDoctorAtClinics/${id}`;
          break;
        default:
          throw new Error('Unknown booking type');
      }

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAccepted: status }),
      });

      if (response.status === 401) {
        logout();
        setError('Session expired. Please log in again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update booking (Status: ${response.status})`);
      }

      // Update local state
      const updatedBookings = bookings.map(b =>
        b.id === id ? { ...b, isAccepted: status } : b
      );
      setBookings(updatedBookings);

      // Show notification
      setNotification({
        type: status ? 'success' : 'danger',
        message: `Booking ${status ? 'accepted' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Get booking type info (label and className)
  const getBookingTypeInfo = (type) => {
    switch (type) {
      case 'Online':
        return {
          icon: 'bi bi-camera-video',
          label: 'Online Consultation',
          bgClass: 'bg-primary bg-opacity-10 text-primary',
        };
      case 'At Home':
        return {
          icon: 'bi bi-house',
          label: 'Home Visit',
          bgClass: 'bg-success bg-opacity-10 text-success',
        };
      case 'Offline':
        return {
          icon: 'bi bi-building',
          label: 'Clinic Appointment',
          bgClass: 'bg-info bg-opacity-10 text-info',
        };
      default:
        return {
          icon: 'bi bi-calendar',
          label: 'Appointment',
          bgClass: 'bg-secondary bg-opacity-10 text-secondary',
        };
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-4">
        <div className="card shadow">
          <div className="card-body text-center py-5">
            <i className="bi bi-shield-lock fs-1 text-muted mb-3"></i>
            <h3 className="mb-3">Authentication Required</h3>
            <p className="text-muted mb-4">Please log in to access the patient booking management system.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/login'} // Adjust based on your routing
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <style>
        {`
          .nav-link:hover,
          .btn:hover,
          .card:hover,
          .badge:hover {
            background-color: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
            box-shadow: none !important;
          }
          .nav-link,
          .btn,
          .card,
          .badge {
            transition: none !important;
          }
        `}
      </style>
      <div className="card shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="card-title h3 mb-2">Patient Booking Management</h1>
              <p className="text-muted mb-0">Manage doctor appointments across online, home, and clinic services</p>
              {user && (
                <small className="text-muted">
                  Logged in as: <strong>{user.email}</strong> | Role: <span className="badge bg-secondary">{user.role}</span>
                </small>
              )}
            </div>
            <button 
              className="btn btn-outline-secondary"
              onClick={logout}
              title="Logout"
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`alert alert-${notification.type} alert-dismissible fade show d-flex align-items-center`} role="alert">
              <i className={`bi ${notification.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
              <div>{notification.message}</div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setNotification(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-circle me-2"></i>
              <div>{error}</div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-4 text-muted">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Loading bookings...
            </div>
          )}

          {/* Tab navigation */}
          {!loading && (
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Bookings ({bookings.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'online' ? 'active' : ''}`}
                  onClick={() => setActiveTab('online')}
                >
                  <i className="bi bi-camera-video me-1"></i>
                  Online ({bookings.filter(b => b.type === 'Online').length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'offline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('offline')}
                >
                  <i className="bi bi-building me-1"></i>
                  Offline ({bookings.filter(b => b.type === 'Offline').length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'athome' ? 'active' : ''}`}
                  onClick={() => setActiveTab('athome')}
                >
                  <i className="bi bi-house me-1"></i>
                  At Home ({bookings.filter(b => b.type === 'At Home').length})
                </button>
              </li>
            </ul>
          )}

          {/* Booking list */}
          {!loading && (
            <div>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                  <h5>No bookings found</h5>
                  <p className="mb-0">No {activeTab === 'all' ? '' : activeTab} bookings available at the moment.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {filteredBookings.map(booking => (
                    <div key={booking.id} className="card">
                      <div className="card-body">
                        {/* Header with type and actions */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className={`badge rounded-pill px-3 py-2 ${getBookingTypeInfo(booking.type).bgClass}`}>
                            <i className={`${getBookingTypeInfo(booking.type).icon} me-1`}></i>
                            {getBookingTypeInfo(booking.type).label}
                          </span>

                          <div>
                            {booking.isAccepted === null ? (
                              <div className="d-flex gap-2">
                                <button
                                  onClick={() => handleBookingStatus(booking.id, true)}
                                  disabled={loading}
                                  className="btn btn-success btn-sm"
                                >
                                  <i className="bi bi-check-circle me-1"></i>
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleBookingStatus(booking.id, false)}
                                  disabled={loading}
                                  className="btn btn-danger btn-sm"
                                >
                                  <i className="bi bi-x-circle me-1"></i>
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span
                                className={`badge rounded-pill ${
                                  booking.isAccepted === true
                                    ? 'bg-success'
                                    : booking.isAccepted === false
                                    ? 'bg-danger'
                                    : 'bg-warning text-dark'
                                }`}
                              >
                                <i
                                  className={`bi ${
                                    booking.isAccepted === true
                                      ? 'bi-check-circle'
                                      : booking.isAccepted === false
                                      ? 'bi-x-circle'
                                      : 'bi-hourglass-split'
                                  } me-1`}
                                ></i>
                                {booking.isAccepted === true
                                  ? 'Accepted'
                                  : booking.isAccepted === false
                                  ? 'Rejected'
                                  : 'Pending'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Patient info */}
                        <div className="d-flex mb-3">
                          <img
                            src={booking.filePath ? 
                              `${API_BASE_URL}/api/v1/Upload/Image?filePath=${encodeURIComponent(booking.filePath)}&path=${encodeURIComponent('Actors/Doctor')}` 
                              : '/api/placeholder/64/64'
                            }
                            alt="Patient profile"
                            className="rounded me-3"
                            style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                            onError={(e) => (e.target.src = '/api/placeholder/64/64')}
                          />
                          <div>
                            <h5 className="mb-1">{booking.patientName}</h5>
                            <p className="text-muted mb-0">
                              Specialization: {booking.specialization}
                            </p>
                          </div>
                        </div>

                        {/* Booking details */}
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="d-flex align-items-start">
                              <i className="bi bi-clock text-muted me-2 mt-1"></i>
                              <div>
                                <p className="mb-0 fw-medium">Date/Time</p>
                                <p className="text-muted mb-0">
                                  {booking.date} {booking.time}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="d-flex align-items-start">
                              <i className="bi bi-file-text text-muted me-2 mt-1"></i>
                              <div>
                                <p className="mb-0 fw-medium">Medical Condition</p>
                                <p className="text-muted mb-0">{booking.medicalCondition}</p>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="d-flex align-items-start">
                              <i className="bi bi-currency-dollar text-muted me-2 mt-1"></i>
                              <div>
                                <p className="mb-0 fw-medium">Total Price</p>
                                <p className="text-muted mb-0">{booking.totalPrice} EGP</p>
                              </div>
                            </div>
                          </div>

                          {booking.notes && (
                            <div className="col-md-6">
                              <div className="d-flex align-items-start">
                                <i className="bi bi-info-circle text-muted me-2 mt-1"></i>
                                <div>
                                  <p className="mb-0 fw-medium">Notes</p>
                                  <p className="text-muted mb-0">{booking.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}