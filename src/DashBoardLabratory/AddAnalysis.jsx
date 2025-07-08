import { useState, useEffect } from 'react';
import { useAuth } from '../Pages/AuthPage';

export default function CreateAnalysis() {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const labId = user?.id;
  const [analyses, setAnalyses] = useState([]);
  const [analysisData, setAnalysisData] = useState({ nameAr: '', nameEn: '', price: '' });
  const [loading, setLoading] = useState({ overall: false, save: false, delete: {} });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [viewAnalysis, setViewAnalysis] = useState(null);

  const API_BASE_URL = 'https://physiocareapp.runasp.net';
  const ENDPOINTS = {
    analyses: (labId) => `${API_BASE_URL}/api/v1/PhAnalyses/get-lab-phanalyses/${labId}`,
    createAnalysis: `${API_BASE_URL}/api/v1/PhAnalyses/create-phAnalysis`,
    updateAnalysis: (id) => `${API_BASE_URL}/api/v1/PhAnalyses/${id}`,
    deleteAnalysis: (id) => `${API_BASE_URL}/api/v1/PhAnalyses/${id}`,
  };

  const fetchData = async (url, options = {}) => {
    try {
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
      if (options.method === 'PUT') {
        headers['Content-Type'] = 'application/json-patch+json';
      }
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Raw error response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      const text = await response.text();
      if (contentType && contentType.includes('application/json')) {
        return text && text.trim() !== '' ? JSON.parse(text) : { success: true, message: 'Operation completed' };
      } else {
        console.log('Non-JSON response:', text);
        return { success: true, message: text || 'Operation completed' };
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (labId) fetchAnalyses();
  }, [labId, accessToken]);

  const fetchAnalyses = async () => {
    try {
      setLoading(prev => ({ ...prev, overall: true }));
      const data = await fetchData(ENDPOINTS.analyses(labId));
      const normalizedAnalyses = Array.isArray(data)
        ? data.map(analysis => ({
            ...analysis,
            id: String(analysis.id),
            nameAr: analysis.NameAR ?? analysis.nameAR ?? 'Unnamed Analysis (AR)',
            nameEn: analysis.NameEN ?? analysis.nameEN ?? 'Unnamed Analysis (EN)',
            price: analysis.Price ?? analysis.price ?? '0',
          }))
        : [];
      setAnalyses(normalizedAnalyses);
    } catch (error) {
      showMessage('Failed to load analyses. Please try again.', 'danger');
      setAnalyses([]);
    } finally {
      setLoading(prev => ({ ...prev, overall: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnalysisData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setAnalysisData({ nameAr: '', nameEn: '', price: '' });
    setEditMode(false);
    setCurrentAnalysisId(null);
    setShowForm(false);
    setViewMode(false);
    setViewAnalysis(null);
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleSaveAnalysis = async () => {
    if (!labId) {
      showMessage('Laboratory ID is missing. Please log in again.', 'warning');
      return;
    }
    if (!analysisData.nameAr || !analysisData.nameEn || !analysisData.price) {
      showMessage('Please fill in all fields.', 'warning');
      return;
    }
    try {
      setLoading(prev => ({ ...prev, save: true }));
      if (editMode && currentAnalysisId) {
        const payload = {
          LaboratoryId: labId,
          NameAR: analysisData.nameAr,
          NameEN: analysisData.nameEn,
          Price: parseFloat(analysisData.price),
        };
        await fetchData(ENDPOINTS.updateAnalysis(currentAnalysisId), {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        // ✅ Update locally
        setAnalyses(prev =>
          prev.map(a =>
            a.id === currentAnalysisId
              ? {
                  ...a,
                  nameAr: analysisData.nameAr,
                  nameEn: analysisData.nameEn,
                  price: parseFloat(analysisData.price),
                }
              : a
          )
        );

        showMessage('Analysis updated successfully!', 'success');
      } else {
        const formData = new FormData();
        formData.append('LaboratoryId', labId);
        formData.append('NameAR', analysisData.nameAr);
        formData.append('NameEN', analysisData.nameEn);
        formData.append('Price', parseFloat(analysisData.price));
        await fetchData(ENDPOINTS.createAnalysis, {
          method: 'POST',
          body: formData,
        });
        showMessage('Analysis created successfully!', 'success');
        await fetchAnalyses(); // Refresh entire list for new entry
      }
      resetForm();
    } catch (error) {
      const errorMsg = error.message.includes('400') || error.message.includes('415')
        ? error.message
        : `Error ${editMode ? 'updating' : 'creating'} analysis: ${error.message}. Please try again.`;
      showMessage(errorMsg, 'danger');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleDeleteAnalysis = async (id) => {
    if (!id || !confirm('Are you sure you want to delete this analysis?')) return;
    try {
      setLoading(prev => ({ ...prev, delete: { ...prev.delete, [id]: true } }));
      await fetchData(ENDPOINTS.deleteAnalysis(id), { method: 'DELETE' });
      setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      showMessage('Analysis deleted successfully!', 'success');
    } catch (error) {
      showMessage(`Error deleting analysis: ${error.message}. Please try again.`, 'danger');
    } finally {
      setLoading(prev => ({ ...prev, delete: { ...prev.delete, [id]: false } }));
    }
  };

  const handleEditAnalysis = (analysis) => {
    setAnalysisData({
      nameAr: analysis.nameAr,
      nameEn: analysis.nameEn,
      price: analysis.price.toString(),
    });
    setCurrentAnalysisId(analysis.id);
    setEditMode(true);
    setShowForm(true);
    setViewMode(false);
  };

  const handleViewAnalysis = (analysis) => {
    setViewAnalysis(analysis);
    setViewMode(true);
    setShowForm(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCancelForm = () => {
    resetForm();
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Laboratory Analysis Management</h4>
              {labId && !showForm && !viewMode && (
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={handleAddNew}
                  disabled={loading.overall || loading.save}
                >
                  <i className="bi bi-plus-circle me-2"></i>Add Analysis
                </button>
              )}
            </div>
            <div className="card-body">
              {message && <div className={`alert alert-${messageType}`} role="alert">{message}</div>}
              {labId ? (
                <>
                  {showForm && (
                    <div className="card mb-4">
                      <div className="card-header bg-light">
                        <h5 className="mb-0">{editMode ? 'Edit Analysis' : 'Add New Analysis'}</h5>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label htmlFor="nameAr" className="form-label">Name (Arabic)</label>
                          <input
                            type="text"
                            className="form-control"
                            id="nameAr"
                            name="nameAr"
                            value={analysisData.nameAr}
                            onChange={handleInputChange}
                            placeholder="Enter Arabic name"
                            disabled={loading.save}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="nameEn" className="form-label">Name (English)</label>
                          <input
                            type="text"
                            className="form-control"
                            id="nameEn"
                            name="nameEn"
                            value={analysisData.nameEn}
                            onChange={handleInputChange}
                            placeholder="Enter English name"
                            disabled={loading.save}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="price" className="form-label">Price</label>
                          <input
                            type="number"
                            className="form-control"
                            id="price"
                            name="price"
                            value={analysisData.price}
                            onChange={handleInputChange}
                            placeholder="Enter price"
                            step="0.01"
                            min="0"
                            disabled={loading.save}
                            required
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-success"
                            disabled={loading.save || !analysisData.nameAr || !analysisData.nameEn || !analysisData.price}
                            onClick={handleSaveAnalysis}
                          >
                            {loading.save ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                {editMode ? 'Updating...' : 'Creating...'}
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                {editMode ? 'Update Analysis' : 'Create Analysis'}
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancelForm}
                            disabled={loading.save}
                          >
                            <i className="bi bi-x-circle me-2"></i>Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {viewMode && viewAnalysis && (
                    <div className="card mb-4">
                      <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Analysis Details</h5>
                        <button type="button" className="btn btn-sm btn-light" onClick={resetForm}>
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="row mb-3">
                          <div className="col-md-6"><strong>Name (Arabic):</strong> {viewAnalysis.nameAr}</div>
                          <div className="col-md-6"><strong>Name (English):</strong> {viewAnalysis.nameEn}</div>
                        </div>
                        <div className="mb-3"><strong>Price:</strong> {viewAnalysis.price} EGP</div>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleEditAnalysis(viewAnalysis)}
                          disabled={loading.save}
                        >
                          <i className="bi bi-pencil me-2"></i>Edit This Analysis
                        </button>
                      </div>
                    </div>
                  )}
                  {analyses.length > 0 && !showForm && !viewMode && (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>Name (AR)</th>
                            <th>Name (EN)</th>
                            <th>Price</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyses.map((analysis, index) => (
                            <tr key={analysis.id}>
                              <td>{analysis.nameAr}</td>
                              <td>{analysis.nameEn}</td>
                              <td>{parseFloat(analysis.price).toFixed(2)} EGP</td>
                              <td>
                                <div className="d-flex justify-content-center gap-2">
                                  <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => handleViewAnalysis(analysis)}
                                    disabled={loading.overall || loading.delete[analysis.id]}
                                    title="View Details"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() => handleEditAnalysis(analysis)}
                                    disabled={loading.overall || loading.save}
                                    title="Edit"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteAnalysis(analysis.id)}
                                    disabled={loading.overall || loading.delete[analysis.id]}
                                    title="Delete"
                                  >
                                    {loading.delete[analysis.id] ? (
                                      <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                      <i className="bi bi-trash"></i>
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
                  {analyses.length === 0 && !showForm && (
                    <div className="alert alert-info text-center">No analyses found. Click "Add Analysis" to create one.</div>
                  )}
                </>
              ) : (
                <div className="alert alert-info text-center">Please ensure you are logged in with a valid laboratory ID.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}