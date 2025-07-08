// src/components/RegistrationPatient.jsx
import React, { useState } from 'react';

const RegistrationPatient = () => {
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    Password: '',
    ConfirmPassword: '',
    PhoneNumber: '',
    Address: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [submittedData, setSubmittedData] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);
  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    setSubmitError('');
    setSubmitMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.FullName.trim()) newErrors.FullName = 'Full Name is required';
    if (!formData.Email.trim()) newErrors.Email = 'Email is required';
    if (!formData.Password.trim()) newErrors.Password = 'Password is required';
    if (!formData.ConfirmPassword.trim()) newErrors.ConfirmPassword = 'Confirm Password is required';
    if (formData.Password !== formData.ConfirmPassword) newErrors.ConfirmPassword = 'Passwords do not match';
    if (formData.Password.length < 6) newErrors.Password = 'Password must be at least 6 characters long';
    if (!formData.PhoneNumber.trim()) newErrors.PhoneNumber = 'Phone Number is required';
    if (!formData.Address.trim()) newErrors.Address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      const payload = new FormData();
      payload.append('FullName', formData.FullName);
      payload.append('Email', formData.Email);
      payload.append('Password', formData.Password);
      payload.append('ConfirmPassword', formData.ConfirmPassword);
      payload.append('PhoneNumber', formData.PhoneNumber);
      payload.append('Address', formData.Address);

      // Replace with actual API call
      console.log('Patient Registration Data:', Object.fromEntries(payload));
      // Example: const response = await fetch('/api/v1/Account/RegisterPatient', { method: 'POST', body: payload });

      setSubmittedData({ ...formData });
      setSubmitMessage('Patient registration successful!');
      setIsEditing(false);
    } catch (error) {
      console.error('Registration Error:', error);
      setSubmitError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <>
      <style>
        {`
          .container {
            max-width: 700px;
            margin: 0 auto;
            padding: 0 15px;
          }
          .my-5 {
            margin-top: 3rem;
            margin-bottom: 3rem;
          }
          .card {
            border-radius: 0.25rem;
            background: #fff;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          }
          .shadow {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }
          .border-primary {
            border: 1px solid #007bff !important;
          }
          .card-header {
            padding: 0.75rem 1.25rem;
            background-color: rgba(0, 0, 0, 0.03);
            border-bottom: 1px solid rgba(0, 0, 0, 0.125);
          }
          .bg-primary {
            background-color: #007bff !important;
          }
          .text-white {
            color: #fff !important;
          }
          .mb-0 {
            margin-bottom: 0 !important;
          }
          .card-body {
            padding: 1.25rem;
          }
          .btn {
            display: inline-block;
            font-weight: 400;
            text-align: center;
            vertical-align: middle;
            user-select: none;
            border: 1px solid transparent;
            padding: 0.375rem 0.75rem;
            font-size: 0.9rem;
            line-height: 1.5;
            border-radius: 0.25rem;
            cursor: pointer;
          }
          .btn-outline-secondary {
            color: #6c757d;
            border-color: #6c757d;
          }
          .btn-outline-secondary:hover {
            background-color: #6c757d;
            color: #fff;
          }
          .mb-3 {
            margin-bottom: 1rem !important;
          }
          .form-label {
            margin-bottom: 0.5rem;
            display: block;
            font-size: 0.9rem;
          }
          .form-control {
            display: block;
            width: 100%;
            padding: 0.375rem 0.75rem;
            font-size: 0.9rem;
            line-height: 1.5;
            color: #495057;
            background-color: #fff;
            border: 1px solid #ced4da;
            border-radius: 0.25rem;
            height: calc(1.5em + 0.75rem + 2px);
          }
          .form-control:disabled {
            background-color: #e9ecef;
            opacity: 1;
          }
          .form-control.error {
            border-color: #dc3545;
          }
          .error-message {
            color: #dc3545;
            font-size: 0.8em;
            margin-top: 5px;
            display: block;
          }
          .input-group {
            position: relative;
            display: flex;
            flex-wrap: nowrap;
            align-items: stretch;
            width: 100%;
          }
          .password-input-container {
            position: relative;
            width: 100%;
          }
          .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            z-index: 5;
            color: #6c757d;
          }
          .input-group-text {
            display: flex;
            align-items: center;
            padding: 0.375rem 0.75rem;
            font-size: 0.9rem;
            font-weight: 400;
            line-height: 1.5;
            color: #495057;
            text-align: center;
            white-space: nowrap;
            background-color: #e9ecef;
            border: 1px solid #ced4da;
            border-radius: 0.25rem;
          }
          .alert {
            position: relative;
            padding: 0.75rem 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.25rem;
          }
          .alert-danger {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
          }
          .alert-success {
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
          }
          .mt-3 {
            margin-top: 1rem !important;
          }
          .w-100 {
            width: 100% !important;
          }
          .btn-primary {
            color: #fff;
            background-color: #007bff;
            border-color: #007bff;
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
          }
          .btn-primary:hover {
            background-color: #0056b3;
            border-color: #004085;
          }
          .table {
            width: 100%;
            margin-bottom: 1rem;
            color: #212529;
            font-size: 0.9rem;
          }
          .table-bordered {
            border: 1px solid #dee2e6;
          }
          .table-bordered th,
          .table-bordered td {
            border: 1px solid #dee2e6;
            padding: 0.75rem;
          }
          .mt-4 {
            margin-top: 1.5rem !important;
          }
          .edit-btn-container {
            display: flex;
            justify-content: flex-end;
          }
        `}
      </style>
      <div className="container my-5">
        <div className="card shadow border-primary">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">Patient Registration</h3>
          </div>
          <div className="card-body">
            <div className="edit-btn-container">
              <button className="btn btn-outline-secondary mb-3" onClick={toggleEdit}>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="FullName"
                  className={`form-control ${errors.FullName ? 'error' : ''}`}
                  value={formData.FullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
                {errors.FullName && <span className="error-message">{errors.FullName}</span>}
              </div>
              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="Email"
                  className={`form-control ${errors.Email ? 'error' : ''}`}
                  value={formData.Email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
                {errors.Email && <span className="error-message">{errors.Email}</span>}
              </div>
              <div className="mb-3">
                <label className="form-label">Password *</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="Password"
                    className={`form-control ${errors.Password ? 'error' : ''}`}
                    value={formData.Password}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    minLength="6"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleShowPassword}
                      tabIndex="-1"
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                  )}
                </div>
                {errors.Password && <span className="error-message">{errors.Password}</span>}
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm Password *</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="ConfirmPassword"
                    className={`form-control ${errors.ConfirmPassword ? 'error' : ''}`}
                    value={formData.ConfirmPassword}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                  {isEditing && (
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleShowConfirmPassword}
                      tabIndex="-1"
                    >
                      <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                    </button>
                  )}
                </div>
                {errors.ConfirmPassword && <span className="error-message">{errors.ConfirmPassword}</span>}
              </div>
              <div className="mb-3">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="PhoneNumber"
                  className={`form-control ${errors.PhoneNumber ? 'error' : ''}`}
                  value={formData.PhoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
                {errors.PhoneNumber && <span className="error-message">{errors.PhoneNumber}</span>}
              </div>
              <div className="mb-3">
                <label className="form-label">Address *</label>
                <input
                  type="text"
                  name="Address"
                  className={`form-control ${errors.Address ? 'error' : ''}`}
                  value={formData.Address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
                {errors.Address && <span className="error-message">{errors.Address}</span>}
              </div>
              {submitError && <div className="alert alert-danger mt-3">{submitError}</div>}
              {isEditing && (
                <button type="submit" className="btn btn-primary mt-3 w-100">
                  Save Registration
                </button>
              )}
            </form>
            {submitMessage && <div className="alert alert-success mt-3">{submitMessage}</div>}
          </div>
        </div>
        {submittedData && (
          <div className="mt-4">
            <h4>Submitted Registration Data</h4>
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th>Full Name</th>
                  <td>{submittedData.FullName}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{submittedData.Email}</td>
                </tr>
                <tr>
                  <th>Password</th>
                  <td>{'********'}</td>
                </tr>
                <tr>
                  <th>Confirm Password</th>
                  <td>{'********'}</td>
                </tr>
                <tr>
                  <th>Phone Number</th>
                  <td>{submittedData.PhoneNumber}</td>
                </tr>
                <tr>
                  <th>Address</th>
                  <td>{submittedData.Address}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default RegistrationPatient;