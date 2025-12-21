import React, { useState } from "react";

const pricingList = {
  monthlyPricings: [
    {
      planTitle: "Patient Basic",
      price: "$15",
      timeline: "/month",
      userType: "For Patients",
      description: "Essential healthcare management tools for personal health monitoring and medical record access.",
      features: [
        { isActive: true, label: "Medical Records Access" },
        { isActive: true, label: "Appointment Booking" },
        { isActive: true, label: "Lab Results Viewing" },
        { isActive: false, label: "Telemedicine Consultations" },
        { isActive: false, label: "Priority Support" },
        { isActive: false, label: "Health Analytics Dashboard" },
      ],
      isActive: false,
      variant: "primary"
    },
    {
      planTitle: "Nurse Pro",
      price: "$45",
      timeline: "/month",
      userType: "For Nurses",
      description: "Comprehensive nursing tools for patient care coordination and clinical workflow management.",
      features: [
        { isActive: true, label: "Patient Care Plans" },
        { isActive: true, label: "Medication Tracking" },
        { isActive: true, label: "Shift Management" },
        { isActive: true, label: "Clinical Documentation" },
        { isActive: true, label: "Care Team Communication" },
        { isActive: false, label: "Advanced Reporting" },
      ],
      isActive: false,
      variant: "secondary"
    },
    {
      planTitle: "Doctor Premium",
      price: "$85",
      timeline: "/month",
      userType: "For Doctors",
      description: "Advanced medical practice management with diagnostic tools and patient relationship features.",
      features: [
        { isActive: true, label: "Electronic Health Records" },
        { isActive: true, label: "Diagnostic Decision Support" },
        { isActive: true, label: "Prescription Management" },
        { isActive: true, label: "Telemedicine Platform" },
        { isActive: true, label: "Patient Portal Integration" },
        { isActive: true, label: "Medical Billing Integration" },
      ],
      isActive: true,
      variant: "success"
    },
    {
      planTitle: "Laboratory Enterprise",
      price: "$150",
      timeline: "/month",
      userType: "For Laboratories",
      description: "Complete laboratory information system with advanced analytics and regulatory compliance tools.",
      features: [
        { isActive: true, label: "Lab Information System (LIS)" },
        { isActive: true, label: "Sample Tracking & Management" },
        { isActive: true, label: "Quality Control & Assurance" },
        { isActive: true, label: "Regulatory Compliance Tools" },
        { isActive: true, label: "Advanced Analytics & Reporting" },
        { isActive: true, label: "Multi-location Management" },
      ],
      isActive: false,
      variant: "warning"
    },
  ],
  yearlyPricings: [
    {
      planTitle: "Patient Basic",
      price: "$150",
      timeline: "/year",
      userType: "For Patients",
      description: "Essential healthcare management tools for personal health monitoring and medical record access.",
      features: [
        { isActive: true, label: "Medical Records Access" },
        { isActive: true, label: "Appointment Booking" },
        { isActive: true, label: "Lab Results Viewing" },
        { isActive: true, label: "Telemedicine Consultations" },
        { isActive: false, label: "Priority Support" },
        { isActive: false, label: "Health Analytics Dashboard" },
      ],
      isActive: false,
      variant: "primary"
    },
    {
      planTitle: "Nurse Pro",
      price: "$450",
      timeline: "/year",
      userType: "For Nurses",
      description: "Comprehensive nursing tools for patient care coordination and clinical workflow management.",
      features: [
        { isActive: true, label: "Patient Care Plans" },
        { isActive: true, label: "Medication Tracking" },
        { isActive: true, label: "Shift Management" },
        { isActive: true, label: "Clinical Documentation" },
        { isActive: true, label: "Care Team Communication" },
        { isActive: true, label: "Advanced Reporting" },
      ],
      isActive: false,
      variant: "secondary"
    },
    {
      planTitle: "Doctor Premium",
      price: "$850",
      timeline: "/year",
      userType: "For Doctors",
      description: "Advanced medical practice management with diagnostic tools and patient relationship features.",
      features: [
        { isActive: true, label: "Electronic Health Records" },
        { isActive: true, label: "Diagnostic Decision Support" },
        { isActive: true, label: "Prescription Management" },
        { isActive: true, label: "Telemedicine Platform" },
        { isActive: true, label: "Patient Portal Integration" },
        { isActive: true, label: "Medical Billing Integration" },
      ],
      isActive: true,
      variant: "success"
    },
    {
      planTitle: "Laboratory Enterprise",
      price: "$1,500",
      timeline: "/year",
      userType: "For Laboratories",
      description: "Complete laboratory information system with advanced analytics and regulatory compliance tools.",
      features: [
        { isActive: true, label: "Lab Information System (LIS)" },
        { isActive: true, label: "Sample Tracking & Management" },
        { isActive: true, label: "Quality Control & Assurance" },
        { isActive: true, label: "Regulatory Compliance Tools" },
        { isActive: true, label: "Advanced Analytics & Reporting" },
        { isActive: true, label: "Multi-location Management" },
      ],
      isActive: false,
      variant: "warning"
    },
  ],
};

const PricingItem = ({ pricing }) => (
  <div className={`card h-100 ${pricing.isActive ? 'border-' + pricing.variant + ' border-3' : 'border-light'} position-relative`}>
    {pricing.isActive && (
      <div className="position-absolute top-0 start-50 translate-middle">
        <span className={`badge bg-${pricing.variant} px-3 py-2 rounded-pill`}>
          RECOMMENDED
        </span>
      </div>
    )}
    
    <div className={`card-header bg-${pricing.variant} bg-opacity-10 border-0 text-center py-4`}>
      <small className={`text-${pricing.variant} fw-semibold text-uppercase tracking-wide`}>
        {pricing.userType}
      </small>
      <h3 className={`h4 fw-bold mb-3 text-${pricing.variant}`}>
        {pricing.planTitle}
      </h3>
      <div className="mb-0">
        <span className={`display-4 fw-bold text-${pricing.variant}`}>{pricing.price}</span>
        <span className={`text-${pricing.variant} opacity-75`}>{pricing.timeline}</span>
      </div>
    </div>
    
    <div className="card-body d-flex flex-column">
      <p className="text-muted mb-4">
        {pricing.description}
      </p>
      
      <ul className="list-unstyled mb-4 flex-grow-1">
        {pricing.features.map((feature, i) => (
          <li className="mb-3 d-flex align-items-center" key={i}>
            <span className={`me-3 d-flex align-items-center justify-content-center rounded-circle ${feature.isActive ? 'bg-success' : 'bg-danger'}`} style={{ width: '24px', height: '24px' }}>
              <i className={`fas ${feature.isActive ? 'fa-check' : 'fa-times'} text-white`} style={{ fontSize: '12px' }}></i>
            </span>
            <span className={`${feature.isActive ? 'text-dark' : 'text-muted'}`}>
              {feature.label}
            </span>
          </li>
        ))}
      </ul>
      
      <button className={`btn btn-${pricing.variant} btn-lg w-100 mt-auto`}>
        Get Started
      </button>
    </div>
  </div>
);

const HealthcarePricing = () => {
  const [isActiveYearlyPricing, setIsActiveYearlyPricing] = useState(false);

  const switchActiveTimeline = (tab) => setIsActiveYearlyPricing(tab);

  return (
    <section className="py-5 bg-light">
      <div className="container py-5">
        {/* Header Section */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8 col-xl-6 text-center">
            <h1 className="display-4 fw-bold mb-4 text-dark">
              Healthcare Solutions for Everyone
            </h1>
            <p className="lead text-muted mb-0">
              Comprehensive healthcare management systems designed for patients, nurses, doctors, and laboratories.
            </p>
          </div>
        </div>
        
        {/* Pricing Toggle */}
        <div className="row justify-content-center mb-5">
          <div className="col-auto">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-2">
                <div className="d-flex align-items-center">
                  <button
                    className={`btn ${!isActiveYearlyPricing ? 'btn-primary' : 'btn-outline-primary'} me-3`}
                    onClick={() => switchActiveTimeline(false)}
                  >
                    Monthly
                  </button>
                  
                  <div className="form-check form-switch mx-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      role="switch" 
                      id="pricing-switcher"
                      checked={isActiveYearlyPricing}
                      onChange={(e) => switchActiveTimeline(e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                  </div>
                  
                  <button
                    className={`btn ${isActiveYearlyPricing ? 'btn-primary' : 'btn-outline-primary'} position-relative`}
                    onClick={() => switchActiveTimeline(true)}
                  >
                    Yearly
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                      17% OFF
                      <span className="visually-hidden">discount</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="row g-4 mb-5">
          {(isActiveYearlyPricing ? pricingList.yearlyPricings : pricingList.monthlyPricings).map((pricing, i) => (
            <div className="col-md-6 col-lg-3" key={i}>
              <PricingItem pricing={pricing} />
            </div>
          ))}
        </div>
        
        {/* CTA Section */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card bg-primary text-white text-center">
              <div className="card-body py-5">
                <h3 className="card-title h2 fw-bold mb-3">Need a Custom Solution?</h3>
                <p className="card-text lead mb-4">
                  Contact our team to discuss enterprise solutions and custom integrations for your healthcare organization.
                </p>
                <button className="btn btn-light btn-lg px-4">
                  <i className="fas fa-phone me-2"></i>
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Font Awesome for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </section>
  );
};

export default HealthcarePricing;