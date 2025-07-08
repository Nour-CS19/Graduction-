import React, { useState, useEffect } from "react";
import { Eye, EyeOff, MapPin, User, Mail, Phone, Building, Lock, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../../Pages/AuthPage'; // Import the useAuth hook

// Define constants
const API_BASE_URL = "https://physiocareapp.runasp.net/api/v1";
const NOMINATIM_API = "https://nominatim.openstreetmap.org/reverse";
const MAX_RETRIES = 3;
const FETCH_TIMEOUT = 10000; // 10 seconds timeout for fetch

const RegistrationLaboratory = () => {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
    PhoneNumber: "",
    ExperienceYears: "",
    OpenAt: "",
    ClosedAt: "",
    Address: "",
    UserName: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Add Bootstrap CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Check authentication status
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setErrors({ auth: 'You must be logged in to register a laboratory. Please login first.' });
    }
  }, [isAuthenticated, authLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-populate UserName with Email if UserName field exists
    if (name === 'Email') {
      setFormData(prev => ({ ...prev, [name]: value, UserName: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, Address: 'Geolocation is not supported by your browser' }));
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`${NOMINATIM_API}?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
          const text = await response.text();
          if (!text) {
            throw new Error('Empty response from Nominatim API');
          }
          let data;
          try {
            data = JSON.parse(text);
          } catch (error) {
            console.error('Failed to parse Nominatim response as JSON:', error);
            throw new Error('Invalid JSON response from Nominatim API');
          }
          const formattedAddress = data.display_name ? data.display_name : 'Unable to format address';
          setFormData(prev => ({ ...prev, Address: formattedAddress }));
        } catch (error) {
          console.error('Error fetching location:', error);
          setErrors(prev => ({ ...prev, Address: `Unable to fetch location: ${error.message}` }));
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setErrors(prev => ({ ...prev, Address: 'Unable to get current location' }));
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{10,15}$/;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!formData.FullName.trim()) newErrors.FullName = 'Full name is required';
    if (!formData.Email.trim()) {
      newErrors.Email = 'Email is required';
    } else if (!emailRegex.test(formData.Email)) {
      newErrors.Email = 'Invalid email format';
    }
    if (!formData.Password) newErrors.Password = 'Password is required';
    else if (formData.Password.length < 6) newErrors.Password = 'Password must be at least 6 characters';
    if (!formData.ConfirmPassword) {
      newErrors.ConfirmPassword = 'Confirm password is required';
    } else if (formData.Password !== formData.ConfirmPassword) {
      newErrors.ConfirmPassword = 'Passwords do not match';
    }
    if (!formData.PhoneNumber.trim()) newErrors.PhoneNumber = 'Phone number is required';
    else if (!phoneRegex.test(formData.PhoneNumber.replace(/\s/g, ''))) {
      newErrors.PhoneNumber = 'Phone number must be 10-15 digits, optionally starting with +';
    }
    if (!formData.ExperienceYears) {
      newErrors.ExperienceYears = 'Experience years is required';
    } else {
      const years = parseInt(formData.ExperienceYears, 10);
      if (isNaN(years) || years < 0) {
        newErrors.ExperienceYears = 'Experience years must be a positive number';
      }
    }
    if (!formData.OpenAt) {
      newErrors.OpenAt = 'Opening time is required';
    } else if (!timeRegex.test(formData.OpenAt)) {
      newErrors.OpenAt = 'Invalid time format (use HH:mm)';
    }
    if (!formData.ClosedAt) {
      newErrors.ClosedAt = 'Closing time is required';
    } else if (!timeRegex.test(formData.ClosedAt)) {
      newErrors.ClosedAt = 'Invalid time format (use HH:mm)';
    }
    if (!formData.Address.trim()) newErrors.Address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAuthHeaders = () => {
    const accessToken = user?.accessToken || localStorage.getItem('accessToken');
    
    if (!accessToken) {
      throw new Error('No access token available. Please login again.');
    }

    return {
      'Authorization': `Bearer ${accessToken}`,
      ...(user?.id && { 'X-User-Id': user.id }),
    };
  };

  const parseServerError = (error, response) => {
    if (typeof error === 'string' && error) {
      return error;
    }

    if (response?.data) {
      if (typeof response.data === 'string') return response.data;
      if (response.data.message) return response.data.message;
      if (response.data.title) return response.data.title;
    }

    switch (response?.status) {
      case 400:
        return 'Invalid data provided. Please check your inputs and try again.';
      case 401:
        return 'Authentication failed. Please login again.';
      case 403:
        return 'You do not have permission to register laboratories. Please contact support.';
      case 409:
        return 'An account with this email already exists. Please use a different email address.';
      case 500:
        return 'Server error occurred. Please try again later or contact support.';
      default:
        return 'Registration failed due to a server error. Please try again later.';
    }
  };

  const handleSubmit = async () => {
    // Check authentication first
    if (!isAuthenticated || !user) {
      setErrors({ auth: 'You must be logged in to register a laboratory. Please login first.' });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      console.log('Submitting laboratory registration with authentication...');
      console.log('Current user:', { id: user.id, email: user.email, role: user.role });

      // Prepare FormData for multipart/form-data request
      const dataToSend = new FormData();
      dataToSend.append('FullName', formData.FullName);
      dataToSend.append('Email', formData.Email);
      dataToSend.append('UserName', formData.Email); // Use email as username
      dataToSend.append('Password', formData.Password);
      dataToSend.append('ConfirmPassword', formData.ConfirmPassword);
      dataToSend.append('PhoneNumber', formData.PhoneNumber);
      dataToSend.append('ExperienceYears', parseInt(formData.ExperienceYears, 10));
      dataToSend.append('OpenAt', formData.OpenAt);
      dataToSend.append('ClosedAt', formData.ClosedAt);
      dataToSend.append('Address', formData.Address);
      dataToSend.append('RegisteredBy', user.id); // Track who registered this laboratory

      console.log('Request payload:', Object.fromEntries(dataToSend));

      // Get authentication headers
      const headers = getAuthHeaders();
      console.log('Request headers:', { ...headers, Authorization: headers.Authorization ? '[HIDDEN]' : 'None' });

      // Set up fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      const response = await fetch(`${API_BASE_URL}/Account/RegisterLaboratory`, {
        method: 'POST',
        headers: headers,
        body: dataToSend,
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Clear timeout if request completes

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));

      const contentType = response.headers.get('content-type');
      const text = await response.text();
      console.log('Raw response text:', text);

      if (!response.ok) {
        let errorData = text;
        if (contentType?.includes('application/json') && text) {
          try {
            errorData = JSON.parse(text);
          } catch (error) {
            console.error('Failed to parse error response as JSON:', error);
          }
        }

        console.error('Error response:', errorData);

        // Handle authentication errors specifically
        if (response.status === 401) {
          logout();
          throw new Error('Your session has expired. Please login again.');
        }

        throw new Error(parseServerError(errorData, response));
      }

      // Handle successful response
      let result = null;
      if (text) {
        if (contentType?.includes('application/json')) {
          try {
            result = JSON.parse(text);
            if (!result || typeof result !== 'object') {
              throw new Error('Invalid JSON structure');
            }
          } catch (error) {
            console.error('Failed to parse successful response as JSON:', error);
            console.error('Problematic response text:', text);
            throw new Error('Server returned invalid JSON data');
          }
        } else if (text.trim().startsWith('<!DOCTYPE html') || text.includes('<html')) {
          throw new Error('Server returned an HTML page. This may indicate a server error or authentication issue.');
        } else {
          // Handle non-JSON response (e.g., plain text)
          console.warn('Non-JSON response received:', text);
          result = { message: text || 'Registration completed' }; // Fallback to a default success object
        }
      } else {
        throw new Error('Server returned an empty response');
      }

      console.log('Registration successful:', result);

      setSubmitSuccess(true);
      setRetryCount(0);
      setFormData({
        FullName: "",
        Email: "",
        Password: "",
        ConfirmPassword: "",
        PhoneNumber: "",
        ExperienceYears: "",
        OpenAt: "",
        ClosedAt: "",
        Address: "",
        UserName: "",
      });
      setErrors({});
    } catch (error) {
      console.error('Registration error:', error);

      let errorMessage = 'Something went wrong. Please try again or contact support.';

      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
        setErrors({ submit: errorMessage });
      } else if (error.message.includes('No access token')) {
        errorMessage = 'Authentication required. Please login again.';
        setErrors({ auth: errorMessage });
      } else if (error.message.includes('session has expired')) {
        errorMessage = error.message;
        setErrors({ auth: errorMessage });
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please login again.';
        setErrors({ auth: errorMessage });
      } else if (error.message.includes('403')) {
        errorMessage = 'You do not have permission to register laboratories. Please contact support.';
        setErrors({ submit: errorMessage });
      } else if (error.message.includes('400')) {
        errorMessage = 'Invalid request data. Please check all fields and try again.';
        setErrors({ submit: errorMessage });
      } else if (error.message.includes('409')) {
        errorMessage = 'An account with this email already exists.';
        setErrors({ submit: errorMessage });
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later or contact support.';
        setErrors({ submit: errorMessage });
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
        setErrors({ submit: errorMessage });
      } else if (error.message.includes('HTML page')) {
        errorMessage = 'Unexpected server response. Please try again or contact support.';
        setErrors({ submit: errorMessage });
      } else {
        errorMessage = error.message || errorMessage;
        setErrors({ submit: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      setErrors({});
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
      handleSubmit();
    }
  };

  const handleNewRegistration = () => {
    setSubmitSuccess(false);
    setFormData({
      FullName: "",
      Email: "",
      Password: "",
      ConfirmPassword: "",
      PhoneNumber: "",
      ExperienceYears: "",
      OpenAt: "",
      ClosedAt: "",
      Address: "",
      UserName: "",
    });
    setErrors({});
    setRetryCount(0);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLocationLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-muted">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show authentication error if not logged in
  if (!isAuthenticated || errors.auth) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)' }}>
        <div className="card shadow-lg border-0" style={{ maxWidth: '400px', width: '100%', borderRadius: '1rem' }}>
          <div className="card-body p-5 text-center">
            <div className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-circle bg-danger bg-opacity-10" style={{ width: '64px', height: '64px' }}>
              <AlertTriangle className="text-danger" size={32} />
            </div>
            <h2 className="h4 fw-bold text-dark mb-3">Authentication Required</h2>
            <p className="text-muted mb-4">
              {errors.auth || 'You must be logged in to register a laboratory. Please login with your account first.'}
            </p>
            <button
              onClick={() => window.location.href = '/login'} // Adjust path as needed
              className="btn btn-primary w-100 py-2 fw-medium"
              style={{ borderRadius: '0.75rem' }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)' }}>
        <div className="card shadow-lg border-0" style={{ maxWidth: '400px', width: '100%', borderRadius: '1rem' }}>
          <div className="card-body p-5 text-center">
            <div className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-circle bg-success bg-opacity-10" style={{ width: '64px', height: '64px' }}>
              <svg className="text-success" width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="h4 fw-bold text-dark mb-3">Registration Successful!</h2>
            <p className="text-muted mb-4">The laboratory has been registered successfully. You will receive a confirmation email shortly.</p>
            <button
              onClick={handleNewRegistration}
              className="btn btn-primary w-100 py-2 fw-medium"
              style={{ borderRadius: '0.75rem' }}
            >
              Register Another Laboratory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5 px-3" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-6">
            <div className="card shadow-lg border-0" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
              <div className="card-header text-white p-4 d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #1976d2 0%, #3f51b5 100%)' }}>
                <div>
                  <h1 className="h3 fw-bold mb-1 d-flex align-items-center">
                    <Building className="me-3" size={32} />
                    Laboratory Registration
                  </h1>
                  <small className="opacity-75">Logged in as: {user?.email}</small>
                </div>
                <button
                  onClick={logout}
                  className="btn btn-light btn-sm"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>

              <div className="card-body p-4">
                {errors.submit && (
                  <div className="alert alert-danger d-flex align-items-start mb-4">
                    <AlertTriangle className="me-2 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-grow-1">
                      <strong className="me-2">Registration Error:</strong>
                      <div className="mt-1">{errors.submit}</div>
                      {retryCount < MAX_RETRIES && (
                        <button
                          onClick={handleRetry}
                          className="btn btn-outline-danger btn-sm mt-2"
                          disabled={isSubmitting}
                        >
                          <RefreshCw className="me-1" size={14} />
                          Try Again ({MAX_RETRIES - retryCount} attempts left)
                        </button>
                      )}
                      {retryCount >= MAX_RETRIES && (
                        <div className="mt-2 small">
                          <strong>Maximum retry attempts reached.</strong> Please try again later or contact support.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mb-5">
                  <h5 className="fw-semibold text-dark border-bottom pb-2 mb-4">
                    Personal Information
                  </h5>

                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      <User className="me-2" size={16} />
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="FullName"
                      value={formData.FullName}
                      onChange={handleInputChange}
                      className={`form-control ${errors.FullName ? 'is-invalid' : ''}`}
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                      style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                    />
                    {errors.FullName && <div className="invalid-feedback">{errors.FullName}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      <Mail className="me-2" size={16} />
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="Email"
                      value={formData.Email}
                      onChange={handleInputChange}
                      className={`form-control ${errors.Email ? 'is-invalid' : ''}`}
                      placeholder="your@email.com"
                      disabled={isSubmitting}
                      style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                    />
                    {errors.Email && <div className="invalid-feedback">{errors.Email}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      <Phone className="me-2" size={16} />
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      name="PhoneNumber"
                      value={formData.PhoneNumber}
                      onChange={handleInputChange}
                      className={`form-control ${errors.PhoneNumber ? 'is-invalid' : ''}`}
                      placeholder="e.g., +1234567890"
                      disabled={isSubmitting}
                      style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                    />
                    {errors.PhoneNumber && <div className="invalid-feedback">{errors.PhoneNumber}</div>}
                  </div>
                </div>

                <div className="mb-5">
                  <h5 className="fw-semibold text-dark border-bottom pb-2 mb-4">
                    Laboratory Information
                  </h5>

                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      Experience Years <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="ExperienceYears"
                      value={formData.ExperienceYears}
                      onChange={handleInputChange}
                      min="0"
                      className={`form-control ${errors.ExperienceYears ? 'is-invalid' : ''}`}
                      placeholder="Years of experience"
                      disabled={isSubmitting}
                      style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                    />
                    {errors.ExperienceYears && <div className="invalid-feedback">{errors.ExperienceYears}</div>}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <Building className="me-2" size={16} />
                        Opening Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        name="OpenAt"
                        value={formData.OpenAt}
                        onChange={handleInputChange}
                        className={`form-control ${errors.OpenAt ? 'is-invalid' : ''}`}
                        disabled={isSubmitting}
                        style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                      />
                      {errors.OpenAt && <div className="invalid-feedback">{errors.OpenAt}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <Building className="me-2" size={16} />
                        Closing Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        name="ClosedAt"
                        value={formData.ClosedAt}
                        onChange={handleInputChange}
                        className={`form-control ${errors.ClosedAt ? 'is-invalid' : ''}`}
                        disabled={isSubmitting}
                        style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                      />
                      {errors.ClosedAt && <div className="invalid-feedback">{errors.ClosedAt}</div>}
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <h5 className="fw-semibold text-dark border-bottom pb-2 mb-4">
                    Security
                  </h5>

                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      <Lock className="me-2" size={16} />
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="Password"
                        value={formData.Password}
                        onChange={handleInputChange}
                        className={`form-control pe-5 ${errors.Password ? 'is-invalid' : ''}`}
                        placeholder="Enter password"
                        disabled={isSubmitting}
                        style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-muted"
                        disabled={isSubmitting}
                        style={{ border: 'none', background: 'none' }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      {errors.Password && <div className="invalid-feedback">{errors.Password}</div>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      <Lock className="me-2" size={16} />
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="ConfirmPassword"
                        value={formData.ConfirmPassword}
                        onChange={handleInputChange}
                        className={`form-control pe-5 ${errors.ConfirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Confirm password"
                        disabled={isSubmitting}
                        style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                      />


                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-muted"
                        disabled={isSubmitting}
                        style={{ border: 'none', background: 'none' }}
                           >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      {errors.ConfirmPassword && <div className="invalid-feedback">{errors.ConfirmPassword}</div>}
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <h5 className="fw-semibold text-dark border-bottom pb-2 mb-4">
                    Location
                  </h5>

                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      <MapPin className="me-2" size={16} />
                      Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <textarea
                        name="Address"
                        value={formData.Address}
                        onChange={handleInputChange}
                        className={`form-control ${errors.Address ? 'is-invalid' : ''}`}
                        disabled={isSubmitting}
                        rows="1"
                        placeholder="Enter your laboratory address"
                        style={{ borderRadius: '0.75rem 0 0 0.75rem', padding: '0.75rem 1rem', resize: 'vertical', minHeight: '45px' }}
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading || isSubmitting}
                        className="btn btn-primary d-flex align-items-center"
                        style={{ borderRadius: '0 0.75rem 0.75rem 0', padding: '0.5rem 0.75rem' }}
                      >
                        {locationLoading ? (
                          <div className="spinner-border spinner-border-sm me-1" role="status"></div>
                        ) : (
                          <MapPin className="me-1" size={14} />
                        )}
                        {locationLoading ? 'Get...' : 'GPS'}
                      </button>
                    </div>
                    {errors.Address && <div className="text-danger small mt-1">{errors.Address}</div>}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn btn-primary w-100 py-3 fw-medium fs-5 d-flex align-items-center justify-content-center"
                    style={{ borderRadius: '0.75rem', background: 'linear-gradient(135deg, #1976d2 0%, #3f51b5 100%)', border: 'none' }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Registering Laboratory...
                      </>
                    ) : (
                      <>
                        <Building className="me-2" size={20} />
                        Register Laboratory
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Registration is performed with authenticated access using your current session.
                    {retryCount > 0 && (
                      <span> Attempt {retryCount + 1} of {MAX_RETRIES + 1}.</span>
                    )}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationLaboratory;