import { useState, useEffect } from 'react';
import { useAuth } from '../Pages/AuthPage';

export default function CityAnalysisAssignment() {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const labId = user?.id;

  const [cities, setCities] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [assignedMap, setAssignedMap] = useState({});
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const API = {
    cities: `/api/v1/Cities/GetAll`,
    analyses: lab => `/api/v1/PhAnalyses/get-lab-phanalyses/${lab}`,
    getAssigned: lab => `/api/v1/LaboratoryCity/get-cities-with-initial-phAnalyses-by-lab-id?labId=${lab}`,
    assign: (lab, phId) =>
      `/api/v1/LaboratoryCity/add-Cities-For-phAnalysis?labId=${lab}&phId=${phId}`
  };

  const fetchData = async (endpoint, options = {}) => {
    const res = await fetch(`https://physiocareapp.runasp.net${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': options.body ? 'application/json-patch+json' : undefined
      }
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchData(API.cities)
      .then(data =>
        setCities(data.map(c => ({ ...c, id: String(c.id), name: c.cityName })))
      )
      .catch(() => showMessage('Failed to load cities.', 'danger'));
    fetchData(API.analyses(labId))
      .then(data =>
        setAnalyses(data.map(a => ({
          id: String(a.id),
          name: `${a.nameAR} - ${a.nameEN}`
        })))
      )
      .catch(() => showMessage('Failed to load analyses.', 'danger'));
    reloadAssignedMap();
  }, [accessToken, labId]);

  const reloadAssignedMap = async () => {
    try {
      const data = await fetchData(API.getAssigned(labId));
      const map = {};
      data.forEach(item => {
        const c = String(item.cityId), p = String(item.phAnalysisId);
        map[c] = map[c] || [];
        map[c].push(p);
      });
      setAssignedMap(map);
      return map;
    } catch {
      showMessage('Failed to fetch assigned cities.', 'danger');
      return {};
    }
  };

  const showMessage = (txt, type) => {
    setMessage(txt);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleAssign = async () => {
    if (!selectedAnalysis || !selectedCities.length) {
      return showMessage('Select analysis and cities.', 'warning');
    }

    setLoading(true);
    const freshMap = await reloadAssignedMap();
    const toAssign = selectedCities.filter(
      cid => !freshMap[cid]?.includes(selectedAnalysis)
    );

    if (toAssign.length === 0) {
      showMessage('All selected cities are already assigned to this analysis.', 'info');
      setLoading(false);
      return;
    }

    try {
      const payload = toAssign.map(cid => ({ cityId: cid }));
      await fetchData(API.assign(labId, selectedAnalysis), {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showMessage('Cities assigned successfully!', 'success');
      setSelectedCities([]);
      const updatedMap = { ...freshMap };
      toAssign.forEach(cid => {
        updatedMap[cid] = updatedMap[cid] || [];
        updatedMap[cid].push(selectedAnalysis);
      });
      setAssignedMap(updatedMap);
    } catch {
      showMessage('Error assigning cities. A duplicate may have been attempted.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () =>
    setSelectedCities(
      cities
        .filter(c => !assignedMap[c.id]?.includes(selectedAnalysis))
        .map(c => c.id)
    );

  const handleDeselectAll = () => setSelectedCities([]);

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Assign Analyses to Cities</h4>
            </div>
            <div className="card-body">
              {message && <div className={`alert alert-${messageType}`}>{message}</div>}

              <div className="mb-3">
                <label htmlFor="analysis" className="form-label">Select Analysis</label>
                <select
                  id="analysis"
                  className="form-select"
                  value={selectedAnalysis}
                  onChange={e => {
                    setSelectedAnalysis(e.target.value);
                    setSelectedCities([]);
                  }}
                >
                  <option value="">-- Select Analysis --</option>
                  {analyses.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {selectedAnalysis && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Select Cities</label>
                    <div className="mb-2">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={handleSelectAll}>Select All</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={handleDeselectAll}>Deselect All</button>
                    </div>
                    <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {cities
                        .filter(city => !assignedMap[city.id]?.includes(selectedAnalysis))
                        .map(city => (
                          <div className="form-check mb-2" key={city.id}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`city-${city.id}`}
                              value={city.id}
                              checked={selectedCities.includes(city.id)}
                              onChange={e => {
                                const id = e.target.value;
                                setSelectedCities(prev =>
                                  prev.includes(id)
                                    ? prev.filter(x => x !== id)
                                    : [...prev, id]
                                );
                              }}
                            />
                            <label className="form-check-label" htmlFor={`city-${city.id}`}>
                              {city.name}
                            </label>
                          </div>
                        ))}
                      {cities.every(city => assignedMap[city.id]?.includes(selectedAnalysis)) &&
                        <div className="text-muted">All cities already assigned.</div>
                      }
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button className="btn btn-primary" onClick={handleAssign} disabled={loading}>
                      {loading ? 'Assigning...' : 'Assign Cities to Analysis'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
