// ServicesPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllServices, deleteService } from '../Services/ServiceService';
import Loader from './Loader';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getAllServices();
      setServices(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (encryptedId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(encryptedId);
        loadServices();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Services Management</h2>
        <Link to="/services/create" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>Create New Service
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <div className="card shadow">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.encryptedId}>
                      <td className="align-middle">{service.name}</td>
                      <td className="align-middle">
                        {service.description || '-'}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <Link
                            to={`/services/${service.encryptedId}`}
                            className="btn btn-sm btn-outline-info"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link
                            to={`/services/edit/${service.encryptedId}`}
                            className="btn btn-sm btn-outline-warning"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(service.encryptedId)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="bi bi-trash"></i>
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
      )}
    </div>
  );
};

export default ServicesPage;