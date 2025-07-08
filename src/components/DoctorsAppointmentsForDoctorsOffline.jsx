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

const getStatusColor = (isAccepted) => {
  const statusStr = isAccepted ? 'Accepted' : 'Pending';
  return statusStr.toLowerCase() === 'accepted' ? 'success' : 'warning';
};

const DoctorClinicAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const patientId = user?.id || '1'; // Fallback for testing

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/PatientBookingDoctorAtClinics/get-all-booking-at-clinic-by-patient-id/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch clinic appointments');
      }

      const data = await response.json();
      
      const transformedAppointments = data.map(appointment => ({
        bookingId: appointment.bookingId,
        id: appointment.bookingId,
        patientName: appointment.patientName || 'N/A',
        specializationNameAR: appointment.nameAR || '',
        specializationNameEN: appointment.nameEN || '',
        medicalCondition: appointment.medicalCondition || '',
        totalPrice: appointment.totalPrice || 0,
        isAccepted: appointment.isAccepted || false
      }));

      setAppointments(transformedAppointments);
      setError(null);
    } catch (err) {
      setError('Failed to fetch clinic appointments');
      console.error('Error fetching clinic appointments:', err);
      setAppointments([
        {
          bookingId: 'ee513527-b7fb-4356-bf58-ac7566195f90',
          id: 'ee513527-b7fb-4356-bf58-ac7566195f90',
          patientName: 'N/A',
          specializationNameAR: 'طب العيون',
          specializationNameEN: 'Ophthalmology',
          medicalCondition: 'i have a stress',
          totalPrice: 0,
          isAccepted: false
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
        `https://physiocareapp.runasp.net/api/v1/PatientBookingDoctorAtClinics/soft-delete-booking-by-id/${selectedBookingId}?cancelReason=${encodeURIComponent(cancelReason)}`,
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
      <>
        <Nav />
        <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#009DA5' }} />
        </Container>
        <Footer />
      </>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <>
        <Nav />
        <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh' }}>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#009DA5', fontWeight: 600 }}>
            Clinic Doctor Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your in-person doctor appointments at clinics
          </Typography>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Some data may not be current. {error}
          </Alert>
        )}

        <StyledTableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="clinic appointments table">
            <StyledTableHead>
              <TableRow>
                <TableCell>Specialization (EN)</TableCell>
                <TableCell>Specialization (AR)</TableCell>
                <TableCell>Medical Condition</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <StyledTableRow key={appointment.id}>
                  <TableCell>{appointment.specializationNameEN}</TableCell>
                  <TableCell>{appointment.specializationNameAR}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                      {appointment.medicalCondition}
                    </Typography>
                  </TableCell>
                  <TableCell>{appointment.totalPrice}EGP</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusColor(appointment.isAccepted) === 'success' ? 'Accepted' : 'Pending'}
                      color={getStatusColor(appointment.isAccepted)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenCancelDialog(appointment.bookingId)}
                      disabled={appointment.isAccepted}
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
              No clinic appointments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your clinic appointments will appear here
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
      <Footer />
    </>
  );
};

export default DoctorClinicAppointments;