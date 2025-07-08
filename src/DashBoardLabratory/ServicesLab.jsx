import { useState, useEffect } from 'react';
import { useAuth } from '../Pages/AuthPage';

export default function ServiceManagement() {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const labId = user?.id; // Using labId directly from auth context
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceValues, setServiceValues] = useState({
    OpenAt: '',
    CloseAt: '',
    ExperienceYears: '',
    Tax: '',
    CreatedSaleAt: '',
    EndedSaleAt: '',
    Evaluation: '',
    Sale: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const availableServices = [
    { id: 'OpenAt', label: 'Open At' },
    { id: 'CloseAt', label: 'Close At' },
    { id: 'ExperienceYears', label: 'Experience Years' },
    { id: 'Tax', label: 'Tax' },
    { id: 'CreatedSaleAt', label: 'Create Sale At' },
    { id: 'EndedSaleAt', label: 'End Sale At' },
    { id: 'Evaluation', label: 'Evaluation' },
    { id: 'Sale', label: 'Sale' }
  ];

  const fetchData = async (url, options = {}) => {
    try {
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch data: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleServiceChange = (e) => {
    const service = e.target.value;
    setSelectedServices(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
  };

  const handleInputChange = (e, service) => {
    setServiceValues(prev => ({
      ...prev,
      [service]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    if (!labId) {
      setMessage('Laboratory ID is missing. Please log in again.');
      return;
    }
    if (selectedServices.length === 0) {
      setMessage('Please select at least one service');
      return;
    }

    const patchOperations = selectedServices.map(service => {
      let value = serviceValues[service];
      if (['Tax', 'ExperienceYears', 'Evaluation', 'Sale'].includes(service)) value = value ? Number(value) : 0;
      return { op: "replace", path: `/${service}`, value };
    });

    try {
      setLoading(true);
      const response = await fetchData(`https://physiocareapp.runasp.net/api/v1/Laboratories/${labId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json-patch+json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(patchOperations)
      });
      setMessage('Services updated successfully!');
      setServiceValues({
        OpenAt: '',
        CloseAt: '',
        ExperienceYears: '',
        Tax: '',
        CreatedSaleAt: '',
        EndedSaleAt: '',
        Evaluation: '',
        Sale: ''
      });
      setSelectedServices([]);
    } catch (error) {
      console.error('Error updating services:', error);
      setMessage(`Error updating services: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Laboratory Service Management</h4>
            </div>
            <div className="card-body">
              {message && <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>{message}</div>}
              <div>
                <div className="mb-3">
                  <p className="form-label">Managing services for Laboratory</p>
                </div>
                <div className="mb-3">
                  <label className="form-label">Select Services to Edit</label>
                  <div className="row g-2">
                    {availableServices.map(service => (
                      <div className="col-6" key={service.id}>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id={service.id} value={service.id} checked={selectedServices.includes(service.id)} onChange={handleServiceChange} disabled={loading} />
                          <label className="form-check-label" htmlFor={service.id}>{service.label}</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedServices.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Edit Service Values</label>
                    <div className="row g-2">
                      {selectedServices.map(service => {
                        const serviceObj = availableServices.find(s => s.id === service);
                        return (
                          <div className="col-12 mb-2" key={service}>
                            <label htmlFor={`input-${service}`} className="form-label">{serviceObj.label}</label>
                            <input type={['Tax', 'ExperienceYears', 'Evaluation', 'Sale'].includes(service) ? 'number' : 'text'} className="form-control" id={`input-${service}`} value={serviceValues[service]} onChange={(e) => handleInputChange(e, service)} placeholder={`Enter ${serviceObj.label}`} disabled={loading} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="d-grid gap-2">
                  <button type="button" className="btn btn-primary" disabled={loading || selectedServices.length === 0} onClick={handleSubmit}>{loading ? 'Updating...' : 'Update Services'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}