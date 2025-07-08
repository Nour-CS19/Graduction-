
/*



import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  TextField,
  Chip,
  Divider,
  IconButton,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Card,
  CardContent,
  InputAdornment,
  ThemeProvider,
  createTheme,
  CssBaseline,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Stack,
  Rating,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DateRangeIcon from "@mui/icons-material/DateRange";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import format from "date-fns/format";

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
      light: "#3b82f6",
      dark: "#1d4ed8",
    },
    secondary: {
      main: "#f43f5e",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 22px",
          boxShadow: "none",
        },
        contained: {
          "&:hover": {
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: "hidden",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 36,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&.Mui-selected": {
            backgroundColor: "#2563eb",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#1d4ed8",
              color: "#ffffff",
            },
          },
        },
      },
    },
  },
});

const MORNING_TIMES = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM"];
const NIGHT_TIMES = ["06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"];
const DEFAULT_REASONS = [
  "Appendicitis",
  "Backache",
  "Bone fracture",
  "Cold",
  "Constipation",
  "Cough",
  "Diarrhea",
  "Dizzy",
];

const steps = ["Select Doctor", "Doctor Details", "Book Appointment", "Patient Info", "Payment"];

const CalendarDates = ({ selectedDate, onDateSelect }) => {
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return date;
  });

  return (
    <Grid container spacing={1} sx={{ mt: 2, mb: 3 }}>
      {dates.map((date, index) => {
        const isSelected = selectedDate && 
          date.getDate() === selectedDate.getDate() && 
          date.getMonth() === selectedDate.getMonth();
        
        return (
          <Grid item key={index}>
            <Card 
              onClick={() => onDateSelect(date)}
              sx={{
                width: 50,
                height: 60,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: isSelected ? '2px solid #2563eb' : '1px solid #e5e7eb',
                bgcolor: isSelected ? 'primary.light' : 'background.paper',
                color: isSelected ? 'white' : 'text.primary',
                '&:hover': {
                  borderColor: !isSelected ? '#2563eb' : '#2563eb',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Typography variant="caption" sx={{ textTransform: 'uppercase' }}>
                {format(date, 'EEE')}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {date.getDate()}
              </Typography>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

const AppointmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced mock doctor data with safe defaults
  const mockDoctor = {
    name: "Dr. Rahul Sharma",
    specialization: "MD, MDS - Cardiology",
    experience: "5 Years",
    consultationFee: 100,
    taxesAndCharges: 20,
    totalAmount: 120,
    image: "https://via.placeholder.com/150?text=Dr+Rahul",
    rating: 4.8,
    reviewCount: 127,
    qualification: "MBBS, MS - General Surgery, MCh - Cardio-thoracic and Vascular Surgery",
    hospital: "Apollo Hospital",
    languages: ["English", "Hindi", "Gujarati"],
    verified: true
  };

  // Merge with default values to prevent undefined errors
  const doctor = {
    languages: [],
    ...(location.state?.doctor || mockDoctor)
  };

  const [selectedDate, setSelectedDate] = useState(null);
  const [isMorning, setIsMorning] = useState(true);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reasons, setReasons] = useState(DEFAULT_REASONS);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [newReasonInput, setNewReasonInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [patientId, setPatientId] = useState("");
  const [insuranceChecked, setInsuranceChecked] = useState(false);
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleAddReason = () => {
    if (newReasonInput.trim()) {
      setReasons((prev) => [...prev, newReasonInput.trim()]);
      setNewReasonInput("");
    }
  };

  const filteredReasons = reasons.filter((reason) =>
    reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canContinue = () => {
    return (
      selectedDate &&
      selectedTime &&
      (selectedReason || customReason) &&
      patientName.trim() &&
      patientPhone.trim() &&
      dateOfBirth.trim() &&
      termsAccepted
    );
  };

  const handleContinue = () => {
    const appointmentData = {
      doctor,
      selectedDate,
      selectedTime,
      reason: selectedReason || customReason,
      patientName,
      patientPhone,
      patientEmail,
      dateOfBirth,
      patientId,
      insuranceChecked,
      insuranceNumber,
    };
    navigate("/payment", { state: appointmentData });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <IconButton 
                sx={{ mr: 1 }} 
                onClick={() => navigate(-1)}
                color="primary"
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <Typography variant="h5">Booking Appointment</Typography>
            </Box>
            
            <Stepper activeStep={2} alternativeLabel sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
                    <Avatar
                      src={doctor.image}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        border: "3px solid #e5e7eb",
                        mr: 3,
                        mt: 1
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Typography variant="h6" sx={{ mr: 1 }}>
                          {doctor.name}
                        </Typography>
                        {doctor.verified && (
                          <Tooltip title="Verified Doctor">
                            <VerifiedIcon color="primary" fontSize="small" />
                          </Tooltip>
                        )}
                      </Box>
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {doctor.specialization}
                      </Typography>
                      
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Rating 
                          value={doctor.rating} 
                          readOnly 
                          precision={0.5} 
                          size="small"
                          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {doctor.rating} ({doctor.reviewCount} reviews)
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Experience:</strong> {doctor.experience}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Qualifications:</strong> {doctor.qualification}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Hospital:</strong> {doctor.hospital}
                      </Typography>
                      
                      {doctor.languages?.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                          {doctor.languages.map((lang) => (
                            <Chip 
                              key={lang} 
                              label={lang} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center", p: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Consultation Fee
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                          {doctor.consultationFee} EGP
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center", p: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Taxes & Charges
                        </Typography>
                        <Typography variant="h6">
                          {doctor.taxesAndCharges} EGP
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center", p: 1, bgcolor: "primary.light", color: "white", borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                          Total Amount
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
                          {doctor.totalAmount} EGP
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ mb: 3, overflow: "visible" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    1. Select Appointment Date & Time
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                      Select Date
                    </Typography>
                    
                    <CalendarDates 
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                    />
                  </Box>
                  
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Or select a specific date:
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      p: 2, 
                      border: '1px solid #e5e7eb', 
                      borderRadius: 2,
                      mb: 3,
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      },
                    }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Appointment Date"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                        minDate={new Date()}
                        sx={{ 
                          width: "100%",
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                              borderColor: 'transparent',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'transparent',
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Box>

                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Preferred Time
                  </Typography>
                  
                  <ToggleButtonGroup
                    value={isMorning ? "morning" : "night"}
                    exclusive
                    onChange={(_, newValue) => {
                      if (newValue !== null) {
                        setIsMorning(newValue === "morning");
                        setSelectedTime(null);
                      }
                    }}
                    fullWidth
                    sx={{ mb: 3 }}
                  >
                    <ToggleButton value="morning" aria-label="morning slots">
                      <WbSunnyOutlinedIcon sx={{ mr: 1 }} />
                      Morning
                    </ToggleButton>
                    <ToggleButton value="night" aria-label="night slots">
                      <NightsStayOutlinedIcon sx={{ mr: 1 }} />
                      Night
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Available Time Slots
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 1 }}>
                    {(isMorning ? MORNING_TIMES : NIGHT_TIMES).map((time, index) => (
                      <Grid item xs={6} sm={3} key={time}>
                        <Button
                          fullWidth
                          variant={selectedTime === time ? "contained" : "outlined"}
                          onClick={() => setSelectedTime(time)}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            backgroundColor: selectedTime === time ? "primary.main" : "transparent",
                            borderColor: "primary.main",
                            color: selectedTime === time ? "white" : "primary.main",
                            position: "relative",
                            "&:hover": {
                              backgroundColor: selectedTime === time ? "primary.main" : "rgba(37, 99, 235, 0.04)",
                              borderColor: "primary.main",
                              boxShadow: selectedTime === time ? "none" : "0px 2px 8px rgba(0, 0, 0, 0.05)",
                            },
                          }}
                        >
                          {time}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    2. Select Reason for Visit
                  </Typography>
                  
                  <TextField
                    fullWidth
                    placeholder="Search for a reason..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                    {filteredReasons.map((reason) => (
                      <Chip
                        key={reason}
                        label={reason}
                        onClick={() => {
                          setSelectedReason(reason);
                          setCustomReason("");
                        }}
                        color={selectedReason === reason ? "primary" : "default"}
                        variant={selectedReason === reason ? "filled" : "outlined"}
                        icon={
                          selectedReason === reason ? <CheckCircleIcon fontSize="small" /> : null
                        }
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>
                  
                  <TextField
                    fullWidth
                    label="Custom Reason"
                    placeholder="Describe your symptoms or reason for visit..."
                    value={customReason}
                    onChange={(e) => {
                      setCustomReason(e.target.value);
                      setSelectedReason("");
                    }}
                    sx={{ mb: 2 }}
                    multiline
                    rows={2}
                  />
                  
                  <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Add New Reason"
                      placeholder="Add a new reason to the list..."
                      value={newReasonInput}
                      onChange={(e) => setNewReasonInput(e.target.value)}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddReason}
                      startIcon={<AddCircleOutlineIcon />}
                    >
                      Add
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    3. Patient Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutlineIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address (Optional)"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        placeholder="DD/MM/YYYY"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DateRangeIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Patient ID (if returning)"
                        placeholder="Enter patient number"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography variant="body2" color="primary" fontWeight="bold" pr={1}>
                                #
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={insuranceChecked}
                            onChange={(e) => setInsuranceChecked(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="I have insurance"
                      />
                    </Grid>
                    
                    {insuranceChecked && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Insurance Number"
                          placeholder="Enter your insurance policy number"
                          value={insuranceNumber}
                          onChange={(e) => setInsuranceNumber(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocalHospitalIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    )}
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2">
                            I agree to the{" "}
                            <Typography
                              component="span"
                              color="primary"
                              sx={{ textDecoration: "underline", cursor: "pointer" }}
                            >
                              Terms of Service
                            </Typography>{" "}
                            and{" "}
                            <Typography
                              component="span"
                              color="primary"
                              sx={{ textDecoration: "underline", cursor: "pointer" }}
                            >
                              Privacy Policy
                            </Typography>
                          </Typography>
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ position: "sticky", top: 20 }}>
                <Card sx={{ mb: 3, bgcolor: "primary.light", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
                      Appointment Summary
                    </Typography>
                    
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Avatar
                        src={doctor.image}
                        sx={{ 
                          width: 70, 
                          height: 70, 
                          border: "3px solid white",
                          mr: 2,
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "white" }}>
                          {doctor.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                          {doctor.specialization} • {doctor.experience}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {selectedDate && selectedTime && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: "rgba(255, 255, 255, 0.1)", borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: "white" }}>
                          Scheduled for:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "bold", color: "white" }}>
                          {selectedDate?.toDateString()} at {selectedTime}
                        </Typography>
                      </Box>
                    )}
                    
                    {(selectedReason || customReason) && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: "rgba(255, 255, 255, 0.1)", borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: "white" }}>
                          Reason for visit:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "bold", color: "white" }}>
                          {selectedReason || customReason}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Fee Details
                    </Typography>
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body1">Consultation Fee</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {doctor.consultationFee} EGP
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="body1">Taxes & Charges</Typography>
                      <Typography variant="body1">
                        {doctor.taxesAndCharges} EGP
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Total Amount
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        {doctor.totalAmount} EGP
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={!canContinue()}
                      onClick={handleContinue}
                      endIcon={<ArrowForwardIosIcon />}
                      sx={{ 
                        mt: 2, 
                        py: 1.5,
                        background: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
                      }}
                    >
                      Proceed to Payment
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AppointmentPage;







*/



