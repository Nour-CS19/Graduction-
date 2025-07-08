
import React, { useState, useEffect } from 'react';
import { CheckCircle, Trash2, Eye, Clock, Image as ImageIcon, FileText } from 'lucide-react';
import { useAuth } from '../Pages/AuthPage';

const StatusBadge = ({ status }) => {
  const getStatusProps = (status) => {
    switch (status) {
      case 'pending':
        return { className: 'bg-warning text-dark', icon: <Clock className="icon" /> };
      case 'accepted':
        return { className: 'bg-success text-white', icon: <CheckCircle className="icon" /> };
      case 'rejected':
        return { className: 'bg-danger text-white', icon: <Trash2 className="icon" /> };
      default:
        return { className: 'bg-secondary text-white', icon: <Clock className="icon" /> };
    }
  };
  const { className, icon } = getStatusProps(status);
  return (
    <span className={`badge ${className} d-flex align-items-center gap-1`}>
      {icon}
      <span className="text-capitalize">{status}</span>
    </span>
  );
};

const BookingManagementSystem = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [canceledBookings, setCanceledBookings] = useState([]);
  const [selectedTab, setSelectedTab] = useState('active');
  const [cancelReason, setCancelReason] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [analysisDetails, setAnalysisDetails] = useState({});
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: null, isAtHome: null });
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [bookingImages, setBookingImages] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id && user?.accessToken) {
      fetchBookings();
    }
  }, [filters, user, isAuthenticated]);

  const fetchBookingImage = async (filename) => {
    if (!filename || typeof filename !== 'string' || filename.trim() === '') {
      console.log(`Invalid or empty filename: ${filename}`);
      setBookingImages(prev => ({ ...prev, [filename]: null }));
      setImageLoading(prev => ({ ...prev, [filename]: false }));
      return;
    }

    try {
      setImageLoading(prev => ({ ...prev, [filename]: true }));
      if (!user?.accessToken) {
        throw new Error('No access token available');
      }

      const encodedPath = encodeURIComponent('Laboratory/Booking');
      const encodedFilename = encodeURIComponent(filename);
      const imageUrl = `https://physiocareapp.runasp.net/api/v1/Upload/image?filename=${encodedFilename}&path=${encodedPath}`;
      console.log(`Fetching image: ${imageUrl}`);

      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      console.log(`Image fetch response for ${filename}: Status ${response.status}, Content-Type: ${response.headers.get('content-type')}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Image not found for ${filename}`);
          setBookingImages(prev => ({ ...prev, [filename]: null }));
          return;
        }
        if (response.status === 401 || response.status === 403) {
          logout();
          throw new Error('Session expired or unauthorized. Please log in again.');
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        console.error(`Invalid content type for ${filename}: ${contentType}`);
        setBookingImages(prev => ({ ...prev, [filename]: null }));
        return;
      }

      const blob = await response.blob();
      const imageUrlObject = URL.createObjectURL(blob);
      console.log(`Image URL created for ${filename}: ${imageUrlObject}`);
      setBookingImages(prev => ({ ...prev, [filename]: imageUrlObject }));
    } catch (err) {
      console.error(`Failed to fetch image for ${filename}:`, err.message);
      setBookingImages(prev => ({ ...prev, [filename]: null }));
    } finally {
      setImageLoading(prev => ({ ...prev, [filename]: false }));
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user?.id || !user?.accessToken) throw new Error('User not authenticated or missing ID/access token');

      const queryParams = new URLSearchParams({ labId: user.id });
      if (filters.status !== null) queryParams.append('status', filters.status.toString());
      if (filters.isAtHome !== null) queryParams.append('isAtHome', filters.isAtHome.toString());

      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/PatientBookLab/get-all-booking-lab-by-lab-id?${queryParams}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logout();
          throw new Error('Session expired or unauthorized. Please log in again.');
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched active bookings data:', data);

      const processBookings = (arr) =>
        arr.map((b, index) => ({
          id: b.bookingid || `fallback-${index}`,
          patientName: b.patientName || b.patientNameEN || 'Unknown Patient',
          patientPhone: b.patientPhone || 'N/A',
          patientEmail: b.patientEmail || 'N/A',
          appointmentDay: b.appointmentDay || 'N/A',
          appointmentTime: b.appointmentTime || 'N/A',
          createdAt: b.createdAt || new Date().toISOString(),
          status: b.status === 1 ? 'pending' : b.status === 2 ? 'accepted' : 'rejected',
          isDeleted: b.isDeleted || false,
          isAtHome: b.isAtHome || false,
          analysisStatus: b.analysisStatus !== undefined ? b.analysisStatus : false,
          bookingStatus: b.status || 'pending',
          isAccepted: b.isAccepted || false,
          imageFileName: b.filePath || null,
          cityName: b.cityName || 'N/A',
          totalPrice: b.totalPrice || 0,
        }));

      const processedBookings = processBookings(data.filter((b) => !b.isDeleted));
      setBookings(processedBookings);

      processedBookings.forEach(booking => {
        if (booking.imageFileName && !bookingImages[booking.imageFileName]) {
          fetchBookingImage(booking.imageFileName);
        }
      });

      await fetchCanceledBookings();
    } catch (err) {
      setError(`Failed to fetch bookings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCanceledBookings = async () => {
    try {
      const canceledResponse = await fetch(
        `https://physiocareapp.runasp.net/api/v1/PatientBookLab/get-all-booking-cancel-lab-by-lab-id?labId=${user.id}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' },
        }
      );

      if (!canceledResponse.ok) {
        if (canceledResponse.status === 401 || response.status === 403) {
          logout();
          throw new Error('Session expired or unauthorized. Please log in again.');
        }
        throw new Error(`HTTP error fetching canceled bookings! Status: ${canceledResponse.status}`);
      }

      const canceledData = await canceledResponse.json();
      console.log('Fetched canceled bookings data:', canceledData);

      const processBookings = (arr) =>
        arr.map((b, index) => ({
          id: b.bookingid || `fallback-${index}`,
          patientName: b.patientName || b.patientNameEN || 'Unknown Patient',
          patientPhone: b.patientPhone || 'N/A',
          patientEmail: b.patientEmail || 'N/A',
          appointmentDay: b.appointmentDay || 'N/A',
          appointmentTime: b.appointmentTime || 'N/A',
          createdAt: b.createdAt || new Date().toISOString(),
          status: 'rejected',
          isDeleted: true,
          isAtHome: b.isAtHome || false,
          cancelReason: b.cancelReason || '',
          canceledAt: b.canceledAt || b.updatedAt || new Date().toISOString(),
          imageFileName: b.filePath || null,
          cityName: b.cityName || 'N/A',
          totalPrice: b.totalPrice || 0,
        }));

      const processedCanceledBookings = processBookings(canceledData);
      setCanceledBookings(processedCanceledBookings);

      processedCanceledBookings.forEach(booking => {
        if (booking.imageFileName && !bookingImages[booking.imageFileName]) {
          fetchBookingImage(booking.imageFileName);
        }
      });
    } catch (err) {
      console.error('Error fetching canceled bookings:', err);
    }
  };

  const fetchAnalysis = async (bookingId) => {
    console.log('Fetching analysis for bookingId:', bookingId);
    try {
      setError(null);
      if (!user?.accessToken) throw new Error('User not authenticated or missing access token.');
      if (!bookingId || typeof bookingId !== 'string') throw new Error('Invalid bookingId');

      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/PatientBookLab/get-all-booking-phanalysis/${bookingId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setCurrentAnalysis([]);
          setAnalysisDetails(prev => ({ ...prev, [bookingId]: [] }));
          console.log(`No analysis data found for booking ${bookingId}`);
          setShowAnalysisModal(true);
          return;
        }
        if (response.status === 401 || response.status === 403) {
          logout();
          throw new Error('Session expired or unauthorized. Please log in again.');
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Analysis data for booking ${bookingId}:`, data);

      const processedAnalysis = Array.isArray(data)
        ? data.map(item => ({
            analysisName: item.nameEN || item.nameAR || 'N/A',
            description: 'No description available',
            price: 0,
            status: 'pending',
          }))
        : [];

      setAnalysisDetails(prev => ({ ...prev, [bookingId]: processedAnalysis }));
      setCurrentAnalysis(processedAnalysis);
      setShowAnalysisModal(true);
    } catch (err) {
      setError(`Failed to fetch analysis: ${err.message}`);
    }
  };

  const acceptBooking = async (bookingId) => {
    try {
      if (!user?.accessToken) throw new Error('No access token');
      const patchOperations = [
        {
          op: 'replace',
          path: '/IsAccepted',
          value: true,
        },
      ];

      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/PatientBookLab/${bookingId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json-patch+json',
          },
          body: JSON.stringify(patchOperations),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'No error message from server.' }));
        if (response.status === 401 || response.status === 403) {
          logout();
          throw new Error('Session expired or unauthorized. Please log in again.');
        }
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, isAccepted: true, status: 'accepted' } : b
        )
      );
      alert('Booking accepted successfully!');
      fetchBookings();
    } catch (err) {
      setError(`Failed to accept booking: ${err.message}`);
    }
  };

  const softDelete = async (bookingId, reason = '') => {
    try {
      if (!user?.accessToken) throw new Error('No access token');
      const queryParams = reason ? `?cancelReason=${encodeURIComponent(reason)}` : '';
      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/PatientBookLab/soft-delete-booking-by-id/${bookingId}${queryParams}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'No error message from server.' }));
        if (response.status === 401 || response.status === 403) {
          logout();
          throw new Error('Session expired or unauthorized. Please log in again.');
        }
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        const rejectedBooking = {
          ...booking,
          status: 'rejected',
          isDeleted: true,
          cancelReason: reason,
          canceledAt: new Date().toISOString(),
        };
        setCanceledBookings((prev) => [...prev, rejectedBooking]);
        alert('Booking rejected successfully!');
      }
    } catch (err) {
      setError(`Failed to reject booking: ${err.message}`);
    }
  };

  const hardDelete = async (bookingId) => {
    try {
      if (!user?.accessToken) throw new Error('No access token');
      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/PatientBookLab/hard-delete-booking-by-id/${bookingId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'No error message from server.' }));
        if (response.status === 401 || response.status === 403) {
          logout();
          throw new Error('Session expired or unauthorized. Please log in again.');
        }
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      setCanceledBookings((prev) => prev.filter((b) => b.id !== bookingId));
      alert('Booking permanently deleted!');
    } catch (err) {
      setError(`Failed to delete booking: ${err.message}`);
    }
  };

  const handleViewAnalysis = (bookingId) => {
    console.log('handleViewAnalysis called with bookingId:', bookingId);
    if (!bookingId) {
      setError('Invalid bookingId for analysis');
      return;
    }

    const currentBooking = [...bookings, ...canceledBookings].find(b => b.id === bookingId);
    setCurrentBooking(currentBooking);

    if (!analysisDetails[bookingId] || analysisDetails[bookingId].length === 0) {
      fetchAnalysis(bookingId);
    } else {
      setCurrentAnalysis(analysisDetails[bookingId]);
      setShowAnalysisModal(true);
    }
  };

  const handleViewImage = (booking) => {
    const imageUrl = booking.imageFileName && bookingImages[booking.imageFileName];
    if (!imageUrl) {
      setError('No image available to view');
      return;
    }
    setCurrentImage(imageUrl);
    setShowImageModal(true);
  };

  const handleAccept = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowAcceptModal(true);
  };

  const confirmAccept = () => {
    if (selectedBookingId) {
      acceptBooking(selectedBookingId);
      setShowAcceptModal(false);
      setSelectedBookingId(null);
    }
  };

  const handleReject = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (selectedBookingId) {
      softDelete(selectedBookingId, cancelReason);
      setShowRejectModal(false);
      setCancelReason('');
      setSelectedBookingId(null);
    }
  };

  const getCurrentStatus = (booking) => {
    if (booking.isAccepted) return 'accepted';
    return booking.bookingStatus || booking.status;
  };

  const isBookingAccepted = (booking) => {
    return booking.isAccepted === true;
  };

  useEffect(() => {
    console.log('Current bookingImages state:', bookingImages);
    return () => {
      Object.values(bookingImages).forEach(imageUrl => {
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }
      });
    };
  }, [bookingImages]);

  if (!isAuthenticated) {
    return <div>Please log in to access the booking management system.</div>;
  }

  return (
    <div className="container my-5">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Patient Lab Booking Management</h1>
          </div>

          <div className="card mb-4">
            <div className="card-body d-flex flex-wrap gap-3 align-items-center">
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="statusFilter" className="form-label mb-0">
                  Status:
                </label>
                <select
                  id="statusFilter"
                  value={filters.status === null ? '' : filters.status.toString()}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value === '' ? null : e.target.value === 'true',
                    })
                  }
                  className="form-select form-select-sm"
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="locationFilter" className="form-label mb-0">
                  Location:
                </label>
                <select
                  id="locationFilter"
                  value={filters.isAtHome === null ? '' : filters.isAtHome.toString()}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      isAtHome: e.target.value === '' ? null : e.target.value === 'true',
                    })
                  }
                  className="form-select form-select-sm"
                  aria-label="Filter by location"
                >
                  <option value="">All Locations</option>
                  <option value="true">At Home</option>
                  <option value="false">At Lab</option>
                </select>
              </div>
              <button
                onClick={fetchBookings}
                className="btn btn-sm btn-primary"
                disabled={loading}
                aria-label="Refresh bookings"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          <ul className="nav nav-tabs mb-4" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link ${selectedTab === 'active' ? 'active' : ''}`}
                onClick={() => setSelectedTab('active')}
                role="tab"
                aria-selected={selectedTab === 'active'}
              >
                Active Bookings ({bookings.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${selectedTab === 'canceled' ? 'active' : ''}`}
                onClick={() => setSelectedTab('canceled')}
                role="tab"
                aria-selected={selectedTab === 'canceled'}
              >
                Canceled Bookings ({canceledBookings.length})
              </button>
            </li>
          </ul>

          {selectedTab === 'active' && (
            <div role="tabpanel">
              <h2 className="h4 mb-3">Active Bookings</h2>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-muted text-center py-3">No active bookings found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Appointment</th>
                        <th>Price</th>
                        <th>Payment Image</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => {
                        const isAccepted = isBookingAccepted(booking);
                        const hasImage = booking.imageFileName && bookingImages[booking.imageFileName];
                        const isImageLoading = imageLoading[booking.imageFileName];

                        return (
                          <tr key={booking.id}>
                            <td>{booking.patientName}</td>
                            <td>{booking.patientPhone}</td>
                            <td>{booking.patientEmail}</td>
                            <td>{booking.cityName}</td>
                            <td>{`${booking.appointmentDay} at ${booking.appointmentTime}`}</td>
                            <td>{booking.totalPrice} EGP</td>
                            <td>
                              {isImageLoading ? (
                                <div className="text-center">
                                  <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading image...</span>
                                  </div>
                                  <small className="d-block mt-1 text-muted">Loading...</small>
                                </div>
                              ) : hasImage ? (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleViewImage(booking)}
                                  disabled={isImageLoading}
                                  aria-label={`View payment receipt for ${booking.patientName}`}
                                >
                                  <Eye size={14} className="me-1" />
                                  View Image
                                </button>
                              ) : (
                                <div className="text-center text-muted">
                                  <ImageIcon size={24} className="mb-1" />
                                  <small>No image</small>
                                </div>
                              )}
                            </td>
                            <td>
                              <StatusBadge status={getCurrentStatus(booking)} />
                              {booking.isAtHome && (
                                <span className="badge bg-info text-white ms-1">At Home</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleViewAnalysis(booking.id)}
                                  className="btn btn-sm btn-outline-info"
                                  aria-label={`View analysis for ${booking.patientName}`}
                                >
                                  <FileText size={14} className="me-1" />
                                  Analysis
                                </button>
                                {!isAccepted && !booking.isDeleted && (
                                  <>
                                    <button
                                      onClick={() => handleAccept(booking.id)}
                                      className="btn btn-sm btn-success"
                                      aria-label={`Accept booking for ${booking.patientName}`}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleReject(booking.id)}
                                      className="btn btn-sm btn-danger"
                                      aria-label={`Reject booking for ${booking.patientName}`}
                                    >
                                      <Trash2 size={14} className="me-1" />
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'canceled' && (
            <div role="tabpanel">
              <h2 className="h4 mb-3">Canceled Bookings</h2>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : canceledBookings.length === 0 ? (
                <p className="text-muted text-center py-3">No canceled bookings found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Appointment</th>
                        <th>Price</th>
                        <th>Payment Image</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {canceledBookings.map((booking) => {
                        const hasImage = booking.imageFileName && bookingImages[booking.imageFileName];
                        const isImageLoading = imageLoading[booking.imageFileName];

                        return (
                          <tr key={booking.id}>
                            <td>{booking.patientName}</td>
                            <td>{booking.patientPhone}</td>
                            <td>{booking.patientEmail}</td>
                            <td>{booking.cityName}</td>
                            <td>{`${booking.appointmentDay} at ${booking.appointmentTime}`}</td>
                            <td>{booking.totalPrice} EGP</td>
                            <td>
                              {isImageLoading ? (
                                <div className="text-center">
                                  <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading image...</span>
                                  </div>
                                  <small className="d-block mt-1 text-muted">Loading...</small>
                                </div>
                              ) : hasImage ? (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleViewImage(booking)}
                                  disabled={isImageLoading}
                                  aria-label={`View payment receipt for ${booking.patientName}`}
                                >
                                  <Eye size={14} className="me-1" />
                                  View Image
                                </button>
                              ) : (
                                <div className="text-center text-muted">
                                  <ImageIcon size={24} className="mb-1" />
                                  <small>No image</small>
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="badge bg-danger text-white d-flex align-items-center gap-1">
                                <Trash2 size={14} />
                                Canceled
                              </span>
                              {booking.cancelReason && (
                                <small className="d-block text-muted mt-1">
                                  Reason: {booking.cancelReason}
                                </small>
                              )}
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleViewAnalysis(booking.id)}
                                  className="btn btn-sm btn-outline-info"
                                  aria-label={`View analysis for ${booking.patientName}`}
                                >
                                  <FileText size={14} className="me-1" />
                                  Analysis
                                </button>
                                <button
                                  onClick={() => hardDelete(booking.id)}
                                  className="btn btn-sm btn-danger"
                                  aria-label={`Permanently delete booking for ${booking.patientName}`}
                                >
                                  <Trash2 size={14} className="me-1" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Accept</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAcceptModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to accept this booking?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAcceptModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={confirmAccept}
                >
                  <CheckCircle size={16} className="me-1" />
                  Accept Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Reject</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRejectModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to reject this booking?</p>
                <div className="mb-3">
                  <label htmlFor="cancelReasonInput" className="form-label">
                    Reason for rejection
                  </label>
                  <textarea
                    id="cancelReasonInput"
                    className="form-control"
                    rows="3"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmReject}
                >
                  <Trash2 size={16} className="me-1" />
                  Reject Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ BackgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Analysis Details {currentBooking && `- ${currentBooking.patientName}`}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAnalysisModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {currentAnalysis && currentAnalysis.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Analysis Name</th>
                          <th>Description</th>
                          <th>Price</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAnalysis.map((analysis, index) => (
                          <tr key={index}>
                            <td>{analysis.analysisName}</td>
                            <td>{analysis.description}</td>
                            <td>{analysis.price} EGP</td>
                            <td>
                              <span className={`badge ${analysis.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                {analysis.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText size={48} className="text-muted mb-3" />
                    <p className="text-muted">No analysis data available for this booking.</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAnalysisModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Payment Receipt</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowImageModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body text-center">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt="Payment Receipt"
                    className="img-fluid"
                    style={{ maxHeight: '70vh' }}
                    onError={(e) => {
                      console.error('Image modal failed to load image:', currentImage);
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f8f9fa"/%3E%3Ctext x="50%" y="50%" font-size="20" text-anchor="middle" alignment-baseline="middle" fill="%236c757d"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="text-center text-muted">
                    <ImageIcon size={48} className="mb-3" />
                    <p>No image available</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowImageModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagementSystem;