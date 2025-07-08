import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Pages/AuthPage'; // Adjust the import path as needed

const BookingList = () => {
  const { user } = useAuth();
  const nurseId = user?.id || null; // Retrieve nurse ID from Auth context
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false); 
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    if (!nurseId) {
      showAlert('warning', 'Nurse ID not available. Please log in.');
      return;
    }
    fetchBookings();
  }, [nurseId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://physiocareapp.runasp.net/api/v1/PatientBookNurse/get-all-booking-for-nurse/${nurseId}`
      );
      if (response.data) {
        setBookings(response.data);
      } else {
        showAlert('warning', 'No bookings found.');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showAlert('danger', 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPaymentImage = async (filePath) => {
    try {
      setImageLoading(true);

      const pathParts = filePath.split('/');
      const filename = pathParts.pop();
      const path = pathParts.join('/');

      const imageApiUrl = `https://physiocareapp.runasp.net/api/v1/Upload/image?filename=${encodeURIComponent(
        filename
      )}&path=${encodeURIComponent(path)}`;

      await axios.head(imageApiUrl);
      setViewImage(imageApiUrl);
    } catch (error) {
      console.error('Error loading payment image:', error);
      showAlert('danger', 'Failed to load payment image.');
      setViewImage(null);
    } finally {
      setImageLoading(false);
    }
  };

  const closeImageModal = () => {
    setViewImage(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return 'N/A';
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (!timeRegex.test(timeString)) return 'N/A';
    return timeString.substring(0, 5);
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  return (
    <div className="booking-list-container">
      <h2 className="text-center section-title">All Bookings</h2>

      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlert({ show: false, type: '', message: '' })}
            aria-label="Close"
          ></button>
        </div>
      )}

      {loading ? (
        <div className="spinner-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {bookings.length === 0 ? (
            <div className="alert alert-info text-center" role="alert">
              No bookings found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-primary">
                  <tr>
                    <th>Patient Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Total Price</th>
                    <th>Medical Condition</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr key={booking.id || `booking-${index}`}>
                      <td>{booking.patientName || 'N/A'}</td>
                      <td>{booking.patientPhone || 'N/A'}</td>
                      <td>{booking.patientAddress || 'N/A'}</td>
                      <td>{formatDate(booking.date)}</td>
                      <td>{formatTime(booking.time)}</td>
                      <td>${booking.totalPrice ? booking.totalPrice.toFixed(2) : '0.00'}</td>
                      <td>{booking.medicalCondition || 'N/A'}</td>
                      <td>
                        {booking.filePath ? (
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleViewPaymentImage(booking.filePath)}
                            disabled={imageLoading || loading}
                          >
                            {imageLoading ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Loading...
                              </>
                            ) : (
                              'View Receipt'
                            )}
                          </button>
                        ) : (
                          'No receipt'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {viewImage && (
        <>
          <div
            className="modal fade show"
            style={{ display: 'block' }}
            tabIndex="-1"
            onClick={closeImageModal}
          >
            <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Payment Receipt</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeImageModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body text-center">
                  <img
                    src={viewImage}
                    alt="Payment Receipt"
                    className="img-fluid"
                    onError={(e) => {
                      console.error('Image failed to load:', viewImage);
                      showAlert('danger', 'Unable to load receipt image.');
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                    }}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeImageModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={closeImageModal}></div>
        </>
      )}
    </div>
  );
};

export default BookingList;