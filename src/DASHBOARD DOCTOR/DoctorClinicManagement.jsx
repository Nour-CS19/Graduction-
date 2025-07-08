import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Pages/AuthPage';
import { 
  Container, Card, Form, Alert, Spinner, 
  Table, Button, Badge, Row, Col, Modal, InputGroup 
} from 'react-bootstrap';

const API_BASE_URL = 'https://physiocareapp.runasp.net';

const ClinicManagementPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const doctorId = user?.id;

  const [activeTab, setActiveTab] = useState('view');
  const [clinics, setClinics] = useState([]);
  const [newClinic, setNewClinic] = useState({
    City: '',
    Area: '',
    Street: '',
    Phone: '',
    Price: '',
    ClinicName: ''
  });
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    ClinicName: ''
  });
  const [loading, setLoading] = useState({
    clinics: false,
    creating: false,
    updating: false,
    deleting: false
  });
  const [error, setError] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const phoneRegex = /^\+?[\d\s-]{5,20}$/;

  const getAuthHeaders = useCallback(() => ({
    Authorization: `Bearer ${user?.accessToken || localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  }), [user]);

  const showStatus = useCallback((type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 5000);
  }, []);

  const fetchClinics = useCallback(async () => {
    if (!doctorId) return;
    setLoading(prev => ({ ...prev, clinics: true }));
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/DoctorClinics/GetAllDoctorClinic/${doctorId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`Failed to fetch clinics (${response.status})`);
      const data = await response.json();
      setClinics(Array.isArray(data) ? data : []);
      showStatus('success', `Found ${data.length} clinic(s)`);
    } catch (error) {
      setError(`Failed to load clinics: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, clinics: false }));
    }
  }, [doctorId, getAuthHeaders, showStatus]);

  const createClinic = async (e) => {
    e.preventDefault();
    if (!doctorId) {
      setError('Doctor ID not found. Please log in again.');
      return;
    }
    setLoading(prev => ({ ...prev, creating: true }));
    try {
      const validation = validateForm(newClinic);
      if (!validation.valid) {
        showStatus('danger', validation.message);
        return;
      }
      const formData = new FormData();
      formData.append('City', newClinic.City.trim());
      formData.append('Area', newClinic.Area.trim());
      formData.append('Street', newClinic.Street.trim());
      formData.append('Phone', newClinic.Phone.trim());
      formData.append('Price', newClinic.Price);
      formData.append('ClinicName', newClinic.ClinicName.trim());
      formData.append('DoctorId', doctorId);

      const response = await fetch(`${API_BASE_URL}/api/v1/DoctorClinics`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      showStatus('success', `Clinic ${newClinic.ClinicName} created successfully!`);
      setNewClinic({ City: '', Area: '', Street: '', Phone: '', Price: '', ClinicName: '' });
      fetchClinics();
    } catch (error) {
      setError(`Failed to create clinic: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const updateClinic = async (e) => {
    e.preventDefault();
    if (!selectedClinic?.id) {
      setError('No clinic selected for update.');
      return;
    }
    setLoading(prev => ({ ...prev, updating: true }));
    try {
      if (!updateFormData.ClinicName.trim()) {
        showStatus('danger', 'Clinic Name is required');
        return;
      }
      const patchData = [{
        op: 'replace',
        path: '/ClinicName',
        value: updateFormData.ClinicName.trim()
      }];
      const response = await fetch(`${API_BASE_URL}/api/v1/DoctorClinics/${selectedClinic.id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json-patch+json'
        },
        body: JSON.stringify(patchData)
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      showStatus('success', 'Clinic name updated successfully!');
      setClinics(clinics.map(clinic => clinic.id === selectedClinic.id ? { ...clinic, ClinicName: updateFormData.ClinicName.trim() } : clinic));
      setSelectedClinic(null);
      setUpdateFormData({ ClinicName: '' });
      setActiveTab('view');
    } catch (error) {
      setError(`Failed to update clinic: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const deleteClinic = async () => {
    if (!selectedClinic?.id || !window.confirm('Are you sure you want to delete this clinic?')) return;
    setLoading(prev => ({ ...prev, deleting: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/DoctorClinics?drId=${doctorId}&clinicId=${selectedClinic.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      showStatus('success', 'Clinic deleted successfully!');
      setSelectedClinic(null);
      fetchClinics();
    } catch (error) {
      setError(`Failed to delete clinic: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  };

  const validateForm = (formData) => {
    const trimmedData = {
      City: formData.City.trim(),
      Area: formData.Area.trim(),
      Street: formData.Street.trim(),
      Phone: formData.Phone.trim(),
      Price: formData.Price.toString().trim(),
      ClinicName: formData.ClinicName.trim()
    };
    if (!trimmedData.City) return { valid: false, message: 'City is required' };
    if (!trimmedData.Area) return { valid: false, message: 'Area is required' };
    if (!trimmedData.Street) return { valid: false, message: 'Street is required' };
    if (!trimmedData.Phone || !phoneRegex.test(trimmedData.Phone)) return { valid: false, message: 'Phone must be 5-20 characters' };
    const price = parseFloat(trimmedData.Price);
    if (isNaN(price) || price <= 0) return { valid: false, message: 'Price must be a positive number' };
    if (!trimmedData.ClinicName) return { valid: false, message: 'Clinic Name is required' };
    return { valid: true };
  };

  const handleInputChange = (e, setFormData) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isAuthenticated && doctorId) fetchClinics();
  }, [isAuthenticated, doctorId, fetchClinics]);

  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 bg-light py-5 d-flex align-items-center justify-content-center">
        <Container>
          <Card className="shadow border-0 rounded-4 mx-auto" style={{ maxWidth: '420px' }}>
            <Card.Body className="text-center p-5">
              <i className="bi bi-shield-lock fs-1 text-primary"></i>
              <h4 className="text-dark mb-3">Authentication Required</h4>
              <p className="text-muted mb-4">Please log in to view clinics</p>
              <Button variant="primary" size="lg" className="px-4" onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  if (!doctorId) {
    return (
      <div className="min-vh-100 bg-light py-5 d-flex align-items-center justify-content-center">
        <Container>
          <Card className="shadow border-0 rounded-4 mx-auto" style={{ maxWidth: '420px' }}>
            <Card.Body className="text-center p-5">
              <i className="bi bi-person-x fs-1 text-warning"></i>
              <h4 className="text-dark mb-3">Doctor ID Required</h4>
              <p className="text-muted mb-4">Please ensure you are logged in as a doctor</p>
              <Button variant="warning" size="lg" className="px-4" onClick={logout}>
                Re-login as Doctor
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-4">
      <style>
        {`
          .nav-link.active { background-color: #0d6efd; color: white !important; }
          .table-hover tbody tr:hover { background-color: rgba(13, 110, 253, 0.05); }
          .btn-action:hover { transform: scale(1.1); transition: transform 0.2s ease; }
          .card-header { background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%); }
        `}
      </style>

      <Container fluid="lg">
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1 text-primary">
                      <i className="bi bi-buildings me-2"></i>
                      Clinic Management
                    </h5>
                    <small className="text-muted">
                      Welcome, <strong>{user?.email}</strong>
                      <Badge bg="secondary" className="ms-2">{user?.role}</Badge>
                      <Badge bg="info" className="ms-2">ID: {doctorId}</Badge>
                    </small>
                  </div>
                  <Button variant="outline-danger" size="sm" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {status.message && (
          <Alert variant={status.type} dismissible onClose={() => setStatus({ type: '', message: '' })}>
            {status.message}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Row>
          <Col>
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'view' ? 'active' : ''}`} onClick={() => setActiveTab('view')}>
                  <i className="bi bi-eye"></i> View Clinics
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
                  <i className="bi bi-plus"></i> Add Clinic
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'update' ? 'active' : ''}`} onClick={() => setActiveTab('update')}>
                  <i className="bi bi-pencil"></i> Update Clinic Name
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'delete' ? 'active' : ''}`} onClick={() => setActiveTab('delete')}>
                  <i className="bi bi-trash"></i> Delete Clinic
                </button>
              </li>
            </ul>

            {activeTab === 'view' && (
              <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 text-white"><i className="bi bi-buildings me-2"></i>My Clinics</h6>
                  {clinics.length > 0 && <Badge bg="light" text="dark">{clinics.length} clinic(s)</Badge>}
                </Card.Header>
                <Card.Body>
                  {loading.clinics ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-3 text-muted">Loading clinics...</p>
                    </div>
                  ) : clinics.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-building-x fs-1 text-muted"></i>
                      <p className="mt-3 text-muted">No clinics found</p>
                      <Button variant="primary" onClick={() => setActiveTab('create')}>
                        Create Your First Clinic
                      </Button>
                    </div>
                  ) : (
                    <Table hover responsive>
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Clinic Name</th>
                          <th>City</th>
                          <th>Area</th>
                          <th>Street</th>
                          <th>Phone</th>
                          <th>Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clinics.map((clinic, index) => (
                          <tr key={clinic.id}>
                            <td>{index + 1}</td>
                            <td>{clinic.ClinicName || 'N/A'}</td>
                            <td>{clinic.City || 'N/A'}</td>
                            <td>{clinic.Area || 'N/A'}</td>
                            <td>{clinic.Street || 'N/A'}</td>
                            <td>{clinic.Phone || 'N/A'}</td>
                            <td>${parseFloat(clinic.Price || 0).toFixed(2)}</td>
                            <td>
                              <Button variant="outline-primary" size="sm" className="me-2 btn-action" onClick={() => { setSelectedClinic(clinic); setUpdateFormData({ ClinicName: clinic.ClinicName || '' }); setActiveTab('update'); }}>
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button variant="outline-danger" size="sm" className="btn-action" onClick={() => { setSelectedClinic(clinic); setActiveTab('delete'); }}>
                                <i className="bi bi-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            )}

            {activeTab === 'create' && (
              <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white"><i className="bi bi-plus-circle me-2"></i>Add New Clinic</Card.Header>
                <Card.Body>
                  <Form onSubmit={createClinic}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Clinic Name <span className="text-danger">*</span></Form.Label>
                          <Form.Control type="text" name="ClinicName" value={newClinic.ClinicName} onChange={(e) => handleInputChange(e, setNewClinic)} placeholder="e.g. Hope Clinic" required />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>City <span className="text-danger">*</span></Form.Label>
                          <Form.Control type="text" name="City" value={newClinic.City} onChange={(e) => handleInputChange(e, setNewClinic)} placeholder="e.g. Cairo" required />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Area <span className="text-danger">*</span></Form.Label>
                          <Form.Control type="text" name="Area" value={newClinic.Area} onChange={(e) => handleInputChange(e, setNewClinic)} placeholder="e.g. Maadi" required />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Street <span className="text-danger">*</span></Form.Label>
                          <Form.Control type="text" name="Street" value={newClinic.Street} onChange={(e) => handleInputChange(e, setNewClinic)} placeholder="e.g. 123 Main St" required />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
                          <Form.Control type="text" name="Phone" value={newClinic.Phone} onChange={(e) => handleInputChange(e, setNewClinic)} placeholder="e.g. +20101256256" required />
                          <Form.Text>5-20 characters, digits, +, spaces, or hyphens.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Price <span className="text-danger">*</span></Form.Label>
                          <InputGroup>
                            <InputGroup.Text>$</InputGroup.Text>
                            <Form.Control type="number" name="Price" value={newClinic.Price} onChange={(e) => handleInputChange(e, setNewClinic)} step="0.01" min="0.01" placeholder="0.00" required />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Button variant="primary" type="submit" disabled={loading.creating} className="w-100">
                          {loading.creating ? <><Spinner animation="border" size="sm" /> Creating...</> : 'Add Clinic'}
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {activeTab === 'update' && selectedClinic && (
              <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white"><i className="bi bi-pencil me-2"></i>Update Clinic Name</Card.Header>
                <Card.Body>
                  <Form onSubmit={updateClinic}>
                    <Row className="g-3">
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Clinic Name <span className="text-danger">*</span></Form.Label>
                          <Form.Control type="text" name="ClinicName" value={updateFormData.ClinicName} onChange={(e) => handleInputChange(e, setUpdateFormData)} placeholder="Enter new clinic name" required />
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Button variant="primary" type="submit" disabled={loading.updating} className="w-100">
                          {loading.updating ? <><Spinner animation="border" size="sm" /> Updating...</> : 'Save Changes'}
                        </Button>
                        <Button variant="secondary" onClick={() => { setSelectedClinic(null); setUpdateFormData({ ClinicName: '' }); setActiveTab('view'); }} className="w-100 mt-2">
                          Cancel
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {activeTab === 'delete' && selectedClinic && (
              <Card className="shadow-sm">
                <Card.Header className="bg-danger text-white"><i className="bi bi-trash me-2"></i>Delete Clinic</Card.Header>
                <Card.Body>
                  <Alert variant="warning">
                    <strong>Warning!</strong> This action cannot be undone. Are you sure you want to delete {selectedClinic.ClinicName}?
                  </Alert>
                  <Button variant="danger" onClick={deleteClinic} disabled={loading.deleting} className="w-100">
                    {loading.deleting ? <><Spinner animation="border" size="sm" /> Deleting...</> : 'Delete Clinic'}
                  </Button>
                  <Button variant="secondary" onClick={() => { setSelectedClinic(null); setActiveTab('view'); }} className="w-100 mt-2">
                    Cancel
                  </Button>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ClinicManagementPage;