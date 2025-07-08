import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Pages/AuthPage'; // Adjust the import path as needed

const PlacesByCity = () => {
  const { user } = useAuth();
  const nurseId = user?.id || null; // Retrieve nurse ID from Auth context
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [nurseNursingCities, setNurseNursingCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Current date and time for logging
  const currentDateTime = new Date().toLocaleString('en-US', { timeZone: 'Europe/Bucharest' });
  console.log(`[${currentDateTime}] Component initialized`);

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedCityId && nurseId) {
      fetchNurseNursingsByCity();
    } else {
      setNurseNursingCities([]);
    }
  }, [selectedCityId, nurseId]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://physiocareapp.runasp.net/api/v1/Cities/GetAll');
      if (response.data) {
        const citiesData = response.data.map((city) => ({
          id: city.id,
          name: city.name || city.cityName || 'Unknown City',
        }));
        console.log(`[${currentDateTime}] Fetched cities from /api/v1/Cities/GetAll:`, citiesData);
        setCities(citiesData);
      } else {
        showAlert('warning', 'No cities found.');
        console.log(`[${currentDateTime}] No cities returned from /api/v1/Cities/GetAll`);
      }
    } catch (error) {
      console.error(`[${currentDateTime}] Error fetching cities:`, error);
      showAlert('danger', 'Failed to load cities. Please try again.');
      const mockCities = [
        { id: 'city-1', name: 'Qwesna' },
        { id: 'city-2', name: 'Tala' },
      ];
      console.log(`[${currentDateTime}] Using mock cities:`, mockCities);
      setCities(mockCities);
    } finally {
      setLoading(false);
    }
  };

  const fetchNurseNursingsByCity = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://physiocareapp.runasp.net/api/v1/NurseNursingCities/get-all-nurse-nursing-for-city`,
        { params: { nurseId, cityId: selectedCityId } }
      );

      if (response.data) {
        const nursingData = response.data.map((item) => ({
          id: item.id,
          nursingName: item.nursingName || 'N/A',
          cityName: item.cityName || 'N/A',
          price: item.price || 0.0,
        }));
        console.log(`[${currentDateTime}] Fetched nurse nursing cities:`, nursingData);
        setNurseNursingCities(nursingData);
      } else {
        setNurseNursingCities([]);
        showAlert('info', 'No nursing services found for this city.');
        console.log(`[${currentDateTime}] No nursing services found for cityId: ${selectedCityId}`);
      }
    } catch (error) {
      console.error(`[${currentDateTime}] Error fetching nurse nursings by city:`, error);
      showAlert('danger', 'Failed to load nursing services for this city. Please try again.');
      const mockNurseNursingCities = [
        {
          id: 'nurse-1',
          nursingName: 'Calona',
          cityName: 'Qwesna',
          price: 150.0,
        },
        {
          id: 'nurse-2',
          nursingName: 'MedCare',
          cityName: 'Qwesna',
          price: 200.0,
        },
      ];
      console.log(`[${currentDateTime}] Using mock nurse nursing cities:`, mockNurseNursingCities);
      setNurseNursingCities(mockNurseNursingCities);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  const selectedCity = cities.find((city) => city.id === selectedCityId);
  const selectedCityName = selectedCity ? selectedCity.name : 'Selected City';
  console.log(`[${currentDateTime}] Selected city:`, selectedCity);

  return (
    <div className="places-by-city-container">
      <h2 className="text-center section-title mb-4">Nursing Services by City</h2>

      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlert({ show: false, type: '', message: '' })}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="cityId" className="form-label fw-bold">Select City</label>
                <select
                  id="cityId"
                  className="form-select"
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- Select a city --</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spinner-container text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {selectedCityId && (
            <div className="table-container mx-auto" style={{ maxWidth: '800px', padding: '0 15px' }}>
              <h4 className="text-center mb-3">Nursing Services in {selectedCityName}</h4>
              {nurseNursingCities.length === 0 ? (
                <div className="alert alert-info text-center" role="alert">
                  No nursing services found for this city.
                </div>
              ) : (
                <div className="table-responsive">
                  <table
                    className="table table-striped table-hover table-bordered table-primary shadow-sm"
                    style={{ backgroundColor: '#fff' }}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: '40%', textAlign: 'center', padding: '12px' }}>
                          Nursing Service
                        </th>
                        <th style={{ width: '30%', textAlign: 'center', padding: '12px' }}>
                          City
                        </th>
                        <th style={{ width: '30%', textAlign: 'center', padding: '12px' }}>
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {nurseNursingCities.map((item) => (
                        <tr key={item.id}>
                          <td style={{ textAlign: 'center', padding: '12px' }}>
                            {item.nursingName || 'N/A'}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px' }}>
                            {item.cityName || 'N/A'}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px' }}>
                            ${item.price ? item.price.toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlacesByCity;