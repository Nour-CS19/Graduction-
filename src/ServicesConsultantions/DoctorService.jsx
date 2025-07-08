import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from '../components/Nav';
import Footer from '../components/Footer';

function DoctorService() {
  const navigate = useNavigate();

  // Handle navigation based on consultation type
  const handleTypeSelection = (type) => {
    if (type === 'online') {
      navigate('/servicedoctoronlineofflineathome/online');
    } else if (type === 'offline') {
      navigate('/servicedoctoronlineofflineathome/offline');
    } else if (type === 'at-home') {
      navigate('/servicedoctoronlineofflineathome/athome');
    }
  };

  // Render Consultation Type Selection (First page only)
  return (
    <>
      <Navbar />
      <div className="container-fluid p-0">
        <div className="container py-5">
          <div className="row mt-5 justify-content-center">
            <div className="col-md-8 text-center mb-5">
              <h2>Select Consultation Type</h2>
              <p className="text-muted">Choose how you would like to consult with our specialists</p>
            </div>
          </div>
          <div className="row justify-content-center">
            {['online', 'offline', 'at-home'].map((type) => (
              <div key={type} className="col-md-3 mb-4">
                <div
                  className="card h-100 shadow-sm"
                  onClick={() => handleTypeSelection(type)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body text-center">
                    <i
                      className={`bi bi-${
                        type === 'online' ? 'laptop' : type === 'at-home' ? 'house-door' : 'building'
                      } fs-1 mb-3 ${
                        type === 'online' ? 'text-primary' : type === 'at-home' ? 'text-success' : 'text-danger'
                      }`}
                    ></i>
                    <h4>{type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</h4>
                    <p className="text-muted">
                      {type === 'online'
                        ? 'Video consultation from your home'
                        : type === 'at-home'
                        ? 'Doctor visits you at your place'
                        : 'Visit the clinic in person'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default DoctorService;