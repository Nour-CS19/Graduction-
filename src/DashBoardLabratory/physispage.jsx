import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PhAnalysesPage = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [phAnalyses, setPhAnalyses] = useState([]);
  const [cityId, setCityId] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPhAnalyses = async () => {
    if (!isAuthenticated || !user?.id) {
      setError('User not authenticated or lab ID not found');
      return;
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cityId)) {
      setError('Please enter a valid UUID for City ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/LaboratoryCity/get-all-PhAnalyses-for-lab?labId=${user.id}&cityId=${cityId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          setError('Session expired. Please log in again.');
        } else {
          throw new Error('Failed to fetch pH analyses');
        }
      }

      const data = await response.json();
      setPhAnalyses(data || []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id && cityId) {
      fetchPhAnalyses();
    }
  }, [isAuthenticated, user, cityId]);

  if (isLoading) {
    return (
      <div className="spinner-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          Please log in to view pH analyses.
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">Laboratory Dashboard</a>
          <div className="navbar-nav ms-auto">
            <span className="nav-link">Welcome, {user.email}</span>
            <button className="btn btn-outline-light" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="container mt-4">
        <div className="card p-4">
          <h2 className="mb-4">pH Analyses</h2>
          <div className="mb-3">
            <label htmlFor="cityId" className="form-label">City ID (UUID)</label>
            <input
              type="text"
              className="form-control"
              id="cityId"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
            />
          </div>
          <button
            className="btn btn-primary mb-3"
            onClick={fetchPhAnalyses}
            disabled={loading || !cityId}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading...
              </>
            ) : (
              'Fetch pH Analyses'
            )}
          </button>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {phAnalyses.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sample ID</th>
                    <th>pH Value</th>
                    <th>Analysis Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {phAnalyses.map((analysis) => (
                    <tr key={analysis.id}>
                      <td>{analysis.id}</td>
                      <td>{analysis.sampleId || 'N/A'}</td>
                      <td>{analysis.phValue || 'N/A'}</td>
                      <td>
                        {analysis.analysisDate
                          ? new Date(analysis.analysisDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>{analysis.status || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info" role="alert">
              No pH analyses found. Please enter a valid City ID and fetch data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhAnalysesPage;