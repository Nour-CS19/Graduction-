import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Grid,
  Divider,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import LanguageIcon from "@mui/icons-material/Language";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";

const AppointmentsList = () => {
  const location = useLocation();
  // appointmentDetails should include both doctor data and appointment data.
  // For example, when navigating from the AppointmentPage:
  // navigate("/appointments", { state: { bookingConfirmed: true, appointmentDetails: { doctor, date, time, type, patient, bookingId } } });
  const { appointmentDetails } = location.state || {};

  return (
    <>
      <Navbar />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Appointments
        </Typography>

        {appointmentDetails ? (
          <Card sx={{ p: 2, mb: 3 }}>
            <CardContent>
              {/* Top Row: Success Icon and Doctor Image */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                <Avatar
                  src={appointmentDetails.doctor.image}
                  alt={appointmentDetails.doctor.name}
                  sx={{ width: 70, height: 70 }}
                />
                <Box>
                  <Typography variant="h6">
                    {appointmentDetails.doctor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointmentDetails.doctor.specialization}
                    {appointmentDetails.doctor.subspecialty &&
                      ` • ${appointmentDetails.doctor.subspecialty}`}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Appointment & Patient Data */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Appointment Details</Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong>{" "}
                    {appointmentDetails.date
                      ? new Date(appointmentDetails.date).toLocaleDateString()
                      : ""}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time:</strong> {appointmentDetails.time}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {appointmentDetails.type}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Booking ID:</strong> {appointmentDetails.bookingId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Patient Details</Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {appointmentDetails.patient.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {appointmentDetails.patient.phone}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Doctor Additional Data */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Doctor Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Experience:</strong> {appointmentDetails.doctor.experience}{" "}
                    years
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    {(appointmentDetails.doctor.languages || []).map(
                      (lang, index) => (
                        <Chip
                          key={index}
                          label={lang}
                          size="small"
                          variant="outlined"
                          icon={<LanguageIcon fontSize="small" />}
                        />
                      )
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, display: "flex", alignItems: "center" }}>
                    <MonetizationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                    EGP {appointmentDetails.doctor.fee}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                    <LocalHospitalIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {appointmentDetails.doctor.hospital.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointmentDetails.doctor.hospital.address}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Education:</strong>
                  </Typography>
                  {appointmentDetails.doctor.education &&
                    appointmentDetails.doctor.education.map((edu, i) => (
                      <Box key={i} sx={{ ml: 2 }}>
                        <Typography variant="body2">
                          {edu.degree} - {edu.institution} ({edu.year})
                        </Typography>
                      </Box>
                    ))}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No appointments found.
          </Typography>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default AppointmentsList;
