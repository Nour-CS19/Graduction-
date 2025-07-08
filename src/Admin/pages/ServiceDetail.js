// ServiceDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getServiceById } from '../Services/ServiceService';
import Loader from './Loader';

const ServiceDetail = () => {
  const { encryptedId } = useParams();
  const [service, setService] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      try {
        const data = await getServiceById(encryptedId);
        setService(data);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [encryptedId]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Service Details</h2>
        <Link to="/services" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>Back to List
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <Loader />
      ) : service ? (
        <div className="card shadow">
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-4">
                <h5 className="text-muted">Service Name</h5>
                <p className="lead">{service.name}</p>
              </div>
              <div className="col-md-8">
                <h5 className="text-muted">Description</h5>
                <p className="lead">
                  {service.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !error && <div className="alert alert-info">No service found</div>
      )}
    </div>
  );
};

export default ServiceDetail;