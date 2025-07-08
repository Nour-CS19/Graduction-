import { useState, useEffect } from 'react';
import { useAuth } from '../Pages/AuthPage';

export default function AddLabAppointment() {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const labId = user?.id;

  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [appointmentDay, setAppointmentDay] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState({
    cities: false,
    submit: false
  });

  const API_BASE = 'https://physiocareapp.runasp.net/api/v1';
  const ENDPOINTS = {
    getCities: `${API_BASE}/LaboratoryCity/get-cities-with-initial-phAnalyses-by-lab-id?labId=${labId}`,
    addAppointment: `${API_BASE}/LaboratoryCityAppointment/AddLaboratoryCityAppointment`
  };

  // Generate next 14 days with day names
  const generateDayOptions = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateString = date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
      const isoString = date.toISOString().split('T')[0]; // YYYY-MM-DD for value
      
      days.push({
        value: isoString,
        display: `${dayName} - ${dateString}`
      });
    }
    
    return days;
  };

  const dayOptions = generateDayOptions();

  useEffect(() => {
    if (!labId || !accessToken) return;

    setLoading(prev => ({ ...prev, cities: true }));
    fetch(ENDPOINTS.getCities, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        const cityList = data.map(c => ({ id: c.id, name: c.cityName }));
        setCities(cityList);
      })
      .catch(() => {
        setMessage('Error loading cities');
        setMessageType('danger');
      })
      .finally(() => setLoading(prev => ({ ...prev, cities: false })));
  }, [labId, accessToken]);

  const handleSubmit = async () => {
    if (!selectedCityId || !appointmentDay || !appointmentTime) {
      setMessage('Please fill all fields.');
      setMessageType('warning');
      return;
    }

    const payload = [
      {
        day: appointmentDay,
        time: appointmentTime,
        available: true
      }
    ];

    setLoading(prev => ({ ...prev, submit: true }));
    setMessage('');
    setMessageType('');

    try {
      const res = await fetch(
        `${ENDPOINTS.addAppointment}?labId=${labId}&cityId=${selectedCityId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      setMessage('Appointment added successfully!');
      setMessageType('success');
      setSelectedCityId('');
      setAppointmentDay('');
      setAppointmentTime('');
    } catch (error) {
      let msg = 'Failed to add appointment.';
      if (error.message.includes('FOREIGN KEY')) {
        msg = 'Invalid city or lab ID.';
      } else if (error.message.includes('duplicate')) {
        msg = 'An appointment already exists for this time.';
      }
      setMessage(msg);
      setMessageType('danger');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          {message && (
            <div className={`alert alert-${messageType}`} role="alert">
              {message}
            </div>
          )}
          
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h4 className="mb-0">
                <i className="fas fa-plus-circle me-2"></i>
                Create New Appointment
              </h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Select City
                  </label>
                  <select
                    className="form-select"
                    value={selectedCityId}
                    onChange={e => setSelectedCityId(e.target.value)}
                    disabled={loading.cities}
                    required
                  >
                    <option value="">-- Select City --</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {loading.cities && (
                    <div className="text-muted mt-1">
                      <small>Loading cities...</small>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-calendar-day me-2"></i>
                    Appointment Day
                  </label>
                  <select
                    className="form-select"
                    value={appointmentDay}
                    onChange={e => setAppointmentDay(e.target.value)}
                    required
                  >
                    <option value="">-- Select Day --</option>
                    {dayOptions.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.display}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-clock me-2"></i>
                    Appointment Time
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    value={appointmentTime}
                    onChange={e => setAppointmentTime(e.target.value)}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading.submit}
                  >
                    {loading.submit ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating Appointment...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Create Appointment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}