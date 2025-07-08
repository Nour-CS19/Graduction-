import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Pages/AuthPage'; // Assuming this is where useAuth is defined

// Fixed API functions for Specializations with proper error handling (matching Cities format)
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
  
  // Check if response is JSON
  try {
    return JSON.parse(text);
  } catch (e) {
    // If it's not JSON, check if it's a success message
    if (text.toLowerCase().includes('success') || text.toLowerCase().includes('added') || text.toLowerCase().includes('updated')) {
      console.log('Success message received:', text);
      return { success: true, message: text };
    }
    console.error('Failed to parse JSON:', text);
    throw new Error('Invalid response from server');
  }
};

// Fixed API functions - now accept accessToken as parameter instead of using hooks
const specializationsApi = {
  getAll: (accessToken) => {
    return fetch(`${API_BASE_URL}/Specializations/GetAll`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': '*/*',
      },
    }).then(parseResponse);
  },
  
  create: (accessToken, data) => {
    const formData = new FormData();
    formData.append('NameAR', data.nameAR || '');
    formData.append('NameEN', data.nameEN || '');
    
    console.log('Creating specialization with data:', data); // Debug log
    
    return fetch(`${API_BASE_URL}/Specializations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData
    }).then(parseResponse);
  },
  
  update: (accessToken, id, data) => {
    const formData = new FormData();
    formData.append('NameAR', data.nameAR || '');
    formData.append('NameEN', data.nameEN || '');
    
    console.log('Updating specialization with ID:', id, 'Data:', data); // Debug log
    
    return fetch(`${API_BASE_URL}/Specializations/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData
    }).then(parseResponse);
  },
  
  delete: (accessToken, id) => {
    console.log('Deleting specialization with ID:', id); // Debug log
    
    return fetch(`${API_BASE_URL}/Specializations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': '*/*',
      },
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to delete specialization`);
      }
      return {}; // Return empty object for successful deletion
    });
  }
};

const SpecializationsPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [specializations, setSpecializations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    nameAR: '',
    nameEN: ''
  });

  // Get access token helper function
  const getAccessToken = () => {
    return user?.accessToken || localStorage.getItem('accessToken');
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadSpecializations();
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

  const loadSpecializations = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setErrorMessage('No access token available');
      return;
    }

    setLoading(true);
    try {
      const data = await specializationsApi.getAll(accessToken);
      console.log('Loaded specializations:', data); // Debug log
      // Ensure data is an array
      setSpecializations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading specializations:', error);
      setErrorMessage('Failed to load specializations');
      if (error.message.includes('401') || error.message.includes('403')) {
        setErrorMessage('Authentication failed. Please log in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nameAR || !formData.nameEN) {
      setErrorMessage('Please fill in both Arabic and English names');
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      setErrorMessage('No access token available');
      return;
    }

    setLoading(true);
    setErrorMessage(''); // Clear previous errors
    
    try {
      if (editingSpec) {
        const result = await specializationsApi.update(accessToken, editingSpec.id, formData);
        console.log('Update result:', result); // Debug log
        
        setSuccessMessage('Specialization updated successfully!');
        // Update the specialization in the local state
        setSpecializations(prevSpecs =>
          prevSpecs.map(spec =>
            spec.id === editingSpec.id
              ? { ...spec, ...formData, id: editingSpec.id }
              : spec
          )
        );
      } else {
        const result = await specializationsApi.create(accessToken, formData);
        console.log('Create result:', result); // Debug log
        
        setSuccessMessage('Specialization created successfully!');
        // Since API might not return the specialization ID, we'll reload the list
        // to get the actual data from the server
        await loadSpecializations();
      }
      
      setShowModal(false);
      setEditingSpec(null);
      setFormData({ nameAR: '', nameEN: '' });
      
    } catch (error) {
      console.error('Error saving specialization:', error);
      setErrorMessage(error.message || 'Failed to save specialization');
      if (error.message.includes('401') || error.message.includes('403')) {
        setErrorMessage('Authentication failed. Please log in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (spec) => {
    setEditingSpec(spec);
    setFormData({
      nameAR: spec.nameAR || '',
      nameEN: spec.nameEN || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this specialization?')) {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setErrorMessage('No access token available');
        return;
      }

      setLoading(true);
      try {
        await specializationsApi.delete(accessToken, id);
        setSuccessMessage('Specialization deleted successfully!');
        setSpecializations(prevSpecs => prevSpecs.filter(spec => spec.id !== id));
      } catch (error) {
        console.error('Error deleting specialization:', error);
        setErrorMessage('Failed to delete specialization');
        if (error.message.includes('401') || error.message.includes('403')) {
          setErrorMessage('Authentication failed. Please log in again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddNew = () => {
    setEditingSpec(null);
    setFormData({ nameAR: '', nameEN: '' });
    setShowModal(true);
  };

  if (authLoading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-success" role="status">
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
          <p>Please log in to manage specializations.</p>
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
          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
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
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setErrorMessage('')}
              ></button>
            </div>
          )}

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Medical Specializations Management</h3>
              <button 
                className="btn btn-success" 
                onClick={handleAddNew}
                disabled={loading}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add New Specialization
              </button>
            </div>
            
            <div className="card-body">
              {loading && <div className="text-center"><div className="spinner-border text-success" role="status"></div></div>}
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-success">
                    <tr>
                      <th width="40%">Name (Arabic)</th>
                      <th width="40%">Name (English)</th>
                      <th width="20%">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specializations.length === 0 && !loading && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">No specializations found</td>
                      </tr>
                    )}
                    {specializations.map((spec) => (
                      <tr key={spec.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-light text-dark me-2">AR</span>
                            <span style={{direction: 'rtl', textAlign: 'right'}}>{spec.nameAR}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-2">EN</span>
                            <strong>{spec.nameEN}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-success" 
                              onClick={() => handleEdit(spec)}
                              disabled={loading}
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => handleDelete(spec.id)}
                              disabled={loading}
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

      {/* Modal - Centered */}
      {showModal && (
        <div 
          className="modal show d-flex align-items-center justify-content-center" 
          tabIndex="-1" 
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className={`bi ${editingSpec ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                  {editingSpec ? 'Edit Specialization' : 'Add New Specialization'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                ></button>
              </div>
              
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <span className="badge bg-light text-dark me-2">AR</span>
                        Name (Arabic) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nameAR}
                        onChange={(e) => setFormData({...formData, nameAR: e.target.value})}
                        placeholder="أدخل الاسم بالعربية"
                        dir="rtl"
                        style={{textAlign: 'right'}}
                        disabled={loading}
                      />
                      <div className="form-text">Enter the specialization name in Arabic</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <span className="badge bg-primary me-2">EN</span>
                        Name (English) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nameEN}
                        onChange={(e) => setFormData({...formData, nameEN: e.target.value})}
                        placeholder="Enter English name"
                        disabled={loading}
                      />
                      <div className="form-text">Enter the specialization name in English</div>
                    </div>
                  </div>
                </div>
                
                {/* Preview */}
                {(formData.nameAR || formData.nameEN) && (
                  <div className="alert alert-info">
                    <h6><i className="bi bi-eye me-2"></i>Preview:</h6>
                    <div className="row">
                      <div className="col-6">
                        <strong>Arabic:</strong> <span dir="rtl">{formData.nameAR || 'Not entered'}</span>
                      </div>
                      <div className="col-6">
                        <strong>English:</strong> {formData.nameEN || 'Not entered'}
                      </div>
                    </div>
                  </div>
                )}
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
                  className="btn btn-success" 
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
                      <i className={`bi ${editingSpec ? 'bi-check-square' : 'bi-plus-circle'} me-1`}></i>
                      {editingSpec ? 'Update Specialization' : 'Create Specialization'}
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

export default SpecializationsPage;