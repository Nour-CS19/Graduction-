
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import bg from '../assets/images/mockuuups-iphone-15-pro-mockup-on-a-white-modern-table.jpeg';

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://physiocareapp.runasp.net';

  // State management
  const [email, setEmail] = useState(location.state?.email || '');
  const [codeOTP, setCodeOTP] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [otpExpired, setOtpExpired] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setOtpExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const otpPattern = /^\d{6}$/; // OTP must be a 6-digit number

    if (!email.trim()) newErrors.email = 'Please enter your email address.';
    else if (!emailPattern.test(email)) newErrors.email = 'Please enter a valid email address.';

    if (!codeOTP.trim()) newErrors.codeOTP = 'Please enter the OTP code.';
    else if (!otpPattern.test(codeOTP)) newErrors.codeOTP = 'OTP must be a 6-digit number.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle OTP verification with FormData
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('Email', email.trim());
      formData.append('CodeOTP', codeOTP.trim());

      console.log('Sending FormData:', { Email: email.trim(), CodeOTP: codeOTP.trim() });

      const response = await fetch(`${API_BASE_URL}/api/v1/Account/verify-OTP`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        console.error('Failed to parse response:', textResponse, parseError);
        data = { message: textResponse || 'Invalid response from server.' };
      }

      console.log('Verify OTP response:', data);

      if (response.ok) {
        navigate('/login', { state: { email: email.trim() } });
      } else {
        const errorMessage = data.message || 'Invalid OTP. Please try again.';
        const detailedError = data.detail || data.innerException || '';
        setErrors({ 
          form: detailedError ? `${errorMessage} Details: ${detailedError}` : errorMessage,
          ...Object.fromEntries(
            Object.entries(data.errors || {}).map(([key, value]) => [key.toLowerCase(), Array.isArray(value) ? value.join(', ') : value])
          ),
        });
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setErrors({ form: 'Network error or server issue. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend with FormData
  const handleResendOTP = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Please enter your email address.' });
      return;
    }

    setResendLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('Email', email.trim());

      const response = await fetch(`${API_BASE_URL}/api/v1/Account/reset-code-OTP
`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch {
        data = { message: textResponse || 'Invalid response from server.' };
      }

      console.log('Resend OTP response:', data);

      if (response.ok) {
        setTimeLeft(5 * 60); // Reset timer
        setOtpExpired(false);
        setCodeOTP(''); // Clear OTP input
        setErrors({ success: 'New OTP sent to your email.' });
      } else {
        setErrors({ form: data.message || 'Failed to resend OTP. Please try again.' });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ minHeight: '100vh', overflowY: 'auto' }}>
      <div className="row" style={{ minHeight: '100vh' }}>
        <div className="col-md-6 d-none d-md-block p-0">
          <div
            style={{
              width: '100%',
              height: '100vh',
              position: 'sticky',
              top: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={bg}
              alt="Verify OTP Background"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
        <div
          className="col-md-6 d-flex align-items-center justify-content-center bg-light"
          style={{ minHeight: '100vh', padding: '2rem 0' }}
        >
          <div className="w-100 px-4" style={{ maxWidth: '500px' }}>
            <div
              className="card shadow p-4"
              style={{
                backgroundColor: 'rgba(245, 252, 255, 0.98)',
                border: '2px solid #0d6efd',
                borderRadius: '15px',
                transition: 'all 0.3s ease',
              }}
            >
              <h3
                className="text-center mb-4"
                style={{
                  color: '#0d6efd',
                  fontWeight: '700',
                  fontSize: '1.65rem',
                  background: 'linear-gradient(135deg, #0d6efd 0%, #0056b3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.5px',
                }}
              >
                Verify Your Email
              </h3>
              <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                Enter the 6-digit OTP sent to your email to confirm your account.
              </p>
              <form onSubmit={handleVerifyOTP}>
                {errors.form && (
                  <div className="alert alert-danger" role="alert">
                    <div className="d-flex align-items-center">
                      <svg
                        width="16"
                        height="16"
                        className="me-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      {errors.form}
                    </div>
                  </div>
                )}
                {errors.success && (
                  <div className="alert alert-success" role="alert">
                    <div className="d-flex align-items-center">
                      <svg
                        width="16"
                        height="16"
                        className="me-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      {errors.success}
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <label
                    htmlFor="email"
                    className="form-label"
                    style={{ color: '#333', fontSize: '0.9rem', fontWeight: '500' }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || resendLoading}
                    style={{
                      backgroundColor: 'rgba(240, 249, 255, 0.9)',
                      border: '1px solid #0d6efd',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="codeOTP"
                    className="form-label"
                    style={{ color: '#333', fontSize: '0.9rem', fontWeight: '500' }}
                  >
                    OTP Code
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.codeOTP ? 'is-invalid' : ''}`}
                    id="codeOTP"
                    placeholder="Enter 6-digit OTP"
                    value={codeOTP}
                    onChange={(e) => setCodeOTP(e.target.value)}
                    disabled={loading || resendLoading || otpExpired}
                    style={{
                      backgroundColor: 'rgba(240, 249, 255, 0.9)',
                      border: '1px solid #0d6efd',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  />
                  {errors.codeOTP && <div className="invalid-feedback">{errors.codeOTP}</div>}
                </div>
                <div className="mb-3 text-center">
                  <p
                    className={`mb-0 ${otpExpired ? 'text-danger' : 'text-muted'}`}
                    style={{ fontSize: '0.9rem' }}
                  >
                    {otpExpired
                      ? 'OTP has expired. Please resend a new OTP.'
                      : `Time remaining: ${formatTime(timeLeft)}`}
                  </p>
                  {otpExpired && (
                    <p className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>
                      To resend the OTP, ensure your email is entered above and click "Resend OTP".
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading || resendLoading || otpExpired}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    backgroundColor: '#0d6efd',
                    borderColor: '#0d6efd',
                    fontSize: '0.95rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <span>Verify OTP</span>
                      <svg
                        className="ms-2"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none"
                    onClick={handleResendOTP}
                    disabled={loading || resendLoading || !email.trim()}
                    style={{ color: '#0d6efd', fontSize: '0.85rem', fontWeight: '500' }}
                  >
                    {resendLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Resending...
                      </>
                    ) : (
                      'Resend OTP'
                    )}
                  </button>
                </div>
              </form>
              <div className="text-center mt-4">
                <p className="mb-0" style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  Back to{' '}
                  <a
                    href="/login"
                    className="text-decoration-none fw-semibold"
                    style={{ color: '#0d6efd' }}
                  >
                    Login
                  </a>
                </p>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                By verifying, you agree to our{' '}
                <a href="/terms" className="text-decoration-none" style={{ color: '#0d6efd' }}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-decoration-none" style={{ color: '#0d6efd' }}>
                  Privacy Policy
                </a>
              </p>
              <div className="mt-3">
                <small className="text-muted">© 2025 PhysioCare. All rights reserved.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999, backdropFilter: 'blur(2px)' }}
        >
          <div className="text-center text-white">
            <div
              className="spinner-border mb-3"
              role="status"
              style={{ width: '3rem', height: '3rem' }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5>Verifying OTP...</h5>
            <p className="text-light">Please wait a moment</p>
          </div>
        </div>
      )}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {loading && 'OTP verification in progress'}
        {resendLoading && 'Resending OTP in progress'}
        {errors.form && `Verification error: ${errors.form}`}
        {errors.success && `Success: ${errors.success}`}
      </div>
      <style>{`
        .form-control:focus {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15) !important;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
        }
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
        @media (max-width: 768px) {
          .col-md-6 {
            padding: 1rem !important;
          }
          .card {
            margin: 0 !important;
            border-radius: 10px !important;
            border-width: 1px !important;
          }
          .btn-primary {
            font-size: 0.9rem !important;
            padding: 0.65rem !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card {
          animation: fadeIn 0.6s ease-out;
        }
        .alert {
          font-size: 0.85rem;
          padding: 0.75rem;
        }
        .spinner-border {
          border-width: 0.2em;
        }
      `}</style>
    </div>
  );
};

export default VerifyOTPPage;
