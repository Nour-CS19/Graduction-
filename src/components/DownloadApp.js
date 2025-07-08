import React from 'react';
import { FaGooglePlay, FaApple } from 'react-icons/fa';
import bg from '../assets/images/003b6a45-7816-4519-850c-43afbd8fe09e_removalai_preview.png'
const DownloadApp = () => {
  return (
    <section className="download-app position-relative py-5" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <div className="row align-items-center">
          {/* Image on the left */}
          <div className="col-lg-6 mb-4 mb-lg-0 text-center">
            <img
              src={bg}
              alt="App Preview"
              className="img-fluid rounded shadow-sm app-image"
              style={{ maxHeight: '300px', objectFit: 'contain' }}
            />
          </div>

          {/* Text and buttons on the right */}
          <div className="col-lg-6 text-center text-lg-start">
            <h2 className="display-4 fw-bold text-dark mb-4">
              Download Our Mobile App
            </h2>
            <p className="lead text-muted mb-4">
              Access your health information, stay updated with the latest reports, and manage your care seamlessly on the go.
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark btn-lg d-flex align-items-center justify-content-center px-4 py-2 shadow"
              >
                <FaGooglePlay className="me-2" size={20} />
                Google Play
              </a>
              <a
                href="https://www.apple.com/app-store"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg d-flex align-items-center justify-content-center px-4 py-2 shadow"
              >
                <FaApple className="me-2" size={20} />
                App Store
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25" style={{ zIndex: -1 }}>
        <svg className="w-100 h-100" viewBox="0 0 1440 320">
          <path
            fill="#e9ecef"
            fillOpacity="1"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,186.7C960,213,1056,235,1152,213.3C1248,192,1344,128,1392,96L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <style jsx>{`
        .download-app {
          overflow: hidden;
        }

        /* Animation for image hover */
        .app-image {
          transition: transform 0.3s ease-in-out;
        }

        .app-image:hover {
          transform: scale(1.05);
        }

        /* Button hover effects */
        .btn-dark:hover,
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Ensure buttons are accessible */
        .btn:focus {
          outline: 2px solid #0d6efd;
          outline-offset: 2px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .display-4 {
            font-size: 2.5rem;
          }

          .lead {
            font-size: 1rem;
          }

          .app-image {
            max-width: 300px;
          }

          .d-flex {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 576px) {
          .display-4 {
            font-size: 2rem;
          }

          .lead {
            font-size: 0.9rem;
          }

          .app-image {
            max-width: 250px;
          }

          .btn-lg {
            padding: 0.5rem 1rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default DownloadApp;