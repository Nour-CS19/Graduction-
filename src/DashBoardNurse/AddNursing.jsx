import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useAuth } from '../Pages/AuthPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddNursing = () => {
  const { user } = useAuth();
  const nurseId = user?.id || null;
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || null;

  const [nursings, setNursings] = useState([]);
  const [selectedNursingId, setSelectedNursingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [nurseNursings, setNurseNursings] = useState([]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  useEffect(() => {
    fetchNursings();
    if (nurseId) fetchNurseNursings();
  }, [nurseId]);

  const fetchNursings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://physiocareapp.runasp.net/api/v1/Nursings/GetAll', {
        headers: getAuthHeaders(),
      });
      if (response.data) {
        setNursings(response.data);
      }
    } catch (error) {
      console.error('Error fetching nursings:', error);
      showAlert('danger', 'Failed to load nursing services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNurseNursings = async () => {
    if (!nurseId) {
      showAlert('warning', 'Nurse ID not available. Please log in.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `https://physiocareapp.runasp.net/api/v1/NurseNursings/get-all-nurse-nursing/${nurseId}`,
        { headers: getAuthHeaders() }
      );
      if (response.data) {
        setNurseNursings(response.data);
      }
    } catch (error) {
      console.error('Error fetching nurse nursings:', error);
      showAlert('danger', 'Failed to load your nursing services.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nurseId) {
      showAlert('warning', 'Nurse ID not available. Please log in.');
      return;
    }
    if (!selectedNursingId) {
      showAlert('warning', 'Please select a nursing service.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('nurseId', nurseId);
      formData.append('nursingId', selectedNursingId.value);

      const response = await axios.post(
        'https://physiocareapp.runasp.net/api/v1/NurseNursings',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data', 'Accept': '*/*', ...getAuthHeaders() } }
      );
      if (response.status === 201 || response.status === 200) {
        showAlert('success', 'Nursing service added successfully!');
        setSelectedNursingId(null);
        fetchNurseNursings();
      }
    } catch (error) {
      console.error('Error adding nursing:', error);
      showAlert('danger', 'Failed to add nursing service. It might already be added or there was a server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNurseNursing = async (nurseNursingId) => {
    if (!window.confirm('Are you sure you want to delete this nursing service?')) return;

    try {
      setLoading(true);
      const response = await axios.delete(
        `https://physiocareapp.runasp.net/api/v1/NurseNursings/${nurseNursingId}`,
        { headers: getAuthHeaders() }
      );
      if (response.status === 200) {
        // Filter using nurseNursingID instead of id
        setNurseNursings(nurseNursings.filter((item) => item.nurseNursingID !== nurseNursingId));
        showAlert('success', 'Nursing service deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting nurse nursing:', error);
      let errorMsg = 'Failed to delete nursing service.';
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMsg = 'Unauthorized. Please log in again.';
            break;
          case 404:
            errorMsg = 'Nursing service not found.';
            break;
          case 500:
            errorMsg = 'Server error. Please try again later.';
            break;
          default:
            errorMsg = `Failed to delete. Status: ${error.response.status}. Message: ${error.response.data?.message || error.message}`;
        }
      } else {
        errorMsg += ` ${error.message}`;
      }
      showAlert('danger', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const nursingOptions = nursings.map((nursing) => ({
    value: nursing.id,
    label: nursing.name,
  }));

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Add Nursing Service</h2>

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

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nursingId" className="form-label">
                    Select Nursing Service
                  </label>
                  <Select
                    id="nursingId"
                    options={nursingOptions}
                    value={selectedNursingId}
                    onChange={setSelectedNursingId}
                    placeholder="-- Select a nursing service --"
                    classNamePrefix="react-select"
                    isDisabled={loading || nursings.length === 0}
                    isSearchable
                    required
                  />
                </div>

                <div className="d-grid mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || nursings.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Adding...
                      </>
                    ) : (
                      'Add Nursing Service'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-4">
                <h4 className="text-center mb-3">Your Nursing Services</h4>
                {nurseNursings.length > 0 ? (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Nursing Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nurseNursings.map((nursing) => (
                        <tr key={nursing.nurseNursingID}>
                          <td>{nursing.name || 'N/A'}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteNurseNursing(nursing.nurseNursingID)}
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
                  <div className="alert alert-info">No nursing services found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNursing;