import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Components/css/RegistertionAdmin.css";
import { useAuth } from "../../Pages/AuthPage"; // Import useAuth from AuthContext

const FIXED_ADMIN_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const API_BASE_URL = "https://physiocareapp.runasp.net/api/v1";
const NOMINATIM_API = "https://nominatim.openstreetmap.org/reverse";


const RegistrationAdmin = () => {
  const { user, logout } = useAuth(); // Use AuthContext to access user and logout
  const [formData, setFormData] = useState({
    AdminId: FIXED_ADMIN_ID,
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    roles: "",
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [geolocationStatus, setGeolocationStatus] = useState("idle"); // idle, loading, success, error

  // Fetch current location on mount or when editing starts
  useEffect(() => {
    if (isEditing && geolocationStatus === "idle") {
      fetchCurrentLocation();
    }
  }, [isEditing, geolocationStatus]);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeolocationStatus("error");
      setAlert({
        show: true,
        type: "warning",
        message: "Geolocation is not supported by your browser. Please enter address manually.",
      });
      return;
    }

    setGeolocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await axios.get(NOMINATIM_API, {
            params: {
              lat: latitude,
              lon: longitude,
              format: "json",
            },
          });
          const address = response.data.display_name || "";
          setFormData((prev) => ({ ...prev, address }));
          setGeolocationStatus("success");
          setAlert({ show: false, type: "", message: "" });
        } catch (error) {
          console.error("Error fetching address:", error);
          setGeolocationStatus("error");
          setAlert({
            show: true,
            type: "warning",
            message: "Unable to fetch location. Please enter address manually.",
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setGeolocationStatus("error");
        setAlert({
          show: true,
          type: "warning",
          message: "Unable to fetch location. Please enter address manually.",
        });
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    setErrors({});
    setAlert({ show: false, type: "", message: "" });
    if (!isEditing) {
      setGeolocationStatus("idle"); // Reset to trigger geolocation on edit
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{10,15}$/;

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = "Phone number must be 10-15 digits, optionally starting with +";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.roles.trim()) {
      newErrors.roles = "At least one role is required";
    } else {
      const rolesArray = formData.roles
        .split(",")
        .map((role) => role.trim())
        .filter((role) => role);
      if (rolesArray.length === 0) {
        newErrors.roles = "At least one valid role is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      const rolesArray = formData.roles
        .split(",")
        .map((role) => role.trim())
        .filter((role) => role);

      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("AdminId", formData.AdminId);
      formDataToSend.append("FullName", formData.fullName);
      formDataToSend.append("Email", formData.email);
      formDataToSend.append("Password", formData.password);
      formDataToSend.append("ConfirmPassword", formData.confirmPassword);
      formDataToSend.append("PhoneNumber", formData.phoneNumber);
      formDataToSend.append("Address", formData.address);
      rolesArray.forEach((role, index) => {
        formDataToSend.append(`Roles[${index}]`, role);
      });

      // Get access token from localStorage
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      // Log FormData for debugging
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axios.post(`${API_BASE_URL}/Account/RegisterAdmin`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`, // Add Bearer token
        },
      });

      setAlert({
        show: true,
        type: "success",
        message: "Admin registered successfully!",
      });

      // Store submitted data for display
      const submitted = {
        AdminId: formData.AdminId,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        roles: rolesArray,
      };
      setSubmittedData(submitted);
      setIsEditing(false);

      // Auto-dismiss success alert after 5 seconds
      setTimeout(() => {
        setAlert({ show: false, type: "", message: "" });
      }, 5000);
    } catch (error) {
      console.error("Error registering admin:", error);
      let errorMessage = "Failed to register admin. Please try again.";

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);

        if (error.response.status === 401) {
          errorMessage = "Unauthorized. Your session has expired. Please log in again.";
          logout(); // Log out the user if token is invalid
        } else if (typeof error.response.data === 'string' && error.response.data) {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          const errorMessages = Object.entries(error.response.data.errors)
            .map(([key, messages]) => `${key}: ${messages.join(', ')}`)
            .join('; ');
          errorMessage = errorMessages;
        } else if (!error.response.data) {
          errorMessage = "Server returned an empty response. Please try again.";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your network connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      setAlert({
        show: true,
        type: "danger",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inline styles for input fields
  const whiteInputStyle = {
    backgroundColor: '#ffffff',
    color: '#000000',
  };

  return (
    <div className="container my-5">
      <div className="card shadow border-primary">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Admin Registration</h3>
          {submittedData && (
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={toggleEdit}
            >
              {isEditing ? "Cancel Edit" : "Edit"}
            </button>
          )}
        </div>
        <div className="card-body">
          {alert.show && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
              {alert.message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setAlert({ show: false, type: "", message: "" })}
              ></button>
            </div>
          )}
          <h4 className="mb-4 text-center">{isEditing ? "Register New Admin" : "Admin Details"}</h4>
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing || isSubmitting}
                    required
                  />
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    style={whiteInputStyle}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing || isSubmitting}
                    required
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {isEditing && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Password *
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          className={`form-control ${errors.password ? "is-invalid" : ""}`}
                          style={whiteInputStyle}
                          value={formData.password}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={toggleShowPassword}
                          disabled={isSubmitting}
                        >
                          <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                      </div>
                      {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password *
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                          style={whiteInputStyle}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={toggleShowConfirmPassword}
                          disabled={isSubmitting}
                        >
                          <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                      )}
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    className={`form-control ${errors.phoneNumber ? "is-invalid" : ""}`}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing || isSubmitting}
                    required
                    placeholder="e.g., +1234567890"
                  />
                  {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Address *
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className={`form-control ${errors.address ? "is-invalid" : ""}`}
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing || isSubmitting}
                      placeholder="Enter address or use current location"
                      required
                    />
                    {isEditing && (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={fetchCurrentLocation}
                        disabled={isSubmitting || geolocationStatus === "loading"}
                      >
                        {geolocationStatus === "loading" ? (
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        ) : (
                          <i className="fas fa-map-marker-alt me-2"></i>
                        )}
                        Get Current Location
                      </button>
                    )}
                  </div>
                  {errors.address && <div className="invalid-feedback d-block">{errors.address}</div>}
                  {geolocationStatus === "loading" && (
                    <small className="text-muted mt-1 d-block">Fetching location...</small>
                  )}
                  {geolocationStatus === "success" && (
                    <small className="text-success mt-1 d-block">Location fetched successfully!</small>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="roles" className="form-label">
                    Roles (comma-separated, e.g., Admin,Manager) *
                  </label>
                  <input
                    type="text"
                    id="roles"
                    name="roles"
                    className={`form-control ${errors.roles ? "is-invalid" : ""}`}
                    value={formData.roles}
                    onChange={handleChange}
                    disabled={!isEditing || isSubmitting}
                    placeholder="e.g., Admin,Manager"
                    required
                  />
                  <small className="form-text text-muted">
                    Enter roles separated by commas (e.g., Admin,Manager)
                  </small>
                  {errors.roles && <div className="invalid-feedback">{errors.roles}</div>}
                </div>

                {isEditing && (
                  <button
                    type="submit"
                    className="btn btn-primary mt-3 w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Submitting...
                      </>
                    ) : (
                      "Save Registration"
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {submittedData && !isEditing && (
        <div className="mt-4">
          <h4>Submitted Registration Data</h4>
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th>Admin ID</th>
                <td>{submittedData.AdminId}</td>
              </tr>
              <tr>
                <th>Full Name</th>
                <td>{submittedData.fullName}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{submittedData.email}</td>
              </tr>
              <tr>
                <th>Phone Number</th>
                <td>{submittedData.phoneNumber}</td>
              </tr>
              <tr>
                <th>Address</th>
                <td>{submittedData.address}</td>
              </tr>
              <tr>
                <th>Roles</th>
                <td>{submittedData.roles.join(", ")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RegistrationAdmin;