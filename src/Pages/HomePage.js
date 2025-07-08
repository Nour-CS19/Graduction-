import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import Header from "../components/Header";
import PatientCare from "../components/PatientCare";
import Statistics from "../components/Statistics";
import DownloadApp from "../components/DownloadApp";
import Footer from "../components/Footer";
import Care from "../components/Care";
import SEARCHER from "../components/searcher"; // Still here in case you need it

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
    <div>
      <Header isVisible={isHeaderVisible} />
      <ServicesSection />
      <section>
        <PatientCare />
      </section>
      <Statistics />
      <Care />
      <DownloadApp />
      <Footer />
    </div>
  );
};

// Services Section
const ServicesSection = () => {
  const services = [
    {
      title: "Consultations",
      description: "Connect with our expert doctors.",
      img: image1,
      link: "/servicedoctoronlineofflineathome",
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
      className="py-5"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      }}
    >
      <div className="container text-center">
        <div className="row justify-content-center">
          <div className="col-12">
            <h3 className="section-heading text-center mb-2">
              Our PhysioCare Services
            </h3>
            <p
              className="text-center text-muted mb-5 mx-auto"
              style={{ maxWidth: "600px" }}
            >
              We provide a range of high-quality healthcare services designed to
              meet your needs, whether at our center, at home, or online.
            </p>
          </div>
        </div>

        <div className="row justify-content-center">
          {services.map((service, index) => (
            <div key={index} className="col-md-4 mb-4">
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Single card component without stars
const ServiceCard = ({ service }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="service-card card shadow-sm p-3 h-100">
      <div className="card-body text-center d-flex flex-column">
        <img
          src={service.img}
          alt={service.title}
          className="mb-3 mx-auto d-block"
          style={{ maxHeight: "80px", width: "50px" }}
        />
        <h5 className="card-title">{service.title}</h5>
        <p className="card-text text-muted">{service.description}</p>

        <div className="mt-auto">
          <button
            className="btn btn-primary me-2 mb-2"
            onClick={() => setModalOpen(true)}
          >
            Learn More <i className="bi bi-info-circle"></i>
          </button>
          <a href={service.link} className="btn btn-success mb-2">
            Book Now <i className="bi bi-calendar-check"></i>
          </a>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
          tabIndex={-1}
          role="dialog"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{service.title} Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">{service.details}</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Scroll animation hook (optional)
const useScrollAnimation = () => {
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
};

// Styles (inserted directly into <head>)
const styles = `
  .section-heading {
    position: relative;
    display: inline-block;
    font-weight: 700;
    color: #212529;
    margin-bottom: 2rem;
    text-align: center;
    width: 100%;
  }
  .section-heading::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -8px;
    width: 80px;
    height: 4px;
    border-radius: 4px;
    background: linear-gradient(to right, #00b4d8, #023e8a);
  }
  .service-card {
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .service-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0,0,0,0.1);
  }
`;

if (typeof document !== "undefined") {
  document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);
}

export default HomePage;
