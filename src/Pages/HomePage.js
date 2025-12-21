import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import Header from "../components/Header";
import PatientCare from "../components/PatientCare";
import Statistics from "../components/Statistics";
import DownloadApp from "../components/DownloadApp";
import Footer from "../components/Footer";
import Care from "../components/Care";

import image1 from "../assets/images/Group 19663.png";
import image2 from "../assets/images/Image.png";
import image3 from "../assets/images/Image1Nursig.png";

const HomePage = () => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderVisible(window.scrollY <= 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useScrollAnimation();

  return (
    <div className="homepage-wrapper">
      <Header isVisible={isHeaderVisible} />
      <ServicesSection />
      <section className="animate-section">
        <PatientCare />
      </section>
      <section className="animate-section">
        <Statistics />
      </section>
      <section className="animate-section">
        <Care />
      </section>
      <section className="animate-section">
        <DownloadApp />
      </section>
      <Footer />
    </div>
  );
};

// Services Section with enhanced animations
const ServicesSection = () => {
  const services = [
    {
      title: "Consultations",
      description: "Connect with our expert doctors.",
      img: image1,
      link: "/servicedoctoronlineofflineathome",
      icon: "bi-hospital",
      details: (
        <>
          <p><strong>Consultation Options:</strong></p>
          <ol>
            <li><strong>Online Consultation:</strong> Book a virtual appointment from home.</li>
            <li><strong>Offline Consultation:</strong> Visit our clinic in person.</li>
            <li><strong>At-Home Consultation:</strong> Request a home visit by our doctors.</li>
          </ol>
          <p><em>Choose an option, fill in your details, and confirm your appointment.</em></p>
        </>
      ),
    },
    {
      title: "Medical Analysis",
      description: "Reliable lab tests and analyses conducted by experts.",
      img: image2,
      link: "/lab1",
      icon: "bi-heart-pulse",
      details: (
        <>
          <p><strong>Analysis Options:</strong></p>
          <ol>
            <li><strong>At Center:</strong> Visit our accredited laboratory.</li>
            <li><strong>At Home:</strong> Home sample collection available.</li>
          </ol>
          <p><em>Select the option that suits you best and schedule your test.</em></p>
        </>
      ),
    },
    {
      title: "Nursing Services",
      description: "Receive quality nursing care in the comfort of your home.",
      img: image3,
      link: "/nurse1",
      icon: "bi-heart",
      details: (
        <>
          <p><strong>Nursing Care:</strong></p>
          <ol>
            <li><strong>At Home:</strong> Nurses will visit your home to provide care.</li>
          </ol>
          <p><em>Schedule your visit, provide your info, and confirm your appointment.</em></p>
        </>
      ),
    },
  ];

  return (
    <section
      className="services-section py-5 animate-section"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12">
            <h3 className="section-heading text-center mb-2">
              Our PhysioCare Services
              <span className="heading-underline"></span>
            </h3>
            <p
              className="text-center text-muted mb-5 mx-auto fade-in-text"
              style={{ maxWidth: "600px", fontSize: "1.1rem" }}
            >
              We provide a range of high-quality healthcare services designed to
              meet your needs, whether at our center, at home, or online.
            </p>
          </div>
        </div>

        <div className="row justify-content-center g-4">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="col-lg-4 col-md-6 col-sm-12"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <ServiceCard service={service} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced Service Card Component
const ServiceCard = ({ service, index }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("card-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        className="service-card card shadow-lg h-100 border-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="card-body text-center d-flex flex-column position-relative p-4">
          <div className="service-icon-wrapper mb-3 mx-auto">
            <img
              src={service.img}
              alt={service.title}
              className="service-image"
              style={{ maxHeight: "80px", width: "auto", maxWidth: "80px" }}
            />
          </div>

          <h5 className="card-title fw-bold mb-3" style={{ fontSize: "1.4rem" }}>
            {service.title}
          </h5>
          
          <p className="card-text text-muted mb-4" style={{ fontSize: "1rem", lineHeight: "1.6" }}>
            {service.description}
          </p>

          <div className="mt-auto">
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-outline-primary btn-hover-effect flex-fill"
                onClick={() => setModalOpen(true)}
              >
                <i className="bi bi-info-circle me-1"></i>
                Learn More
              </button>
              <a 
                href={service.link} 
                className="btn btn-success flex-fill"
              >
                <i className="bi bi-calendar-check me-1"></i>
                Book Now
              </a>
            </div>
          </div>
        </div>

        <div className={`card-shine ${isHovered ? "active" : ""}`}></div>
      </div>

      {/* Enhanced Modal */}
      {modalOpen && (
        <>
          <div
            className="modal-backdrop-custom fade-in"
            onClick={() => setModalOpen(false)}
          />
          <div
            className="modal fade show d-block modal-custom"
            tabIndex={-1}
            role="dialog"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 shadow-lg">
                <div 
                  className="modal-header border-0 bg-primary text-white"
                >
                  <h5 className="modal-title fw-bold">
                    <i className={`bi ${service.icon} me-2`}></i>
                    {service.title} Details
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setModalOpen(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body p-4" style={{ fontSize: "1rem" }}>
                  {service.details}
                </div>
                <div className="modal-footer border-0 bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Close
                  </button>
                  <a href={service.link} className="btn btn-primary">
                    Book Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Enhanced scroll animation hook
const useScrollAnimation = () => {
  useEffect(() => {
    const sections = document.querySelectorAll(".animate-section");
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible");
          }
        });
      },
      { 
        threshold: 0.15,
        rootMargin: "0px 0px -100px 0px"
      }
    );

    sections.forEach((section) => observer.observe(section));
    
    return () => observer.disconnect();
  }, []);
};

// Enhanced Styles
const styles = `
  :root {
    --animation-speed: 0.8s;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .homepage-wrapper {
    overflow-x: hidden;
    position: relative;
  }

  /* Section Heading with Animated Underline */
  .section-heading {
    position: relative;
    display: inline-block;
    font-weight: 700;
    color: #212529;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    width: 100%;
    word-spacing: 0.3em;
  }

  .heading-underline {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    width: 120px;
    height: 4px;
    border-radius: 4px;
    background: linear-gradient(to right, #00b4d8, #023e8a);
    animation: loadingBar 2s ease-in-out infinite;
  }

  @keyframes loadingBar {
    0% {
      width: 0;
      left: 25%;
      transform: translateX(0);
    }
    50% {
      width: 120px;
      left: 50%;
      transform: translateX(-50%);
    }
    100% {
      width: 0;
      left: 75%;
      transform: translateX(-100%);
    }
  }

  /* Fade in text animation */
  .fade-in-text {
    opacity: 0;
    animation: fadeInUp 0.8s ease-out 0.5s forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Service Card Animations */
  .service-card {
    position: relative;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 20px;
    overflow: hidden;
    opacity: 0;
    transform: translateX(-50px);
    background: white;
  }

  .service-card.card-visible {
    opacity: 1;
    transform: translateX(0);
    animation: slideInFromLeft 0.6s ease-out forwards;
  }

  .service-card:nth-child(1) { animation-delay: 0.1s; }
  .service-card:nth-child(2) { animation-delay: 0.2s; }
  .service-card:nth-child(3) { animation-delay: 0.3s; }

  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .service-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  .service-card:hover .card-gradient-overlay {
    height: 100%;
    opacity: 0.1;
  }

  /* Service Icon Animation */
  .service-icon-wrapper {
    position: relative;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 50%;
    transition: all 0.4s ease;
  }

  .service-card:hover .service-icon-wrapper {
    transform: rotate(360deg) scale(1.1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .service-image {
    transition: all 0.4s ease;
  }

  .service-card:hover .service-image {
    transform: scale(1.1);
  }

  /* Button Styles */
  .btn-hover-effect {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    border-width: 2px;
    font-weight: 600;
  }

  .btn-hover-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  .btn-hover-effect:hover::before {
    left: 100%;
  }

  .btn-primary {
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .btn-primary:hover,
  .btn-success:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .btn-success {
    font-weight: 600;
    transition: all 0.3s ease;
  }

  /* Card Shine Effect */
  .card-shine {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 70%
    );
    transform: rotate(45deg);
    transition: all 0.6s ease;
    pointer-events: none;
    opacity: 0;
  }

  .card-shine.active {
    opacity: 1;
    animation: shine 1.5s ease-in-out;
  }

  @keyframes shine {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }

  /* Section Slide Animation */
  .animate-section {
    opacity: 0;
    transform: translateX(-100px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-section.section-visible {
    opacity: 1;
    transform: translateX(0);
  }

  /* Modal Enhancements */
  .modal-backdrop-custom {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    z-index: 1040;
    animation: fadeIn 0.3s ease;
  }

  .modal-custom .modal-content {
    border-radius: 20px;
    animation: modalSlideIn 0.4s ease-out;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-custom .modal-body ol {
    padding-left: 1.5rem;
  }

  .modal-custom .modal-body ol li {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .modal-custom .modal-body strong {
    color: #212529;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .section-heading {
      font-size: 1.8rem;
      margin-bottom: 2rem;
      padding-bottom: 1.2rem;
      word-spacing: 0.25em;
    }

    .heading-underline {
      bottom: 0;
      width: 100px;
    }

    @keyframes loadingBar {
      0% {
        width: 0;
        left: 25%;
        transform: translateX(0);
      }
      50% {
        width: 100px;
        left: 50%;
        transform: translateX(-50%);
      }
      100% {
        width: 0;
        left: 75%;
        transform: translateX(-100%);
      }
    }

    .service-card {
      margin-bottom: 1.5rem;
    }

    .service-icon-wrapper {
      width: 80px;
      height: 80px;
    }

    .animate-section {
      transform: translateX(-30px);
    }

    .btn-hover-effect,
    .btn-success {
      font-size: 0.85rem;
      padding: 0.5rem 0.75rem;
    }
  }

  @media (max-width: 576px) {
    .section-heading {
      font-size: 1.5rem;
      margin-bottom: 1.75rem;
      padding-bottom: 1rem;
      word-spacing: 0.2em;
    }

    .heading-underline {
      bottom: 0;
      width: 80px;
    }

    @keyframes loadingBar {
      0% {
        width: 0;
        left: 25%;
        transform: translateX(0);
      }
      50% {
        width: 80px;
        left: 50%;
        transform: translateX(-50%);
      }
      100% {
        width: 0;
        left: 75%;
        transform: translateX(-100%);
      }
    }

    .btn-hover-effect,
    .btn-success {
      font-size: 0.8rem;
      padding: 0.45rem 0.6rem;
    }

    .d-flex.gap-2 {
      gap: 0.5rem !important;
    }
  }

  /* Smooth Scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Performance Optimization */
  .service-card,
  .animate-section,
  .btn-hover-effect,
  .btn-gradient {
    will-change: transform, opacity;
  }

  /* Accessibility */
  .btn:focus,
  .btn-close:focus {
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    outline: none;
  }

  /* Loading State */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .loading {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Hover Effects for Interactive Elements */
  a, button {
    cursor: pointer;
  }

  /* Card Text */
  .card-title {
    color: #212529;
    transition: color 0.3s ease;
  }

  .service-card:hover .card-title {
    color: #0d6efd;
  }

  /* Scrollbar Styling */
  .modal-dialog-scrollable .modal-body::-webkit-scrollbar {
    width: 8px;
  }

  .modal-dialog-scrollable .modal-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .modal-dialog-scrollable .modal-body::-webkit-scrollbar-thumb {
    background: #0d6efd;
    border-radius: 10px;
  }

  .modal-dialog-scrollable .modal-body::-webkit-scrollbar-thumb:hover {
    background: #0b5ed7;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleId = "homepage-styles";
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
  }
}

export default HomePage;