/*



import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Typography, Grid, Button, TextField, Chip, Divider, 
  Card, CardContent, Avatar, Rating, FormControlLabel, Checkbox, 
  FormControl, InputLabel, Select, MenuItem, Alert, Tooltip
} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import bg from '../assets/images/00001zon_cropped.png';
export default function ArabicAppointmentBooking() {
  // States for calendar and booking information
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [isMorning, setIsMorning] = useState(true);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reasons] = useState([
    "نزلات البرد والإنفلونزا",
    "الحمى",
    "مشاكل الجهاز الهضمي",
    "البلهارسيا",
    "التهاب الكبد",
    "مشاكل الجهاز التنفسي",
    "فحص السكري",
    "ارتفاع ضغط الدم"
  ]);
  const [filteredReasons, setFilteredReasons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientGovernorate, setPatientGovernorate] = useState("");
  const [patientInsurance, setPatientInsurance] = useState("");
  const [patientNationalId, setPatientNationalId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  // Mock doctor data
  const doctor = {
    id: "dr-ahmed-mahmoud",
    name: "د. أحمد محمود",
    specialization: "طب باطني وجهاز هضمي",
    reviewCount: 127,
    verified: true,
    image: {bg},
    experience: 15,
    patientsCount: 50,
    consultationFee: 400,
    availableNow: true,
    education: "دكتوراه في الطب الباطني - جامعة القاهرة",
    languages: ["العربية", "الإنجليزية", "الفرنسية"],
    specialties: ["الجهاز الهضمي", "مناظير الجهاز الهضمي", "أمراض الكبد"]
  };

  // Constants for appointment times and dropdown options
  const MORNING_TIMES = ["٩:٠٠ ص", "١٠:٠٠ ص", "١١:٠٠ ص", "١٢:٠٠ م"];
  const NIGHT_TIMES = ["٥:٠٠ م", "٦:٠٠ م", "٧:٠٠ م", "٨:٠٠ م"];
  const EGYPT_GOVERNORATES = [
    "القاهرة", "الإسكندرية", "الجيزة", "أسوان", "أسيوط", "الأقصر",
    "البحر الأحمر", "البحيرة", "بني سويف", "بورسعيد", "جنوب سيناء",
    "الدقهلية", "دمياط", "سوهاج"
  ];
  const EGYPT_INSURANCE_PROVIDERS = [
    "التأمين الصحي المصري",
    "ميديكير مصر",
    "أليانز مصر",
    "أكسا مصر",
    "متلايف مصر",
    "بيوبا مصر",
    "المجموعة العربية للتأمين"
  ];

  // Filter reasons based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = reasons.filter(reason => 
        reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReasons(filtered);
    } else {
      setFilteredReasons(reasons);
    }
  }, [searchTerm, reasons]);

  // Set initial filtered reasons
  useEffect(() => {
    setFilteredReasons(reasons);
  }, [reasons]);

  // Format date with a friendly label if it's today
  const formatDate = useCallback((date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "اليوم";
    }
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-EG', options);
  }, []);

  // Validate patient information
  const validatePatientInfo = useCallback(() => {
    const errors = {};
    
    if (!patientName) errors.name = "الاسم الكامل مطلوب";
    if (!patientPhone) {
      errors.phone = "رقم الهاتف مطلوب";
    } else if (!/^01[0-2]\d{8}$/.test(patientPhone)) {
      errors.phone = "رقم الهاتف غير صحيح";
    }
    
    if (!patientEmail) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
      errors.email = "البريد الإلكتروني غير صحيح";
    }
    
    if (!patientGovernorate) errors.governorate = "المحافظة مطلوبة";
    
    if (!patientNationalId) {
      errors.nationalId = "الرقم القومي مطلوب";
    } else if (!/^\d{14}$/.test(patientNationalId)) {
      errors.nationalId = "الرقم القومي يجب أن يكون 14 رقم";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [patientName, patientPhone, patientEmail, patientGovernorate, patientNationalId]);

  // Check if all required fields are filled to allow booking continuation
  const canContinue = useCallback(() => {
    if (currentStep === 1) {
      return selectedDate && selectedTime;
    } else if (currentStep === 2) {
      return selectedReason || customReason;
    } else if (currentStep === 3) {
      return patientName && patientPhone && patientEmail && patientGovernorate && 
             patientNationalId && termsAccepted &&
             !/^01[0-2]\d{8}$/.test(patientPhone) === false &&
             !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail) === false &&
             !/^\d{14}$/.test(patientNationalId) === false;
    }
    return false;
  }, [currentStep, selectedDate, selectedTime, selectedReason, customReason, patientName, patientPhone, patientEmail, patientGovernorate, patientNationalId, termsAccepted]);

  const handleContinue = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      if (validatePatientInfo()) {
        // Here you could process the booking
        console.log("Booking confirmed", {
          doctor,
          date: selectedDate,
          time: selectedTime,
          reason: selectedReason || customReason,
          patient: {
            name: patientName,
            phone: patientPhone,
            email: patientEmail,
            governorate: patientGovernorate,
            insurance: patientInsurance,
            nationalId: patientNationalId
          }
        });
        setBookingSubmitted(true);
      }
    }
  }, [currentStep, validatePatientInfo, doctor, selectedDate, selectedTime, selectedReason, customReason, patientName, patientPhone, patientEmail, patientGovernorate, patientInsurance, patientNationalId]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const applyPromoCode = useCallback(() => {
    // Mock promo code validation
    if (promoCode === "WELCOME50") {
      setDiscountApplied(true);
    } else {
      alert("رمز الخصم غير صالح");
    }
  }, [promoCode]);

  // Enhanced calendar with week navigation
  const CalendarDates = useCallback(() => {
    const today = new Date();
    // Calculate start date based on weekOffset
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + weekOffset * 7);

    // Generate an array of 7 consecutive dates
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });

    const handleDateClick = (date) => {
      setSelectedDate(date);
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <Button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="py-1 px-3 bg-gray-200 text-teal-600 rounded hover:shadow-md"
            startIcon={<ArrowBackIosIcon />}
          >
            السابق
          </Button>
          <Typography className="font-bold">
            {dates[0].toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
          </Typography>
          <Button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="py-1 px-3 bg-gray-200 text-teal-600 rounded hover:shadow-md"
            endIcon={<ArrowForwardIosIcon />}
          >
            التالي
          </Button>
        </div>

        <Grid container spacing={1} className="mt-2 mb-3">
          {dates.map((date, index) => {
            const isSelected = selectedDate && (selectedDate.toDateString() === date.toDateString());
            const dayName = date.toLocaleDateString('ar-EG', { weekday: 'short' });
            const isToday = date.toDateString() === today.toDateString();
            
            return (
              <Grid item xs={12/7} key={index}>
                <Card
                  onClick={() => handleDateClick(date)}
                  className={`w-full h-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 
                    ${isSelected ? 'bg-teal-100 border-2 border-teal-500' : 'bg-white border border-gray-200'} 
                    ${isToday ? 'border-blue-300' : ''}
                    hover:border-teal-500 hover:shadow-md hover:-translate-y-1`}
                >
                  <Typography className="text-xs text-center uppercase">
                    {dayName}
                  </Typography>
                  <Typography className={`text-lg font-bold ${isToday ? 'text-blue-600' : ''}`}>
                    {date.getDate()}
                  </Typography>
                  {isToday && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </div>
    );
  }, [weekOffset, selectedDate]);

  const BookingProgressBar = () => (
    <Box className="mb-6">
      <Box className="flex justify-between">
        {Array.from({ length: 3 }, (_, i) => i + 1).map((step) => (
          <Box 
            key={step} 
            className={`flex flex-col items-center cursor-pointer ${step < currentStep ? 'text-teal-600' : (step === currentStep ? 'text-teal-800' : 'text-gray-400')}`}
            onClick={() => step < currentStep && setCurrentStep(step)}
          >
            <Box 
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300
                ${step < currentStep ? 'bg-teal-600 text-white' : (step === currentStep ? 'bg-teal-800 text-white' : 'bg-gray-200 text-gray-600')}`}
            >
              {step < currentStep ? <CheckCircleIcon fontSize="small" /> : step}
            </Box>
            <Typography className="text-xs text-center">
              {step === 1 ? 'الموعد' : step === 2 ? 'سبب الزيارة' : 'المعلومات الشخصية'}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box className="relative mt-2">
        <Divider className="my-2" />
        <Box 
          className="absolute top-0 left-0 h-0.5 bg-teal-600 transition-all duration-500" 
          style={{ width: `${(currentStep - 1) * 50}%` }}
        />
      </Box>
    </Box>
  );

  const BookingConfirmation = () => (
    <Box className="text-center py-8">
      <Box className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircleIcon fontSize="large" className="text-teal-600" />
      </Box>
      <Typography variant="h5" className="font-bold mb-2">
        تم تأكيد الحجز بنجاح!
      </Typography>
      <Typography className="mb-4 text-gray-600">
        تم إرسال تفاصيل الحجز إلى بريدك الإلكتروني
      </Typography>
      
      <Card className="max-w-md mx-auto mb-6 border-teal-200 border-2">
        <CardContent>
          <Box className="flex items-center mb-4">
            <EventAvailableIcon className="text-teal-600 mr-2" />
            <Typography variant="h6">تفاصيل الموعد</Typography>
          </Box>
          
          <Box className="flex items-center justify-between mb-2">
            <Typography className="flex items-center text-gray-600">
              <AccessTimeIcon fontSize="small" className="mr-1" />
              الموعد:
            </Typography>
            <Typography className="font-medium">
              {formatDate(selectedDate)} - {selectedTime}
            </Typography>
          </Box>
          
          <Box className="flex items-center justify-between mb-2">
            <Typography className="flex items-center text-gray-600">
              <LocalHospitalIcon fontSize="small" className="mr-1" />
              الطبيب:
            </Typography>
            <Typography className="font-medium">
              {doctor.name}
            </Typography>
          </Box>
          
          <Box className="flex items-center justify-between mb-2">
            <Typography className="flex items-center text-gray-600">
              <ScheduleIcon fontSize="small" className="mr-1" />
              سبب الزيارة:
            </Typography>
            <Typography className="font-medium">
              {selectedReason || customReason}
            </Typography>
          </Box>
          
          <Box className="flex items-center justify-between">
            <Typography className="flex items-center text-gray-600">
              <ReceiptIcon fontSize="small" className="mr-1" />
              رقم الحجز:
            </Typography>
            <Typography className="font-medium">
              #AP{Math.floor(100000 + Math.random() * 900000)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
      
      <Box className="flex justify-center space-x-2">
        <Button
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          onClick={() => window.print()}
        >
          طباعة التفاصيل
        </Button>
        <Button
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => {
            setBookingSubmitted(false);
            setCurrentStep(1);
            setSelectedTime(null);
            setSelectedReason("");
            setCustomReason("");
            setPatientName("");
            setPatientPhone("");
            setPatientEmail("");
            setPatientGovernorate("");
            setPatientInsurance("");
            setPatientNationalId("");
            setTermsAccepted(false);
          }}
        >
          حجز موعد آخر
        </Button>
      </Box>
    </Box>
  );

  const handleTimeSelection = useCallback((time) => {
    setSelectedTime(time);
  }, []);

  const handleReasonSelection = useCallback((reason) => {
    setSelectedReason(reason);
    setCustomReason("");
  }, []);

  const handleTimeOfDayToggle = useCallback((isMorningTime) => {
    setIsMorning(isMorningTime);
    setSelectedTime(null);
  }, []);

  return (
    <Box className="w-full max-w-5xl mx-auto p-4 bg-slate-50 min-h-screen" dir="rtl">
      <Typography className="text-3xl font-bold text-center my-6 text-teal-600">
        حجز موعد مع طبيب
      </Typography>

      {!bookingSubmitted ? (
        <>
          <Card className="mb-6 relative overflow-visible shadow-md hover:shadow-lg transition-all duration-300">
            {doctor.availableNow && (
              <Box className="absolute -top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-t-lg font-bold text-sm">
                متوفر الآن
              </Box>
            )}
            <CardContent>
              <Box className="flex flex-col md:flex-row items-start mb-3">
                <Avatar
                  src={doctor.image}
                  className="w-24 h-24 border-3 border-teal-300 mr-3 mt-1 shadow-md"
                />
                <Box className="flex-1 mt-4 md:mt-0">
                  <Box className="flex items-center mb-1">
                    <Typography className="text-xl font-bold mr-1">
                      {doctor.name}
                    </Typography>
                    {doctor.verified && (
                      <Tooltip title="طبيب موثق" arrow>
                        <VerifiedIcon className="w-5 h-5 text-teal-600" />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography className="text-gray-600 mb-1">
                    {doctor.specialization}
                  </Typography>
                  <Box className="flex items-center mb-1">
                    <Rating
                      value={doctor.rating}
                      readOnly
                      precision={0.1}
                      className="text-amber-500"
                    />
                    <Typography className="text-sm mr-1">
                      {doctor.rating} ({doctor.reviewCount} تقييم)
                    </Typography>
                  </Box>
                  <Divider className="my-3" />
                  <Grid container spacing={2} className="mt-2">
                    <Grid item xs={12} md={4}>
                      <Box className="text-center p-3 bg-teal-50 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                        <Typography className="text-2xl font-bold text-teal-600">
                          {doctor.experience}+
                        </Typography>
                        <Typography className="text-sm text-gray-600">
                          سنة خبرة
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box className="text-center p-3 bg-teal-50 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                        <Typography className="text-2xl font-bold text-teal-600">
                          {doctor.patientsCount}+
                        </Typography>
                        <Typography className="text-sm text-gray-600">
                          مريض معالج شهرياً
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box className="text-center p-3 bg-teal-50 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                        <Typography className="text-2xl font-bold text-teal-600">
                          {doctor.consultationFee}
                        </Typography>
                        <Typography className="text-sm text-gray-600">
                          جنيه / الكشف
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              
              <Divider className="my-3" />
              
              <Box className="mt-2">
                <Typography className="font-bold mb-2">التخصصات:</Typography>
                <Box className="flex flex-wrap gap-1">
                  {doctor.specialties.map((specialty, index) => (
                    <Chip
                      key={index}
                      label={specialty}
                      className="bg-teal-100 text-teal-700 m-1"
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>

          <BookingProgressBar />

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              {currentStep === 1 && (
                <Card className="mb-4 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent>
                    <Typography className="flex items-center mb-4 text-lg font-semibold">
                      <Box className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2">
                        1
                      </Box>
                      اختر تاريخ ووقت الموعد
                    </Typography>
                    <Box className="mb-4">
                      <Typography className="flex items-center mb-1 text-teal-700 font-medium">
                        <CalendarTodayIcon className="w-4 h-4 mr-1" />
                        اختر التاريخ
                      </Typography>
                      <CalendarDates />
                    </Box>
                    <Box className="p-2 border border-gray-200 rounded-lg mb-4 transition-all duration-300 hover:shadow-md hover:border-teal-500">
                      <Typography className="mb-2 font-medium">
                        التاريخ المحدد: {formatDate(selectedDate)}
                      </Typography>
                    </Box>
                    <div className="flex mb-4 space-x-2 border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        className={`flex-1 py-2 px-4 flex items-center justify-center ${isMorning ? 'bg-teal-600 text-white' : 'bg-white text-teal-600'} transition-all duration-300`}
                        onClick={() => handleTimeOfDayToggle(true)}
                      >
                        <WbSunnyOutlinedIcon className="w-4 h-4 mr-1" /> الصباح
                      </button>
                      <button
                        className={`flex-1 py-2 px-4 flex items-center justify-center ${!isMorning ? 'bg-teal-600 text-white' : 'bg-white text-teal-600'} transition-all duration-300`}
                        onClick={() => handleTimeOfDayToggle(false)}
                      >
                        <NightsStayOutlinedIcon className="w-4 h-4 mr-1" /> المساء
                      </button>
                    </div>
                    <Typography className="mb-2 text-teal-700 font-medium">
                      اختر الوقت المناسب
                    </Typography>
                    <Grid container spacing={2}>
                      {(isMorning ? MORNING_TIMES : NIGHT_TIMES).map((time) => (
                        <Grid item xs={6} sm={3} key={time}>
                          <Button
                            className={`py-2 w-full rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                              selectedTime === time
                                ? 'bg-teal-600 text-white'
                                : 'bg-white text-teal-600 border border-teal-600'
                            }`}
                            onClick={() => handleTimeSelection(time)}
                          >
                            {time}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Alert severity="info" className="mt-4">
                      مدة الكشف: 30 دقيقة
                    </Alert>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card className="mb-4 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent>
                    <Typography className="flex items-center mb-4 text-lg font-semibold">
                      <Box className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2">
                        2
                      </Box>
                      اختر سبب الزيارة
                    </Typography>
                    <TextField
                      placeholder="البحث عن سبب..."
                      className="mb-4 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <SearchIcon className="w-4 h-4 mr-2" />
                        ),
                      }}
                    />
                    <Box className="flex flex-wrap gap-2 mb-4">
                      {filteredReasons.map((reason) => (
                        <Chip
                          key={reason}
                          label={reason}
                          onClick={() => handleReasonSelection(reason)}
                          className={`transition-all duration-300 hover:-translate-y-1 hover:shadow-md m-1 ${
                            selectedReason === reason
                              ? 'bg-teal-600 text-white'
                              : 'bg-white text-teal-600 border border-teal-600'
                          }`}
                        />
                      ))}
                    </Box>
                    <Divider className="my-4">أو</Divider>
                    <TextField
                      label="سبب مخصص"
                      placeholder="وصف الأعراض الخاصة بك..."
                      value={customReason}
                      onChange={(e) => {
                        setCustomReason(e.target.value);
                        setSelectedReason("");
                      }}
                      className="mb-4 w-full"
                      multiline
                      rows={4}
                    />
                    
                    <Alert severity="info" className="mt-4">
                      <Typography>
                        معلومات دقيقة عن حالتك الصحية تساعد الطبيب في تقديم تشخيص أفضل
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card className="mb-4 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent>
                    <Typography className="flex items-center mb-4 text-lg font-semibold">
                    <Box className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2">
  3
</Box>
معلومات المريض
</Typography>

<Grid container spacing={2}>
  <Grid item xs={12}>
    <TextField
      label="الاسم الكامل"
      placeholder="أدخل الاسم الكامل للمريض"
      className="w-full mb-1"
      value={patientName}
      onChange={(e) => setPatientName(e.target.value)}
      error={Boolean(formErrors.name)}
      helperText={formErrors.name}
      InputProps={{
        startAdornment: <PersonOutlineIcon className="text-gray-500 mr-2" />,
      }}
    />
  </Grid>
  
  <Grid item xs={12} sm={6}>
    <TextField
      label="رقم الهاتف"
      placeholder="01xxxxxxxxx"
      className="w-full mb-1"
      value={patientPhone}
      onChange={(e) => setPatientPhone(e.target.value)}
      error={Boolean(formErrors.phone)}
      helperText={formErrors.phone}
      InputProps={{
        startAdornment: <PhoneIcon className="text-gray-500 mr-2" />,
      }}
    />
  </Grid>
  
  <Grid item xs={12} sm={6}>
    <TextField
      label="البريد الإلكتروني"
      placeholder="example@example.com"
      className="w-full mb-1"
      value={patientEmail}
      onChange={(e) => setPatientEmail(e.target.value)}
      error={Boolean(formErrors.email)}
      helperText={formErrors.email}
      InputProps={{
        startAdornment: <EmailIcon className="text-gray-500 mr-2" />,
      }}
    />
  </Grid>
  
  <Grid item xs={12} sm={6}>
    <FormControl className="w-full mb-1" error={Boolean(formErrors.governorate)}>
      <InputLabel>المحافظة</InputLabel>
      <Select
        value={patientGovernorate}
        onChange={(e) => setPatientGovernorate(e.target.value)}
        label="المحافظة"
        startAdornment={<LocationOnIcon className="text-gray-500 mr-2" />}
      >
        {EGYPT_GOVERNORATES.map((governorate) => (
          <MenuItem key={governorate} value={governorate}>
            {governorate}
          </MenuItem>
        ))}
      </Select>
      {formErrors.governorate && (
        <Typography className="text-red-500 text-xs mt-1">
          {formErrors.governorate}
        </Typography>
      )}
    </FormControl>
  </Grid>
  
  <Grid item xs={12} sm={6}>
    <FormControl className="w-full mb-1">
      <InputLabel>شركة التأمين (اختياري)</InputLabel>
      <Select
        value={patientInsurance}
        onChange={(e) => setPatientInsurance(e.target.value)}
        label="شركة التأمين (اختياري)"
        startAdornment={<PaymentIcon className="text-gray-500 mr-2" />}
      >
        <MenuItem value="">بدون تأمين</MenuItem>
        {EGYPT_INSURANCE_PROVIDERS.map((provider) => (
          <MenuItem key={provider} value={provider}>
            {provider}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>
  
  <Grid item xs={12}>
    <TextField
      label="الرقم القومي"
      placeholder="14 رقم"
      className="w-full mb-1"
      value={patientNationalId}
      onChange={(e) => setPatientNationalId(e.target.value)}
      error={Boolean(formErrors.nationalId)}
      helperText={formErrors.nationalId}
      InputProps={{
        startAdornment: <InfoOutlinedIcon className="text-gray-500 mr-2" />,
      }}
    />
  </Grid>

  <Grid item xs={12}>
    <Box className="p-4 bg-teal-50 rounded-lg mb-4">
      <Typography className="font-medium mb-2">
        الشروط والأحكام
      </Typography>
      <Typography className="text-sm text-gray-600 mb-4">
        بالضغط على موافق، أقر بصحة جميع المعلومات المقدمة وأوافق على سياسة خصوصية البيانات والشروط والأحكام.
        كما أفوض الطبيب في الاطلاع على المعلومات الطبية الخاصة بي.
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="text-teal-600"
          />
        }
        label="أوافق على الشروط والأحكام"
      />
    </Box>
  </Grid>
</Grid>

<Alert severity="info" className="mt-4">
  <Typography>
    جميع بياناتك محمية ولن يتم مشاركتها مع أي طرف ثالث
  </Typography>
</Alert>
</CardContent>
</Card>
)}
</Grid>

<Grid item xs={12} md={4}>
  <Card className="shadow-md sticky top-4 transition-all duration-300 hover:shadow-lg">
    <CardContent>
      <Typography className="text-lg font-bold mb-4 text-teal-600">
        ملخص الحجز
      </Typography>
      
      <Box className="mb-4">
        <Box className="flex items-center mb-2">
          <CalendarTodayIcon fontSize="small" className="text-gray-600 mr-2" />
          <Typography className="font-medium">
            {selectedDate ? formatDate(selectedDate) : "لم يتم اختيار تاريخ"}
          </Typography>
        </Box>
        
        <Box className="flex items-center mb-2">
          <AccessTimeIcon fontSize="small" className="text-gray-600 mr-2" />
          <Typography className="font-medium">
            {selectedTime ? selectedTime : "لم يتم اختيار وقت"}
          </Typography>
        </Box>
        
        <Box className="flex items-start mb-2">
          <LocalHospitalIcon fontSize="small" className="text-gray-600 mr-2 mt-1" />
          <Box>
            <Typography className="font-medium">
              {selectedReason || customReason || "لم يتم اختيار سبب الزيارة"}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Divider className="my-4" />
      
      <Typography className="font-bold mb-2">
        تفاصيل الدفع
      </Typography>
      
      <Box className="flex justify-between mb-2">
        <Typography>سعر الكشف:</Typography>
        <Typography>{doctor.consultationFee} جنيه</Typography>
      </Box>
      
      {discountApplied && (
        <Box className="flex justify-between mb-2 text-green-600">
          <Typography>خصم:</Typography>
          <Typography>-{Math.floor(doctor.consultationFee * 0.5)} جنيه</Typography>
        </Box>
      )}
      
      <Box className="flex justify-between font-bold text-lg">
        <Typography>الإجمالي:</Typography>
        <Typography>
          {discountApplied
            ? Math.floor(doctor.consultationFee * 0.5)
            : doctor.consultationFee} جنيه
        </Typography>
      </Box>
      
      {currentStep === 3 && (
        <Box className="mt-4">
          <TextField
            label="كود الخصم"
            placeholder="أدخل كود الخصم"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="mb-2 w-full"
            disabled={discountApplied}
          />
          <Button
            onClick={applyPromoCode}
            className="w-full py-1 bg-teal-100 text-teal-700 hover:bg-teal-200"
            disabled={discountApplied || !promoCode}
          >
            تطبيق الكود
          </Button>
          {discountApplied && (
            <Typography className="text-green-600 text-sm mt-1">
              تم تطبيق الخصم بنجاح!
            </Typography>
          )}
        </Box>
      )}
      
      <Box className="mt-4 mb-2">
        <Button
          onClick={handleContinue}
          disabled={!canContinue()}
          className="w-full py-2 bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {currentStep === 3 ? "تأكيد الحجز" : "متابعة"}
        </Button>
        
        {currentStep > 1 && (
          <Button
            onClick={handleBack}
            className="w-full py-2 mt-2 border border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            العودة
          </Button>
        )}
      </Box>
    </CardContent>
  </Card>
</Grid>
</Grid>
</>
) : (
<BookingConfirmation />
)}
</Box>
);
}




*/

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Rating,
  Tooltip,
  Avatar,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Chip,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import BackupIcon from "@mui/icons-material/Backup";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import LanguageIcon from "@mui/icons-material/Language";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { format, isValid } from "date-fns";

import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
 
import bg from '../assets/images/Pay With Vodafone Cash - Vodafone Mobile Money Logo - Free Transparent PNG Clipart Images Download_ ClipartMax 1.png';
import tg from '../assets/images/Pay With Vodafone Cash - Vodafone Mobile Money Logo - Free Transparent PNG Clipart Images Download_ ClipartMax 1.png';


const steps = [
  "Select Date & Time",
  "Enter Patient Details",
  "Confirm & Pay",
  "Success",
];

// Default doctor details (fallback)
const DOCTOR_DETAILS = {
  id: 1,
  name: "Dr. Sarah Johnson",
  specialization: "Cardiology",
  subspecialty: "Interventional Cardiology",
  experience: 15,
  languages: ["English", "Arabic", "French"],
  rating: 4.8,
  reviewCount: 247,
  fee: 800,
  image: "https://randomuser.me/api/portraits/women/76.jpg",
  verified: true,
  availableDays: ["Monday", "Wednesday", "Thursday", "Saturday"],
  about:
    "Dr. Sarah Johnson is a highly qualified cardiologist with over 15 years of experience in treating complex cardiac conditions. She specializes in interventional cardiology and cardiac imaging.",
  education: [
    { degree: "MBBS", institution: "Harvard Medical School", year: "2004" },
    { degree: "MD", institution: "Mayo Clinic", year: "2008" },
  ],
  hospital: {
    name: "Cairo International Medical Center",
    address: "15 El-Nozha Street, Heliopolis, Cairo",
  },
  appointmentDuration: 30, // minutes
  consultationTypes: ["video", "physical", "home-visit"],
};

