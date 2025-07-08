/*

import React, { useState, useEffect } from 'react';

const HealthcareFinderApp = () => {
  const [specialties, setSpecialties] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchName, setSearchName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('in-person');
  const [serviceType, setServiceType] = useState('doctors'); // New state for service type

  // Base API URL
  const API_BASE = 'https://physiocareapp.runasp.net/api/v1';

  // Fetch specialties on component mount
  useEffect(() => {
    fetchSpecialties();
    fetchCities();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await fetch(`${API_BASE}/Specializations/GetAll`);
      const data = await response.json();
      setSpecialties(data);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE}/Cities/GetAll`);
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleSearch = async () => {
    if (!selectedSpecialty && !searchName) {
      alert(`Please select a specialty or enter a ${serviceType === 'doctors' ? 'doctor' : serviceType === 'laboratories' ? 'laboratory' : 'nurse'} name`);
      return;
    }

    setLoading(true);
    try {
      let url;
      
      // API endpoints based on service type
      if (serviceType === 'doctors') {
        if (searchName) {
          url = `${API_BASE}/Doctors/GetDoctorsForSpecialization/${selectedSpecialty || ''}?name=${encodeURIComponent(searchName)}`;
        } else {
          if (selectedCity) {
            url = `${API_BASE}/DoctorSpecializationAtClinics/GetDoctorsAtClinic?specialId=${selectedSpecialty}&cityName=${encodeURIComponent(selectedCity)}`;
          } else {
            url = `${API_BASE}/Doctors/GetDoctorsForSpecialization/${selectedSpecialty}`;
          }
        }
      } else if (serviceType === 'laboratories') {
        // For laboratories - you might need to adjust these endpoints based on your actual API
        if (searchName) {
          url = `${API_BASE}/Laboratories/GetLaboratoriesForSpecialization/${selectedSpecialty || ''}?name=${encodeURIComponent(searchName)}`;
        } else {
          if (selectedCity) {
            url = `${API_BASE}/Laboratories/GetLaboratoriesInCity?specialId=${selectedSpecialty}&cityName=${encodeURIComponent(selectedCity)}`;
          } else {
            url = `${API_BASE}/Laboratories/GetLaboratoriesForSpecialization/${selectedSpecialty}`;
          }
        }
      } else if (serviceType === 'nurses') {
        // For nurses - you might need to adjust these endpoints based on your actual API
        if (searchName) {
          url = `${API_BASE}/Nurses/GetNursesForSpecialization/${selectedSpecialty || ''}?name=${encodeURIComponent(searchName)}`;
        } else {
          if (selectedCity) {
            url = `${API_BASE}/Nurses/GetNursesInCity?specialId=${selectedSpecialty}&cityName=${encodeURIComponent(selectedCity)}`;
          } else {
            url = `${API_BASE}/Nurses/GetNursesForSpecialization/${selectedSpecialty}`;
          }
        }
      }

      const response = await fetch(url);
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(`Error searching ${serviceType}:`, error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedSpecialty('');
    setSelectedCity('');
    setSearchName('');
    setResults([]);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear search results when switching tabs
    setResults([]);
  };

  const handleServiceTypeChange = (type) => {
    setServiceType(type);
    setResults([]);
    setSelectedSpecialty('');
    setSelectedCity('');
    setSearchName('');
  };

  const getServiceConfig = () => {
    switch (serviceType) {
      case 'doctors':
        return {
          title: 'Find the Best Doctors in Egypt',
          subtitle: 'High-quality healthcare across the Nile Valley and beyond',
          icon: 'fas fa-user-md',
          searchPlaceholder: 'Search for Doctors',
          nameLabel: 'Doctor Name',
          namePlaceholder: "Enter doctor's name",
          resultIcon: 'fa-user-md',
          bookingText: 'Book Appointment'
        };
      case 'laboratories':
        return {
          title: 'Find the Best Laboratories in Egypt',
          subtitle: 'Accurate diagnostic services across the country',
          icon: 'fas fa-flask',
          searchPlaceholder: 'Search for Laboratories',
          nameLabel: 'Laboratory Name',
          namePlaceholder: "Enter laboratory's name",
          resultIcon: 'fa-flask',
          bookingText: 'Book Test'
        };
      case 'nurses':
        return {
          title: 'Find Professional Nurses in Egypt',
          subtitle: 'Qualified nursing care in your area',
          icon: 'fas fa-user-nurse',
          searchPlaceholder: 'Search for Nurses',
          nameLabel: 'Nurse Name',
          namePlaceholder: "Enter nurse's name",
          resultIcon: 'fa-user-nurse',
          bookingText: 'Book Service'
        };
      default:
        return {};
    }
  };

  const config = getServiceConfig();

  return (
    <>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      
      <style>
        {`
          body { background-color: #f8f9fa; }
          .bg-teal { background-color: #20B2AA !important; }
          .text-teal { color: #20B2AA !important; }
          .btn-teal { 
            background-color: #20B2AA; 
            border-color: #20B2AA; 
            color: white;
          }
          .btn-teal:hover { 
            background-color: #1a9999; 
            border-color: #1a9999; 
            color: white;
          }
          .rounded-4 { border-radius: 1.5rem !important; }
          .rounded-5 { border-radius: 2rem !important; }
          .custom-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 16px 12px;
          }
          .form-control:focus, .form-select:focus {
            border-color: #86b7fe;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
          }
          .search-card {
            background: white;
            border: 1px solid #dee2e6;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          }
          .icon-blue { color: #0d6efd; }
          .icon-teal { color: #20B2AA; }
          .tab-active {
            background-color: #20B2AA !important;
          }
          .tab-inactive {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
          }
          .tab-active .tab-content {
            background-color: white;
          }
          .tab-inactive .tab-content {
            background-color: white;
          }
          .tab-clickable {
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .tab-clickable:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .service-type-active {
            background-color: #20B2AA !important;
            color: white !important;
          }
          .service-type-inactive {
            background-color: white;
            border: 2px solid #dee2e6;
            color: #6c757d;
          }
          .service-type-clickable {
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .service-type-clickable:hover {
            border-color: #20B2AA;
            color: #20B2AA;
          }
        `}
      </style>

      <div className="bg-light min-vh-100">
        <div className="container py-4">
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <div 
                  className={`p-3 rounded-4 service-type-clickable ${serviceType === 'doctors' ? 'service-type-active' : 'service-type-inactive'}`}
                  onClick={() => handleServiceTypeChange('doctors')}
                >
                  <div className="d-flex align-items-center">
                    <i className="fas fa-user-md me-2"></i>
                    <span className="fw-semibold">Doctors</span>
                  </div>
                </div>
                <div 
                  className={`p-3 rounded-4 service-type-clickable ${serviceType === 'laboratories' ? 'service-type-active' : 'service-type-inactive'}`}
                  onClick={() => handleServiceTypeChange('laboratories')}
                >
                  <div className="d-flex align-items-center">
                    <i className="fas fa-flask me-2"></i>
                    <span className="fw-semibold">Laboratories</span>
                  </div>
                </div>
                <div 
                  className={`p-3 rounded-4 service-type-clickable ${serviceType === 'nurses' ? 'service-type-active' : 'service-type-inactive'}`}
                  onClick={() => handleServiceTypeChange('nurses')}
                >
                  <div className="d-flex align-items-center">
                    <i className="fas fa-user-nurse me-2"></i>
                    <span className="fw-semibold">Nurses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-teal text-white p-4 rounded-5 mb-4">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <i className={`${config.icon} fs-1`}></i>
              </div>
              <div>
                <h1 className="h2 mb-1 fw-bold">{config.title}</h1>
                <p className="mb-0 opacity-75">{config.subtitle}</p>
              </div>
            </div>
          </div>

          {(serviceType === 'doctors' || serviceType === 'nurses') && (
            <div className="row mb-4">
              <div className="col-md-6">
                <div 
                  className={`p-3 rounded-4 tab-clickable ${activeTab === 'in-person' ? 'tab-active' : 'tab-inactive'}`}
                  onClick={() => handleTabChange('in-person')}
                >
                  <div className="tab-content rounded-3 p-3 d-flex align-items-center">
                    <div className={`rounded-circle me-3 d-flex align-items-center justify-content-center ${activeTab === 'in-person' ? 'bg-success' : 'bg-secondary'}`} style={{width: '12px', height: '12px'}}>
                    </div>
                    <i className="far fa-calendar-check me-3 fs-5"></i>
                    <div>
                      <div className="fw-bold text-dark">Book {serviceType === 'doctors' ? 'a Doctor' : 'a Nurse'}</div>
                      <small className="text-muted">In-person visits</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div 
                  className={`p-3 rounded-4 tab-clickable ${activeTab === 'telehealth' ? 'tab-active' : 'tab-inactive'}`}
                  onClick={() => handleTabChange('telehealth')}
                >
                  <div className="tab-content rounded-3 p-3 d-flex align-items-center">
                    <div className={`rounded-circle me-3 d-flex align-items-center justify-content-center ${activeTab === 'telehealth' ? 'bg-success' : 'bg-secondary'}`} style={{width: '12px', height: '12px'}}>
                    </div>
                    <i className="fas fa-video me-3 fs-5"></i>
                    <div>
                      <div className="fw-bold text-dark">{serviceType === 'doctors' ? 'Telehealth' : 'Virtual Consultation'}</div>
                      <small className="text-muted">Virtual consultations</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="position-relative">
              <i className="fas fa-search position-absolute text-primary" style={{left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: '10'}}></i>
              <input
                type="text"
                className="form-control form-control-lg rounded-4 ps-5"
                placeholder={
                  serviceType === 'laboratories' 
                    ? config.searchPlaceholder
                    : activeTab === 'in-person' 
                      ? `Search for In-Person ${serviceType === 'doctors' ? 'Doctors' : 'Nurses'}` 
                      : `Search for ${serviceType === 'doctors' ? 'Telehealth Doctors' : 'Virtual Consultation Nurses'}`
                }
                style={{padding: '1rem 1rem 1rem 3rem', fontSize: '1.1rem'}}
              />
            </div>
          </div>

          <div className="search-card rounded-4 p-4">
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <label className="form-label d-flex align-items-center icon-blue fw-semibold mb-2">
                  <i className="fas fa-stethoscope me-2"></i>
                  {serviceType === 'laboratories' ? 'Test Type' : 'Specialty'} ({specialties.length} available)
                </label>
                <select
                  className="form-select custom-select rounded-3"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  style={{padding: '0.75rem 2.5rem 0.75rem 1rem'}}
                >
                  <option value="">{serviceType === 'laboratories' ? 'Select Test Type' : 'Select Specialty'}</option>
                  {specialties.map((specialty, index) => (
                    <option key={index} value={specialty.id || index}>
                      {specialty.nameEN || specialty.nameAR}
                    </option>
                  ))}
                </select>
              </div>

              {(serviceType === 'laboratories' || activeTab === 'in-person') && (
                <div className="col-md-4">
                  <label className="form-label d-flex align-items-center icon-blue fw-semibold mb-2">
                    <div className="bg-primary rounded me-2" style={{width: '16px', height: '16px'}}></div>
                    City ({cities.length} available)
                  </label>
                  <select
                    className="form-select custom-select rounded-3"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    style={{padding: '0.75rem 2.5rem 0.75rem 1rem'}}
                  >
                    <option value="">Select City</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city.cityName}>
                        {city.cityName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={`col-md-${(serviceType === 'laboratories' || activeTab === 'in-person') ? '4' : '8'}`}>
                <label className="form-label d-flex align-items-center icon-blue fw-semibold mb-2">
                  <i className={`fas ${serviceType === 'laboratories' ? 'fa-building' : 'fa-user'} me-2`}></i>
                  {config.nameLabel}
                </label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder={config.namePlaceholder}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  style={{padding: '0.75rem 1rem'}}
                />
              </div>
            </div>

            <div className="d-flex gap-3">
              <button
                className="btn btn-teal px-4 py-2 rounded-3 d-flex align-items-center fw-semibold"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search me-2"></i>
                    Search {serviceType === 'laboratories' ? 'Laboratories' : activeTab === 'telehealth' ? 'Virtual' : 'In-Person'}
                  </>
                )}
              </button>
              <button
                className="btn btn-outline-danger px-4 py-2 rounded-3 d-flex align-items-center fw-semibold"
                onClick={handleClear}
              >
                <i className="fas fa-times-circle me-2"></i>
                Clear
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="mt-5">
              <h3 className="fw-bold mb-4">
                {serviceType === 'laboratories' ? '' : activeTab === 'telehealth' ? 'Virtual ' : ''}
                Search Results ({results.length} {serviceType} found)
              </h3>
              <div className="row g-4">
                {results.map((result, index) => (
                  <div key={index} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-start mb-3">
                          <div className="bg-teal p-3 rounded-circle me-3">
                            <i className={`fas ${serviceType === 'laboratories' || activeTab !== 'telehealth' ? config.resultIcon : 'fa-video'} text-white`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="card-title fw-bold mb-1">
                              {result.name || result.doctorName || result.laboratoryName || result.nurseName || 
                               `${serviceType === 'doctors' ? 'Dr.' : serviceType === 'laboratories' ? 'Lab' : 'Nurse'} ${result.firstName || ''} ${result.lastName || ''}` || 
                               `${serviceType === 'doctors' ? 'Doctor' : serviceType === 'laboratories' ? 'Laboratory' : 'Nurse'} Name`}
                            </h5>
                            <p className="text-muted small mb-0">
                              {result.specialization || result.specialty || result.testType || 'Specialization'}
                            </p>
                          </div>
                        </div>
                        
                        {result.clinic && (serviceType === 'doctors' || serviceType === 'nurses') && activeTab === 'in-person' && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-clinic-medical text-muted me-2"></i>
                            <small className="text-muted">{result.clinic}</small>
                          </div>
                        )}

                        {result.address && serviceType === 'laboratories' && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-map-marker-alt text-muted me-2"></i>
                            <small className="text-muted">{result.address}</small>
                          </div>
                        )}
                        
                        {activeTab === 'telehealth' && serviceType !== 'laboratories' && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-wifi text-muted me-2"></i>
                            <small className="text-muted">{serviceType === 'doctors' ? 'Online Consultation Available' : 'Virtual Nursing Care Available'}</small>
                          </div>
                        )}
                        
                        {result.city && (
                          <div className="d-flex align-items-center mb-3">
                            <i className="fas fa-map-marker-alt text-muted me-2"></i>
                            <small className="text-muted">{result.city}</small>
                          </div>
                        )}
                        
                        <button className="btn btn-teal w-100 rounded-3 fw-semibold">
                          {activeTab === 'telehealth' && serviceType !== 'laboratories' ? 
                            (serviceType === 'doctors' ? 'Start Video Call' : 'Start Virtual Consultation') : 
                            config.bookingText}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 && !loading && (selectedSpecialty || selectedCity || searchName) && (
            <div className="mt-5">
              <div className="alert alert-info rounded-4 d-flex align-items-center">
                <i className="fas fa-info-circle me-3"></i>
                <span>No {serviceType === 'laboratories' ? '' : activeTab === 'telehealth' ? 'virtual ' : ''}{serviceType} found matching your search criteria. Please try adjusting your filters.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </>
  );
};

export default HealthcareFinderApp;


*/


