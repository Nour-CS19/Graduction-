import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Pages/AuthPage';

const PlacesByCity = () => {
  const { user, logout } = useAuth(); // Get user context including nurse ID
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [nurseNursingCities, setNurseNursingCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [editData, setEditData] = useState({ id: '', name: '', description: '' }); // State for edit form

  // Current date and time for logging (07:53 AM EEST, June 15, 2025)
  const currentDateTime = new Date('2025-06-15T04:53:00Z').toLocaleString('en-US', { timeZone: 'Europe/Bucharest' });
  console.log(`[${currentDateTime}] Component initialized`);

  // Get authorization headers
  const getAuthHeaders = () => {
    const token = user?.accessToken || localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedCityId && user?.id) {
      fetchNurseNursingsByCity();
    } else {
      setNurseNursingCities([]);
    }
  }, [selectedCityId, user?.id]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://physiocareapp.runasp.net/api/v1/Cities/GetAll', {
        headers: getAuthHeaders(),
      });
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
        {
          params: { nurseId: user?.id, cityId: selectedCityId },
          headers: getAuthHeaders(),
        }
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

  const updateNurseNursingCity = async (id) => {
    try {
      setLoading(true);
      const updatedData = {
        name: editData.name || nurseNursingCities.find(item => item.id === id)?.nursingName || 'N/A',
        description: editData.description || 'Updated Description', // Default or user input
      };
      const response = await axios.put(
        `https://physiocareapp.runasp.net/api/v1/NurseNursingCities/${id}`,
        updatedData,
        { headers: getAuthHeaders() }
      );
      console.log(`[${currentDateTime}] Successfully updated NurseNursingCity with ID ${id}:`, response.data);
      showAlert('success', 'Nurse nursing city updated successfully.');
      setEditData({ id: '', name: '', description: '' }); // Reset edit form
      fetchNurseNursingsByCity(); // Refresh the list
    } catch (error) {
      console.error(`[${currentDateTime}] Error updating NurseNursingCity with ID ${id}:`, error);
      showAlert('danger', 'Failed to update nurse nursing city. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteNurseNursingCity = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `https://physiocareapp.runasp.net/api/v1/NurseNursingCities/${id}`,
        { headers: getAuthHeaders() }
      );
      console.log(`[${currentDateTime}] Successfully deleted NurseNursingCity with ID ${id}:`, response.status);
      showAlert('success', 'Nurse nursing city deleted successfully.');
      fetchNurseNursingsByCity(); // Refresh the list
    } catch (error) {
      console.error(`[${currentDateTime}] Error deleting NurseNursingCity with ID ${id}:`, error);
      showAlert('danger', 'Failed to delete nurse nursing city. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditData({
      id: item.id,
      name: item.nursingName,
      description: '', // Initialize description (can be edited)
    });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (editData.id) {
      updateNurseNursingCity(editData.id);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Get the selected city's name for display
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
                          Actions
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
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => handleEditClick(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteNurseNursingCity(item.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Edit Form */}
                  {editData.id && (
                    <div className="card mt-4 shadow-sm">
                      <div className="card-body">
                        <h5 className="card-title">Edit Nursing Service</h5>
                        <form onSubmit={handleUpdateSubmit}>
                          <div className="mb-3">
                            <label htmlFor="editName" className="form-label">Name</label>
                            <input
                              type="text"
                              className="form-control"
                              id="editName"
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="editDescription" className="form-label">Description</label>
                            <input
                              type="text"
                              className="form-control"
                              id="editDescription"
                              value={editData.description}
                              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                              required
                            />
                          </div>
                          <button type="submit" className="btn btn-primary">
                            Update
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => setEditData({ id: '', name: '', description: '' })}
                          >
                            Cancel
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
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