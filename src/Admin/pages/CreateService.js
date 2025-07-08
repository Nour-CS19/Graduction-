import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createService } from '../Services/ServiceService';

const CreateService = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Hard-coded adminID; service id is omitted so that the database generates it
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    adminID: '18D847AA-2C3D-4BA8-A676-9996945F20D8'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createService(formData);
      navigate('/services');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Create New Service</h2>
        <Link to="/services" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>Cancel
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Service Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-lg me-2"></i>Create Service
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateService;
