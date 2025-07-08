import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bg from "../assets/images/mockuuups-a34bojiukqwhp8cgywbgmd.jpeg";

const RegistrationPage2 = () => {
  console.log("RegistrationPage2 loaded.");
  const navigate = useNavigate();
  const location = useLocation();

  // Predefined Admin IDs
  const ADMIN_IDS = {
    MAIN: "63948D9F-2CD6-47D8-FFCC-08DD6B075A45",
    ALTERNATIVE: "306D2CA1-A527-417D-8DD2-8E5AA7EAA07A"
  };

  // Predefined Specialization IDs
  const SPECIALIZATION_IDS = {
    PHYSIO1: "F784E740-864A-46F2-AC0B-24275D787CBB",
    PHYSIO2: "306D2CA1-A527-417D-8DD2-8E5AA7EAA07A"
  };

  // Receive data passed from Page1
  const page1Data = location.state || {};
  if (!page1Data || !page1Data.firstName) {
    console.warn("No data from Page1. Redirecting...");
    navigate("/register");
    return null;
  }
  console.log("Received page1Data:", page1Data);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    governorate: "Menofia", // Default value
    city: "",
    area: "",
    street: "",
    acceptRules: false,
    image: "", // Store the Base64 string of the uploaded image
    // AdminId and specificationId are set for Doctor role only
    adminId: page1Data.role === "Doctor" ? ADMIN_IDS.MAIN : "",
    specificationId: page1Data.role === "Doctor" ? SPECIALIZATION_IDS.PHYSIO1 : ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Validators
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };
  const validateNonEmpty = (value) => value.trim().length > 0;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters, include uppercase, lowercase, digit, and special character.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!validateNonEmpty(formData.governorate)) {
      newErrors.governorate = "Governorate is required";
    }
    if (!validateNonEmpty(formData.city)) {
      newErrors.city = "City is required";
    }
    if (!validateNonEmpty(formData.area)) {
      newErrors.area = "Area is required";
    }
    if (!validateNonEmpty(formData.street)) {
      newErrors.street = "Street is required";
    }
    if (!formData.acceptRules) {
      newErrors.acceptRules = "You must accept the terms to continue";
    }
    // Validate specificationId for Doctor role
    if (page1Data.role === "Doctor" && !formData.specificationId) {
      newErrors.specificationId = "Please select a specification";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle image selection and convert it to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("RegistrationPage2 handleSubmit triggered.");
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    console.log("RegistrationPage2 formData:", formData);
    setIsSubmitting(true);
    setSubmitError("");

    try {
      let endpoint = "";
      let payload;

      if (page1Data.role === "User") {
        // For User role, send JSON including the image
        endpoint = "https://physiocareapp.runasp.net/api/v1/Account/Register";
        payload = {
          firstName: page1Data.firstName,
          lastName: page1Data.lastName,
          password: formData.password,
          email: formData.email,
          phoneNumber: page1Data.phone,
          roles: [page1Data.role],
          clientUri: "http://yourclienturi.com/confirm",
          image: formData.image || ""
        };
      } else {
        // For all other roles, send data using FormData
        const form = new FormData();
        // Common fields
        form.append("fname", page1Data.firstName);
        form.append("lname", page1Data.lastName);
        form.append("email", formData.email);
        form.append("password", formData.password);
        form.append("gender", page1Data.gender);
        form.append("age", page1Data.age);
        form.append("phone", page1Data.phone);
        // Evaluation: use value from Page1 or default to 0
        form.append("evaluation", page1Data.evaluation || 0);
        // Append image as Base64 string
        form.append("image", formData.image || "");

        // Address fields
        form.append("homeAddressForCreationDto.governorate", formData.governorate);
        form.append("homeAddressForCreationDto.city", formData.city);
        form.append("homeAddressForCreationDto.area", formData.area);
        form.append("homeAddressForCreationDto.street", formData.street);

        // Role-specific fields
        switch (page1Data.role) {
          case "Admin":
            endpoint = "https://physiocareapp.runasp.net/api/v1/Account/RegisterAdmin";
            form.append("AdminId", formData.adminId || ADMIN_IDS.MAIN);
            form.append("roles", "Admin");
            break;
          case "Doctor":
            endpoint = "https://physiocareapp.runasp.net/api/v1/Account/RegisterDoctor";
            form.append("specializationId", formData.specificationId || SPECIALIZATION_IDS.PHYSIO1);
            form.append("AdminId", formData.adminId || ADMIN_IDS.MAIN);
            break;
          case "Nurse":
            endpoint = "https://physiocareapp.runasp.net/api/v1/Account/RegisterNurse";
            form.append("AdminId", ADMIN_IDS.MAIN);
            break;
          case "Lab":
            endpoint = "https://physiocareapp.runasp.net/api/v1/Account/RegisterLaboratory";
            form.append("AdminId", formData.adminId || ADMIN_IDS.MAIN);
            break;
          case "Patient":
          default:
            endpoint = "https://physiocareapp.runasp.net/api/v1/Account/RegisterPatient";
            break;
        }
        payload = form;
      }

      // Debug payload
      if (payload instanceof FormData) {
        console.log("FormData payload entries:");
        for (let pair of payload.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }
      } else {
        console.log("JSON payload:", JSON.stringify(payload, null, 2));
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: payload instanceof FormData ? {} : { "Content-Type": "application/json" },
        body: payload instanceof FormData ? payload : JSON.stringify(payload)
      });

      console.log("Response status:", response.status);
      if (!response.ok) {
        let errorMsg = "Registration failed - please try again";
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.log("Error response from server:", errorData);
          if (errorData && errorData.message) {
            errorMsg = errorData.message;
          }
        } else {
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }

      const responseData = await response.json();
      console.log("Success response from server:", responseData);
      navigate("/registration-success");
    } catch (error) {
      console.error("Error during registration:", error);
      setSubmitError(error.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Left panel: background image */}
        <div className="col-md-6 d-none d-md-block p-0">
          <img
            src={bg}
            alt="Registration"
            style={{ width: "100%", height: "100vh", objectFit: "cover" }}
          />
        </div>
        {/* Right panel: form */}
        <div className="col-md-6 d-flex align-items-center justify-content-center bg-light">
          <div
            className="card p-4 shadow"
            style={{
              maxWidth: "500px",
              width: "100%",
              borderRadius: "15px",
              border: "2px solid #0d6efd",
              backgroundColor: "rgba(245,252,255,0.98)"
            }}
          >
            <h2 className="text-center mb-4" style={{ color: "#0d6efd", fontWeight: "700", fontSize: "1.8rem" }}>
              Registration – Part 2
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="example@domain.com"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Enter your password"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                <small className="form-text text-muted">
                  Must be at least 8 characters, include uppercase, lowercase, digit, and special character.
                </small>
              </div>
              {/* Confirm Password */}
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
              {/* Image Upload Field (Visible for all roles) */}
              <div className="mb-3">
                <label htmlFor="image" className="form-label">Upload Image</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ marginTop: "10px", maxWidth: "100%", height: "auto" }}
                  />
                )}
              </div>
              {/* Address: Governorate */}
              <div className="mb-3">
                <label htmlFor="governorate" className="form-label">Governorate</label>
                <input
                  type="text"
                  id="governorate"
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleChange}
                  className={`form-control ${errors.governorate ? "is-invalid" : ""}`}
                />
                {errors.governorate && <div className="invalid-feedback">{errors.governorate}</div>}
              </div>
              {/* Address: City */}
              <div className="mb-3">
                <label htmlFor="city" className="form-label">City</label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`form-select ${errors.city ? "is-invalid" : ""}`}
                >
                  <option value="">Select your city</option>
                  {[
                    "Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Port Said",
                    "Suez", "El-Mahalla El-Kubra", "Mansoura", "Tanta", "Asyut",
                    "Ismailia", "Faiyum", "Zagazig", "Aswan", "Damanhour",
                    "Damietta", "Minya", "Beni Suef", "Qena", "Sohag",
                    "Hurghada", "6th of October City", "Shibin El-Kom",
                    "Marsa Matruh", "El-Minya", "El-Kharga", "Luxor", "Banha"
                  ].map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && <div className="invalid-feedback">{errors.city}</div>}
              </div>
              {/* Address: Area */}
              <div className="mb-3">
                <label htmlFor="area" className="form-label">Area</label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className={`form-control ${errors.area ? "is-invalid" : ""}`}
                  placeholder="Enter your area"
                />
                {errors.area && <div className="invalid-feedback">{errors.area}</div>}
              </div>
              {/* Address: Street */}
              <div className="mb-3">
                <label htmlFor="street" className="form-label">Street</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className={`form-control ${errors.street ? "is-invalid" : ""}`}
                  placeholder="Enter your street"
                />
                {errors.street && <div className="invalid-feedback">{errors.street}</div>}
              </div>
              {/* Admin ID field for Doctor role */}
              {page1Data.role === "Doctor" && (
                <div className="mb-3">
                  <label htmlFor="adminId" className="form-label">Admin ID</label>
                  <input
                    type="text"
                    id="adminId"
                    name="adminId"
                    value={formData.adminId}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter Admin ID (optional)"
                  />
                </div>
              )}
              {/* Specialization for Doctor role */}
              {page1Data.role === "Doctor" && (
                <div className="mb-3">
                  <label htmlFor="specificationId" className="form-label">Select Specification</label>
                  <select
                    id="specificationId"
                    name="specificationId"
                    value={formData.specificationId}
                    onChange={handleChange}
                    className={`form-select ${errors.specificationId ? "is-invalid" : ""}`}
                  >
                    <option value={SPECIALIZATION_IDS.PHYSIO1}>Physiotherapy 1</option>
                    <option value={SPECIALIZATION_IDS.PHYSIO2}>Physiotherapy 2</option>
                  </select>
                  {errors.specificationId && <div className="invalid-feedback">{errors.specificationId}</div>}
                </div>
              )}
              {/* Terms and Conditions */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  id="acceptRules"
                  name="acceptRules"
                  checked={formData.acceptRules}
                  onChange={handleChange}
                  className={`form-check-input ${errors.acceptRules ? "is-invalid" : ""}`}
                />
                <label htmlFor="acceptRules" className="form-check-label">
                  I accept the Terms and Conditions
                </label>
                {errors.acceptRules && <div className="invalid-feedback">{errors.acceptRules}</div>}
              </div>
              {submitError && <div className="alert alert-danger">{submitError}</div>}
              <button
                type="submit"
                className="btn btn-primary w-100 py-2"
                disabled={isSubmitting}
                style={{ fontSize: "1.1rem", fontWeight: "600", borderRadius: "8px" }}
              >
                {isSubmitting ? "Registering..." : "Complete Registration"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage2;
