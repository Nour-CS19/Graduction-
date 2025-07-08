import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Eye, EyeOff, MapPin, User, Mail, Phone, Building, Lock, Stethoscope, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from "../../Pages/AuthPage";

// Define constants
const API_BASE_URL = "https://physiocareapp.runasp.net/api/v1";
const NOMINATIM_API = "https://nominatim.openstreetmap.org/reverse";
const MAX_RETRIES = 3;

const RegistrationDoctor = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [specializations, setSpecializations] = useState([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(true);
  
  const [formData, setFormData] = useState({
    ClinicName: "",
    SpecializationId: "",
    FullName: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
    PhoneNumber: "",
    Address: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Helper function to get current access token
  const getAccessToken = useCallback(() => {
    // Try multiple sources for the token
    const token = user?.accessToken || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ No access token found');
      return null;
    }
    
    console.log('✅ Access token retrieved successfully');
    return token;
  }, [user]);

  // Helper function to create axios config with authorization
  const createAuthConfig = useCallback((additionalHeaders = {}) => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token available. Please log in again.');
    }

    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...additionalHeaders
      }
    };
  }, [getAccessToken]);

  // Helper function to handle token refresh
  const attemptRefreshToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.warn('⚠️ No refresh token available');
      return null;
    }

    try {
      console.log('🔄 Attempting to refresh token...');
      const response = await axios.post(`${API_BASE_URL}/Account/refresh-token`, {
        refreshToken,
      });
      
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Update localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      console.log('✅ Token refreshed successfully');
      return accessToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      logout();
      return null;
    }
  }, [logout]);

  // Helper function for API calls with automatic retry on auth failure
  const makeAuthenticatedRequest = useCallback(async (requestFn, isRetry = false) => {
    try {
      const config = createAuthConfig();
      return await requestFn(config);
    } catch (error) {
      if (error.response?.status === 401 && !isRetry && retryCount < MAX_RETRIES) {
        console.log('🔄 Received 401, attempting token refresh...');
        const newToken = await attemptRefreshToken();
        
        if (newToken) {
          setRetryCount(prev => prev + 1);
          // Retry the request with new token
          const newConfig = {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              ...createAuthConfig().headers
            }
          };
          return await requestFn(newConfig);
        }
      }
      throw error;
    }
  }, [createAuthConfig, attemptRefreshToken, retryCount]);

  // Add Bootstrap CSS and JS
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js';
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      setErrors({ submit: 'Please log in to access doctor registration.' });
      return;
    }

    // Clear auth error if user becomes authenticated
    if (errors.submit?.includes('log in')) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  }, [isAuthenticated, errors.submit]);

  // Fetch specializations with proper authorization
  useEffect(() => {
    const fetchSpecializations = async () => {
      if (!isAuthenticated) {
        setLoadingSpecializations(false);
        return;
      }

      try {
        console.log('📋 Fetching specializations...');
        
        const response = await makeAuthenticatedRequest(async (config) => {
          return await axios.get(`${API_BASE_URL}/Specializations/GetAll`, config);
        });

        console.log('✅ Specializations fetched:', response.data);
        setSpecializations(response.data);
        
        if (response.data.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            SpecializationId: response.data[0].id 
          }));
        }
      } catch (error) {
        console.error('❌ Error fetching specializations:', error);
        let errorMessage = 'Failed to load specializations. Please refresh the page.';
        
        if (error.response?.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          logout();
        } else if (error.response?.status === 403) {
          errorMessage = 'You do not have permission to access specializations.';
        }
        
        setErrors(prev => ({ ...prev, submit: errorMessage }));
      } finally {
        setLoadingSpecializations(false);
      }
    };

    fetchSpecializations();
  }, [isAuthenticated, makeAuthenticatedRequest, logout]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ 
        ...prev, 
        Address: 'Geolocation is not supported by your browser' 
      }));
      return;
    }

    setLocationLoading(true);
    setErrors(prev => ({ ...prev, Address: '' }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log('📍 Getting location coordinates...');
          const { latitude, longitude } = position.coords;
          
          const response = await axios.get(NOMINATIM_API, {
            params: {
              lat: latitude,
              lon: longitude,
              format: "json",
              "accept-language": "en",
            },
          });
          
          const formattedAddress = response.data.display_name || 
                                 `${latitude}, ${longitude}`;
          
          setFormData(prev => ({ ...prev, Address: formattedAddress }));
          console.log('✅ Location retrieved:', formattedAddress);
        } catch (error) {
          console.error('❌ Error fetching location:', error);
          setErrors(prev => ({ 
            ...prev, 
            Address: 'Unable to fetch location details' 
          }));
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        let locationError = 'Unable to get current location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            locationError = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            locationError = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            locationError = 'Location request timed out';
            break;
        }
        
        setErrors(prev => ({ ...prev, Address: locationError }));
        setLocationLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{10,15}$/;

    if (!formData.ClinicName.trim()) {
      newErrors.ClinicName = 'Clinic name is required';
    }
    
    if (!formData.FullName.trim()) {
      newErrors.FullName = 'Full name is required';
    }
    
    if (!formData.Email.trim()) {
      newErrors.Email = 'Email is required';
    } else if (!emailRegex.test(formData.Email.trim())) {
      newErrors.Email = 'Invalid email format';
    }
    
    if (!formData.Password) {
      newErrors.Password = 'Password is required';
    } else if (formData.Password.length < 6) {
      newErrors.Password = 'Password must be at least 6 characters';
    }
    
    if (!formData.ConfirmPassword) {
      newErrors.ConfirmPassword = 'Confirm password is required';
    } else if (formData.Password !== formData.ConfirmPassword) {
      newErrors.ConfirmPassword = 'Passwords do not match';
    }
    
    if (!formData.PhoneNumber.trim()) {
      newErrors.PhoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.PhoneNumber.replace(/\s/g, ''))) {
      newErrors.PhoneNumber = 'Phone number must be 10-15 digits, optionally starting with +';
    }
    
    if (!formData.Address.trim()) {
      newErrors.Address = 'Address is required';
    }
    
    if (!formData.SpecializationId) {
      newErrors.SpecializationId = 'Specialization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseServerError = (error) => {
    // Handle string errors
    if (typeof error === 'string' && error) {
      if (error.includes('InvalidOperationException') && 
          error.includes('connection does not have any active transactions')) {
        return 'Server database error occurred. This is likely a temporary issue. Please try again.';
      }
      if (error.includes('RollbackTransactionAsync')) {
        return 'Registration failed due to a server transaction error. Please try again.';
      }
      return error;
    }

    // Handle axios error responses
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Handle HTTP status codes
    switch (error.response?.status) {
      case 400:
        return 'Invalid data provided. Please check your inputs and try again.';
      case 401:
        return 'Unauthorized. Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to register a doctor.';
      case 409:
        return 'An account with this email already exists. Please use a different email address.';
      case 422:
        return 'Validation failed. Please check your inputs.';
      case 500:
        return 'Server error occurred. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'Registration failed due to a server error. Please try again later.';
    }
  };

  const handleSubmit = async (isRetry = false) => {
    // Check authentication first
    if (!isAuthenticated) {
      setErrors({ submit: 'Please log in to register a doctor.' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: '' }));

    try {
      console.log('🏥 Submitting doctor registration...', 
                  isRetry ? `(Retry ${retryCount + 1})` : '');

      // Prepare form data
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Log form data for debugging
      console.log('📤 Form data being sent:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Make the authenticated request
      const response = await makeAuthenticatedRequest(async (config) => {
        return await axios.post(
          `${API_BASE_URL}/Account/RegisterDoctor`, 
          formDataToSend,
          {
            ...config,
            headers: {
              ...config.headers,
              'Content-Type': 'multipart/form-data',
            }
          }
        );
      }, isRetry);

      console.log('✅ Doctor registration successful:', response.data);
      
      // Reset form and show success
      setSubmitSuccess(true);
      setRetryCount(0);
      setFormData({
        ClinicName: "",
        SpecializationId: specializations.length > 0 ? specializations[0].id : "",
        FullName: "",
        Email: "",
        Password: "",
        ConfirmPassword: "",
        PhoneNumber: "",
        Address: "",
      });
      setErrors({});

    } catch (error) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';

      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          const normalizedKey = key.toLowerCase();
          validationErrors[normalizedKey] = Array.isArray(messages) 
            ? messages.join(', ') 
            : messages;
        });
        setErrors(validationErrors);
        return;
      }

      // Handle authentication errors
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        logout();
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to register doctors.';
      } else if (!error.response) {
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        errorMessage = parseServerError(error);
      }

      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      setErrors({});
      handleSubmit(true);
    }
  };

  // Show authentication error if not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" 
           style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)'}}>
        <div className="card shadow-lg border-0" style={{maxWidth: '400px', width: '100%', borderRadius: '1rem'}}>
          <div className="card-body p-5 text-center">
            <div className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-circle bg-warning bg-opacity-10" 
                 style={{width: '64px', height: '64px'}}>
              <AlertTriangle className="text-warning" size={32} />
            </div>
            <h2 className="h4 fw-bold text-dark mb-3">Authentication Required</h2>
            <p className="text-muted mb-4">
              You need to be logged in to access the doctor registration page.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="btn btn-primary w-100 py-2 fw-medium"
              style={{borderRadius: '0.75rem'}}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show success screen
  if (submitSuccess) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" 
           style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)'}}>
        <div className="card shadow-lg border-0" style={{maxWidth: '400px', width: '100%', borderRadius: '1rem'}}>
          <div className="card-body p-5 text-center">
            <div className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-circle bg-success bg-opacity-10" 
                 style={{width: '64px', height: '64px'}}>
              <svg className="text-success" width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="h4 fw-bold text-dark mb-3">Registration Successful!</h2>
            <p className="text-muted mb-4">
              The doctor profile has been registered successfully. A confirmation email will be sent shortly.
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="btn btn-primary w-100 py-2 fw-medium"
              style={{borderRadius: '0.75rem'}}
            >
              Register Another Doctor
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-vh-100 py-5 px-3" 
         style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)'}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-6">
            <div className="card shadow-lg border-0" 
                 style={{borderRadius: '1.5rem', overflow: 'hidden'}}>
              
              {/* Header */}
              <div className="card-header text-white p-4" 
                   style={{background: 'linear-gradient(135deg, #1976d2 0%, #3f51b5 100%)'}}>
                <h1 className="h3 fw-bold mb-2 d-flex align-items-center">
                  <Stethoscope className="me-2" size={24} />
                  Doctor Registration
                </h1>
                <p className="mb-0 opacity-90">
                  Logged in as: {user?.email || 'Unknown'} ({user?.role || 'Unknown Role'})
                </p>
              </div>

              <div className="card-body p-4">
                {/* Loading indicator */}
                {loadingSpecializations && (
                  <div className="alert alert-primary d-flex align-items-center mb-4">
                    <div className="spinner-border spinner-border-sm me-3" role="status"></div>
                    <span className="fw-medium">Loading specializations...</span>
                  </div>
                )}

                {/* Error display */}
                {errors.submit && (
                  <div className="alert alert-danger d-flex align-items-start mb-4">
                    <AlertTriangle className="me-2 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-grow-1">
                      <strong className="me-2">Registration Error:</strong> 
                      <div className="mt-1">{errors.submit}</div>
                      {retryCount < MAX_RETRIES && errors.submit.includes('server') && (
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
                          <strong>Maximum retry attempts reached.</strong> 
                          Please try again later or contact support.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Clinic Information Section */}
                <div className="mb-5">
                  <h5 className="fw-semibold text-dark border-bottom pb-2 mb-4">
                    <Building className="me-2" size={18} />
                    Clinic Information
                  </h5>
                  
                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      <Building className="me-2" size={16} />
                      Clinic Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="ClinicName"
                      value={formData.ClinicName}
                      onChange={handleInputChange}
                      className={`form-control ${errors.ClinicName ? 'is-invalid' : ''}`}
                      placeholder="Enter your clinic name"
                      disabled={isSubmitting || loadingSpecializations}
                      style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
                    />
                    {errors.ClinicName && <div className="invalid-feedback">{errors.ClinicName}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      <Stethoscope className="me-2" size={16} />
                      Specialization <span className="text-danger">*</span>
                    </label>
                    <select
                      name="SpecializationId"
                      value={formData.SpecializationId}
                      onChange={handleInputChange}
                      className={`form-select ${errors.SpecializationId ? 'is-invalid' : ''}`}
                      disabled={isSubmitting || loadingSpecializations}
                      style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map(spec => (
                        <option key={spec.id} value={spec.id}>
                          {spec.nameEN} - {spec.nameAR}
                        </option>
                      ))}
                    </select>
                    {errors.SpecializationId && <div className="invalid-feedback">{errors.SpecializationId}</div>}
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="mb-5">
                  <h5 className="fw-semibold text-dark border-bottom pb-2 mb-4">
                    <User className="me-2" size={18} />
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
                      disabled={isSubmitting || loadingSpecializations}
                      style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
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
                      disabled={isSubmitting || loadingSpecializations}
                      style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
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
                      disabled={isSubmitting || loadingSpecializations}
                      style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
                    />
                    {errors.PhoneNumber && <div className="invalid-feedback">{errors.PhoneNumber}</div>}
                  </div>
                </div>

                {/* Password Section */}
                <div className="mb-5">
                  <h5 className="fw-semibold text-dark border-bottom pb-2 mb-4">
                    <Lock className="me-2" size={18} />
                    Account Security
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
                        disabled={isSubmitting || loadingSpecializations}
                        style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-muted"
                        disabled={isSubmitting || loadingSpecializations}
                        style={{border: 'none', background: 'none'}}
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
                        disabled={isSubmitting || loadingSpecializations}
                        style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-muted"
                        disabled={isSubmitting || loadingSpecializations}
                        style={{border: 'none', background: 'none'}}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      {errors.ConfirmPassword && <div className="invalid-feedback">{errors.ConfirmPassword}</div>}
                    </div>
                  </div>
                </div>
{/* Location Section - Continuation */}
<div className="mb-5">
                  <h5 className="fw-semibold text-dark border-bottom pb-2 mb-4">
                    <MapPin className="me-2" size={18} />
                    Location Information
                  </h5>
                  
                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      <MapPin className="me-2" size={16} />
                      Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="Address"
                        value={formData.Address}
                        onChange={handleInputChange}
                        className={`form-control ${errors.Address ? 'is-invalid' : ''}`}
                        placeholder="Enter your clinic address"
                        disabled={isSubmitting || loadingSpecializations || locationLoading}
                        style={{borderRadius: '0.75rem 0 0 0.75rem', padding: '0.75rem 1rem'}}
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="btn btn-outline-primary"
                        disabled={isSubmitting || loadingSpecializations || locationLoading}
                        style={{borderRadius: '0 0.75rem 0.75rem 0'}}
                        title="Get current location"
                      >
                        {locationLoading ? (
                          <div className="spinner-border spinner-border-sm" role="status"></div>
                        ) : (
                          <MapPin size={16} />
                        )}
                      </button>
                      {errors.Address && <div className="invalid-feedback">{errors.Address}</div>}
                    </div>
                    <div className="form-text">
                      <small className="text-muted">
                        Click the location button to automatically fill your current address
                      </small>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-3">
                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting || loadingSpecializations}
                    className="btn btn-primary btn-lg fw-semibold py-3"
                    style={{
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #1976d2 0%, #3f51b5 100%)',
                      border: 'none'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Registering Doctor...
                      </>
                    ) : (
                      <>
                        <Stethoscope className="me-2" size={20} />
                        Register Doctor
                      </>
                    )}
                  </button>

                  {/* Progress indicator */}
                  {isSubmitting && (
                    <div className="text-center">
                      <small className="text-muted">
                        Please wait while we process the registration...
                      </small>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-4 p-3 bg-light rounded" style={{borderRadius: '0.75rem'}}>
                  <small className="text-muted">
                    <strong>Note:</strong> After successful registration, the doctor will receive a confirmation email 
                    with login credentials and account activation instructions.
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

export default RegistrationDoctor;