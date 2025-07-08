import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useAuth } from '../Pages/AuthPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddPlace = () => {
  const { user } = useAuth();
  const nurseId = user?.id || null;
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || null;

  const [nurseNursings, setNurseNursings] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedNurseNursingId, setSelectedNurseNursingId] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [nurseNursingCities, setNurseNursingCities] = useState([]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  useEffect(() => {
    fetchNurseNursings();
    fetchCities();
  }, []);

  const fetchNurseNursings = async () => {
    if (!nurseId) {
      showAlert('warning', 'Nurse ID not available. Please log in.');
      return;
    }
    try {
      setLoadingData(true);
      const response = await axios.get(`https://physiocareapp.runasp.net/api/v1/NurseNursings/get-all-nurse-nursing/${nurseId}`, {
        headers: getAuthHeaders(),
      });
      if (response.data) {
        setNurseNursings(response.data);
      }
    } catch (error) {
      console.error('Error fetching nurse nursings:', error);
      showAlert('danger', 'Failed to load your nursing services. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchCities = async () => {
    try {
      setLoadingData(true);
      const response = await axios.get('https://physiocareapp.runasp.net/api/v1/Cities/GetAll', {
        headers: getAuthHeaders(),
      });
      if (response.data) {
        setCities(response.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      showAlert('danger', 'Failed to load cities. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!nurseId || !token || !selectedCityId) {
      setNurseNursingCities([]);
      return;
    }

    const fetchNurseNursingCities = async () => {
      try {
        setLoadingData(true);
        const response = await axios.get(
          `https://physiocareapp.runasp.net/api/v1/NurseNursingCities/get-all-nurse-nursing-for-city?nurseId=${nurseId}&cityId=${selectedCityId.value}`,
          { headers: getAuthHeaders() }
        );
        if (response.data) {
          setNurseNursingCities(response.data);
        }
      } catch (error) {
        console.error('Error fetching nurse-nursing-cities:', error);
        showAlert('danger', 'Failed to load nurse-nursing-cities.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchNurseNursingCities();
  }, [nurseId, token, selectedCityId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nurseId) {
      showAlert('warning', 'Nurse ID not available. Please log in.');
      return;
    }
    if (!selectedNurseNursingId || !selectedCityId || !price) {
      showAlert('warning', 'Please fill all required fields.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('nurseNursingId', selectedNurseNursingId.value);
      formData.append('cityId', selectedCityId.value);
      formData.append('price', price);

      const response = await axios.post(
        'https://physiocareapp.runasp.net/api/v1/NurseNursingCities',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data', ...getAuthHeaders() } }
      );
      if (response.status === 201 || response.status === 200) {
        showAlert('success', 'Place added successfully!');
        setSelectedNurseNursingId(null);
        setSelectedCityId(null);
        setPrice('');
      }
    } catch (error) {
      console.error('Error adding place:', error);
      showAlert('danger', 'Failed to add place. It might already exist or there was a server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNurseNursingCity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this nurse-nursing-city association?")) return;

    try {
      setLoading(true);
      const response = await axios.delete(
        `https://physiocareapp.runasp.net/api/v1/NurseNursingCities/${id}`,
        { headers: getAuthHeaders() }
      );
      if (response.status === 200) {
        setNurseNursingCities(nurseNursingCities.filter((item) => item.id !== id));
        showAlert('success', 'Nurse-nursing-city deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting nurse-nursing-city:', error);
      showAlert('danger', `Failed to delete. ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const getSelectedCityName = () => {
    if (!selectedCityId) return '';
    return selectedCityId.label;
  };

  const nurseNursingOptions = nurseNursings.map((nursing) => ({
    value: nursing.nurseNursingID,
    label: nursing.name,
  }));

  const cityOptions = cities.map((city) => ({
    value: city.id,
    label: city.cityName,
  }));

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Add Place for Nursing Service</h2>

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

      {loadingData ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="nurseNursingId" className="form-label">
                      Select Nursing Service
                    </label>
                    <Select
                      id="nurseNursingId"
                      options={nurseNursingOptions}
                      value={selectedNurseNursingId}
                      onChange={setSelectedNurseNursingId}
                      placeholder="-- Select your nursing service --"
                      classNamePrefix="react-select"
                      isDisabled={loading}
                      isSearchable
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="cityId" className="form-label">
                      Select City
                    </label>
                    <Select
                      id="cityId"
                      options={cityOptions}
                      value={selectedCityId}
                      onChange={setSelectedCityId}
                      placeholder="-- Select a city --"
                      classNamePrefix="react-select"
                      isDisabled={loading}
                      isSearchable
                      required
                    />
                    {selectedCityId && (
                      <div className="mt-2 text-muted small">
                        Selected city: {getSelectedCityName()}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="price" className="form-label">
                      Price
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                        placeholder="Enter price for this service in this city"
                      />
                    </div>
                  </div>

                  <div className="d-grid mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adding Place...
                        </>
                      ) : (
                        'Add Place'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-4">
                  <h4 className="text-center mb-3">Existing Nurse-Nursing-City Associations</h4>
                  {nurseNursingCities.length > 0 ? (
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Nursing Name</th>
                          <th>City Name</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nurseNursingCities.map((item) => (
                          <tr key={item.id}>
                            <td>{item.nursingName || 'N/A'}</td>
                            <td>{item.cityName || 'N/A'}</td>
                            <td>{item.price ? `$${item.price}` : 'N/A'}</td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteNurseNursingCity(item.id)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="alert alert-info">No nurse-nursing-city associations found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPlace;