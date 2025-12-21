import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../Pages/AuthPage';

// Modern API client using fetch with better error handling
class ModernApiClient {
  constructor(baseURL, defaultHeaders = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...defaultHeaders
    };
    this.timeout = 30000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/${endpoint.replace(/^\//, '')}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle different response types
      let data = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new ApiError(response.status, response.statusText, data, url);
      }

      return { data, status: response.status, headers: response.headers };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new ApiError(408, 'Request Timeout', null, url);
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network errors
      throw new ApiError(0, 'Network Error', error.message, url);
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    });
  }

  patch(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

// Custom error class for better error handling
class ApiError extends Error {
  constructor(status, statusText, data, url) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.url = url;
    this.isNetworkError = status === 0;
    this.isCorsError = status === 0 && statusText === 'Network Error';
  }
}

// Modern API endpoints configuration
const createApiEndpoints = (userId) => ({
  bookings: {
    getAll: `PatientBookNurse/get-all-booking-for-nurse/${userId}`,
    accept: (bookingId) => `PatientBookNurse/${bookingId}`,
    reject: (bookingId) => `PatientBookNurse/reject-booking/${bookingId}`,
    delete: (bookingId) => `PatientBookNurse/hard-delete-booking-by-id/${bookingId}`,
    getImage: (filename, path = 'Nurse%2FBooking') => 
      `Upload/image?filename=${encodeURIComponent(filename)}&path=${encodeURIComponent(path)}`
  }
});

// Custom hooks for better state management
const useAlert = () => {
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const showAlert = useCallback((type, message, duration = 6000) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), duration);
  }, []);

  const hideAlert = useCallback(() => {
    setAlert({ show: false, type: '', message: '' });
  }, []);

  return { alert, showAlert, hideAlert };
};

const useAsyncAction = () => {
  const [loading, setLoading] = useState({});
  const [actionType, setActionType] = useState({});

  const executeAction = useCallback(async (id, type, asyncFunction) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    setActionType(prev => ({ ...prev, [id]: type }));

    try {
      const result = await asyncFunction();
      return result;
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
      setActionType(prev => ({ ...prev, [id]: null }));
    }
  }, []);

  return { loading, actionType, executeAction };
};

// Enhanced data processing utilities
const DataProcessor = {
  isValidUUID: (uuid) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
  },

  extractBookingId: (booking, index) => {
    const idFields = ['bookingId', 'id', 'Id', 'booking_id'];
    
    for (const field of idFields) {
      const value = booking[field];
      if (value && DataProcessor.isValidUUID(value)) {
        return value;
      }
    }
    
    return `temp-${index}-${Date.now()}`;
  },

  processBooking: (rawBooking, index) => {
    const id = DataProcessor.extractBookingId(rawBooking, index);
    
    const serverIsAccepted = rawBooking.isAccepted ?? rawBooking.IsAccepted ?? rawBooking.is_accepted ?? null;
    const status = serverIsAccepted === true ? 'Accepted' : serverIsAccepted === false ? 'Pending' : 'Pending';
    
    return {
      id,
      originalBooking: rawBooking,
      patientId: rawBooking.patientId ?? rawBooking.PatientId ?? 'N/A',
      patientName: rawBooking.patientName ?? rawBooking.PatientName ?? 'Unknown Patient',
      patientPhone: rawBooking.patientPhone ?? rawBooking.PatientPhone ?? 'N/A',
      patientEmail: rawBooking.patientEmail ?? rawBooking.PatientEmail ?? 'N/A',
      patientAddress: rawBooking.patientAddress ?? rawBooking.PatientAddress ?? 'N/A',
      nursingId: rawBooking.nursingId ?? rawBooking.NursingId ?? 'N/A',
      nursingName: rawBooking.nursingName ?? rawBooking.NursingName ?? 'N/A',
      nursingDescription: rawBooking.nursingDescription ?? rawBooking.NursingDescription ?? 'N/A',
      appointmentId: rawBooking.appointmentId ?? rawBooking.AppointmentId ?? 'N/A',
      medicalCondition: rawBooking.medicalCondition ?? rawBooking.MedicalCondition ?? 'Not specified',
      date: rawBooking.date ?? rawBooking.Date ?? rawBooking.appointmentDate ?? new Date().toISOString().split('T')[0],
      time: rawBooking.time ?? rawBooking.Time ?? rawBooking.appointmentTime ?? '00:00:00',
      totalPrice: Number(rawBooking.totalPrice ?? rawBooking.TotalPrice ?? rawBooking.price ?? 0),
      isAccepted: serverIsAccepted,
      status,
      filePath: rawBooking.filePath ?? rawBooking.FilePath ?? rawBooking.file_path ?? null,
      createdAt: rawBooking.createdAt ?? rawBooking.CreatedAt ?? rawBooking.created_at ?? new Date().toISOString(),
      notes: rawBooking.notes ?? rawBooking.Notes ?? rawBooking.description ?? '',
      rejectionReason: rawBooking.rejectionReason ?? rawBooking.RejectionReason ?? ''
    };
  },

  processApiResponse: (response) => {
    if (!response?.data) return [];

    let bookingsData = [];
    
    if (Array.isArray(response.data)) {
      bookingsData = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      bookingsData = response.data.data;
    } else if (response.data.bookings && Array.isArray(response.data.bookings)) {
      bookingsData = response.data.bookings;
    } else if (typeof response.data === 'object') {
      bookingsData = [response.data];
    }

    const uniqueBookings = new Map();
    bookingsData.forEach((booking, index) => {
      const key = booking.id || booking.bookingId || JSON.stringify(booking);
      if (!uniqueBookings.has(key)) {
        uniqueBookings.set(key, DataProcessor.processBooking(booking, index));
      }
    });

    return Array.from(uniqueBookings.values());
  }
};

// Modern filtering and sorting utilities
const useBookingFilters = (bookings) => {
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchTerm: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  const filteredAndSortedBookings = useMemo(() => {
    let result = [...bookings];

    if (filters.status !== 'all') {
      result = result.filter(booking => {
        switch (filters.status) {
          case 'pending': return booking.status === 'Pending';
          case 'accepted': return booking.status === 'Accepted';
          default: return true;
        }
      });
    }

    if (filters.dateRange !== 'all') {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      
      result = result.filter(booking => {
        const bookingTime = new Date(booking.date).getTime();
        switch (filters.dateRange) {
          case 'today': return bookingTime >= now - dayMs && bookingTime <= now + dayMs;
          case 'week': return bookingTime >= now - 7 * dayMs;
          case 'month': return bookingTime >= now - 30 * dayMs;
          default: return true;
        }
      });
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(booking => 
        [booking.patientName, booking.patientPhone, booking.patientId, 
         booking.medicalCondition, booking.nursingName]
          .some(field => field?.toLowerCase().includes(searchLower))
      );
    }

    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (['date', 'createdAt'].includes(sortConfig.key)) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortConfig.key === 'totalPrice') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }
      
      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortConfig.direction === 'asc' ? result : -result;
    });

    return result;
  }, [bookings, filters, sortConfig]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  return {
    filters,
    setFilters,
    sortConfig,
    handleSort,
    filteredAndSortedBookings
  };
};

