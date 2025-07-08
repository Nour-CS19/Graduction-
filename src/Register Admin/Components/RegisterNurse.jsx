import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff, MapPin, User, Mail, Phone, Heart, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from "../../Pages/AuthPage";
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating NurseId

const RegistrationNurse = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    NurseId: uuidv4(), // Initialize NurseId with a UUID
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

  const API_BASE_URL = "https://physiocareapp.runasp.net/api/v1";
  const NOMINATIM_API = "https://nominatim.openstreetmap.org/reverse";
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js';
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          const response = await axios.get(NOMINATIM_API, {
            params: {
              lat: latitude,
              lon: longitude,
              format: "json",
              "accept-language": "en",
            },
          });
          const formattedAddress = response.data.display_name || `${latitude}, ${longitude}`;
          setFormData(prev => ({ ...prev, Address: formattedAddress }));
        } catch (error) {
          console.error('Error fetching address:', error);
          setErrors(prev => ({ ...prev, Address: 'Unable to fetch location' }));
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
    if (!formData.Address.trim()) newErrors.Address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseServerError = (error, response) => {
    if (typeof error === 'string' && error) {
      if (error.includes('InvalidOperationException') && error.includes('connection does not have any active transactions')) {
        return 'Server database transaction error occurred. Please try again.';
      }
      if (error.includes('RollbackTransactionAsync')) {
        return 'Registration failed due to a server transaction error. Please try again.';
      }
      if (error.includes('RegisterUser')) {
        return 'User registration service encountered an error. Please verify your information and try again.';
      }
      return error;
    }

    switch (response?.status) {
      case 400:
        return 'Invalid data provided. Please check your inputs and try again.';
      case 401:
        return 'Unauthorized. Your session has expired. Please log in again.';
      case 409:
        return 'An account with this email already exists. Please use a different email address.';
      case 500:
        return 'Server error occurred. Please try again later.';
      default:
        return 'Registration failed due to a server error. Please try again later.';
    }
  };

  const attemptRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await axios.post(`${API_BASE_URL}/Account/refresh-token`, {
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

  const handleSubmit = async (isRetry = false) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    let accessToken = localStorage.getItem('accessToken');

    if (!accessToken && !isRetry) {
      setErrors({ submit: 'Please log in to register a nurse.' });
      setIsSubmitting(false);
      return;
    }

    try {
      if (isRetry) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }

      const formDataToSend = new FormData();
      formDataToSend.append('NurseId', formData.NurseId);
      formDataToSend.append('FullName', formData.FullName);
      formDataToSend.append('Email', formData.Email);
      formDataToSend.append('Password', formData.Password);
      formDataToSend.append('ConfirmPassword', formData.ConfirmPassword);
      formDataToSend.append('PhoneNumber', formData.PhoneNumber);
      formDataToSend.append('Address', formData.Address);

      console.log('Submitting nurse registration...', isRetry ? `(Retry ${retryCount + 1}/${MAX_RETRIES})` : '');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axios.post(`${API_BASE_URL}/Account/RegisterNurse`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Log the response for debugging
      console.log('Registration response:', response.status, response.data);

      // Handle empty response data
      if (!response.data || typeof response.data === 'string' && response.data.trim() === '') {
        console.warn('Empty response received from server. Assuming success based on status code.');
      }

      setSubmitSuccess(true);
      setRetryCount(0);
      setFormData({
        NurseId: uuidv4(), // Reset NurseId with a new UUID
        FullName: "",
        Email: "",
        Password: "",
        ConfirmPassword: "",
        PhoneNumber: "",
        Address: "",
      });
      setErrors({});
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);

        if (error.response.status === 401 && retryCount < MAX_RETRIES && !isRetry) {
          const newAccessToken = await attemptRefreshToken();
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            setRetryCount(prev => prev + 1);
            return handleSubmit(true);
          } else {
            errorMessage = 'Session expired. Please log in again.';
            logout();
          }
        } else if (error.response.status === 500 && retryCount < MAX_RETRIES && !isRetry) {
          // Retry on 500 server errors
          setRetryCount(prev => prev + 1);
          return handleSubmit(true);
        } else if (typeof error.response.data === 'string' && error.response.data) {
          errorMessage = parseServerError(error.response.data, error.response);
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          const validationErrors = {};
          Object.entries(error.response.data.errors).forEach(([key, messages]) => {
            validationErrors[key] = Array.isArray(messages) ? messages.join(', ') : messages;
          });
          setErrors(validationErrors);
          return;
        } else if (!error.response.data) {
          errorMessage = parseServerError('', error.response);
        }
      } else if (error.request) {
        if (retryCount < MAX_RETRIES && !isRetry) {
          // Retry on network errors
          setRetryCount(prev => prev + 1);
          return handleSubmit(true);
        }
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        errorMessage = error.message || errorMessage;
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

  if (submitSuccess) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)'}}>
        <div className="card shadow-lg border-0" style={{maxWidth: '400px', width: '100%', borderRadius: '1rem'}}>
          <div className="card-body p-5 text-center">
            <div className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-circle bg-success bg-opacity-10" style={{width: '64px', height: '64px'}}>
              <svg className="text-success" width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="h4 fw-bold text-dark mb-3">Registration Successful!</h2>
            <p className="text-muted mb-4">Your nurse profile has been registered successfully. You will receive a confirmation email shortly.</p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="btn btn-primary w-100 py-2 fw-medium"
              style={{borderRadius: '0.75rem'}}
            >
              Register Another Nurse
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5 px-3" style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)'}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-6">
            <div className="card shadow-lg border-0" style={{borderRadius: '1.5rem', overflow: 'hidden'}}>
              <div className="card-header text-white p-4" style={{background: 'linear-gradient(135deg, #1976d2 0%, #3f51b5 100%)'}}>
                <h1 className="h3 fw-bold mb-2 d-flex align-items-center">
                  <Heart className="me-3" size={32} />
                  Nurse Registration
                </h1>
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
                          <strong>Maximum retry attempts reached.</strong> Please try again later or contact support at support@physiocareapp.com.
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
                    <label className="form-label fw-medium mb-1">
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
                      style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
                    />
                    {errors.FullName && <div className="invalid-feedback">{errors.FullName}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium mb-1">
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
                      style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
                    />
                    {errors.Email && <div className="invalid-feedback">{errors.Email}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium mb-1">
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
                      style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
                    />
                    {errors.PhoneNumber && <div className="invalid-feedback">{errors.PhoneNumber}</div>}
                  </div>
                </div>

                <div className="mb-5">
                  <h5 className="fw-semibold text-dark border-bottom pb-2 mb-4">
                    Passwords
                  </h5>
                  
                  <div className="mb-4">
                    <label className="form-label fw-medium mb-1">
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
                        style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-2 text-muted"
                        disabled={isSubmitting}
                        style={{border: 'none', background: 'none'}}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      {errors.Password && <div className="invalid-feedback">{errors.Password}</div>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium mb-1">
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
                        style={{borderRadius: '0.75rem', padding: '0.75rem 1rem'}}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-2 text-muted"
                        disabled={isSubmitting}
                        style={{border: 'none', background: 'none'}}
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
                    <label className="form-label fw-medium mb-1">
                      <MapPin className="me-2" size={16} />
                      Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <textarea
                        name="Address"
                        value={formData.Address}
                        onChange={handleInputChange}
                        className={`form-control ${errors.Address ? 'is-invalid' : ''}`}
                        disabled={isSubmitting || locationLoading}
                        rows="1"
                        placeholder="Enter your address"
                        style={{borderRadius: '0.75rem 0 0 0.75rem', padding: '0.75rem 1rem', resize: 'none', minHeight: '45px'}}
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading || isSubmitting}
                        className="btn btn-primary d-flex align-items-center"
                        style={{borderRadius: '0 0.75rem 0.75rem 0', padding: '0.5rem 0.75rem'}}
                      >
                        {locationLoading ? (
                          <div className="spinner-border spinner-border-sm me-1" role="status"></div>
                        ) : (
                          <MapPin className="me-1" size={16} />
                        )}
                        {locationLoading ? 'Loading Address...' : 'GPS'}
                      </button>
                    </div>
                    {errors.Address && <div className="text-danger small mt-1">{errors.Address}</div>}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="btn btn-primary w-100 py-3 fw-medium fs-5 d-flex align-items-center justify-content-center"
                    style={{borderRadius: '0.75rem', background: 'linear-gradient(135deg, #1976d2 0%, #3f51b5 100%)', border: 'none'}}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Registering Nurse...
                      </>
                    ) : (
                      <>
                        <Heart className="me-2" size={20} />
                        Register Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationNurse;