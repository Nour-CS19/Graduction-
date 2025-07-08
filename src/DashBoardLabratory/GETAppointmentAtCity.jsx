import { useState, useEffect } from 'react';
import { useAuth } from '../Pages/AuthPage';

export default function LaboratoryAppointmentManager() {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const labId = user?.id; // Using labId directly from auth context
  const [cities, setCities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [filterCity, setFilterCity] = useState('');
  const [dataLoading, setDataLoading] = useState({
    cities: true,
    appointments: false
  });
  const [showCityColumn, setShowCityColumn] = useState(true);

  const API_BASE_URL = 'https://physiocareapp.runasp.net/api/v1';
  const ENDPOINTS = {
    cities: `${API_BASE_URL}/Cities/GetAll`,
    appointments: `${API_BASE_URL}/LaboratoryCityAppointment/getAllLabCityAppointment`,
    addAppointment: `${API_BASE_URL}/LaboratoryCityAppointment/AddLaboratoryCityAppointment`,
    deleteAppointment: `${API_BASE_URL}/LaboratoryCityAppointment/DeleteAppointment`
  };

  const today = new Date().toISOString().split('T')[0];

  const fetchData = async (url, options = {}) => {
    try {
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const fetchCities = async () => {
    try {
      setDataLoading(prev => ({ ...prev, cities: true }));
      const citiesData = await fetchData(ENDPOINTS.cities);
      const normalizedCities = citiesData.map(city => ({
        ...city,
        id: String(city.id),
        cityName: city.cityName || `City ${city.id}`
      }));
      setCities(normalizedCities);
      return normalizedCities;
    } catch (error) {
      showMessage('Failed to load cities. Please try again.', 'danger');
      return [];
    } finally {
      setDataLoading(prev => ({ ...prev, cities: false }));
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await fetchCities();
      } catch (error) {
        console.error('Error in initial data loading:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [accessToken]);

  useEffect(() => {
    if (activeTab === 'view' && !dataLoading.cities) {
      fetchAppointments(filterCity);
    }
  }, [filterCity, activeTab, dataLoading.cities, accessToken]);

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setSelectedCity(cityId);
    const city = cities.find(c => c.id === cityId);
    setSelectedCityName(city ? city.cityName : '');
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleSubmit = async () => {
    if (!labId) {
      showMessage('Laboratory ID is missing. Please log in again.', 'warning');
      return;
    }
    if (!selectedCity) {
      showMessage('Please select a city', 'warning');
      return;
    }
    if (!appointmentDate) {
      showMessage('Please select a date', 'warning');
      return;
    }
    if (!appointmentTime) {
      showMessage('Please enter a time', 'warning');
      return;
    }

    const payload = [{ date: appointmentDate, time: appointmentTime, available: true }];
    try {
      setLoading(true);
      const url = `${ENDPOINTS.addAppointment}?labId=${labId}&cityId=${selectedCity}`;
      await fetchData(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setAppointmentDate('');
      setAppointmentTime('');
      showMessage('Appointment added successfully!', 'success');
      if (activeTab === 'view') fetchAppointments(filterCity);
    } catch (error) {
      showMessage('Error adding appointment. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async (cityId = '') => {
    try {
      setDataLoading(prev => ({ ...prev, appointments: true }));
      let url = `${ENDPOINTS.appointments}?labId=${labId}`;
      if (cityId && cityId !== '' && cityId !== '00000000-0000-0000-0000-000000000000') url += `&cityId=${encodeURIComponent(cityId)}`;
      const data = await fetchData(url);
      const processedAppointments = data.map(app => {
        const appCityId = String(app.cityId);
        const city = cities.find(city => String(city.id) === appCityId);
        return {
          ...app,
          cityName: city && city.cityName ? city.cityName : null,
        };
      });
      setShowCityColumn(processedAppointments.some(app => app.cityName !== null));
      setAppointments(processedAppointments);
    } catch (error) {
      showMessage('Error fetching appointments. Please try again or adjust your filters.', 'danger');
    } finally {
      setDataLoading(prev => ({ ...prev, appointments: false }));
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!appointmentId || !window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      setDeleteLoading(appointmentId);
      await fetchData(ENDPOINTS.deleteAppointment, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId })
      });
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
      setShowCityColumn(appointments.filter(app => app.id !== appointmentId).some(app => app.cityName !== null));
      showMessage('Appointment deleted successfully!', 'success');
    } catch (error) {
      showMessage(`Error deleting appointment: ${error.message}`, 'danger');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'view' && !dataLoading.cities) fetchAppointments(filterCity);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const isInitialLoading = dataLoading.cities;

  return (
    <div className="container mt-4">
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item"><button className={`nav-link ${activeTab === 'add' ? 'active bg-white text-primary' : 'text-white'}`} onClick={() => handleTabChange('add')} disabled={isInitialLoading}>Add Appointment</button></li>
            <li className="nav-item"><button className={`nav-link ${activeTab === 'view' ? 'active bg-white text-primary' : 'text-white'}`} onClick={() => handleTabChange('view')} disabled={isInitialLoading}>View Appointments</button></li>
          </ul>
        </div>
        <div className="card-body">
          {message && <div className={`alert alert-${messageType}`} role="alert">{message}</div>}
          {isInitialLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
              <p className="mt-3">Loading cities data...</p>
            </div>
          ) : activeTab === 'add' ? (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="mb-3"><label htmlFor="city" className="form-label">Select City</label><select className="form-select" id="city" value={selectedCity} onChange={handleCityChange} disabled={loading}><option value="">-- Select City --</option>{cities.map(city => <option key={city.id} value={city.id}>{city.cityName}</option>)}</select>{selectedCityName && <div className="form-text text-muted">Selected: {selectedCityName}</div>}</div>
                <div className="mb-3"><label htmlFor="date" className="form-label">Appointment Date</label><input type="date" className="form-control" id="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} min={today} disabled={loading} /></div>
                <div className="mb-4"><label htmlFor="time" className="form-label">Appointment Time</label><input type="time" className="form-control" id="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} disabled={loading} /></div>
                <div className="d-grid gap-2"><button type="button" className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Adding...</> : 'Add Appointment'}</button></div>
                {labId && selectedCity && appointmentDate && appointmentTime && (
                  <div className="mt-4"><div className="card bg-light"><div className="card-body"><h6 className="card-title">Appointment Summary</h6><ul className="list-unstyled mb-0"><li><strong>Laboratory:</strong> {labId}</li><li><strong>City:</strong> {selectedCityName}</li><li><strong>Date:</strong> {appointmentDate}</li><li><strong>Time:</strong> {appointmentTime}</li><li><strong>Available:</strong> Yes</li></ul></div></div></div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="row mb-4">
                <div className="col-md-6 offset-md-3">
                  <div className="mb-3"><label htmlFor="filterCity" className="form-label">Filter by City</label><select className="form-select" id="filterCity" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} disabled={dataLoading.appointments}><option value="">All Cities</option>{cities.map(city => <option key={city.id} value={city.id}>{city.cityName}</option>)}</select></div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark"><tr>{showCityColumn && <th scope="col">City</th>}<th scope="col">Date</th><th scope="col">Time</th><th scope="col">Available</th><th scope="col">Actions</th></tr></thead>
                  <tbody>
                    {dataLoading.appointments ? <tr><td colSpan={5 - !showCityColumn} className="text-center py-4"><span className="spinner-border text-primary" role="status" aria-hidden="true"></span><span className="ms-2">Loading appointments...</span></td></tr> : appointments.length > 0 ? appointments.map(app => (
                      <tr key={app.id}>{showCityColumn && <td>{app.cityName || 'N/A'}</td>}<td>{formatDate(app.date)}</td><td>{app.time}</td><td><span className={`badge bg-${app.available ? 'success' : 'danger'}`}>{app.available ? 'Yes' : 'No'}</span></td><td><button className="btn btn-sm btn-danger" onClick={() => handleDeleteAppointment(app.id)} disabled={deleteLoading === app.id}>{deleteLoading === app.id ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Delete'}</button></td></tr>
                    )) : <tr><td colSpan={5 - !showCityColumn} className="text-center py-4">No appointments found. Please adjust your filters or add new appointments.</td></tr>}
                  </tbody>
                </table>
              </div>
              {appointments.length > 0 && !dataLoading.appointments && <div className="text-muted mt-2">Total appointments: {appointments.length}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}