import React, { useState } from 'react';
import Footer from './Footer';
import { Nav } from 'react-bootstrap';
import Navbar from './navwithcalude';
import { Margin } from '@mui/icons-material';
const PasswordResetComponent = () => {
  const [currentStep, setCurrentStep] = useState('forgot'); // 'forgot' or 'reset'
  const [email, setEmail] = useState('');
  const [codeOTP, setCodeOTP] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    // Input validation
    if (!email.trim()) {
      setMessage('Please enter your email address.');
      setMessageType('error');
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formdata = new FormData();
      formdata.append('email', email.trim());

      const response = await fetch('https://physiocareapp.runasp.net/api/v1/Account/forgotPassword', {
        method: 'POST',
        body: formdata,
      });

      if (response.ok) {
        setMessage('Password reset email sent successfully! Please check your inbox and spam folder for your OTP code.');
        setMessageType('success');
        setTimeout(() => {
          setCurrentStep('reset');
        }, 2000);
      } else {
        const errorText = await response.text();
        console.error('Reset email failed:', response.status, errorText);

        if (response.status === 404) {
          setMessage('Email address not found. Please check your email and try again.');
        } else if (response.status === 400) {
          setMessage('Invalid email format. Please enter a valid email address.');
        } else if (response.status >= 500) {
          setMessage('Server error. Please try again later.');
        } else {
          setMessage(`Failed to send reset email (Error ${response.status}). Please try again.`);
        }
        setMessageType('error');
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    }

    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!codeOTP.trim()) {
      setMessage('Please enter the OTP code from your email.');
      setMessageType('error');
      return;
    }

    if (!password) {
      setMessage('Please enter a new password.');
      setMessageType('error');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setMessageType('error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setMessage('Please enter a valid email address.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formdata = new FormData();
      formdata.append('Password', password);
      formdata.append('ConfirmPassword', confirmPassword);
      formdata.append('Email', email.trim());
      formdata.append('CodeOTP', codeOTP.trim());

      const response = await fetch('https://physiocareapp.runasp.net/api/v1/Account/reset-password-by-code-otp', {
        method: 'POST',
        body: formdata,
      });

      if (response.ok) {
        setMessage('Password reset successfully! You can now login with your new password.');
        setMessageType('success');
        setTimeout(() => {
          setCurrentStep('forgot');
          setEmail('');
          setCodeOTP('');
          setPassword('');
          setConfirmPassword('');
          setShowPassword(false);
          setShowConfirmPassword(false);
          setMessage('');
        }, 3000);
      } else {
        const errorText = await response.text();
        console.error('Password reset failed:', response.status, errorText);

        if (response.status === 400) {
          setMessage('Invalid or expired OTP code. Please request a new password reset.');
        } else if (response.status === 404) {
          setMessage('Email address not found. Please check your email.');
        } else {
          setMessage('Failed to reset password. Please check your OTP code and try again.');
        }
        setMessageType('error');
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    }

    setLoading(false);
  };

  const goBackToForgot = () => {
    setCurrentStep('forgot');
    setCodeOTP('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMessage('');
  };

  return (
    <>
<Navbar />
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
      
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <h2 className="card-title h3 mb-3">
                      {currentStep === 'forgot' ? 'Forgot Password' : 'Reset Password'}
                    </h2>
                    <p className="text-muted">
                      {currentStep === 'forgot'
                        ? 'Enter your email to receive a reset code'
                        : 'Enter your OTP code and new password'}
                    </p>
                  </div>

                  {message && (
                    <div 
                      className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center mb-4`}
                      role="alert"
                    >
                      <div className="me-2">
                        {messageType === 'success' ? (
                          <svg width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        {message}
                      </div>
                    </div>
                  )}

                  {currentStep === 'forgot' ? (
                    <div>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
                        />
                        <div className="form-text">
                          We'll send you a password reset code to this email address.
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleForgotPassword}
                        className="btn btn-primary w-100"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending...
                          </>
                        ) : (
                          'Send Reset Email'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <label htmlFor="codeOTP" className="form-label">
                          OTP Code
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="codeOTP"
                          value={codeOTP}
                          onChange={(e) => setCodeOTP(e.target.value)}
                          placeholder="Enter the OTP code from your email"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="emailConfirm" className="form-label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="emailConfirm"
                          value={email}
                          readOnly
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label">
                          New Password
                        </label>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="newPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your new password"
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ borderLeft: 'none' }}
                          >
                            {showPassword ? (
                              <svg width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                                <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.708zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="confirmNewPassword" className="form-label">
                          Confirm New Password
                        </label>
                        <div className="input-group">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="form-control"
                            id="confirmNewPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ borderLeft: 'none' }}
                          >
                            {showConfirmPassword ? (
                              <svg width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                                <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.708zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={handleResetPassword}
                          className="btn btn-success"
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Resetting...
                            </>
                          ) : (
                            'Reset Password'
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={goBackToForgot}
                          disabled={loading}
                          className="btn btn-outline-secondary"
                        >
                          Back to Forgot Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PasswordResetComponent;