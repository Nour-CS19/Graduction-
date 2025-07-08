import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Pages/AuthPage'; // Assuming this is where useAuth is defined

// Fixed API functions for Nursing Services with improved error handling
const API_BASE_URL = 'https://physiocareapp.runasp.net/api/v1';

const parseResponse = async (response) => {
  const text = await response.text();
  console.log('Raw response:', text); // Debug log

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  if (!text) {
    return {}; // Return empty object for empty responses
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

// Enhanced API functions with improved error handling
const nursingsApi = {
  getAll: (accessToken) => {
    return fetch(`${API_BASE_URL}/Nursings/GetAll`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    }).then(parseResponse);
  },

  create: (data, accessToken) => {
    const formData = new FormData();
    formData.append('Name', data.name.trim());
    formData.append('Description', data.description.trim());
    console.log('Creating nursing service with FormData:', {
      Name: data.name.trim(),
      Description: data.description.trim(),
    }); // Debug log
    
    return fetch(`${API_BASE_URL}/Nursings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    }).then(parseResponse);
  },

  update: (id, data, accessToken) => {
    const payload = {
      name: data.name.trim(),
      description: data.description.trim(),
    };
    console.log('Updating nursing service with ID:', id, 'Payload:', payload); // Debug log
    
    return fetch(`${API_BASE_URL}/Nursings/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then(parseResponse);
  },

  // FIXED: Simplified delete function with proper error handling
  delete: async (id, accessToken) => {
    console.log('Attempting to delete nursing service with ID:', id);
    
    if (!id) {
      throw new Error('Invalid service ID provided');
    }

    if (!accessToken) {
      throw new Error('Access token is required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Nursings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          // Removed Content-Type header as it's not needed for DELETE without body
        },
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response headers:', Object.fromEntries(response.headers.entries()));

      // Handle successful deletion (200, 204, etc.)
      if (response.ok) {
        console.log('Delete operation successful');
        return { success: true, message: 'Nursing service deleted successfully' };
      }

      // Handle error responses
      let errorMessage = `Failed to delete nursing service (HTTP ${response.status})`;
      
      try {
        const responseText = await response.text();
        console.log('Error response text:', responseText);
        
        // Try to parse JSON error response
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.title) {
              errorMessage = errorData.title;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            // If not JSON, use the text as is
            if (responseText.length < 200) { // Avoid very long error messages
              errorMessage = responseText;
            }
          }
        }
      } catch (textError) {
        console.error('Error reading response text:', textError);
      }

      // Handle specific HTTP status codes
      switch (response.status) {
        case 400:
          errorMessage = 'Bad Request - Invalid nursing service ID';
          break;
        case 401:
          errorMessage = 'Unauthorized - Please log in again';
          break;
        case 403:
          errorMessage = 'Forbidden - You do not have permission to delete this service';
          break;
        case 404:
          errorMessage = 'Nursing service not found or already deleted';
          break;
        case 409:
          errorMessage = 'Cannot delete - This service is currently being used';
          break;
        case 500:
          errorMessage = 'Server error - Please try again later';
          break;
      }

      throw new Error(errorMessage);

    } catch (error) {
      console.error('Delete operation failed:', error);
      
      // Re-throw network errors or custom errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error - Please check your connection');
      }
      
      throw error;
    }
  },

  // FIXED: Simplified existence check
  checkExists: async (id, accessToken) => {
    if (!id || !accessToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Nursings/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error checking service existence:', error);
      return false;
    }
  },
};

const NursingsPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [nursings, setNursings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNursing, setEditingNursing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initial form state
  const initialFormState = { name: '', description: '' };
  const [formData, setFormData] = useState(initialFormState);

  // Get access token helper function
  const getAccessToken = () => {
    return user?.accessToken || localStorage.getItem('accessToken');
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadNursings();
    }
  }, [authLoading, isAuthenticated]);

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

  const loadNursings = async () => {
    setLoading(true);
    try {
      const accessToken = getAccessToken();
      const data = await nursingsApi.getAll(accessToken);
      console.log('Loaded nursing services:', data); // Debug log
      setNursings(
        Array.isArray(data)
          ? data
              .filter(item => item && typeof item === 'object')
              .map(item => ({
                id: item.id || null,
                name: item.Name || item.name || 'Unnamed Service',
                description: item.Description || item.description || 'No description provided',
              }))
          : []
      );
    } catch (error) {
      console.error('Error loading nursing services:', error);
      setErrorMessage('Failed to load nursing services');
      if (error.message.includes('401') || error.message.includes('403')) {
        setErrorMessage('Authentication failed. Please log in again.');
      } else {
        setNursings([
          {
            id: 1,
            name: 'IV Fluid Administration',
            description: 'Professional intravenous fluid therapy including setup, monitoring, and maintenance of IV lines for hydration and medication delivery.',
          },
          {
            id: 2,
            name: 'Wound Care & Dressing',
            description: 'Expert wound assessment, cleaning, dressing changes, and monitoring for proper healing of surgical sites, injuries, and chronic wounds.',
          },
          {
            id: 3,
            name: 'Medication Administration',
            description: 'Safe administration of prescribed medications via various routes (oral, injection, topical) with proper documentation and monitoring.',
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData); // Debug log

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedName || !trimmedDescription) {
      setErrorMessage('Please fill in all required fields with valid values');
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMessage('Service name must be at least 2 characters long');
      return;
    }

    if (trimmedDescription.length < 10) {
      setErrorMessage('Description must be at least 10 characters long');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const accessToken = getAccessToken();
      
      if (editingNursing) {
        const result = await nursingsApi.update(editingNursing.id, { name: trimmedName, description: trimmedDescription }, accessToken);
        console.log('Update result:', result);
        setSuccessMessage('Nursing service updated successfully!');
        setNursings(prevNursings =>
          prevNursings.map(nursing =>
            nursing.id === editingNursing.id
              ? { ...nursing, name: trimmedName, description: trimmedDescription, id: editingNursing.id }
              : nursing
          )
        );
      } else {
        const result = await nursingsApi.create({ name: trimmedName, description: trimmedDescription }, accessToken);
        console.log('Create result:', result);
        setSuccessMessage('Nursing service created successfully!');
        if (result.id) {
          setNursings(prevNursings => [
            ...prevNursings,
            { name: trimmedName, description: trimmedDescription, id: result.id },
          ]);
        } else {
          await loadNursings();
        }
      }

      setShowModal(false);
      setEditingNursing(null);
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error saving nursing service:', error);
      let errorMsg = 'Failed to save nursing service';
      try {
        const errorText = error.message;
        if (errorText.includes('HTTP 400:')) {
          const jsonPart = errorText.split('HTTP 400: ')[1];
          const errorObj = JSON.parse(jsonPart);
          if (errorObj.errors) {
            const errorDetails = Object.entries(errorObj.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('; ');
            errorMsg = `Validation Error - ${errorDetails}`;
          } else if (errorObj.title) {
            errorMsg = errorObj.title;
          }
        } else {
          errorMsg = errorText;
        }
      } catch (parseError) {
        console.error('Error parsing error message:', parseError);
        errorMsg = error.message || 'An unexpected error occurred';
      }
      if (errorMsg.includes('401') || errorMsg.includes('403')) {
        errorMsg = 'Authentication failed. Please log in again.';
      }
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (nursing) => {
    setEditingNursing(nursing);
    setFormData({
      name: nursing.name || '',
      description: nursing.description || '',
    });
    setShowModal(true);
  };

  // FIXED: Simplified handleDelete function
  const handleDelete = async (id) => {
    console.log('Delete requested for ID:', id);
    
    if (!id) {
      setErrorMessage('Invalid service ID');
      return;
    }

    const confirmMessage = `Are you sure you want to delete this nursing service?\n\nThis action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        throw new Error('Authentication required - Please log in again');
      }
      
      console.log('Calling delete API...');
      await nursingsApi.delete(id, accessToken);
      
      console.log('Delete successful, updating UI...');
      setSuccessMessage('Nursing service deleted successfully!');
      
      // Remove from local state immediately
      setNursings(prevNursings => {
        const filtered = prevNursings.filter(nursing => nursing.id !== id);
        console.log('Updated nursings list:', filtered);
        return filtered;
      });
      
    } catch (error) {
      console.error('Delete error:', error);
      
      let errorMsg = error.message || 'Failed to delete nursing service';
      
      // Handle specific error cases
      if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        // If service doesn't exist, remove it from the list anyway
        setNursings(prevNursings => prevNursings.filter(nursing => nursing.id !== id));
        setSuccessMessage('Service was already deleted and has been removed from the list');
      } else if (errorMsg.includes('409') || errorMsg.includes('being used')) {
        setErrorMessage('Cannot delete this service because it is currently being used in appointments or treatments');
      } else if (errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('Unauthorized') || errorMsg.includes('Forbidden')) {
        setErrorMessage('Authentication failed - Please log in again');
      } else if (errorMsg.includes('Network error')) {
        setErrorMessage('Network error - Please check your internet connection and try again');
      } else {
        setErrorMessage(errorMsg);
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingNursing(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNursing(null);
    setFormData(initialFormState);
    setErrorMessage('');
  };

  const filteredNursings = nursings.filter(nursing => {
    const name = nursing.name || '';
    const description = nursing.description || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const isFormValid = () => {
    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();
    return trimmedName.length >= 2 && trimmedDescription.length >= 10;
  };

  if (authLoading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning text-center">
          <h4>Authentication Required</h4>
          <p>Please log in to manage nursing services.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet" />

      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-12">
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

            {errorMessage && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {errorMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setErrorMessage('')}
                ></button>
              </div>
            )}

            <div className="card">
              <div className="card-header bg-light">
                <div className="row align-items-center">
                  <div className="col-md-4">
                    <h3 className="mb-0 text-info">
                      <i className="bi bi-heart-pulse me-2"></i>
                      Nursing Services Management
                    </h3>
                  </div>
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-info text-white">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <button
                      className="btn btn-info"
                      onClick={handleAddNew}
                      disabled={loading}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add New Service
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {loading && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading nursing services...</p>
                  </div>
                )}

                <div className="row">
                  {filteredNursings.length === 0 && !loading && (
                    <div className="col-12">
                      <div className="alert alert-info text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        {searchTerm ? 'No services found matching your search' : 'No nursing services found'}
                      </div>
                    </div>
                  )}

                  {filteredNursings.map((nursing) => (
                    <div key={nursing.id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100 shadow-sm border-0" style={{ borderLeft: '4px solid #17a2b8' }}>
                        <div className="card-body">
                          <h5 className="card-title text-info d-flex align-items-center">
                            <i className="bi bi-clipboard-heart me-2"></i>
                            {nursing.name || 'Unnamed Service'}
                          </h5>
                          <p className="card-text text-muted">{nursing.description || 'No description provided'}</p>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                          <div className="d-flex gap-2 w-100">
                            <button
                              className="btn btn-outline-info btn-sm flex-fill"
                              onClick={() => handleEdit(nursing)}
                              disabled={loading}
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm flex-fill"
                              onClick={() => handleDelete(nursing.id)}
                              disabled={loading}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!loading && (
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="alert alert-light border">
                        <div className="row text-center">
                          <div className="col-md-4">
                            <div className="d-flex align-items-center justify-content-center">
                              <i className="bi bi-collection text-info fs-2 me-2"></i>
                              <div>
                                <h4 className="text-info mb-0">{nursings.length}</h4>
                                <small className="text-muted">Total Services</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="d-flex align-items-center justify-content-center">
                              <i className="bi bi-eye text-success fs-2 me-2"></i>
                              <div>
                                <h4 className="text-success mb-0">{filteredNursings.length}</h4>
                                <small className="text-muted">Showing</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="d-flex align-items-center justify-content-center">
                              <i className="bi bi-funnel text-warning fs-2 me-2"></i>
                              <div>
                                <h4 className="text-warning mb-0">{searchTerm ? 'Filtered' : 'All'}</h4>
                                <small className="text-muted">View Mode</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-info text-white">
                  <h5 className="modal-title d-flex align-items-center">
                    <i className={`bi ${editingNursing ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                    {editingNursing ? 'Edit Nursing Service' : 'Add New Nursing Service'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseModal}
                    disabled={loading}
                  ></button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="modal-body">
                    {errorMessage && (
                      <div className="alert alert-danger">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {errorMessage}
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        <i className="bi bi-tag me-2 text-info"></i>
                        Service Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${
                          formData.name.trim() && formData.name.trim().length < 2 ? 'is-invalid' : 
                          formData.name.trim().length >= 2 ? 'is-valid' : ''
                        }`}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter service name (e.g., IV Fluid Administration)"
                        disabled={loading}
                        required
                      />
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Enter a clear, descriptive name (minimum 2 characters)
                      </div>
                      {formData.name.trim() && formData.name.trim().length < 2 && (
                        <div className="invalid-feedback">
                          Service name must be at least 2 characters long
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        <i className="bi bi-card-text me-2 text-info"></i>
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className={`form-control ${
                          formData.description.trim() && formData.description.trim().length < 10 ? 'is-invalid' : 
                          formData.description.trim().length >= 10 ? 'is-valid' : ''
                        }`}
                        rows="4"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter detailed description of the nursing service..."
                        disabled={loading}
                        required
                      />
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Provide a detailed description (minimum 10 characters)
                      </div>
                      {formData.description.trim() && formData.description.trim().length < 10 && (
                        <div className="invalid-feedback">
                          Description must be at least 10 characters long
                        </div>
                      )}
                    </div>

                    {!isFormValid() && (
                      <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Please fill in all required fields with valid values
                      </div>
                    )}
                  </div>

                  <div className="modal-footer bg-light">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      disabled={loading}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-info"
                      disabled={loading || !isFormValid()}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className={`bi ${editingNursing ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                          {editingNursing ? 'Update Service' : 'Create Service'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NursingsPage;