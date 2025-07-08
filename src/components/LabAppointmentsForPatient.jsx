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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
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

const LabAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAtHomeFilter, setIsAtHomeFilter] = useState('');

  const patientId = user?.id || '1'; // Fallback for testing

  // Function to fetch analysis details by booking ID
  const fetchAnalysisDetails = async (bookingId) => {
    try {
      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/PatientBookLab/get-all-booking-phanalysis/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch analysis for booking ${bookingId}`);
        return [];
      }

      const analysisData = await response.json();
      return analysisData.map(analysis => analysis.nameEN || analysis.nameAR || 'N/A').filter(Boolean);
    } catch (err) {
      console.warn(`Error fetching analysis for booking ${bookingId}:`, err);
      return [];
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const url = new URL(`https://physiocareapp.runasp.net/api/v1/PatientBookLab/get-all-booking-lab-by-Patient-id`);
      url.searchParams.append('PatientId', patientId);
      if (statusFilter === 'active') url.searchParams.append('status', 'true');
      else if (statusFilter === 'cancelled') url.searchParams.append('status', 'false');
      if (isAtHomeFilter === 'home') url.searchParams.append('isAtHome', 'true');
      else if (isAtHomeFilter === 'center') url.searchParams.append('isAtHome', 'false');

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lab appointments');
      }

      const data = await response.json();
      
      const appointmentsWithAnalysis = await Promise.all(
        data.map(async (appointment) => {
          const analysisDetails = await fetchAnalysisDetails(appointment.bookingid);
          const testType = analysisDetails.length > 0 ? analysisDetails.join(', ') : 'Lab Test';

          return {
            id: appointment.bookingid,
            bookingId: appointment.bookingid,
            labName: appointment.labName || 'Lab Service',
            labPhone: appointment.labPhone || 'N/A',
            appointmentDay: appointment.appointmentDay,
            appointmentTime: appointment.appointmentTime,
            testType: testType,
            status: appointment.status,
            cost: appointment.totalPrice || 'N/A',
            address: appointment.cityName || 'N/A',
            isAccepted: appointment.isAccepted
          };
        })
      );

      setAppointments(appointmentsWithAnalysis);
      setError(null);
    } catch (err) {
      setError('Failed to fetch lab appointments');
      console.error('Error fetching lab appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientId, statusFilter, isAtHomeFilter]);

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
        `https://physiocareapp.runasp.net/api/v1/PatientBookLab/soft-delete-booking-by-id/${selectedBookingId}?cancelReason=${encodeURIComponent(cancelReason)}`,
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
            Lab Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your laboratory test appointments
          </Typography>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Location</InputLabel>
            <Select
              value={isAtHomeFilter}
              onChange={(e) => setIsAtHomeFilter(e.target.value)}
              label="Location"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="home">Home</MenuItem>
              <MenuItem value="center">Center</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Some data may not be current. {error}
          </Alert>
        )}

        <StyledTableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="lab appointments table">
            <StyledTableHead>
              <TableRow>
                <TableCell>Lab Name</TableCell>
                <TableCell>Lab Phone</TableCell>
                <TableCell>Appointment Day</TableCell>
                <TableCell>Appointment Time</TableCell>
                <TableCell>Test Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <StyledTableRow key={appointment.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight={500}>
                      {appointment.labName}
                    </Typography>
                  </TableCell>
                  <TableCell>{appointment.labPhone}</TableCell>
                  <TableCell>{appointment.appointmentDay}</TableCell>
                  <TableCell>{appointment.appointmentTime}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                      {appointment.testType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusColor(appointment.isAccepted) === 'success' ? 'Accepted' : 'Pending'}
                      color={getStatusColor(appointment.isAccepted)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>{appointment.cost}EGP</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                      {appointment.address}
                    </Typography>
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
              No lab appointments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your laboratory test appointments will appear here
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

export default LabAppointments;