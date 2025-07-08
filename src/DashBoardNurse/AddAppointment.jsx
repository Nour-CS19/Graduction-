import { useState, useEffect } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../Pages/AuthPage";

export default function AddAppointmentPage() {
    const { user } = useAuth();
    const nurseId = user?.id || user?.Id || null;
    const token = user?.token || localStorage.getItem("token") || null;

    const [nursingCities, setNursingCities] = useState([]);
    const [selectedCityId, setSelectedCityId] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [error, setError] = useState(null);
    const [appointments, setAppointments] = useState([]);

    const today = new Date().toISOString().split("T")[0];

    // UUID validation regex
    const isValidUUID = (id) => {
        if (!id || typeof id !== 'string') return false;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    };

    useEffect(() => {
        if (!nurseId || !token) {
            setError("User not authenticated. Please log in.");
            setLoading(false);
            return;
        }

        const fetchCities = async () => {
            try {
                const res = await fetch(
                    `https://physiocareapp.runasp.net/api/v1/NurseNursingCities/get-all-nurse-nursing-city/${nurseId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Failed to fetch nursing cities. Status: ${res.status}. Message: ${text}`);
                }

                const data = await res.json();
                console.log('Fetched cities:', data);
                setNursingCities(data);
            } catch (err) {
                console.error("Fetch cities error:", err);
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchCities();
    }, [nurseId, token]);

    useEffect(() => {
        if (!nurseId || !token || !selectedCityId) return;

        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `https://physiocareapp.runasp.net/api/v1/NurseAppointment/get-all-nurse-nursing-appointment/${selectedCityId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Failed to fetch appointments. Status: ${res.status}. Message: ${text}`);
                }

                const data = await res.json();
                console.log('Fetched appointments:', data);
                console.log('Sample appointment structure:', data[0]);
                
                // Process appointments and ensure we have valid IDs
                const processedAppointments = data.filter(app => {
                    if (!app.id) {
                        console.warn('Appointment missing ID:', app);
                        return false;
                    }
                    if (!isValidUUID(app.id)) {
                        console.warn('Invalid appointment ID format:', app.id, app);
                        return false;
                    }
                    return true;
                }).map(app => ({
                    ...app,
                    // Ensure we preserve the original ID
                    appointmentId: app.id // Store original ID for deletion
                }));
                
                console.log('Processed appointments:', processedAppointments);
                setAppointments(processedAppointments);
            } catch (err) {
                console.error("Fetch appointments error:", err);
                setError(err.message || "Failed to load appointments.");
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [nurseId, token, selectedCityId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCityId || !date || !time) {
            setSubmitStatus({ success: false, message: "Please fill in all fields." });
            return;
        }

        const formData = new FormData();
        formData.append("NurseNursingCityId", selectedCityId);
        formData.append("IsAvailable", isAvailable.toString());
        formData.append("Date", date);
        formData.append("Time", `${time}:00`);

        console.log('Submitting payload:', Object.fromEntries(formData));

        try {
            setIsSubmitting(true);
            setSubmitStatus({ success: false, message: "Submitting..." });

            const response = await fetch(
                "https://physiocareapp.runasp.net/api/v1/NurseAppointment/add-nurse-nursing-city-appointment",
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed to submit appointment. Status: ${response.status}. Message: ${text}`);
            }

            setSubmitStatus({ success: true, message: "Appointment added successfully!" });
            setSelectedCityId("");
            setDate("");
            setTime("");
            setIsAvailable(true);
            
            // Refresh appointments after successful creation
            if (selectedCityId) {
                // Re-fetch appointments for the selected city
                setTimeout(() => {
                    // Trigger re-fetch by clearing and setting selectedCityId
                    const currentCityId = selectedCityId;
                    setSelectedCityId("");
                    setTimeout(() => setSelectedCityId(currentCityId), 100);
                }, 1000);
            }
        } catch (err) {
            console.error("Submit appointment error:", err);
            setSubmitStatus({ success: false, message: `Error: ${err.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAppointment = async (appointment) => {
      // Get the ID from the appointment object
      const appointmentId = appointment.id;
      
      console.log('Delete called with appointment:', appointment);
      console.log('Extracted appointment ID:', appointmentId);
      
      if (!appointmentId) {
          console.error('No ID found in appointment object');
          setError('Appointment ID is missing.');
          return;
      }
  
      if (!isValidUUID(appointmentId)) {
          console.error('Invalid UUID format:', appointmentId);
          setError('Invalid appointment ID format.');
          return;
      }
  
      if (!window.confirm("Are you sure you want to delete this appointment?")) return;
  
      try {
          setLoading(true);
          setError(null);
          
          console.log('Sending DELETE request with ID:', appointmentId);
  
          // Create FormData instead of JSON - based on your curl command using multipart/form-data
          const formData = new FormData();
          formData.append('id', appointmentId);
          
          console.log('Delete FormData content:', Object.fromEntries(formData));
  
          const res = await fetch(
              "https://physiocareapp.runasp.net/api/v1/NurseAppointment/DeleteAppointment",
              {
                  method: 'DELETE',
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Accept': '*/*', // Match your curl command
                      // Note: Don't set Content-Type for FormData - let browser set it
                  },
                  body: formData, // Use FormData instead of JSON
              }
          );
  
          console.log('DELETE response status:', res.status);
          console.log('DELETE response statusText:', res.statusText);
  
          if (res.ok) {
              console.log('Delete successful, removing from local state');
              setAppointments(prev => {
                  const filtered = prev.filter(app => app.id !== appointmentId);
                  console.log('Appointments after deletion:', filtered);
                  return filtered;
              });
              setSubmitStatus({ success: true, message: "Appointment deleted successfully!" });
              return;
          }
  
          // If delete fails, get the error response
          const errorText = await res.text();
          console.error('Delete failed with status:', res.status, 'Error:', errorText);
          throw new Error(`Delete failed: ${res.status} - ${errorText}`);
  
      } catch (err) {
          console.error('Delete appointment error:', err);
          setError(`Failed to delete appointment: ${err.message}`);
          setSubmitStatus({ success: false, message: `Delete failed: ${err.message}` });
      } finally {
          setLoading(false);
      }
  };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <Card className="shadow" style={{ borderRadius: '12px', border: 'none' }}>
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-4" style={{ color: '#009DA5', fontWeight: '600' }}>Add Appointment</h2>

                            {loading ? (
                                <div className="text-center">
                                    <div className="spinner-border" style={{ color: '#009DA5' }} role="status" />
                                    <p className="mt-2">Loading...</p>
                                </div>
                            ) : error ? (
                                <Alert variant="danger">{error}</Alert>
                            ) : nursingCities.length === 0 ? (
                                <Alert variant="warning">No nursing cities available.</Alert>
                            ) : (
                                <>
                                    {submitStatus && (
                                        <Alert
                                            variant={submitStatus.success ? "success" : "danger"}
                                            onClose={() => setSubmitStatus(null)}
                                            dismissible
                                        >
                                            {submitStatus.message}
                                        </Alert>
                                    )}
                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ color: '#2d3748', fontWeight: '500' }}>Nursing City</Form.Label>
                                            <Form.Select
                                                value={selectedCityId}
                                                onChange={(e) => setSelectedCityId(e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                                style={{ borderRadius: '8px', padding: '10px' }}
                                            >
                                                <option value="">Select a city</option>
                                                {nursingCities.map((city) => (
                                                    <option key={city.id} value={city.id}>
                                                        {city.nursingName} - {city.cityName}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ color: '#2d3748', fontWeight: '500' }}>Availability</Form.Label>
                                            <div className="form-check">
                                                <Form.Check
                                                    type="radio"
                                                    id="available"
                                                    label="Available"
                                                    checked={isAvailable}
                                                    onChange={() => setIsAvailable(true)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div className="form-check">
                                                <Form.Check
                                                    type="radio"
                                                    id="notAvailable"
                                                    label="Not Available"
                                                    checked={!isAvailable}
                                                    onChange={() => setIsAvailable(false)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ color: '#2d3748', fontWeight: '500' }} htmlFor="date">Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                id="date"
                                                min={today}
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                                style={{ borderRadius: '8px', padding: '10px' }}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ color: '#2d3748', fontWeight: '500' }} htmlFor="time">Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                id="time"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                                style={{ borderRadius: '8px', padding: '10px' }}
                                            />
                                        </Form.Group>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="w-100"
                                            disabled={isSubmitting}
                                            style={{ backgroundColor: '#009DA5', borderColor: '#009DA5', borderRadius: '8px', padding: '10px' }}
                                        >
                                            {isSubmitting ? "Submitting..." : "Add Appointment"}
                                        </Button>
                                    </Form>

                                    <div className="mt-4">
                                        <h4 className="text-center mb-3" style={{ color: '#2d3748', fontWeight: '600' }}>Your Appointments</h4>
                                        {appointments.length > 0 ? (
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th style={{ color: '#2d3748', fontWeight: '600' }}>Date</th>
                                                        <th style={{ color: '#2d3748', fontWeight: '600' }}>Time</th>
                                                        <th style={{ color: '#2d3748', fontWeight: '600' }}>Availability</th>
                                                        <th style={{ color: '#2d3748', fontWeight: '600' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {appointments.map((app) => (
                                                        <tr key={app.id}>
                                                            <td>{new Date(app.date).toLocaleDateString()}</td>
                                                            <td>{app.time?.slice(0, 5)}</td>
                                                            <td>{app.isAvailable ? "Available" : "Not Available"}</td>
                                                            <td>
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteAppointment(app)}
                                                                    disabled={loading || !app.id}
                                                                    style={{ borderRadius: '8px', padding: '6px 12px' }}
                                                                    title={!app.id ? "Invalid appointment ID" : `Delete appointment ${app.id}`}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <Alert variant="info">No appointments found.</Alert>
                                        )}
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
}