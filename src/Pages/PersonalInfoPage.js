import React, { useState, useEffect } from "react";

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
  });

  const [confirmationData, setConfirmationData] = useState({
    email: "",
    codeOTP: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+20|20)?(010|011|012|015)\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    setPasswordStrength(strength);

    return {
      isValid: strength >= 3,
      requirements: { minLength, hasUpper, hasLower, hasNumber, hasSpecial },
    };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = "Full name can only contain letters and spaces";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = "Password must meet at least 3 requirements";
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid Egyptian phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please provide a more detailed address";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "password") {
      validatePassword(value);
    }
  };

  const handleConfirmationChange = (e) => {
    const { name, value } = e.target;
    setConfirmationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");
    setResendCooldown(300);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("FullName", formData.fullName);
      formDataToSend.append("Email", formData.email);
      formDataToSend.append("Password", formData.password);
      formDataToSend.append("ConfirmPassword", formData.confirmPassword);
      formDataToSend.append("PhoneNumber", formData.phoneNumber);
      formDataToSend.append("Address", formData.address);

      console.log("Submitting registration data...");
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`FormData [${key}]: ${value}`);
      }

      const response = await fetch(
        "https://physiocareapp.runasp.net/api/v1/Account/RegisterPatient",
        {
          method: "POST",
          headers: {
            accept: "*/*",
          },
          body: formDataToSend,
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        if (response.status === 400) {
          setErrorMessage("Invalid registration data. Please check your inputs.");
        } else if (response.status === 409) {
          setErrorMessage("An account with this email already exists.");
        } else if (response.status === 500) {
          setErrorMessage("Server error. Please try again later.");
        } else {
          setErrorMessage(responseText || `Registration failed (${response.status})`);
        }
        throw new Error(responseText || "Registration failed");
      }

      let data = null;
      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.warn("Response is not valid JSON:", parseError);
          data = { message: "Registration successful" };
        }
      }

      console.log("Parsed response data:", data);

      setConfirmationData({
        email: formData.email,
        codeOTP: "",
      });

      setSubmitStatus("success");
      setShowEmailConfirmation(true);

      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        address: "",
      });
      setPasswordStrength(0);
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitStatus("error");

      if (!errorMessage) {
        setErrorMessage(
          "Registration failed. Please check your connection and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmationEmail = async () => {
    if (resendCooldown > 0) {
      setResendMessage("Please wait before requesting a new OTP.");
      setResendStatus("error");
      return;
    }

    if (!confirmationData.email.trim()) {
      setResendMessage("Please enter your email address.");
      setResendStatus("error");
      return;
    }

    if (!validateEmail(confirmationData.email)) {
      setResendMessage("Please enter a valid email address.");
      setResendStatus("error");
      return;
    }

    setIsResending(true);
    setResendStatus(null);
    setResendMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", confirmationData.email);

      console.log("Resending OTP...");
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`FormData [${key}]: ${value}`);
      }

      const response = await fetch(
        "https://physiocareapp.runasp.net/api/v1/Account/reset-code-OTP",
        {
          method: "POST",
          headers: {
            accept: "*/*",
          },
          body: formDataToSend,
        }
      );

      const responseText = await response.text();
      console.log("Resend OTP response:", responseText);

      if (!response.ok) {
        if (response.status === 400) {
          setResendMessage("Invalid email address. Please check your input.");
        } else if (response.status === 404) {
          setResendMessage("No account found with this email.");
        } else if (response.status === 429) {
          setResendMessage("Too many requests. Please try again later.");
        } else {
          setResendMessage(responseText || "Failed to resend OTP.");
        }
        setResendStatus("error");
        throw new Error(responseText || "Resend failed");
      }

      setResendStatus("success");
      setResendMessage("A new OTP has been sent. Please check your inbox.");
      setResendCooldown(300);
    } catch (error) {
      console.error("Resend OTP error:", error);
      setResendStatus("error");
      if (!resendMessage) {
        setResendMessage("Failed to resend OTP. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailConfirmation = async () => {
    if (!confirmationData.codeOTP.trim()) {
      setErrorMessage("Please enter the OTP from your email.");
      return;
    }

    if (!confirmationData.email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!validateEmail(confirmationData.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsConfirming(true);
    setErrorMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", confirmationData.email);
      formDataToSend.append("codeOTP", confirmationData.codeOTP);

      console.log("Verifying OTP...");
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`FormData [${key}]: ${value}`);
      }

      const response = await fetch(
        "https://physiocareapp.runasp.net/api/v1/Account/verify-OTP",
        {
          method: "POST",
          headers: {
            accept: "*/*",
          },
          body: formDataToSend,
        }
      );

      const responseText = await response.text();
      console.log("OTP verification response:", responseText);

      if (!response.ok) {
        if (response.status === 400) {
          setErrorMessage("Invalid OTP or email. Please check your inputs.");
        } else if (response.status === 404) {
          setErrorMessage("OTP not found or expired. Please request a new one.");
          setResendMessage("OTP expired. Click 'Resend OTP' to get a new code.");
        } else {
          setErrorMessage(responseText || "OTP verification failed");
        }
        throw new Error(responseText || "OTP verification failed");
      }

      let data = null;
      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.warn("Verification response is not valid JSON:", parseError);
          data = { message: "Email confirmed successfully" };
        }
      }

      setSubmitStatus("confirmed");
      setTimeout(() => {
        console.log("Redirecting to login...");
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("OTP verification error:", error);
      setSubmitStatus("confirmation-error");
      if (!errorMessage) {
        setErrorMessage("OTP verification failed. Please try again or contact support.");
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "#dc3545";
    if (passwordStrength <= 3) return "#fd7e14";
    return "#198754";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatCooldown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css"
        rel="stylesheet"
      />

      <style>
        {`
        .gradient-bg {
          background: linear-gradient(135deg, #e3f2fd 0%, #3f51b5 100%);
          min-height: 100vh;
        }

        .left-panel {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 50%, #0d47a1 100%);
          position: relative;
          overflow: hidden;
        }

        .bg-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.1;
        }

        .phone-mockup {
          width: 250px;
          height: 500px;
          background: #1a1a1a;
          border-radius: 3rem;
          padding: 0.25rem;
          box-shadow: 0 25px 50px rgba(0,0,0,0.4);
          transform: rotate(3deg);
          transition: transform 0.5s ease;
          position: relative;
        }

        .phone-mockup:hover {
          transform: rotate(0deg);
        }

        .phone-mockup::before {
          content: '';
          position: absolute;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 4px;
          background: #333;
          border-radius: 2px;
          z-index: 10;
        }

        .phone-screen {
          background: #ffffff;
          border-radius: 2.5rem;
          height: 100%;
          position: relative;
          overflow: hidden;
          border: 1px solid #333;
        }

        .app-logo {
          width: 4rem;
          height: 4rem;
          background: rgba(0, 149, 156, 0.15);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .loading-dot {
          width: 12px;
          height: 12px;
          background: #00959C;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }

        .btn-register {
          background: linear-gradient(135deg, #0d6efd 66%, #0056b3 100%);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          transition: all 0.2s ease;
          transform: scale(1);
        }

        .btn-register:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
        }

        .password-toggle:hover {
          color: #495057;
        }

        .strength-bar {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 4px;
        }

        .email-confirmation-card {
          background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
          border: 2px solid #2196f3;
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          margin-top: 2rem;
        }

        .confirmation-icon {
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
      `}
      </style>

      <div className="gradient-bg d-flex align-items-center justify-content-center p-3">
        <div className="container-fluid" style={{ maxWidth: "1400px" }}>
          <div
            className="card shadow-lg border-0"
            style={{ borderRadius: "2rem", overflow: "hidden" }}
          >
            <div className="row g-0" style={{ minHeight: "600px" }}>
              <div className="col-lg-6 left-panel d-flex align-items-center justify-content-center p-5">
                <div className="bg-pattern">
                  <div
                    style={{
                      position: "absolute",
                      top: "2.5rem",
                      left: "2.5rem",
                      width: "8rem",
                      height: "8rem",
                      background: "white",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "5rem",
                      right: "2.5rem",
                      width: "6rem",
                      height: "6rem",
                      background: "white",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "25%",
                      width: "4rem",
                      height: "4rem",
                      background: "white",
                      borderRadius: "50%",
                    }}
                  ></div>
                </div>

                <div
                  className="text-center text-white position-relative"
                  style={{ zIndex: 10 }}
                >
                  <h1 className="display-5 fw-bold mb-3">Welcome to PhysioCare</h1>
                  <p
                    className="lead mb-4"
                    style={{
                      color: "#e3f2fd",
                      maxWidth: "400px",
                      margin: "0 auto",
                    }}
                  >
                    Join thousands of patients who trust us with their healthcare
                    journey
                  </p>

                  <div className="d-flex justify-content-center">
                    <div className="phone-mockup">
                      <div className="phone-screen">
                        <div className="p-4 h-100 d-flex flex-column justify-content-center">
                          <div className="text-center mb-4">
                            <div className="app-logo mx-auto mb-3">
                              <svg
                                viewBox="0 0 97 76"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ width: 45, height: 35 }}
                              >
                                <path
                                  d="M1.91304 12L3.1087 12.2689L4.30435 13.6134L5.26087 16.5714L6.21739 25.4454L6.45652 28.4034L4.30435 30.5546L4.54348 32.7059L6.69565 35.9328L9.80435 40.7731L11.9565 43.4622L12.913 44L11.2391 41.8487L5.26087 32.437L5.02174 30.8235L6.93478 29.7479L8.36957 30.0168L11.4783 31.8992L13.6304 33.7815L15.7826 36.2017L18.413 39.9664L20.087 41.8487L21.7609 42.9244L27.5 43.7311L31.5652 45.0756L33.9565 46.4202L36.587 48.5714L39.4565 51.7983L41.6087 55.563L43.2826 59.5966L44 62.5546V66.8571L43.7609 68.7395L43.5217 75.7311L43.2826 76H28.2174L27.9783 75.7311L27.7391 68.4706L26.5435 65.7815V65.2437H26.0652V64.7059L25.1087 64.1681L18.8913 59.8655L13.3913 56.1008L10.0435 53.4118L7.8913 51.2605L5.02174 45.0756L1.91304 37.2773L0.23913 31.6303L0 30.0168V25.9832L0.717391 17.1092L1.43478 12.5378L1.91304 12Z"
                                  fill="#009DA5"
                                />
                                <path
                                  d="M94.788 12L95.7935 12.2689L96.3967 16.3025L97 25.9832V31.0924L95.5924 36.7395L94.1848 41.042L91.1685 49.1092L89.962 51.7983L88.3533 53.6807L84.1304 57.4454L79.7065 60.9412L76.288 63.8992L74.6793 65.7815L73.875 67.6639L73.6739 75.7311L73.4728 76H60.6033L60.4022 75.7311L60.2011 67.395L60 65.5126V63.3613L61.0054 58.2521L62.6141 54.2185L64.2228 51.5294L65.8315 49.1092L68.6467 46.1513L70.8587 44.8067L75.0815 43.4622L78.7011 42.9244L80.1087 41.8487L81.7174 39.9664L84.3315 35.395L86.3424 32.7059L89.5598 30.2857L90.163 30.0168H91.7717L92.9783 31.0924L92.1739 33.2437L89.5598 38.084L87.5489 41.8487L86.5435 43.4622L87.75 42.6555L89.1576 40.2353L91.7717 35.395L92.9783 33.2437L93.3804 31.8992L93.1793 30.2857L92.5761 29.479L91.5707 28.6723L91.7717 25.1765L92.5761 16.8403L93.3804 13.6134L94.3859 12.2689L94.788 12Z"
                                  fill="#009DA5"
                                />
                                <path
                                  d="M38.6 0L41.313 0.235577L44.2522 1.17788L47.8696 3.29808L48.3217 3.76923L49.6783 3.53365L52.6174 1.64904L55.7826 0.471154L57.8174 0H60.3043L64.8261 1.17788L68.4435 2.82692L70.7043 4.47596L72.7391 6.83173L74.3217 10.3654L75 14.3702V16.9615L74.3217 20.9663L73.1913 23.7933L71.1565 27.5625L68.6696 30.8606L66.6348 33.2163L65.0522 35.101L59.8522 40.5192L58.0435 42.1683L53.7478 46.6442L51.2609 48.5288L49.9043 49H47.8696L45.1565 47.5865L39.9565 42.1683L38.1478 40.5192L30.913 32.9808L29.3304 31.0962L27.0696 28.0337L25.0348 24.7356L23.6783 21.2019L23 18.1394V12.7212L24.1304 8.95192L25.713 6.125L27.9739 3.76923L30.2348 2.35577L33.8522 0.942308L38.6 0Z"
                                  fill="#009DA5"
                                />
                              </svg>
                            </div>
                            <h5 className="fw-bold mb-1" style={{ color: "#00959C" }}>
                              PhysioCare
                            </h5>
                            <small style={{ color: "#888" }}>Your Health Partner</small>
                          </div>
                          <div className="d-flex align-items-center justify-content-center">
                            <div className="d-flex gap-2">
                              <div className="loading-dot"></div>
                              <div className="loading-dot"></div>
                              <div className="loading-dot"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 p-4 p-lg-5">
                <div className="mx-auto" style={{ maxWidth: "400px" }}>
                  {!showEmailConfirmation ? (
                    <>
                      <div className="text-center mb-4">
                        <div
                          className="bg-primary d-inline-flex align-items-center justify-content-center mb-3"
                          style={{ width: "4rem", height: "4rem", borderRadius: "1rem" }}
                        >
                          <i
                            className="bi bi-person-plus-fill text-white"
                            style={{ fontSize: "2rem" }}
                          ></i>
                        </div>
                        <h2 className="fw-bold mb-2">Create Account</h2>
                        <p className="text-muted">Join our healthcare community today</p>
                      </div>

                      {submitStatus === "error" && (
                        <div
                          className="alert alert-danger d-flex align-items-center mb-4"
                          role="alert"
                        >
                          <i className="bi bi-exclamation-circle-fill me-3"></i>
                          <div>
                            <div>{errorMessage || "Registration failed. Please try again."}</div>
                            <small className="text-muted mt-1">
                              Please check your internet connection and ensure all fields are
                              filled correctly.
                            </small>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Full Name</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                            style={{ borderRadius: "0.75rem", padding: "0.75rem 1rem" }}
                            placeholder="Enter your full name"
                          />
                          {errors.fullName && (
                            <div className="invalid-feedback d-flex align-items-center">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {errors.fullName}
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-control ${errors.email ? "is-invalid" : ""}`}
                            style={{ borderRadius: "0.75rem", padding: "0.75rem 1rem" }}
                            placeholder="Enter your email address"
                          />
                          {errors.email && (
                            <div className="invalid-feedback d-flex align-items-center">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {errors.email}
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Password</label>
                          <div className="position-relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className={`form-control ${errors.password ? "is-invalid" : ""}`}
                              style={{ borderRadius: "0.75rem", padding: "0.75rem 3rem 0.75rem 1rem" }}
                              placeholder="Create a strong password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="password-toggle"
                            >
                              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                            </button>
                          </div>

                          {formData.password && (
                            <div className="mt-2">
                              <div className="d-flex justify-content-between small mb-1">
                                <span className="text-muted">Password strength</span>
                                <span
                                  className="small"
                                  style={{ color: getPasswordStrengthColor() }}
                                >
                                  {getPasswordStrengthText()}
                                </span>
                              </div>
                              <div className="strength-bar">
                                <div
                                  className="strength-fill"
                                  style={{
                                    width: `${(passwordStrength / 5) * 100}%`,
                                    backgroundColor: getPasswordStrengthColor(),
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {errors.password && (
                            <div className="invalid-feedback d-flex align-items-center">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {errors.password}
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Confirm Password</label>
                          <div className="position-relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                              style={{ borderRadius: "0.75rem", padding: "0.75rem 3rem 0.75rem 1rem" }}
                              placeholder="Confirm your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="password-toggle"
                            >
                              <i
                                className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}
                              ></i>
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <div className="invalid-feedback d-flex align-items-center">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {errors.confirmPassword}
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Phone Number</label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={`form-control ${errors.phoneNumber ? "is-invalid" : ""}`}
                            style={{ borderRadius: "0.75rem", padding: "0.75rem 1rem" }}
                            placeholder="01012345678"
                          />
                          {errors.phoneNumber && (
                            <div className="invalid-feedback d-flex align-items-center">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {errors.phoneNumber}
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-semibold">Address</label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className={`form-control ${errors.address ? "is-invalid" : ""}`}
                            style={{ borderRadius: "0.75rem", padding: "0.75rem 1rem" }}
                            rows="3"
                            placeholder="Enter your full address"
                          />
                          {errors.address && (
                            <div className="invalid-feedback d-flex align-items-center">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {errors.address}
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn btn-primary btn-register w-100 text-white fw-semibold"
                        >
                          {isSubmitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-person-plus-fill me-2"></i>
                              Create Account
                            </>
                          )}
                        </button>
                      </form>

                      <div className="text-center mt-4">
                        <p className="text-muted">
                          Already have an account?{" "}
                          <a href="/login" className="text-decoration-none fw-semibold">
                            Sign In
                          </a>
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="email-confirmation-card">
                      <div className="confirmation-icon">
                        <i
                          className="bi bi-envelope-check text-white"
                          style={{ fontSize: "1.5rem" }}
                        ></i>
                      </div>

                      {submitStatus === "success" && (
                        <>
                          <h3 className="fw-bold text-primary mb-3">Check Your Email</h3>
                          <p className="text-muted mb-4">
                            We've sent an OTP to <strong>{confirmationData.email}</strong>. Please
                            check your inbox and enter the OTP below.
                          </p>
                        </>
                      )}

                      {submitStatus === "confirmed" && (
                        <>
                          <div className="text-success mb-3">
                            <i className="bi bi-check-circle-fill" style={{ fontSize: "3rem" }}></i>
                          </div>
                          <h3 className="fw-bold text-success mb-3">Email Confirmed!</h3>
                          <p className="text-muted mb-4">
                            Your email has been successfully confirmed. You will be redirected to
                            the login page shortly.
                          </p>
                        </>
                      )}

                      {(submitStatus === "success" || submitStatus === "confirmation-error") && (
                        <>
                          {errorMessage && (
                            <div
                              className="alert alert-danger d-flex align-items-center mb-4"
                              role="alert"
                            >
                              <i className="bi bi-exclamation-circle-fill me-3"></i>
                              <div>{errorMessage}</div>
                            </div>
                          )}

                          {resendStatus === "success" && (
                            <div
                              className="alert alert-success d-flex align-items-center mb-4"
                              role="alert"
                            >
                              <i className="bi bi-check-circle-fill me-3"></i>
                              <div>{resendMessage}</div>
                            </div>
                          )}

                          {resendStatus === "error" && (
                            <div
                              className="alert alert-danger d-flex align-items-center mb-4"
                              role="alert"
                            >
                              <i className="bi bi-exclamation-circle-fill me-3"></i>
                              <div>{resendMessage}</div>
                            </div>
                          )}

                          <div className="mb-3">
                            <label className="form-label fw-semibold">Email Address</label>
                            <input
                              type="email"
                              name="email"
                              value={confirmationData.email}
                              onChange={handleConfirmationChange}
                              className="form-control"
                              style={{ borderRadius: "0.75rem", padding: "0.75rem 1rem" }}
                              placeholder="Enter your email address"
                              disabled
                            />
                          </div>

                          <div className="mb-4">
                            <label className="form-label fw-semibold">OTP Code</label>
                            <input
                              type="text"
                              name="codeOTP"
                              value={confirmationData.codeOTP}
                              onChange={handleConfirmationChange}
                              className="form-control"
                              style={{ borderRadius: "0.75rem", padding: "0.75rem 1rem" }}
                              placeholder="Enter the OTP from your email"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleEmailConfirmation}
                            disabled={isConfirming}
                            className="btn btn-primary btn-register w-100 text-white fw-semibold mb-3"
                          >
                            {isConfirming ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Confirming...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Verify OTP
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={handleResendConfirmationEmail}
                            disabled={isResending || resendCooldown > 0}
                            className="btn btn-outline-primary w-100 mb-3"
                          >
                            {isResending ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Resending...
                              </>
                            ) : resendCooldown > 0 ? (
                              <>
                                <i className="bi bi-clock me-2"></i>
                                Resend OTP ({formatCooldown(resendCooldown)})
                              </>
                            ) : (
                              <>
                                <i className="bi bi-envelope me-2"></i>
                                Resend OTP
                              </>
                            )}
                          </button>

                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => {
                                setShowEmailConfirmation(false);
                                setSubmitStatus(null);
                                setErrorMessage("");
                                setResendStatus(null);
                                setResendMessage("");
                                setResendCooldown(0);
                              }}
                              className="btn btn-outline-secondary btn-sm"
                            >
                              <i className="bi bi-arrow-left me-1"></i>
                              Back to Registration
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientRegistration;