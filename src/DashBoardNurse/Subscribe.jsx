import React, { useState } from "react";

const pricingList = {
  monthlyPricings: [
    {
      planTitle: "Basic",
      price: "$9",
      timeline: "/month",
      description:
        "It's easier to reach your savings goals when you have the right savings account.",
      features: [
        { isActive: true, label: "Build Links" },
        { isActive: true, label: "Over 66 complex" },
        { isActive: false, label: "24/7 Contact support" },
        { isActive: false, label: "Build Tools easily" },
        { isActive: false, label: "6TB storage" },
      ],
      isActive: false,
    },
    {
      planTitle: "Premium",
      price: "$29",
      timeline: "/month",
      description:
        "More off this less hello salamander lied porpoise much over tightly circa horse taped.",
      features: [
        { isActive: true, label: "Build Links" },
        { isActive: true, label: "Over 66 complex" },
        { isActive: true, label: "24/7 Contact support" },
        { isActive: true, label: "Build Tools easily" },
        { isActive: true, label: "6TB storage" },
      ],
      isActive: true,
    },
  ],
  yearlyPricings: [
    {
      planTitle: "Basic",
      price: "$99",
      timeline: "/year",
      description:
        "More off this less hello salamander lied porpoise much over tightly circa horse taped.",
      features: [
        { isActive: true, label: "Build Links" },
        { isActive: true, label: "Over 66 complex" },
        { isActive: false, label: "24/7 Contact support" },
        { isActive: false, label: "Build Tools easily" },
        { isActive: false, label: "6TB storage" },
      ],
      isActive: false,
    },
    {
      planTitle: "Premium",
      price: "$299",
      timeline: "/year",
      description:
        "It's easier to reach your savings goals when you have the right savings account.",
      features: [
        { isActive: true, label: "Build Links" },
        { isActive: true, label: "Over 66 complex" },
        { isActive: true, label: "24/7 Contact support" },
        { isActive: true, label: "Build Tools easily" },
        { isActive: true, label: "6TB storage" },
      ],
      isActive: true,
    },
  ],
};

const PricingItem = ({ pricing }) => (
  <div
    className={`pricing-item p-4 ${pricing.isActive ? 'active' : ''}`}
    style={{
      backgroundColor: pricing.isActive ? '#0d6efd' : '#f7f7ff',
      borderRadius: '15px',
      color: pricing.isActive ? 'white' : '#252d39',
      background: pricing.isActive 
        ? 'linear-gradient(145deg, rgba(13, 110, 253, 1) 0%, rgba(13, 110, 253, 0.7) 100%)'
        : '#f7f7ff',
      boxShadow: pricing.isActive ? '0 0.5rem 1rem rgba(0, 0, 0, 0.15)' : 'none',
      transition: 'all 0.25s ease-in-out'
    }}
  >
    <h3 className="fw-bold mb-2">
      {pricing.planTitle}
    </h3>
    <div className="mb-3">
      <span className="fs-3 fw-bold">{pricing.price}</span>
      <span className="ms-2 opacity-75">{pricing.timeline}</span>
    </div>
    <p className="opacity-75 mb-4">
      {pricing.description}
    </p>
    <ul className="list-unstyled">
      {pricing.features.map((feature, i) => (
        <li
          className={`${pricing.features.length - 1 > i ? 'mb-3' : ''}`}
          key={i}
        >
          <span className="me-2">
            {feature.isActive ? (
              <i className="fas fa-check text-success opacity-75"></i>
            ) : (
              <i className="fas fa-times text-danger opacity-75"></i>
            )}
          </span>
          <span className="opacity-75">{feature.label}</span>
        </li>
      ))}
    </ul>

    <button
      className={`btn w-100 mt-4 ${
        pricing.isActive 
          ? 'btn-light text-dark' 
          : 'btn-outline-primary'
      }`}
      style={{
        padding: '12px 30px',
        ...(pricing.isActive ? {} : {
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          borderColor: 'rgba(13, 110, 253, 0.3)'
        })
      }}
    >
      Choose plan
    </button>
  </div>
);

const Pricing8 = () => {
  const [isActiveYearlyPricing, setIsActiveYearlyPricing] = useState(false);

  const switchActiveTimeline = (tab) => setIsActiveYearlyPricing(tab);

  return (
    <section 
      className="py-5"
      style={{
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        paddingTop: '60px',
        paddingBottom: '60px'
      }}
    >
      <div className="container">
        <div className="row justify-content-center mb-5">
          <div className="col-lg-6 col-xl-5 text-center">
            <h2 
              className="mb-3 fw-bold"
              style={{
                fontSize: '45px',
                lineHeight: '45px',
                color: '#252d39'
              }}
            >
              Flexible Plan for you
            </h2>
            <p 
              className="mb-0"
              style={{
                fontSize: '16px',
                lineHeight: '22px',
                color: '#252d39'
              }}
            >
              Choice suitable plan for you.
            </p>
          </div>
        </div>
        
        <div className="text-center mb-4 d-flex justify-content-center align-items-center">
          <button
            className={`btn border-0 ${!isActiveYearlyPricing ? 'fw-bold' : ''}`}
            style={{
              color: '#252d39',
              padding: '12px 30px',
              backgroundColor: !isActiveYearlyPricing ? 'rgba(13, 110, 253, 0.1)' : 'transparent'
            }}
            onClick={() => switchActiveTimeline(false)}
          >
            MONTHLY
          </button>
          
          <div className="mx-3">
            <div className="form-check form-switch">
              <input 
                className="form-check-input" 
                type="checkbox" 
                role="switch" 
                id="pricing-switcher"
                checked={isActiveYearlyPricing}
                onChange={(e) => switchActiveTimeline(e.target.checked)}
                style={{ transform: 'scale(1.5)' }}
              />
            </div>
          </div>
          
          <button
            className={`btn border-0 ${isActiveYearlyPricing ? 'fw-bold' : ''}`}
            style={{
              color: '#252d39',
              padding: '12px 30px',
              backgroundColor: isActiveYearlyPricing ? 'rgba(13, 110, 253, 0.1)' : 'transparent'
            }}
            onClick={() => switchActiveTimeline(true)}
          >
            YEARLY
          </button>
        </div>
        
        <div className="row justify-content-center">
          {(isActiveYearlyPricing ? pricingList.yearlyPricings : pricingList.monthlyPricings).map((pricing, i) => (
            <div className="col-md-6 col-lg-4 mt-4" key={i}>
              <PricingItem pricing={pricing} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing8;