// Main component
const ManageBookings = () => {
  const context = useOutletContext() || {};
  const { labId, accessToken: contextAccessToken } = context;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const authData = useMemo(() => ({
    userId: labId || user?.id || user?.Id || user?.userId,
    accessToken: contextAccessToken || user?.accessToken
  }), [labId, user, contextAccessToken]);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const [viewImage, setViewImage] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [corsError, setCorsError] = useState(false);
  
  const { alert, showAlert, hideAlert } = useAlert();
  const { loading: actionLoading, actionType, executeAction } = useAsyncAction();
  const {
    filters,
    setFilters,
    sortConfig,
    handleSort,
    filteredAndSortedBookings
  } = useBookingFilters(bookings);

  const apiClient = useMemo(() => {
    if (!authData.accessToken) return null;
    
    return new ModernApiClient('https://physiocareapp.runasp.net/api/v1', {
      'Authorization': `Bearer ${authData.accessToken}`,
      'Accept': '*/*'
    });
  }, [authData.accessToken]);

  const apiEndpoints = useMemo(() => 
    authData.userId ? createApiEndpoints(authData.userId) : null, 
    [authData.userId]
  );

  const fetchBookings = useCallback(async () => {
    if (!apiClient || !apiEndpoints) {
      showAlert('warning', 'Authentication required. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setLastRefresh(new Date());
      setCorsError(false);

      const response = await apiClient.get(apiEndpoints.bookings.getAll);
      const processedBookings = DataProcessor.processApiResponse(response);

      setBookings(processedBookings);

      showAlert('success', `Successfully loaded ${processedBookings.length} booking(s).`);
    } catch (error) {
      console.error('Fetch bookings error:', error);
      
      if (error instanceof ApiError) {
        if (error.isCorsError) {
          setCorsError(true);
          showAlert('danger', 'Connection error. Please check your internet connection.');
        } else if (error.status === 401) {
          showAlert('danger', 'Authentication expired. Please log in again.');
        } else if (error.status === 403) {
          showAlert('danger', 'Access denied. You do not have permission.');
        } else if (error.status === 404) {
          setBookings([]);
          showAlert('info', 'No bookings found.');
        } else {
          showAlert('danger', `Failed to load bookings: ${error.message}`);
        }
      } else {
        showAlert('danger', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [apiClient, apiEndpoints, showAlert]);

  const handleAcceptBooking = useCallback(async (bookingId) => {
    if (!DataProcessor.isValidUUID(bookingId)) {
      showAlert('danger', 'Invalid booking ID format.');
      return;
    }

    return executeAction(bookingId, 'accept', async () => {
      try {
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, isAccepted: true, status: 'Accepted' } : b
        ));

        const patchData = [{
          op: "replace",
          path: "/IsAccepted",
          value: true
        }];

        await apiClient.patch(
          apiEndpoints.bookings.accept(bookingId),
          patchData,
          { 'Content-Type': 'application/json-patch+json' }
        );

        showAlert('success', 'Booking accepted successfully!');
        setTimeout(() => fetchBookings(), 2000);
      } catch (error) {
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, isAccepted: null, status: 'Pending' } : b
        ));

        const errorMessage = error instanceof ApiError
          ? `Failed to accept booking: ${error.message}`
          : 'Failed to accept booking';
        showAlert('danger', errorMessage);
        throw error;
      }
    });
  }, [executeAction, apiClient, apiEndpoints, showAlert, fetchBookings]);

  const handleRejectBooking = useCallback(async (bookingId) => {
    if (!DataProcessor.isValidUUID(bookingId)) {
      showAlert('danger', 'Invalid booking ID format.');
      return;
    }

    return executeAction(bookingId, 'reject', async () => {
      try {
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, isAccepted: false, status: 'Pending' } : b
        ));

        const patchData = [{
          op: "replace",
          path: "/IsAccepted",
          value: false
        }];

        await apiClient.patch(
          apiEndpoints.bookings.reject(bookingId),
          patchData,
          { 'Content-Type': 'application/json-patch+json' }
        );

        showAlert('success', 'Booking rejected successfully!');
        setTimeout(() => fetchBookings(), 2000);
      } catch (error) {
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, isAccepted: null, status: 'Pending' } : b
        ));

        const errorMessage = error instanceof ApiError
          ? `Failed to reject booking: ${error.message}`
          : 'Failed to reject booking';
        showAlert('danger', errorMessage);
        throw error;
      }
    });
  }, [executeAction, apiClient, apiEndpoints, showAlert, fetchBookings]);

  const handleDeleteBooking = useCallback(async (bookingId) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    return executeAction(bookingId, 'delete', async () => {
      try {
        await apiClient.delete(apiEndpoints.bookings.delete(bookingId));
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        showAlert('success', 'Booking deleted successfully!');
        setTimeout(() => fetchBookings(), 2000);
      } catch (error) {
        const errorMessage = error instanceof ApiError
          ? `Failed to delete booking: ${error.message}`
          : 'Failed to delete booking';
        showAlert('danger', errorMessage);
        throw error;
      }
    });
  }, [executeAction, apiClient, apiEndpoints, showAlert, fetchBookings]);

  const handleViewPaymentImage = useCallback(async (bookingId, filePath) => {
    if (!filePath) {
      showAlert('warning', 'No receipt image available.');
      return;
    }

    // Validate image file extension
    const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!validImageExtensions.some(ext => filePath.toLowerCase().endsWith(ext))) {
      showAlert('warning', 'Invalid image file format.');
      return;
    }

    try {
      setImageLoading(prev => ({ ...prev, [bookingId]: true }));
      
      const filename = filePath; // filePath is just the filename
      const imageUrl = `https://physiocareapp.runasp.net/api/v1/${apiEndpoints.bookings.getImage(filename)}`;
      setViewImage(imageUrl);
    } catch (error) {
      showAlert('danger', 'Failed to load payment receipt.');
    } finally {
      setImageLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  }, [apiEndpoints, showAlert]);

  const getStatusBadge = useCallback((booking) => {
    const badgeText = booking.status;
    const badgeClass = booking.status === 'Accepted' ? 'bg-success' : 'bg-warning text-dark';
    
    return (
      <span className={`badge ${badgeClass} fs-6 px-3 py-2`}>
        {badgeText}
      </span>
    );
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }, []);

  const formatDate = useCallback((dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const formatTime = useCallback((timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  }, []);

  const getSortIcon = useCallback((columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <i className="bi bi-arrow-down-up text-muted ms-1"></i>;
    }
    return sortConfig.direction === 'asc' 
      ? <i className="bi bi-arrow-up text-primary ms-1"></i>
      : <i className="bi bi-arrow-down text-primary ms-1"></i>;
  }, [sortConfig]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && authData.accessToken && authData.userId) {
      fetchBookings();
    }
  }, [authLoading, isAuthenticated, authData.accessToken, authData.userId, fetchBookings]);

  useEffect(() => {
    if (!authData.accessToken || !authData.userId) return;

    const refreshInterval = setInterval(() => {
      fetchBookings();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [authData.accessToken, authData.userId, fetchBookings]);

  if (authLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Authentication Required</h4>
          <p>Please log in to access your bookings.</p>
        </div>
      </div>
    );
  }

  const isAnyActionLoading = Object.values(actionLoading).some(Boolean);
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const acceptedCount = bookings.filter(b => b.status === 'Accepted').length;

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-calendar-check me-2"></i>
                Manage Bookings
              </h2>
              <small className="text-muted">
                {lastRefresh && `Last updated: ${lastRefresh.toLocaleTimeString()}`}
              </small>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-outline-secondary"
                onClick={() => fetchBookings()}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                  <i className="bi bi-calendar-check text-primary fs-4"></i>
                </div>
              </div>
              <h5 className="card-title mb-1">{bookings.length}</h5>
              <p className="card-text text-muted small">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                  <i className="bi bi-clock text-warning fs-4"></i>
                </div>
              </div>
              <h5 className="card-title mb-1">{pendingCount}</h5>
              <p className="card-text text-muted small">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="rounded-circle bg-success bg-opacity-10 p-3">
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>
              </div>
              <h5 className="card-title mb-1">{acceptedCount}</h5>
              <p className="card-text text-muted small">Accepted</p>
            </div>
          </div>
        </div>
      </div>

      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          <div className="d-flex align-items-center">
            <i className={`bi ${
              alert.type === 'success' ? 'bi-check-circle' :
              alert.type === 'danger' ? 'bi-exclamation-triangle' :
              alert.type === 'warning' ? 'bi-exclamation-triangle' :
              'bi-info-circle'
            } me-2`}></i>
            <div className="flex-grow-1">{alert.message}</div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={hideAlert}
            aria-label="Close"
          ></button>
        </div>
      )}

      {corsError && (
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Connection Error</h4>
          <p>Unable to connect to the server. This might be due to:</p>
          <ul>
            <li>Network connectivity issues</li>
            <li>Server maintenance</li>
            <li>CORS configuration</li>
          </ul>
          <hr />
          <button className="btn btn-outline-danger" onClick={() => fetchBookings()}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Try Again
          </button>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Status Filter</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date Range</label>
              <select
                className="form-select"
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Search</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by patient name, phone, condition..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                />
                {filters.searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            Bookings ({filteredAndSortedBookings.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {loading && bookings.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading bookings...</p>
            </div>
          ) : filteredAndSortedBookings.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">No bookings found</h5>
              <p className="text-muted">
                {bookings.length === 0 
                  ? "You don't have any bookings yet." 
                  : "No bookings match your current filters."
                }
              </p>
              {bookings.length > 0 && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setFilters({ status: 'all', dateRange: 'all', searchTerm: '' })}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th
                      className="cursor-pointer user-select-none"
                      onClick={() => handleSort('patientName')}
                    >
                      Patient
                      {getSortIcon('patientName')}
                    </th>
                    <th
                      className="cursor-pointer user-select-none"
                      onClick={() => handleSort('date')}
                    >
                      Date & Time
                      {getSortIcon('date')}
                    </th>
                    <th
                      className="cursor-pointer user-select-none"
                      onClick={() => handleSort('nursingName')}
                    >
                      Service
                      {getSortIcon('nursingName')}
                    </th>
                    <th
                      className="cursor-pointer user-select-none"
                      onClick={() => handleSort('totalPrice')}
                    >
                      Price
                      {getSortIcon('totalPrice')}
                    </th>
                    <th
                      className="cursor-pointer user-select-none"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {getSortIcon('status')}
                    </th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <div>
                          <div className="fw-semibold">{booking.patientName}</div>
                          <small className="text-muted">
                            <i className="bi bi-telephone me-1"></i>
                            {booking.patientPhone}
                          </small>
                          {booking.medicalCondition !== 'Not specified' && (
                            <div>
                              <small className="text-info">
                                <i className="bi bi-heart-pulse me-1"></i>
                                {booking.medicalCondition}
                              </small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">
                            <i className="bi bi-calendar me-1"></i>
                            {formatDate(booking.date)}
                          </div>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {formatTime(booking.time)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">{booking.nursingName}</div>
                          {booking.nursingDescription !== 'N/A' && (
                            <small className="text-muted">
                              {booking.nursingDescription.length > 50
                                ? `${booking.nursingDescription.substring(0, 50)}...`
                                : booking.nursingDescription
                              }
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold text-success">
                          {formatCurrency(booking.totalPrice)}
                        </span>
                      </td>
                      <td>{getStatusBadge(booking)}</td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          {booking.status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleAcceptBooking(booking.id)}
                                disabled={actionLoading[booking.id]}
                                title="Accept booking"
                              >
                                {actionLoading[booking.id] && actionType[booking.id] === 'accept' ? (
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                ) : (
                                  <i className="bi bi-check me-1"></i>
                                )}
                                Accept
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRejectBooking(booking.id)}
                                disabled={actionLoading[booking.id]}
                                title="Reject booking"
                              >
                                {actionLoading[booking.id] && actionType[booking.id] === 'reject' ? (
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                ) : (
                                  <i className="bi bi-x me-1"></i>
                                )}
                                Reject
                              </button>
                            </>
                          )}
                          {booking.filePath && (
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => handleViewPaymentImage(booking.id, booking.filePath)}
                              disabled={imageLoading[booking.id]}
                              title="View payment receipt"
                            >
                              {imageLoading[booking.id] ? (
                                <span className="spinner-border spinner-border-sm me-1"></span>
                              ) : (
                                <i className="bi bi-image me-1"></i>
                              )}
                              Receipt
                            </button>
                          )}
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteBooking(booking.id)}
                            disabled={actionLoading[booking.id]}
                            title="Delete booking"
                          >
                            {actionLoading[booking.id] && actionType[booking.id] === 'delete' ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <i className="bi bi-trash me-1"></i>
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {viewImage && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setViewImage(null)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5 className="modal-title">Payment Receipt</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewImage(null)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={viewImage}
                  alt="Payment Receipt"
                  className="img-fluid rounded"
                  style={{ maxHeight: '70vh' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div style={{ display: 'none' }} className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Failed to load image. The file might not exist or be accessible.
                </div>
              </div>
              <div className="modal-footer">
                <a
                  href={viewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <i className="bi bi-download me-1"></i>
                  View Full Size
                </a>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewImage(null)}
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

export default ManageBookings;