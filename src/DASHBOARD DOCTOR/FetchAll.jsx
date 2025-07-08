import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Pages/AuthPage'; // Adjust the import path as needed
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  FileText,
  Eye,
  Check,
  X,
  Trash2,
  AlertTriangle,
  Image,
  Archive,
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

// API Service
const API_SERVICE = {
  BASE_URL: 'https://physiocareapp.runasp.net/api/v1',

  getAuthHeaders() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) throw new Error('No access token available');
    return { Authorization: `Bearer ${accessToken}`, 'accept': '*/*' };
  },

  async fetchData(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...(options.headers || {})
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  },

  async fetchReceiptImage(filePath, retry = true) {
    if (!filePath || filePath === 'N/A') {
      console.log('Invalid or missing filePath:', filePath);
      return null;
    }

    try {
      console.log('Fetching receipt image for filePath:', filePath);
      const response = await fetch(`${this.BASE_URL}/Upload/image?filename=${encodeURIComponent(filePath)}&path=Doctor%2FBooking%2Fathome`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401 && retry) {
          console.warn('Unauthorized, retrying fetchReceiptImage once...');
          return await this.fetchReceiptImage(filePath, false); // Retry once
        }
        throw new Error(`Failed to fetch receipt image: ${response.status} ${errorText}`);
      }

      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('Received non-image content from API');
      }
      const url = URL.createObjectURL(blob);
      console.log('Receipt image URL created:', url);
      return url;
    } catch (error) {
      console.error('Receipt image fetch error:', error.message);
      return null;
    }
  }
};

const BookingManagementPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewBooking, setViewBooking] = useState(null);
  const [actionBooking, setActionBooking] = useState(null);
  const [deleteBookingId, setDeleteBookingId] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [receiptImageUrl, setReceiptImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);

  const showAlert = (type, message, duration = 3000) => {
    setAlert({ type, message });
    if (duration) {
      setTimeout(() => setAlert({ type: '', message: '' }), duration);
    }
  };

  const resetAlerts = () => {
    setAlert({ type: '', message: '' });
  };

  const fetchBookings = async () => {
    if (!user || !user.id || authLoading) {
      showAlert('danger', 'User not authenticated or loading');
      console.log('User or ID missing:', user);
      return;
    }

    try {
      setLoading(true);
      resetAlerts();

      console.log(`Fetching bookings for doctorId: ${user.id}`);
      const endpoint = `/PatientBookingDoctorAtHomes/get-all-booking-at-homes/${user.id}`;
      const result = await API_SERVICE.fetchData(endpoint);
      console.log('API Response:', result);

      let data = Array.isArray(result) ? result : [];
      if (!Array.isArray(result)) {
        console.warn('Unexpected response format:', result);
      }

      const normalizedBookings = data.map((booking) => ({
        bookingId: booking.bookingId ?? null,
        patientId: booking.patientId ?? null,
        patientName: booking.patientName ?? 'N/A',
        specialization: `${booking.nameAR ?? ''} - ${booking.nameEN ?? ''}`,
        appointmentOnlineId: booking.appointmentOnlineId ?? null,
        date: booking.date ?? 'N/A',
        time: booking.time ?? 'N/A',
        totalPrice: booking.totalPrice ?? 0,
        medicalCondition: booking.medicalCondition ?? 'N/A',
        isAccepted: booking.isAccepted ?? false,
        isDeleted: booking.isDeleted ?? false,
        notes: booking.notes ?? '',
        filePath: booking.filePath ?? 'N/A',
        cancelReason: booking.cancellationReason ?? '',
      }));

      setBookings(normalizedBookings);
      const filteredBookings = getFilteredBookings(normalizedBookings);
      const totalCount = filteredBookings.length;
      setTotalItems(totalCount);
      setTotalPages(Math.ceil(totalCount / pageSize));
      setCurrentPage(1);

      if (normalizedBookings.length === 0) {
        showAlert('info', 'No bookings found.');
      } else {
        showAlert('success', `Loaded ${normalizedBookings.length} bookings successfully`);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
      showAlert('danger', `Failed to load bookings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async () => {
    if (!actionBooking || !user?.id) return;

    try {
      setLoading(true);
      resetAlerts();

      const patchOperations = [
        { op: 'replace', path: '/IsAccepted', value: true }
      ];

      if (actionNotes.trim()) {
        patchOperations.push({ op: 'replace', path: '/Notes', value: actionNotes.trim() });
      }

      const response = await fetch(`${API_SERVICE.BASE_URL}/PatientBookingDoctorAtHomes/${actionBooking.bookingId}`, {
        method: 'PATCH',
        headers: {
          ...API_SERVICE.getAuthHeaders(),
          'Content-Type': 'application/json-patch+json'
        },
        body: JSON.stringify(patchOperations),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to accept booking: ${response.status} ${errorText}`);
      }

      setBookings(prev => prev.map(booking => 
        booking.bookingId === actionBooking.bookingId 
          ? { ...booking, isAccepted: true, notes: actionNotes.trim() }
          : booking
      ));

      setShowActionModal(false);
      setActionNotes('');
      showAlert('success', 'Booking accepted successfully');
    } catch (error) {
      console.error('Accept booking error:', error);
      showAlert('danger', `Failed to accept booking: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!deleteBookingId || !user?.id) return;

    try {
      setLoading(true);
      resetAlerts();

      let endpoint = `/PatientBookingDoctorAtHomes/soft-delete/${deleteBookingId}`;
      if (deleteReason.trim()) {
        endpoint += `?cancelReason=${encodeURIComponent(deleteReason.trim())}`;
      }

      const response = await fetch(`${API_SERVICE.BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: API_SERVICE.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to cancel booking: ${response.status} ${errorText}`);
      }

      setBookings(prev => prev.map(booking => 
        booking.bookingId === deleteBookingId 
          ? { ...booking, isDeleted: true, cancelReason: deleteReason.trim() }
          : booking
      ));

      setShowDeleteModal(false);
      setDeleteReason('');
      showAlert('success', 'Booking cancelled successfully and moved to cancelled tab');
    } catch (error) {
      console.error('Soft delete error:', error);
      showAlert('danger', `Failed to cancel booking: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleHardDelete = async () => {
    if (!deleteBookingId || !user?.id) return;

    try {
      setLoading(true);
      resetAlerts();

      const response = await fetch(`${API_SERVICE.BASE_URL}/PatientBookingDoctorAtHomes/hard-delete/${deleteBookingId}`, {
        method: 'DELETE',
        headers: API_SERVICE.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete booking: ${response.status} ${errorText}`);
      }

      setBookings(prev => prev.filter(booking => booking.bookingId !== deleteBookingId));

      setShowDeleteModal(false);
      setDeleteReason('');
      showAlert('success', 'Booking permanently deleted from database');
    } catch (error) {
      console.error('Hard delete error:', error);
      showAlert('danger', `Failed to delete booking: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = async (booking) => {
    setViewBooking(booking);
    setReceiptImageUrl(null);
    setImageLoading(true);
    setImageError(null);

    if (booking.filePath && booking.filePath !== 'N/A') {
      try {
        const url = await API_SERVICE.fetchReceiptImage(booking.filePath);
        if (url) {
          setReceiptImageUrl(url);
        } else {
          setImageError('Failed to load receipt image');
          showAlert('warning', 'Failed to load receipt image');
        }
      } catch (error) {
        setImageError(error.message);
        showAlert('warning', `Failed to load receipt image: ${error.message}`);
      }
    } else {
      setImageError('No receipt image available');
    }

    setImageLoading(false);
    setShowViewModal(true);
  };

  const handleActionClick = (booking) => {
    setActionBooking(booking);
    setActionNotes('');
    setShowActionModal(true);
  };

  const handleDeleteClick = (bookingId) => {
    setDeleteBookingId(bookingId);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const getFilteredBookings = (bookingsList = bookings) => {
    return activeTab === 'cancelled' 
      ? bookingsList.filter(booking => booking.isDeleted)
      : bookingsList.filter(booking => !booking.isDeleted);
  };

  const getPaginatedBookings = () => {
    const filteredBookings = getFilteredBookings();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredBookings.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    const filteredBookings = getFilteredBookings();
    setTotalPages(Math.ceil(filteredBookings.length / newSize));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    const filteredBookings = getFilteredBookings();
    const totalCount = filteredBookings.length;
    setTotalItems(totalCount);
    setTotalPages(Math.ceil(totalCount / pageSize));
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  };

  const getStatusBadge = (booking) => {
    if (booking.isDeleted) {
      return <span className="badge bg-danger text-white"><X className="me-1" size={12} /> Cancelled</span>;
    } else if (booking.isAccepted) {
      return <span className="badge bg-success text-white"><Check className="me-1" size={12} /> Accepted</span>;
    } else {
      return <span className="badge bg-warning text-dark"><Clock className="me-1" size={12} /> Pending</span>;
    }
  };

  const getActionButtons = (booking) => {
    if (activeTab === 'cancelled') {
      return (
        <div className="btn-group-vertical">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm rounded-pill mb-2"
            onClick={() => handleViewClick(booking)}
          >
            <Eye className="me-1" size={16} /> View
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm rounded-pill"
            onClick={() => handleDeleteClick(booking.bookingId)}
            title="Permanently delete from database"
          >
            <Trash2 className="me-1" size={16} /> Delete
          </button>
        </div>
      );
    }

    if (booking.isAccepted) {
      return (
        <div className="btn-group-vertical">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm rounded-pill mb-2"
            onClick={() => handleViewClick(booking)}
          >
            <Eye className="me-1" size={16} /> View
          </button>
          <button
            type="button"
            className="btn btn-outline-warning btn-sm rounded-pill"
            onClick={() => handleDeleteClick(booking.bookingId)}
            title="Cancel booking (move to cancelled tab)"
          >
            <Archive className="me-1" size={16} /> Cancel
          </button>
        </div>
      );
    }

    return (
      <div className="btn-group-vertical">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm rounded-pill mb-2"
          onClick={() => handleViewClick(booking)}
        >
          <Eye className="me-1" size={16} /> View
        </button>
        <button
          type="button"
          className="btn btn-outline-success btn-sm rounded-pill mb-2"
          onClick={() => handleActionClick(booking)}
          title="Accept booking"
        >
          <Check className="me-1" size={16} /> Accept
        </button>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm rounded-pill"
          onClick={() => handleDeleteClick(booking.bookingId)}
          title="Reject booking (move to cancelled tab)"
        >
          <X className="me-1" size={16} /> Reject
        </button>
      </div>
    );
  };

  const renderPaginationControls = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className="page-item">
          <button
            className={`page-link ${i === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(i)}
            disabled={loading}
          >
            {i}
          </button>
        </li>
      );
    }

    return (
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="text-muted me-3">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </span>
            <select
              className="form-select form-select-sm w-auto"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              disabled={loading}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <div>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </button>
            {pages}
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </button>
          </div>
        </ul>
      </nav>
    );
  };

  useEffect(() => {
    if (user && user.id && !authLoading) {
      fetchBookings();
    }
  }, [user, authLoading]);

  useEffect(() => {
    const filteredBookings = getFilteredBookings();
    const totalCount = filteredBookings.length;
    setTotalItems(totalCount);
    setTotalPages(Math.ceil(totalCount / pageSize));
  }, [bookings, activeTab, pageSize]);

  // Cleanup receiptImageUrl when modal closes
  useEffect(() => {
    return () => {
      if (receiptImageUrl) {
        URL.revokeObjectURL(receiptImageUrl);
        console.log('Revoked receiptImageUrl:', receiptImageUrl);
      }
    };
  }, [receiptImageUrl]);

  if (authLoading || !user?.id) {
    return (
      <div className="min-vh-100 bg-light py-5">
        <div className="container">
          <h1 className="text-center mb-4">Booking Management</h1>
          <div className="alert alert-danger text-center" role="alert">
            Please log in to view your bookings.
          </div>
        </div>
      </div>
    );
  }

  const paginatedBookings = getPaginatedBookings();
  const activeBookingsCount = bookings.filter(b => !b.isDeleted).length;
  const cancelledBookingsCount = bookings.filter(b => b.isDeleted).length;

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-4 mb-3">Patient Booking Management</h1>
          <p className="lead text-muted">Welcome, {user.name}</p>
        </div>

        {alert.message && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show mb-4`}>
            {alert.message}
            <button type="button" className="btn-close" onClick={() => resetAlerts()}></button>
          </div>
        )}

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => handleTabChange('active')}
                >
                  <Check className="me-2" size={16} />
                  Active Bookings
                  <span className="badge bg-primary ms-2">{activeBookingsCount}</span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'cancelled' ? 'active' : ''}`}
                  onClick={() => handleTabChange('cancelled')}
                >
                  <Archive className="me-2" size={16} />
                  Cancelled Bookings
                  <span className="badge bg-secondary ms-2">{cancelledBookingsCount}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {paginatedBookings.length > 0 && (
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="card-title mb-0">
                {activeTab === 'active' ? 'Active Patient Bookings' : 'Cancelled Patient Bookings'}
              </h2>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th><User className="me-2" size={16} /> Patient Name</th>
                    <th>Specialization</th>
                    <th><Calendar className="me-2" size={16} /> Date</th>
                    <th><Clock className="me-2" size={16} /> Time</th>
                    <th><DollarSign className="me-2" size={16} /> Price</th>
                    <th>Medical Condition</th>
                    <th>Status</th>
                    <th><Image className="me-2" size={16} /> Receipt</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.bookingId}>
                      <td>{booking.patientName}</td>
                      <td>{booking.specialization}</td>
                      <td>{formatDate(booking.date)}</td>
                      <td>{formatTime(booking.time)}</td>
                      <td>${(booking.totalPrice || 0).toFixed(2)}</td>
                      <td>
                        <span className="text-truncate d-inline-block" style={{maxWidth: '150px'}} title={booking.medicalCondition}>
                          {booking.medicalCondition}
                        </span>
                      </td>
                      <td>{getStatusBadge(booking)}</td>
                      <td>
                        {booking.filePath && booking.filePath !== 'N/A' ? (
                          <span className="badge bg-info text-white">
                            <Image className="me-1" size={12} /> Available
                          </span>
                        ) : (
                          <span className="badge bg-secondary">N/A</span>
                        )}
                      </td>
                      <td>{getActionButtons(booking)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && renderPaginationControls()}
          </div>
        )}

        {paginatedBookings.length === 0 && !loading && (
          <div className="alert alert-info text-center" role="alert">
            {activeTab === 'active' ? 'No active bookings found.' : 'No cancelled bookings found.'}
          </div>
        )}

        {/* View Modal */}
        {showViewModal && viewBooking && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Booking Details</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => {
                    setShowViewModal(false);
                    setViewBooking(null);
                    if (receiptImageUrl) {
                      URL.revokeObjectURL(receiptImageUrl);
                      setReceiptImageUrl(null);
                    }
                    setImageError(null);
                    setImageLoading(false);
                  }}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title text-muted mb-3">Patient Information</h6>
                          <p className="card-text"><strong>Patient Name:</strong> {viewBooking.patientName}</p>
                          <p className="card-text"><strong>Medical Condition:</strong> {viewBooking.medicalCondition}</p>

                          <h6 className="card-title text-muted mb-3 mt-4">Appointment Details</h6>
                          <p className="card-text"><strong>Specialization:</strong> {viewBooking.specialization}</p>
                          <p className="card-text"><strong>Date:</strong> {formatDate(viewBooking.date)}</p>
                          <p className="card-text"><strong>Time:</strong> {formatTime(viewBooking.time)}</p>
                          <p className="card-text"><strong>Total Price:</strong> ${(viewBooking.totalPrice || 0).toFixed(2)}</p>
                          <p className="card-text"><strong>Status:</strong> {getStatusBadge(viewBooking)}</p>

                          {viewBooking.notes && viewBooking.notes.trim() && (
                            <>
                              <h6 className="card-title text-muted mb-3 mt-4">Notes</h6>
                              <p className="card-text">{viewBooking.notes}</p>
                            </>
                          )}

                          {viewBooking.cancelReason && viewBooking.cancelReason.trim() && (
                            <>
                              <h6 className="card-title text-muted mb-3 mt-4">Cancel Reason</h6>
                              <p className="card-text text-danger">{viewBooking.cancelReason}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title text-muted mb-3">
                            <Image className="me-2" size={16} />
                            Payment Receipt
                          </h6>
                          {imageLoading ? (
                            <div className="text-center py-5">
                              <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading receipt image...</span>
                              </div>
                              <p className="text-muted">Loading receipt image...</p>
                            </div>
                          ) : imageError ? (
                            <div className="text-center text-muted py-5">
                              <AlertTriangle size={48} className="mb-3 opacity-50" />
                              <p>{imageError}</p>
                            </div>
                          ) : receiptImageUrl ? (
                            <div className="text-center">
                              <img 
                                src={receiptImageUrl} 
                                alt="Payment Receipt" 
                                className="img-fluid rounded shadow-sm" 
                                style={{ maxHeight: '400px', width: 'auto' }}
                                onError={() => {
                                  setImageError('Failed to load receipt image');
                                  setReceiptImageUrl(null);
                                  showAlert('warning', 'Failed to load receipt image');
                                }} 
                              />
                            </div>
                          ) : (
                            <div className="text-center text-muted py-5">
                              <Image size={48} className="mb-3 opacity-50" />
                              <p>No payment receipt available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Modal (Accept) */}
        {showActionModal && actionBooking && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">Accept Booking</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => {
                    setShowActionModal(false);
                    setActionBooking(null);
                    setActionNotes('');
                  }}></button>
                </div>
                <div className="modal-body">
                  <p className="mb-3">Are you sure you want to accept the booking for <strong>{actionBooking.patientName}</strong>?</p>
                  <div className="card bg-light mb-3">
                    <div className="card-body">
                      <p className="card-text"><strong>Date:</strong> {formatDate(actionBooking.date)}</p>
                      <p className="card-text"><strong>Time:</strong> {formatTime(actionBooking.time)}</p>
                      <p className="card-text"><strong>Medical Condition:</strong> {actionBooking.medicalCondition}</p>
                      <p className="card-text"><strong>Price:</strong> ${(actionBooking.totalPrice || 0).toFixed(2)}</p>
                    </div>
                  </div>                 
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowActionModal(false);
                      setActionBooking(null);
                      setActionNotes('');
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleBookingAction}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Check className="me-2" size={16} />
                        Accept Booking
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal (Cancel/Reject or Hard Delete) */}
        {showDeleteModal && deleteBookingId && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    {activeTab === 'cancelled' ? (
                      <>
                        <Trash2 className="me-2" size={16} />
                        Delete Booking Permanently
                      </>
                    ) : (
                      <>
                        <X className="me-2" size={16} />
                        Cancel/Reject Booking
                      </>
                    )}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteBookingId(null);
                    setDeleteReason('');
                  }}></button>
                </div>
                <div className="modal-body">
                  {activeTab === 'cancelled' ? (
                    <div>
                      <div className="alert alert-warning" role="alert">
                        <AlertTriangle className="me-2" size={16} />
                        <strong>Warning:</strong> This action will permanently delete the booking from the database and cannot be undone.
                      </div>
                      <p>Are you sure you want to permanently delete this booking?</p>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-3">
                        This will cancel/reject the booking and move it to the cancelled tab. You can optionally provide a reason:
                      </p>
                      <div className="mb-3">
                        <label htmlFor="deleteReason" className="form-label">
                          <FileText className="me-2" size={16} />
                          Cancellation/Rejection Reason 
                        </label>
                        <textarea
                          id="deleteReason"
                          className="form-control"
                          rows="3"
                          placeholder="Provide a reason for cancellation/rejection..."
                          value={deleteReason}
                          onChange={(e) => setDeleteReason(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteBookingId(null);
                      setDeleteReason('');
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={activeTab === 'cancelled' ? handleHardDelete : handleSoftDelete}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {activeTab === 'cancelled' ? 'Deleting...' : 'Cancelling...'}
                      </>
                    ) : (
                      <>
                        {activeTab === 'cancelled' ? (
                          <>
                            <Trash2 className="me-2" size={16} />
                            Delete Permanently
                          </>
                        ) : (
                          <>
                            <X className="me-2" size={16} />
                            Cancel/Reject
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
               style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
            <div className="bg-white p-4 rounded shadow text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mb-0">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagementPage;