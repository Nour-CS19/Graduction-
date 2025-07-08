import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Pages/AuthPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = 'https://physiocareapp.runasp.net';

const LOADING_STATES = {
  CLINICS: 'clinics',
  CREATING: 'creating',
  DELETING: 'deleting',
  UPDATING: 'updating'
};

export default function ClinicManagementApp() {
  const { user, isAuthenticated } = useAuth();
  const doctorId = user?.id || user?.Id;

  const [clinics, setClinics] = useState([]);
  const [newClinic, setNewClinic] = useState({
    City: '',
    Area: '',
    Street: '',
    Phone: '',
    Price: ''
  });
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    Governorate: '',
    City: '',
    Area: '',
    Street: '',
    Phone: '',
    Price: '',
    ClinicName: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [loading, setLoading] = useState({
    [LOADING_STATES.CLINICS]: false,
    [LOADING_STATES.CREATING]: false,
    [LOADING_STATES.DELETING]: null,
    [LOADING_STATES.UPDATING]: false
  });
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const phoneRegex = /^\+?[\d\s-]{5,20}$/;

  const updateLoading = useCallback((key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const showToast = useCallback((type, message) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = user?.accessToken;
    if (!token) throw new Error('No access token found. Please log in again.');
    return { 'Authorization': `Bearer ${token}` };
  }, [user?.accessToken]);

  const handleApiError = useCallback(async (error, context, response) => {
    console.error(`API Error (${context}):`, { error, response });
    let errorMessage = error.message || 'An unexpected error occurred.';
    
    if (response) {
      try {
        const errorText = await response.text();
        console.error(`${context} - Server response:`, errorText);
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorData.title || errorText;
        } catch (parseError) {
          errorMessage = errorText || errorMessage;
        }
      } catch (textError) {
        console.error(`Failed to read response text for ${context}:`, textError);
      }
    }

    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      setError('Your session has expired. Please log in again.');
      return;
    }
    if (error.message.includes('403')) {
      setError('You do not have permission to access this resource.');
      return;
    }
    if (error.message.includes('500')) {
      setError(`Server error occurred while ${context}. Please try again later.`);
    } else {
      setError(`Error ${context}: ${errorMessage}`);
    }
    
    showToast('danger', `Failed to ${context}: ${errorMessage}`);
  }, [showToast]);

  const validateForm = useCallback((formData, isUpdate = false, currentClinicId = null) => {
    const trimmedData = {
      Governorate: formData.Governorate?.trim() || '',
      City: formData.City?.trim() || '',
      Area: formData.Area?.trim() || '',
      Street: formData.Street?.trim() || '',
      Phone: formData.Phone?.trim() || '',
      Price: formData.Price?.toString().trim() || '',
      ClinicName: formData.ClinicName?.trim() || ''
    };

    if (!isUpdate) {
      // Validation for POST (create)
      if (!trimmedData.City) return { valid: false, message: 'City is required' };
      if (!trimmedData.Area) return { valid: false, message: 'Area is required' };
      if (!trimmedData.Street) return { valid: false, message: 'Street is required' };
      if (!trimmedData.Phone || !phoneRegex.test(trimmedData.Phone)) {
        return { valid: false, message: 'Phone must be 5-20 characters with digits, +, spaces, or hyphens' };
      }
      const price = parseFloat(trimmedData.Price);
      if (isNaN(price) || price <= 0) return { valid: false, message: 'Price must be a positive number' };

      const cityExists = clinics.some(clinic => 
        clinic.city?.toLowerCase() === trimmedData.City.toLowerCase() &&
        (!isUpdate || clinic.id !== currentClinicId)
      );
      if (cityExists) return { valid: false, message: 'You already have a clinic in this city' };
    } else {
      // Validation for PUT (update)
      if (trimmedData.Phone && !phoneRegex.test(trimmedData.Phone)) {
        return { valid: false, message: 'Phone must be 5-20 characters with digits, +, spaces, or hyphens' };
      }
      if (trimmedData.Price) {
        const price = parseFloat(trimmedData.Price);
        if (isNaN(price) || price <= 0) return { valid: false, message: 'Price must be a positive number' };
      }
      const cityExists = trimmedData.City && clinics.some(clinic => 
        clinic.city?.toLowerCase() === trimmedData.City.toLowerCase() &&
        clinic.id !== currentClinicId
      );
      if (cityExists) return { valid: false, message: 'You already have a clinic in this city' };
    }

    return { valid: true, data: trimmedData };
  }, [clinics, phoneRegex]);

  const fetchClinics = useCallback(async () => {
    if (!doctorId) {
      console.error('Doctor ID is undefined:', user);
      setError('Doctor ID not found. Please ensure you are logged in as a doctor.');
      return;
    }
    try {
      updateLoading(LOADING_STATES.CLINICS, true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/DoctorClinics/GetAllDoctorClinic/${doctorId}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setClinics(Array.isArray(data) ? data : []);
      showToast('success', `Found ${Array.isArray(data) ? data.length : 0} clinic(s)`);
    } catch (error) {
      await handleApiError(error, 'fetching clinics', error.response);
    } finally {
      updateLoading(LOADING_STATES.CLINICS, false);
    }
  }, [doctorId, getAuthHeaders, handleApiError, showToast, updateLoading]);

  const createClinic = async (e) => {
    e.preventDefault();
    if (!doctorId) {
      console.error('Doctor ID is undefined during create:', user);
      setError('Doctor ID not found. Please log in again.');
      return;
    }

    try {
      updateLoading(LOADING_STATES.CREATING, true);
      setError('');

      const validation = validateForm(newClinic);
      if (!validation.valid) {
        showToast('danger', validation.message);
        return;
      }

      const formData = new FormData();
      formData.append('City', validation.data.City);
      formData.append('Area', validation.data.Area);
      formData.append('Street', validation.data.Street);
      formData.append('Phone', validation.data.Phone);
      formData.append('Price', parseFloat(validation.data.Price));
      formData.append('DoctorId', doctorId);

      console.log('Creating clinic with data:', Object.fromEntries(formData));

      const response = await fetch(`${API_BASE_URL}/api/v1/DoctorClinics`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      console.log('Create response status:', response.status);

      if (!response.ok) {
        await handleApiError(new Error(`HTTP error! status: ${response.status}`), 'creating clinic', response);
        return;
      }

      const responseText = await response.text();
      console.log('Create response text:', responseText);

      let newClinicData;
      if (responseText.trim()) {
        try {
          newClinicData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse create response:', parseError);
          newClinicData = {
            id: Date.now(),
            ...validation.data,
            city: validation.data.City,
            area: validation.data.Area,
            street: validation.data.Street,
            phone: validation.data.Phone,
            price: parseFloat(validation.data.Price),
            clinicName: ''
          };
        }
      } else {
        newClinicData = {
          id: Date.now(),
          ...validation.data,
          city: validation.data.City,
          area: validation.data.Area,
          street: validation.data.Street,
          phone: validation.data.Phone,
          price: parseFloat(validation.data.Price),
          clinicName: ''
        };
      }

      setClinics(prev => [...prev, newClinicData]);
      showToast('success', 'Clinic created successfully!');
      setNewClinic({ City: '', Area: '', Street: '', Phone: '', Price: '' });
      setShowAddModal(false);
      setTimeout(() => fetchClinics(), 1000);
    } catch (error) {
      console.error('Create clinic error:', error);
      await handleApiError(error, 'creating clinic', null);
    } finally {
      updateLoading(LOADING_STATES.CREATING, false);
    }
  };

  const updateClinic = async (e) => {
    e.preventDefault();
    if (!selectedClinic?.id || !doctorId) {
      console.error('No clinic selected or doctor ID missing during update:', { selectedClinic, doctorId, user });
      setError('No clinic selected or doctor ID missing for update.');
      return;
    }
    
    updateLoading(LOADING_STATES.UPDATING, true);
    
    try {
      const clinicId = selectedClinic.id;
      const validation = validateForm(updateFormData, true, clinicId);
      if (!validation.valid) {
        showToast('danger', validation.message);
        return;
      }

      const formData = new FormData();
      formData.append('Id', clinicId);
      if (validation.data.Governorate) formData.append('Governorate', validation.data.Governorate);
      if (validation.data.City) formData.append('City', validation.data.City);
      if (validation.data.Area) formData.append('Area', validation.data.Area);
      if (validation.data.Street) formData.append('Street', validation.data.Street);
      if (validation.data.Phone) formData.append('Phone', validation.data.Phone);
      if (validation.data.Price) formData.append('Price', parseFloat(validation.data.Price));

      console.log('Updating clinic with data:', Object.fromEntries(formData));

      const response = await fetch(`${API_BASE_URL}/api/v1/DoctorClinics`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData,
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        await handleApiError(new Error(`HTTP error! status: ${response.status}`), 'updating clinic', response);
        return;
      }

      const responseText = await response.text();
      console.log('Update response text:', responseText);

      let updatedClinic;
      if (responseText.trim()) {
        try {
          updatedClinic = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse update response:', parseError);
          updatedClinic = {
            ...selectedClinic,
            governorate: validation.data.Governorate,
            city: validation.data.City,
            area: validation.data.Area,
            street: validation.data.Street,
            phone: validation.data.Phone,
            price: validation.data.Price ? parseFloat(validation.data.Price) : selectedClinic.price,
            clinicName: validation.data.ClinicName || selectedClinic.clinicName || ''
          };
        }
      } else {
        updatedClinic = {
          ...selectedClinic,
          governorate: validation.data.Governorate,
          city: validation.data.City,
          area: validation.data.Area,
          street: validation.data.Street,
          phone: validation.data.Phone,
          price: validation.data.Price ? parseFloat(validation.data.Price) : selectedClinic.price,
          clinicName: validation.data.ClinicName || selectedClinic.clinicName || ''
        };
      }

      setClinics(prevClinics => 
        prevClinics.map(clinic => clinic.id === clinicId ? updatedClinic : clinic)
      );
      showToast('success', 'Clinic updated successfully!');
      resetEditState();
      setTimeout(() => fetchClinics(), 1000);
    } catch (error) {
      console.error('Update clinic error:', error);
      await handleApiError(error, 'updating clinic', null);
    } finally {
      updateLoading(LOADING_STATES.UPDATING, false);
    }
  };

  const handleDeleteClinic = async (clinicIdToDelete) => {
    if (!clinicIdToDelete || !doctorId) {
      console.error('Missing clinic ID or doctor ID for deletion:', { clinicIdToDelete, doctorId, user });
      setError('Missing clinic ID or doctor ID for deletion.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this clinic? This action cannot be undone.')) {
      return;
    }

    try {
      updateLoading(LOADING_STATES.DELETING, clinicIdToDelete);
      setError('');

      console.log(`Deleting clinic ${clinicIdToDelete} for doctor ${doctorId}`);

      const response = await fetch(`${API_BASE_URL}/api/v1/DoctorClinics?drId=${doctorId}&clinicId=${clinicIdToDelete}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('REFERENCE constraint') || errorText.includes('FK_AppointmentAtClinics_DoctorClinics')) {
          setError('Cannot delete clinic. There are related appointments. Please delete or reassign them first.');
        } else {
          await handleApiError(new Error(`HTTP error! status: ${response.status}`), 'deleting clinic', response);
        }
        return;
      }

      setClinics(prev => prev.filter(clinic => clinic.id !== clinicIdToDelete));
      showToast('success', 'Clinic deleted successfully!');
    } catch (error) {
      console.error('Delete clinic error:', error);
      await handleApiError(error, 'deleting clinic', null);
    } finally {
      updateLoading(LOADING_STATES.DELETING, null);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Please log in to access this page.');
      return;
    }
    if (!doctorId) {
      setError('Doctor ID not found. Please ensure you are logged in as a doctor.');
      console.error('Doctor ID missing on mount:', user);
      return;
    }
    fetchClinics();
  }, [isAuthenticated, doctorId, fetchClinics, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClinic(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (clinic) => {
    setSelectedClinic(clinic);
    setUpdateFormData({
      Governorate: clinic.governorate || '',
      City: clinic.city || '',
      Area: clinic.area || '',
      Street: clinic.street || '',
      Phone: clinic.phone || '',
      Price: clinic.price || '',
      ClinicName: clinic.clinicName || ''
    });
    setShowUpdateModal(true);
  };

  const resetEditState = () => {
    setSelectedClinic(null);
    setUpdateFormData({
      Governorate: '',
      City: '',
      Area: '',
      Street: '',
      Phone: '',
      Price: '',
      ClinicName: ''
    });
    setShowUpdateModal(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow">
                <div className="card-body text-center">
                  <h4 className="card-title mb-3">Authentication Required</h4>
                  <p className="card-text text-muted mb-4">Please log in to view clinics</p>
                  <button className="btn btn-primary" onClick={() => window.location.href = '/login'}>
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctorId) {
    return (
      <div className="min-vh-100 bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow">
                <div className="card-body text-center">
                  <h4 className="card-title mb-3">Doctor ID Required</h4>
                  <p className="card-text text-muted mb-4">Please ensure you are logged in as a doctor to view clinics</p>
                  <button className="btn btn-warning" onClick={() => window.location.href = '/login'}>
                    Re-login as Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container-fluid">
        <div className="mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="text-primary mb-2">My Clinic Management</h1>
                  <div className="small text-muted">
                    Welcome, <strong>{user?.email}</strong>
                    <span className="ms-2 badge bg-secondary">{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast.show && (
          <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <div className={`alert alert-${toast.type === 'success' ? 'success' : toast.type === 'danger' ? 'danger' : 'info'} alert-dismissible fade show`}>
              {toast.message}
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">My Clinics</h5>
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-primary">{clinics.length} clinic{clinics.length !== 1 ? 's' : ''}</span>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                    disabled={loading[LOADING_STATES.CREATING]}
                  >
                    Add Clinic
                  </button>
                </div>
              </div>
              <div className="card-body">
                {loading[LOADING_STATES.CLINICS] ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3"></div>
                    <p className="text-muted">Loading clinics...</p>
                  </div>
                ) : clinics.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-2">No clinics found</p>
                    <small className="text-muted">Create your first clinic</small>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Governorate</th>
                          <th>City</th>
                          <th>Area</th>
                          <th>Street</th>
                          <th>Phone</th>
                          <th>Price</th>
                          <th>Clinic Name</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clinics.map((clinic, index) => (
                          <tr key={clinic.id}>
                            <td><span className="badge bg-secondary">{index + 1}</span></td>
                            <td>{clinic.governorate || 'N/A'}</td>
                            <td>{clinic.city || 'N/A'}</td>
                            <td>{clinic.area || 'N/A'}</td>
                            <td>{clinic.street || 'N/A'}</td>
                            <td>{clinic.phone || 'N/A'}</td>
                            <td className="fw-bold">{parseFloat(clinic.price || 0).toFixed(2)}</td>
                            <td>{clinic.clinicName || 'N/A'}</td>
                            <td className="text-center">
                              <div className="btn-group" role="group">
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditClick(clinic)}
                                  disabled={loading[LOADING_STATES.UPDATING]}
                                  title="Update Clinic"
                                >
                                  Update
                                </button>
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteClinic(clinic.id)}
                                  disabled={loading[LOADING_STATES.DELETING] === clinic.id}
                                  title="Delete Clinic"
                                >
                                  {loading[LOADING_STATES.DELETING] === clinic.id ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    'Delete'
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ADD CLINIC MODAL */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Clinic</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={createClinic} encType="multipart/form-data">
                    <div className="mb-3">
                      <label className="form-label">City <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="City"
                        className="form-control"
                        value={newClinic.City}
                        onChange={handleInputChange}
                        placeholder="e.g., Cairo"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Area <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="Area"
                        className="form-control"
                        value={newClinic.Area}
                        onChange={handleInputChange}
                        placeholder="e.g., Nasr City"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Street <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="Street"
                        className="form-control"
                        value={newClinic.Street}
                        onChange={handleInputChange}
                        placeholder="e.g., Main Street"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="Phone"
                        className="form-control"
                        value={newClinic.Phone}
                        onChange={handleInputChange}
                        placeholder="e.g., 01234567890"
                        required
                      />
                      <div className="form-text">5-20 characters, digits, +, spaces, or hyphens.</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Price <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        name="Price"
                        className="form-control"
                        value={newClinic.Price}
                        onChange={handleInputChange}
                        placeholder="e.g., 200"
                        step="0.01"
                        min="0.01"
                        required
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={loading[LOADING_STATES.CREATING]}>
                        {loading[LOADING_STATES.CREATING] ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Creating...
                          </>
                        ) : (
                          'Add Clinic'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UPDATE CLINIC MODAL */}
        {showUpdateModal && selectedClinic && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Clinic</h5>
                  <button type="button" className="btn-close" onClick={resetEditState}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={updateClinic} encType="multipart/form-data">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Governorate</label>
                        <input
                          type="text"
                          name="Governorate"
                          className="form-control"
                          value={updateFormData.Governorate}
                          onChange={handleUpdateInputChange}
                          placeholder="e.g., Cairo Governorate (optional)"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          name="City"
                          className="form-control"
                          value={updateFormData.City}
                          onChange={handleUpdateInputChange}
                          placeholder="e.g., Cairo (optional)"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Area</label>
                        <input
                          type="text"
                          name="Area"
                          className="form-control"
                          value={updateFormData.Area}
                          onChange={handleUpdateInputChange}
                          placeholder="e.g., Nasr City (optional)"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Street</label>
                        <input
                          type="text"
                          name="Street"
                          className="form-control"
                          value={updateFormData.Street}
                          onChange={handleUpdateInputChange}
                          placeholder="e.g., Main Street (optional)"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="text"
                          name="Phone"
                          className="form-control"
                          value={updateFormData.Phone}
                          onChange={handleUpdateInputChange}
                          placeholder="e.g., 01234567890 (optional)"
                        />
                        <div className="form-text">5-20 characters, digits, +, spaces, or hyphens.</div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="number"
                          name="Price"
                          className="form-control"
                          value={updateFormData.Price}
                          onChange={handleUpdateInputChange}
                          placeholder="e.g., 200 (optional)"
                          step="0.01"
                          min="0.01"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Clinic Name</label>
                      <input
                        type="text"
                        name="ClinicName"
                        className="form-control"
                        value={updateFormData.ClinicName}
                        onChange={handleUpdateInputChange}
                        placeholder="e.g., Care Clinic (optional)"
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={resetEditState}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={loading[LOADING_STATES.UPDATING]}>
                        {loading[LOADING_STATES.UPDATING] ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Updating...
                          </>
                        ) : (
                          'Update Clinic'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">Quick Statistics</h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-primary mb-1">{clinics.length}</h4>
                      <small className="text-muted">Total Clinics</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-success mb-1">
                        {new Set(clinics.map(c => c.city)).size}
                      </h4>
                      <small className="text-muted">Cities Covered</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-info mb-1">
                        {clinics.length > 0 
                          ? (clinics.reduce((sum, c) => sum + parseFloat(c.price || 0), 0) / clinics.length).toFixed(2)
                          : '0.00'
                        }
                      </h4>
                      <small className="text-muted">Average Price</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <h4 className="text-warning mb-1">
                      {clinics.filter(c => c.clinicName).length}
                    </h4>
                    <small className="text-muted">Named Clinics</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {clinics.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h6 className="mb-0">Clinics by City</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    {Array.from(new Set(clinics.map(c => c.city))).map(city => {
                      const cityClinic = clinics.find(c => c.city === city);
                      return (
                        <div key={city} className="col-md-4 mb-3">
                          <div className="card bg-light">
                            <div className="card-body">
                              <h6 className="card-title text-primary">{city}</h6>
                              <p className="card-text mb-2">
                                <small className="text-muted">
                                  {cityClinic?.governorate && (
                                    <>
                                      {cityClinic.governorate}<br/>
                                    </>
                                  )}
                                  {cityClinic?.area}<br/>
                                  {cityClinic?.street}<br/>
                                  {cityClinic?.phone}<br/>
                                  {parseFloat(cityClinic?.price || 0).toFixed(2)}
                                  {cityClinic?.clinicName && (
                                    <>
                                      <br/>{cityClinic.clinicName}
                                    </>
                                  )}
                                </small>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row mt-5">
          <div className="col-12">
            <div className="text-center text-muted">
              <small>
                Clinic Management System | Last Updated: {new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}