// Import your images for the appointment types (update paths as needed)
import onlineImg from "../assets/images/Group 19663.png";
import offlineImg from "../assets/images/Image.png";
import homeImg from "../assets/images/Image1Nursig.png";

const APPOINTMENT_TYPES = [
  { value: "video", label: "Video Consultation", img: onlineImg },
  { value: "physical", label: "In-Clinic Visit", img: offlineImg },
  { value: "home-visit", label: "Home Visit (+EGP 300)", img: homeImg },
];

// Sample available time slots
const AVAILABLE_SLOTS = [
  { time: "9:00 AM", available: true },
  { time: "9:30 AM", available: true },
  { time: "10:00 AM", available: false },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "11:30 AM", available: true },
  { time: "12:00 PM", available: false },
  { time: "12:30 PM", available: true },
  { time: "2:00 PM", available: true },
  { time: "2:30 PM", available: false },
  { time: "3:00 PM", available: true },
  { time: "3:30 PM", available: true },
  { time: "4:00 PM", available: true },
  { time: "4:30 PM", available: false },
  { time: "5:00 PM", available: true },
];

// Helper to display "morning" or "night" based on time slot
const getDayPeriod = (timeString) => {
  if (!timeString) return "";
  const parts = timeString.split(" ");
  if (parts.length < 2) return timeString;
  const ampm = parts[1];
  return ampm === "AM" ? "morning" : "night";
};

const AppointmentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor = DOCTOR_DETAILS } = location.state || {};

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("vodafone");

  // Step state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0: Date & Time
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [appointmentType, setAppointmentType] = useState("video");
  const [availableSlots, setAvailableSlots] = useState([]);

  // Step 1: Patient Details – only Name and Phone
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    phone: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Step 2: Payment & Confirmation
  const [agreeToPolicies, setAgreeToPolicies] = useState(false);

  // Errors & notifications
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // Additional dialogs
  const [showDoctorInfo, setShowDoctorInfo] = useState(false);
  const [completionDialog, setCompletionDialog] = useState(false);

  useEffect(() => {
    if (!doctor) {
      navigate("/doctors");
    }
  }, [doctor, navigate]);

  useEffect(() => {
    if (appointmentDate) {
      setLoading(true);
      setTimeout(() => {
        const dayOfWeek = format(appointmentDate, "EEEE");
        const isAvailableDay = (doctor?.availableDays || []).includes(dayOfWeek);
        if (isAvailableDay) {
          const slots = AVAILABLE_SLOTS.map((slot) => ({
            ...slot,
            available: slot.available && Math.random() > 0.3,
          }));
          setAvailableSlots(slots);
        } else {
          setAvailableSlots([]);
        }
        setLoading(false);
      }, 500);
    }
  }, [appointmentDate, doctor]);

  const handleDateChange = (newValue) => {
    const validDate = new Date(newValue);
    if (isValid(validDate)) {
      setAppointmentDate(validDate);
    } else {
      setAppointmentDate(null);
    }
    setSelectedSlot("");
    setErrors({ ...errors, date: null });
  };

  const formatDate = (date) => {
    if (!date || !isValid(date)) return "";
    return format(date, "EEEE, MMMM d, yyyy");
  };

  const shouldDisableDate = (date) => {
    const dayOfWeek = format(date, "EEEE");
    return !(doctor?.availableDays || []).includes(dayOfWeek);
  };

  const handleNext = () => {
    let valid = true;
    const newErrors = {};

    if (activeStep === 0) {
      if (!appointmentDate) {
        newErrors.date = "Please select a date";
        valid = false;
      }
      if (!selectedSlot) {
        newErrors.slot = "Please select a time slot";
        valid = false;
      }
      if (!appointmentType) {
        newErrors.type = "Please select appointment type";
        valid = false;
      }
    } else if (activeStep === 1) {
      if (!patientDetails.name.trim()) {
        newErrors.name = "Name is required";
        valid = false;
      }
      if (!patientDetails.phone.trim()) {
        newErrors.phone = "Phone number is required";
        valid = false;
      } else if (!/^\d{10,11}$/.test(patientDetails.phone.trim())) {
        newErrors.phone = "Please enter a valid phone number";
        valid = false;
      }
    } else if (activeStep === 2) {
      if (!agreeToPolicies) {
        newErrors.policies = "Please agree to our policies";
        valid = false;
      }
    }

    setErrors(newErrors);

    if (valid) {
      if (activeStep === 2) {
        // Move to final success page (Step 3)
        setActiveStep(3);
      } else if (activeStep === 3) {
        // Final "Next" click: complete booking
        handleCompleteBooking();
      } else {
        setActiveStep((prev) => prev + 1);
        setSnackbar({
          open: true,
          message: `Step ${activeStep + 1} completed successfully!`,
          severity: "success",
        });
      }
    } else {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (field) => (e) => {
    setPatientDetails({ ...patientDetails, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
    setSnackbar({
      open: true,
      message: `${files.length} file(s) uploaded successfully`,
      severity: "success",
    });
  };

  const removeFile = (index) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const handleCompleteBooking = () => {
    navigate("/appointments", {
      state: {
        bookingConfirmed: true,
        appointmentDetails: {
          doctor,
          date: appointmentDate,
          time: selectedSlot,
          type: appointmentType,
          patient: patientDetails,
          bookingId: `BK${Math.floor(Math.random() * 1000000)}`,
        },
      },
    });
  };

  // STEP 0: Date & Time Selection
  const renderDateTimeStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography sx={{ mb: 1, fontWeight: "bold", color: "green", fontSize: "1.25rem" }}>
          Available on: {(doctor?.availableDays || []).join(", ")}
        </Typography>
        <Typography sx={{ mb: 1 }}>Select Appointment Date</Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={appointmentDate}
            onChange={handleDateChange}
            disablePast
            shouldDisableDate={shouldDisableDate}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!errors.date}
                helperText={errors.date || ""}
                sx={{
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography sx={{ mb: 1 }}>Appointment Type</Typography>
        <FormControl fullWidth error={!!errors.type}>
          <Select
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            }}
          >
            {APPOINTMENT_TYPES.filter((t) =>
              doctor.consultationTypes?.includes(t.value)
            ).map((t) => (
              <MenuItem key={t.value} value={t.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <img
                    src={t.img}
                    alt={t.value}
                    style={{ width: 24, height: 24, objectFit: "cover" }}
                  />
                  <Typography>{t.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
          {errors.type && (
            <Typography color="error" variant="caption">
              {errors.type}
            </Typography>
          )}
        </FormControl>
        <Paper sx={{ mt: 2, p: 2, bgcolor: "#f0f0f0" }}>
          <Typography variant="body2">
            {appointmentType === "video"
              ? "Video consultation will be via our secure platform..."
              : appointmentType === "physical"
              ? `Visit Dr. ${doctor.name} at ${doctor.hospital.name}, ${doctor.hospital.address}.`
              : "Doctor will visit your location. Extra fees apply."}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Typography sx={{ mt: 2, mb: 1 }}>Available Time Slots:</Typography>
        {appointmentDate ? (
          loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : availableSlots.length > 0 ? (
            <Card variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedSlot === slot.time ? "contained" : "outlined"}
                    onClick={() => {
                      if (slot.available) {
                        setSelectedSlot(slot.time);
                        setErrors({ ...errors, slot: null });
                      }
                    }}
                    disabled={!slot.available}
                    sx={{
                      opacity: slot.available ? 1 : 0.5,
                      cursor: slot.available ? "pointer" : "not-allowed",
                    }}
                  >
                    {slot.time}
                  </Button>
                ))}
              </Box>
              {errors.slot && (
                <Typography color="error" variant="caption">
                  {errors.slot}
                </Typography>
              )}
            </Card>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Dr. {doctor.name} is not available on {formatDate(appointmentDate)}.
            </Alert>
          )
        ) : (
          <Alert severity="info">Please select a date to see available slots</Alert>
        )}
        {selectedSlot && (
          <Alert severity="success" sx={{ mt: 2 }}>
            You selected: {selectedSlot} — Good {getDayPeriod(selectedSlot)}!
          </Alert>
        )}
      </Grid>
    </Grid>
  );

  // STEP 1: Patient Details
  const renderPatientDetailsStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography sx={{ mb: 1 }}>Patient Name</Typography>
        <TextField
          placeholder="Enter your name"
          fullWidth
          value={patientDetails.name}
          onChange={handleChange("name")}
          error={!!errors.name}
          helperText={errors.name || ""}
          sx={{
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography sx={{ mb: 1 }}>Phone Number</Typography>
        <TextField
          placeholder="Enter phone number"
          fullWidth
          value={patientDetails.phone}
          onChange={handleChange("phone")}
          error={!!errors.phone}
          helperText={errors.phone || ""}
          sx={{
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography sx={{ mb: 1 }}>Upload Medical Records (Optional)</Typography>
        <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button variant="outlined" component="label" startIcon={<BackupIcon />} sx={{ width: "fit-content" }}>
              Upload Files
              <input type="file" hidden multiple onChange={handleFileUpload} />
            </Button>
            {uploadedFiles.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {uploadedFiles.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "background.paper",
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="body2" noWrap sx={{ maxWidth: "70%" }}>
                      {file.name}
                    </Typography>
                    <IconButton size="small" onClick={() => removeFile(index)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
            <Typography variant="caption" color="text.secondary">
              Supported formats: PDF, JPG, PNG (max 10MB each)
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  // STEP 2: Confirmation & Payment
  const renderConfirmationStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography sx={{ mb: 2 }}>
          <ReceiptIcon color="primary" sx={{ mr: 1 }} />
          Review and Confirm
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
              <Avatar src={doctor.image} alt={doctor.name} sx={{ width: 56, height: 56, mr: 2 }} />
              <Box flex={1}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ mr: 1 }}>
                    {doctor.name}
                  </Typography>
                  {doctor.verified && (
                    <Tooltip title="Verified Doctor">
                      <VerifiedUserIcon color="primary" fontSize="small" />
                    </Tooltip>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {doctor.specialization}
                  {doctor.subspecialty && ` • ${doctor.subspecialty}`}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                  <Rating
                    value={doctor.rating}
                    readOnly
                    precision={0.1}
                    size="small"
                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                  />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {doctor.rating} ({doctor.reviewCount} reviews)
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Date & Time</Typography>
                <Typography variant="body2">
                  {formatDate(appointmentDate)} • {selectedSlot}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Appointment Type</Typography>
                  <Typography variant="body2">
                    {APPOINTMENT_TYPES.find((t) => t.value === appointmentType)?.label ||
                      appointmentType}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Patient</Typography>
                <Typography variant="body2">
                  {patientDetails.name} • {patientDetails.phone}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {/* Payment Method */}
      <Grid item xs={12}>
        <Typography variant="h6">Payment Instructions</Typography>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            }}
          >
            <MenuItem value="vodafone">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img
                  src={bg}
                  alt="Vodafone Cash"
                  style={{ width: 24, height: 24, objectFit: "cover" }}
                />
                <Typography>Vodafone Cash</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="clinic">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img
                  src={tg}
                  alt="Pay on Clinic"
                  style={{ width: 24, height: 24, objectFit: "cover" }}
                />
                <Typography>Pay on Clinic</Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
        {paymentMethod === "vodafone" && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            For Vodafone Cash: Instructions will be sent to your phone.
          </Typography>
        )}
        {paymentMethod === "clinic" && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            For Pay on Clinic: You will pay at the clinic upon arrival.
          </Typography>
        )}
      </Grid>
      {/* Payment Summary */}
      <Grid item xs={12}>
        <Typography variant="h6">Payment Summary</Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography>Consultation Fee</Typography>
          <Typography>EGP {doctor.fee}</Typography>
        </Box>
        {appointmentType === "home-visit" && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography>Home Visit Fee</Typography>
            <Typography>EGP 300</Typography>
          </Box>
        )}
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="subtitle1">Total</Typography>
          <Typography variant="subtitle1">
            EGP {doctor.fee + (appointmentType === "home-visit" ? 300 : 0)}
          </Typography>
        </Box>
        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeToPolicies}
                onChange={(e) => {
                  setAgreeToPolicies(e.target.checked);
                  if (e.target.checked && errors.policies) {
                    setErrors({ ...errors, policies: null });
                  }
                }}
              />
            }
            label="I agree to the Terms & Conditions and Privacy Policy"
          />
          {errors.policies && (
            <Typography color="error" variant="caption" sx={{ ml: 4 }}>
              {errors.policies}
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );

  // STEP 3: Success Page
  const renderSuccessStep = () => (
    <Box sx={{ textAlign: "center", py: 5 }}>
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Appointment Booked Successfully!
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        You have booked an appointment with {doctor.name} on {formatDate(appointmentDate)} at {selectedSlot}. It is a good {getDayPeriod(selectedSlot)}.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        A confirmation has been sent to your phone.
      </Typography>
      <Button variant="contained" onClick={handleCompleteBooking} size="large">
        View My Appointments
      </Button>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderDateTimeStep();
      case 1:
        return renderPatientDetailsStep();
      case 2:
        return renderConfirmationStep();
      case 3:
        return renderSuccessStep();
      default:
        return "Unknown step";
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Book Appointment</Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          {getStepContent(activeStep)}
        </Paper>

        {activeStep < 3 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button variant="contained" onClick={handleNext} disabled={loading} size="large">
              Next
            </Button>
          </Box>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default AppointmentPage;
