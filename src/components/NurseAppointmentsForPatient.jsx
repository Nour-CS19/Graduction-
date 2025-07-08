import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Container,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useAuth } from '../Pages/AuthPage';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#009DA5',
  '& .MuiTableCell-head': {
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: '1rem',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    cursor: 'pointer',
  },
}));

const getStatusColor = (status, isAccepted) => {
  let statusStr;
  if (isAccepted) {
    statusStr = 'Accepted';
  } else {
    statusStr = status || 'Pending';
  }
  switch (statusStr.toLowerCase()) {
    case 'accepted':
    case 'confirmed':
    case 'completed':
      return 'success';
    case 'pending':
    case 'scheduled':
      return 'warning';
    case 'cancelled':
      return 'error';
    case 'en route':
    case 'in_progress':
      return 'info';
    default:
      return 'default';
  }
};

const AppointmentsContainer = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const patientId = user?.id || '1'; // Fallback for testing

  // Function to get image URL from filePath (removed functionality, kept for reference if needed later)
  const getImageUrl = (filePath) => {
    if (!filePath || filePath === ' ' || filePath === null) return null;
    const baseUrl = 'https://physiocareapp.runasp.net/api/v1/Upload/image';
    const filename = filePath;
    const path = 'Bookings/Patient';
    return `${baseUrl}?filename=${encodeURIComponent(filename)}&path=${encodeURIComponent(path)}`;
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/PatientBookNurse/get-all-booking-for-patient/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch nurse appointments');
      }

      const data = await response.json();
      const transformedAppointments = data.map(appointment => ({
        id: appointment.bookingId || appointment.id,
        bookingId: appointment.bookingId || appointment.id,
        patientName: appointment.patientName || appointment.patient?.name || 'N/A',
        nurseName: appointment.nurseName || appointment.nurse?.name || 'Registered Nurse',
        nurseAddress: appointment.nurseAddress || appointment.address || 'N/A',
        nursingName: appointment.nursingName || appointment.serviceType || 'Home Nursing Care',
        nursingDescription: appointment.nursingDescription || appointment.notes || 'General Care',
        date: appointment.date || appointment.appointmentDate,
        time: appointment.time || appointment.appointmentTime,
        status: appointment.status || 'Pending',
        medicalCondition: appointment.medicalCondition || appointment.notes || '',
        estimatedDuration: appointment.estimatedDuration || appointment.duration || '60 minutes',
        cost: appointment.totalPrice || appointment.cost || appointment.fee || 'N/A',
        contactNumber: appointment.nurse?.phone || appointment.contactNumber || 'N/A',
        filePath: appointment.filePath,
        isAccepted: appointment.isAccepted
      }));

      setAppointments(transformedAppointments);
      setError(null);
    } catch (err) {
      setError('Failed to fetch nurse appointments');
      console.error('Error fetching nurse appointments:', err);
      
      // Fallback data using the provided JSON structure
      setAppointments([
        {
          id: "6200c6a8-3165-4869-b3de-66ab74f0f32a",
          bookingId: "6200c6a8-3165-4869-b3de-66ab74f0f32a",
          patientName: "Helen Rodriguez",
          nurseName: "Fareda Omer",
          nurseAddress: "addresss",
          nursingName: "Home Care",
          nursingDescription: "Home Care Service",
          date: "2025-06-21",
          time: "20:00:00",
          status: "Confirmed",
          medicalCondition: "i have a headche",
          estimatedDuration: "90 minutes",
          cost: "200",
          contactNumber: "(555) 123-4567",
          filePath: "6200c6a8-3165-4869-b3de-66ab74f0f32a.png",
          isAccepted: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const handleOpenCancelDialog = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCancelReason('');
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setSelectedBookingId(null);
    setCancelReason('');
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingId || !cancelReason) {
      alert('Please provide a cancel reason');
      return;
    }

    try {
      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/PatientBookNurse/soft-delete-booking-by-id/${selectedBookingId}?cancelReason=${encodeURIComponent(cancelReason)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      setAppointments(appointments.filter(appointment => appointment.bookingId !== selectedBookingId));
      handleCloseCancelDialog();
    } catch (err) {
      setError('Failed to cancel appointment');
      console.error('Error canceling appointment:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#009DA5' }} />
      </Container>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh' }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#009DA5', fontWeight: 600 }}>
          Nurse Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your home nursing care appointments and medical services
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Some data may not be current. {error}
        </Alert>
      )}

      <StyledTableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="nurse appointments table">
          <StyledTableHead>
            <TableRow>
              <TableCell>Nurse</TableCell>
              <TableCell>Nurse Address</TableCell>
              <TableCell>Service Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Medical Condition</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <StyledTableRow key={appointment.id}>
                <TableCell>
                  <Typography variant="body1" fontWeight={500}>
                    {appointment.nurseName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.nursingDescription}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 150 }}>
                    {appointment.nurseAddress}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.nursingName}
                  </Typography>
                </TableCell>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>{appointment.estimatedDuration}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusColor(appointment.status, appointment.isAccepted) === 'success' ? 'Accepted' : 
                           getStatusColor(appointment.status, appointment.isAccepted) === 'warning' ? 'Pending' : 
                           getStatusColor(appointment.status, appointment.isAccepted) === 'info' ? 'In Progress' : 
                           getStatusColor(appointment.status, appointment.isAccepted) === 'error' ? 'Cancelled' : appointment.status}
                    color={getStatusColor(appointment.status, appointment.isAccepted)}
                    size="small"
                    variant="filled"
                  />
                </TableCell>
                <TableCell>{appointment.cost}EGP</TableCell>
                <TableCell>
                  <Typography variant="body2" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    {appointment.contactNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                    {appointment.medicalCondition}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleOpenCancelDialog(appointment.bookingId)}
                    disabled={appointment.status.toLowerCase() === 'cancelled' || appointment.status.toLowerCase() === 'completed' || appointment.isAccepted}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {appointments.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No nurse appointments found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your home nursing care appointments will appear here
          </Typography>
        </Box>
      )}

      {/* Cancel Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for canceling this appointment.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Cancel Reason"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Back</Button>
          <Button onClick={handleCancelBooking} color="error">
            Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const NurseAppointments = () => {
  return (
    <>
      <Nav />
      <section style={{ paddingBottom: '40px' }}>
        <AppointmentsContainer />
      </section>
      <Footer />
    </>
  );
};

export default NurseAppointments;