// EditService.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate , Link } from 'react-router-dom';
import { getServiceById, updateService } from '../Services/ServiceService';
import Loader from './Loader';

const EditService = () => {
  const { encryptedId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '', adminID: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      try {
        const data = await getServiceById(encryptedId);
        setFormData(data);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [encryptedId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateService(encryptedId, formData);
      navigate('edit/:encryptedId');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Edit Service</h2>
        <Link to="/services" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>Cancel
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <div className="card shadow">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Service Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Admin ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.adminID}
                  onChange={(e) => setFormData({ ...formData, adminID: e.target.value })}
                  required
                />
              </div>
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditService;