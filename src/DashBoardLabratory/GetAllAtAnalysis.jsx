import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Pages/AuthPage';

export default function LabAnalysesList() {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const labId = user?.id;
  const labName = user?.name; // Fixed variable naming
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async (url, options = {}) => {
    try {
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (labId) fetchAnalyses(labId);
  }, [labId, accessToken]);

  const fetchAnalyses = async (labId) => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchData(`https://physiocareapp.runasp.net/api/v1/PhAnalyses/get-lab-phanalyses/${labId}`);
      setAnalyses(data);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      setError('Error fetching analyses. Please try again.');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnalysis = () => {
    navigate('/CreateAnalysisAtCity');
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Laboratory Analyses</h4>
        </div>
        <div className="card-body p-4">
          {loading && (
            <div className="d-flex justify-content-center my-4">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
            </div>
          )}
          {!loading && !error && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Analyses for Laboratory: {labName}</h5>               
              </div>
              {analyses.length === 0 ? (
                <div className="alert alert-info">No analyses found for this laboratory.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover table-bordered">
                    <thead className="table-primary">
                      <tr>
                        <th scope="col" className="px-4 py-3">English Name</th>
                        <th scope="col" className="px-4 py-3">Arabic Name</th>
                        <th scope="col" className="px-4 py-3">Price (EGP)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyses.map(analysis => (
                        <tr key={analysis.id} className="analysis-row">
                          <td className="px-4 py-3">{analysis.nameEN}</td>
                          <td className="px-4 py-3">{analysis.nameAR}</td>
                          <td className="px-4 py-3">{analysis.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="card bg-light mt-4 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title">Summary</h6>
                  <p className="card-text mb-1">Total Analyses: {analyses.length}</p>
                  {analyses.length > 0 && (
                    <p className="card-text mb-1">
                      Average Price: {(analyses.reduce((sum, item) => sum + item.price, 0) / analyses.length).toFixed(2)} EGP
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}