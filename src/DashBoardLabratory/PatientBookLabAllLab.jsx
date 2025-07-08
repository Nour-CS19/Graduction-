import { useState, useEffect } from 'react';
import { useAuth } from '../Pages/AuthPage';

export default function PatientLabBookingsList() {
  const { user } = useAuth();
  const accessToken = user?.accessToken;
  const labId = user?.id; // Using labId directly from auth context
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
    if (labId) fetchBookings(labId);
  }, [labId, accessToken]);

  const fetchBookings = async (labId) => {
    try {
      setLoading(true);
      const data = await fetchData(`https://physiocareapp.runasp.net/api/v1/PatientBookLab/get-all-lab-booking/${labId}`);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showMessage('Error fetching bookings. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      setDeleteLoading(bookingId);
      await fetchData(`https://physiocareapp.runasp.net/api/v1/PatientBookLab/DeleteBooking`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId })
      });
      setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId));
      showMessage('Booking deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting booking:', error);
      showMessage('Error deleting booking. Please try again.', 'danger');
    } finally {
      setDeleteLoading(null);
    }
  };

  const navigateToManageBooking = (bookingId) => {
    window.location.href = `/bookings/manage/${bookingId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Patient Laboratory Bookings List</h4>
        </div>
        <div className="card-body">
          {message && <div className={`alert alert-${messageType}`} role="alert">{message}</div>}
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr><th scope="col">ID</th><th scope="col">Patient Name</th><th scope="col">Phone</th><th scope="col">Booking Date</th><th scope="col">Status</th><th scope="col">Actions</th></tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? bookings.map(booking => (
                  <tr key={booking.id}><td>{booking.id}</td><td>{booking.patientName || 'N/A'}{booking.patientEmail && <div className="small text-muted">{booking.patientEmail}</div>}</td><td>{booking.patientPhone || 'N/A'}</td><td>{formatDate(booking.bookingDate)}</td><td><span className={`badge bg-${getStatusBadgeColor(booking.status)}`}>{booking.status || 'Pending'}</span></td><td><div className="btn-group btn-group-sm" role="group"><button className="btn btn-primary" onClick={() => navigateToManageBooking(booking.id)}>Manage</button><button className="btn btn-danger" onClick={() => deleteBooking(booking.id)} disabled={deleteLoading === booking.id}>{deleteLoading === booking.id ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Delete'}</button></div></td></tr>
                )) : <tr><td colSpan="6" className="text-center py-4">{loading ? <div className="d-flex justify-content-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div> : <div><p className="mb-0">No bookings found for this laboratory.</p><small className="text-muted">Once patients make bookings, they will appear here.</small></div>}</td></tr>}
              </tbody>
            </table>
          </div>
          {bookings.length > 0 && (
            <div className="row mt-3">
              <div className="col-md-12">
                <div className="card-group">
                  <div className="card border-0 bg-light"><div className="card-body"><h5 className="card-title">Total Bookings</h5><p className="card-text display-6">{bookings.length}</p></div></div>
                  <div className="card border-0 bg-light"><div className="card-body"><h5 className="card-title">Pending</h5><p className="card-text display-6">{bookings.filter(b => b.status?.toLowerCase() === 'pending' || !b.status).length}</p></div></div>
                  <div className="card border-0 bg-light"><div className="card-body"><h5 className="card-title">Accepted</h5><p className="card-text display-6">{bookings.filter(b => b.status?.toLowerCase() === 'accepted').length}</p></div></div>
                  <div className="card border-0 bg-light"><div className="card-body"><h5 className="card-title">Rejected</h5><p className="card-text display-6">{bookings.filter(b => b.status?.toLowerCase() === 'rejected').length}</p></div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}