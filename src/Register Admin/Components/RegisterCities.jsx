import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../Pages/AuthPage";

// Fixed API functions for Cities with proper error handling and authorization
const API_BASE_URL = 'https://physiocareapp.runasp.net/api/v1';
const MAX_RETRIES = 3;

const CitiesPage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [cities, setCities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [formData, setFormData] = useState({
    governorate: '',
    cityName: '',
    area: '',
    street: ''
  });

  // Helper function to get current access token
  const getAccessToken = useCallback(() => {
    const token = user?.accessToken || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ No access token found');
      return null;
    }
    
    console.log('✅ Access token retrieved successfully');
    return token;
  }, [user]);

  // Helper function to create axios config with authorization
  const createAuthConfig = useCallback((additionalHeaders = {}) => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token available. Please log in again.');
    }

    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...additionalHeaders
      }
    };
  }, [getAccessToken]);

  // Helper function to handle token refresh
  const attemptRefreshToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.warn('⚠️ No refresh token available');
      return null;
    }

    try {
      console.log('🔄 Attempting to refresh token...');
      const response = await fetch(`${API_BASE_URL}/Account/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const { accessToken, refreshToken: newRefreshToken } = data;
      
      // Update localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      console.log('✅ Token refreshed successfully');
      return accessToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      logout();
      return null;
    }
  }, [logout]);

  // Enhanced parseResponse with auth handling
  const parseResponse = async (response, isRetry = false) => {
    const text = await response.text();
    console.log('Raw response:', text);
    
    // Handle 401 errors with token refresh
    if (response.status === 401 && !isRetry && retryCount < MAX_RETRIES) {
      console.log('🔄 Received 401, attempting token refresh...');
      const newToken = await attemptRefreshToken();
      if (newToken) {
        setRetryCount(prev => prev + 1);
        throw new Error('TOKEN_REFRESH_RETRY');
      }
    }
    
    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    if (!text) {
      return {};
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      if (text.toLowerCase().includes('success') || text.toLowerCase().includes('added') || text.toLowerCase().includes('updated')) {
        console.log('Success message received:', text);
        return { success: true, message: text };
      }
      console.error('Failed to parse JSON:', text);
      throw new Error('Invalid response from server');
    }
  };

  // Helper function for authenticated API calls with retry logic
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('No access token available. Please log in again.');
    }

    const authOptions = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, authOptions);
      return await parseResponse(response);
    } catch (error) {
      if (error.message === 'TOKEN_REFRESH_RETRY' && retryCount < MAX_RETRIES) {
        // Retry with new token
        const newToken = getAccessToken();
        const retryOptions = {
          ...options,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            ...options.headers
          }
        };
        const retryResponse = await fetch(url, retryOptions);
        return await parseResponse(retryResponse, true);
      }
      throw error;
    }
  }, [getAccessToken, retryCount, attemptRefreshToken]);

  // Authorized API functions
  const citiesApi = {
    getAll: () => makeAuthenticatedRequest(`${API_BASE_URL}/Cities/GetAll`),
    
    create: (data) => {
      const formData = new FormData();
      formData.append('Governorate', data.governorate || '');
      formData.append('CityName', data.cityName || '');
      formData.append('Area', data.area || '');
      formData.append('Street', data.street || '');
      
      console.log('Creating city with data:', data);
      
      return makeAuthenticatedRequest(`${API_BASE_URL}/Cities`, {
        method: 'POST',
        body: formData
      });
    },
    
    update: (id, data) => {
      const formData = new FormData();
      formData.append('Governorate', data.governorate || '');
      formData.append('CityName', data.cityName || '');
      formData.append('Area', data.area || '');
      formData.append('Street', data.street || '');
      
      console.log('Updating city with ID:', id, 'Data:', data);
      
      return makeAuthenticatedRequest(`${API_BASE_URL}/Cities/${id}`, {
        method: 'PUT',
        body: formData
      });
    },
    
    delete: (id) => {
      console.log('Deleting city with ID:', id);
      
      return makeAuthenticatedRequest(`${API_BASE_URL}/Cities/${id}`, {
        method: 'DELETE'
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCities();
    }
  }, [isAuthenticated]);

  // Auto-hide success or error message after 3 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      setErrorMessage('Please log in to access cities management.');
      return;
    }

    // Clear auth error if user becomes authenticated
    if (errorMessage?.includes('log in')) {
      setErrorMessage('');
    }
  }, [isAuthenticated, errorMessage]);

  const loadCities = async () => {
    if (!isAuthenticated) {
      setErrorMessage('Please log in to load cities.');
      return;
    }

    setLoading(true);
    try {
      console.log('📋 Fetching cities...');
      const data = await citiesApi.getAll();
      console.log('✅ Cities fetched:', data);
      setCities(Array.isArray(data) ? data : []);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('❌ Error loading cities:', error);
      let errorMsg = 'Failed to load cities';
      
      if (error.message.includes('Session expired')) {
        errorMsg = 'Session expired. Please log in again.';
      } else if (error.message.includes('permission')) {
        errorMsg = 'You do not have permission to view cities.';
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setErrorMessage('Please log in to save cities.');
      return;
    }

    if (!formData.governorate || !formData.cityName) {
      setErrorMessage('Please fill in required fields (Governorate and City Name)');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      if (editingCity) {
        console.log('🏙️ Updating city...');
        const result = await citiesApi.update(editingCity.id, formData);
        console.log('✅ Update result:', result);
        
        setSuccessMessage('City updated successfully!');
        setCities(prevCities =>
          prevCities.map(city =>
            city.id === editingCity.id
              ? { ...city, ...formData, id: editingCity.id }
              : city
          )
        );
      } else {
        console.log('🏙️ Creating city...');
        const result = await citiesApi.create(formData);
        console.log('✅ Create result:', result);
        
        setSuccessMessage('City created successfully!');
        await loadCities(); // Reload to get updated data
      }
      
      setShowModal(false);
      setEditingCity(null);
      setFormData({ governorate: '', cityName: '', area: '', street: '' });
      setRetryCount(0); // Reset retry count on success
      
    } catch (error) {
      console.error('❌ Error saving city:', error);
      let errorMsg = 'Failed to save city';
      
      if (error.message.includes('Session expired')) {
        errorMsg = 'Session expired. Please log in again.';
      } else if (error.message.includes('permission')) {
        errorMsg = 'You do not have permission to save cities.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (city) => {
    setEditingCity(city);
    setFormData({
      governorate: city.governorate || '',
      cityName: city.cityName || '',
      area: city.area || '',
      street: city.street || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) {
      setErrorMessage('Please log in to delete cities.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this city?')) {
      setLoading(true);
      try {
        console.log('🗑️ Deleting city...');
        await citiesApi.delete(id);
        console.log('✅ City deleted successfully');
        
        setSuccessMessage('City deleted successfully!');
        setCities(prevCities => prevCities.filter(city => city.id !== id));
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('❌ Error deleting city:', error);
        let errorMsg = 'Failed to delete city';
        
        if (error.message.includes('Session expired')) {
          errorMsg = 'Session expired. Please log in again.';
        } else if (error.message.includes('permission')) {
          errorMsg = 'You do not have permission to delete cities.';
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        setErrorMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddNew = () => {
    setEditingCity(null);
    setFormData({ governorate: '', cityName: '', area: '', street: '' });
    setShowModal(true);
  };

  // Show authentication error if not logged in
  if (!isAuthenticated) {
    return (
      <div className="container-fluid mt-4">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet" />
        
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-warning text-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <h4>Authentication Required</h4>
              <p>You need to be logged in to access cities management.</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="btn btn-primary"
              >
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet" />
      
      <div className="row">
        <div className="col-12">
          {/* User Info */}
          <div className="mb-3">
            <small className="text-muted">
              Logged in as: <strong>{user?.email || 'Unknown'}</strong> ({user?.role || 'Unknown Role'})
            </small>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              {successMessage}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccessMessage('')}
              ></button>
            </div>
          )}
          
          {/* Error Message */}
          {errorMessage && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {errorMessage}
              {retryCount < MAX_RETRIES && errorMessage.includes('server') && (
                <div className="mt-2">
                  <button
                    onClick={loadCities}
                    className="btn btn-outline-danger btn-sm"
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Retry ({MAX_RETRIES - retryCount} attempts left)
                  </button>
                </div>
              )}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setErrorMessage('')}
              ></button>
            </div>
          )}

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="mb-0">
                <i className="bi bi-geo-alt me-2"></i>
                Cities Management
              </h3>
              <button 
                className="btn btn-primary" 
                onClick={handleAddNew}
                disabled={loading}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add New City
              </button>
            </div>
            
            <div className="card-body">
              {loading && (
                <div className="text-center mb-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="mt-2">Loading cities...</div>
                </div>
              )}
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th><i className="bi bi-geo-alt me-1"></i>Governorate</th>
                      <th><i className="bi bi-building me-1"></i>City Name</th>
                      <th><i className="bi bi-map me-1"></i>Area</th>
                      <th><i className="bi bi-signpost me-1"></i>Street</th>
                      <th width="150"><i className="bi bi-gear me-1"></i>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cities.length === 0 && !loading && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          <i className="bi bi-inbox display-4 d-block mb-2"></i>
                          No cities found
                        </td>
                      </tr>
                    )}
                    {cities.map((city) => (
                      <tr key={city.id}>
                        <td><strong>{city.governorate}</strong></td>
                        <td>{city.cityName}</td>
                        <td>{city.area || <span className="text-muted">-</span>}</td>
                        <td>{city.street || <span className="text-muted">-</span>}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary" 
                              onClick={() => handleEdit(city)}
                              disabled={loading}
                              title="Edit city"
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => handleDelete(city.id)}
                              disabled={loading}
                              title="Delete city"
                            >
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-flex align-items-center justify-content-center" 
             tabIndex="-1" 
             style={{
               backgroundColor: 'rgba(0,0,0,0.5)',
               position: 'fixed',
               top: 0,
               left: 0,
               width: '100%',
               height: '100%',
               zIndex: 1050
             }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`bi ${editingCity ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                  {editingCity ? 'Edit City' : 'Add New City'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                ></button>
              </div>
              
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="bi bi-geo-alt me-1"></i>
                        Governorate <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.governorate}
                        onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                        placeholder="Enter governorate"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="bi bi-building me-1"></i>
                        City Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.cityName}
                        onChange={(e) => setFormData({...formData, cityName: e.target.value})}
                        placeholder="Enter city name"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="bi bi-map me-1"></i>
                        Area
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.area}
                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                        placeholder="Enter area (optional)"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="bi bi-signpost me-1"></i>
                        Street
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.street}
                        onChange={(e) => setFormData({...formData, street: e.target.value})}
                        placeholder="Enter street (optional)"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className={`bi ${editingCity ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                      {editingCity ? 'Update City' : 'Create City'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitiesPage;