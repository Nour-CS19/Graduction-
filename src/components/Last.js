import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#0d6efd' }} className="py-5">
      <div className="container">
        <div className="row">

          {/* Column 1: Our Services */}
          <div className="col-md-3">
            <h5 style={{ color: '#000' }}>Our Services</h5>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-white text-decoration-none">
                  General Consultation
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Emergency Care
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Specialized Treatments
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Surgical Procedures
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Diagnostic Imaging
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Rehabilitation Services
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Getting Started */}
          <div className="col-md-3">
            <h5 style={{ color: '#000' }}>Getting Started</h5>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-white text-decoration-none">
                  New Patient Registration
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  How to Book Appointments
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Meet Our Doctors
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Patient Portal
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Insurance & Billing
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Health Tips & Guides
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Medical Resources */}
          <div className="col-md-3">
            <h5 style={{ color: '#000' }}>Medical Resources</h5>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Health Articles
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  FAQs & Support
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Research & Studies
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Download Forms
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Clinic Locations
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Wellness Programs
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="col-md-3">
            <h5 style={{ color: '#000' }}>Newsletter</h5>
            <p className="text-white">
              Subscribe to our newsletter for the latest in medical news, health tips,
              and exclusive offers.
            </p>
            <form className="d-flex">
              <input
                type="email"
                className="form-control me-2"
                placeholder="Your email"
                aria-label="Your email"
              />
              <button className="btn btn-primary" type="submit">
                SUBSCRIBE
              </button>
            </form>
            <div className="mt-3 d-flex">
              <a href="#" className="text-white me-3">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
