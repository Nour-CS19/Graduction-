import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./Pages/AuthPage";
import ErrorBoundary from "./ErrorBoundary";
import VerifyOTPPage from './Pages/VerifyOTPPage';
import NurseDashboardLayout from './DashBoardNurse/DashBoardNurse';

// Lazy-loaded components
const ResetPasswordForPatient = lazy(() => import("./components/ResetPasswordForPatient").catch(() => ({ default: () => <div>Reset password</div> })));
const MedicalRecordsForPatient = lazy(() => import("./components/MedicalRecoredsForPatient").catch(() => ({ default: () => <div>MedicalRecoredsForPatient failed to load</div> })));
const PasswordResetComponent = lazy(() => import("./components/PasswordResetComponent").catch(() => ({ default: () => <div>Reset password</div> })));
const HomePage = lazy(() => import("./Pages/HomePage").catch(() => ({ default: () => <div>HomePage failed to load</div> })));
const Login = lazy(() => import("./Pages/LoginPage").catch(() => ({ default: () => <div>LoginPage failed to load</div> })));
const Register = lazy(() => import("./Pages/PersonalInfoPage").catch(() => ({ default: () => <div>PersonalInfoPage failed to load</div> })));
const ProfilePage = lazy(() => import("./Pages/ProfilePage").catch(() => ({ default: () => <div>ProfilePage failed to load</div> })));
const HeroSection = lazy(() => import("./components/HeroSection").catch(() => ({ default: () => <div>HeroSection failed to load</div> })));
const ForgotPasswordPage = lazy(() => import("./Pages/ForgotPasswordPage").catch(() => ({ default: () => <div>ForgotPasswordPage failed to load</div> })));
const SuccessPage = lazy(() => import("./Pages/Success").catch(() => ({ default: () => <div>Success failed to load</div> })));
const AboutUs = lazy(() => import("./components/AboutUsVersion").catch(() => ({ default: () => <div>About Us Component</div> })));
const DoctorAppointment = lazy(() => import("./ServicesConsultantions/AppointmentPage").catch(() => ({ default: () => <div>AppointmentPage failed to load</div> })));
const AppointmentsList = lazy(() => import("./ServicesConsultantions/AppointmentList").catch(() => ({ default: () => <div>AppointmentList failed to load</div> })));
const DoctorPayment = lazy(() => import("./ServicesConsultantions/PaymentPage").catch(() => ({ default: () => <div>PaymentPage failed to load</div> })));
const OnlineConsultantion = lazy(() => import("./ServicesConsultantions/OnlineConsultantion").catch(() => ({ default: () => <div>OnlineConsultantion failed to load</div> })));
const DoctorASService = lazy(() => import("./ServicesConsultantions/DoctorService").catch(() => ({ default: () => <div>DoctorService failed to load</div> })));
const AtHomeConsultantion = lazy(() => import("./ServicesConsultantions/AtHomeConsultantion").catch(() => ({ default: () => <div>AtHomeConsultantion failed to load</div> })));
const OfflineConsultantion = lazy(() => import("./ServicesConsultantions/OfflineConsultantion").catch(() => ({ default: () => <div>OfflineConsultantion failed to load</div> })));
const NurseDashboardHome = lazy(() => import("./DashBoardNurse/DashboardNurseHome"));
const VideosAdvices = lazy(() => import("./components/VideosAdvices").catch(() => ({ default: () => <div>VideosAdvices failed to load</div> })));
const Profile = lazy(() => import("./components/Profile").catch(() => ({ default: () => <div>Profile failed to load</div> })));
const ServiceContactUs = lazy(() => import("./components/ContactusService").catch(() => ({ default: () => <div>ContactusService failed to load</div> })));
const AppointmentsNurseForPatients = lazy(() => import("./components/NurseAppointmentsForPatient").catch(() => ({ default: () => <div>NurseAppointmentsForPatient failed to load</div> })));
const NavBarForgetPassword = lazy(() => import("./components/NavBarForForgetPassword").catch(() => ({ default: () => <div>NavBarForForgetPassword failed to load</div> })));
const AppointmentForDoctorsOnline = lazy(() => import("./components/DoctorsAppointmentsForDoctorsOnline").catch(() => ({ default: () => <div>DoctorsAppointmentsForDoctors failed to load</div> })));
const AppointmentsPatientToDoctorOffline = lazy(() => import("./components/DoctorsAppointmentsForDoctorsOffline").catch(() => ({ default: () => <div>DoctorsAppointmentsForDoctors failed to load</div> })));
const AppointmentsPatientToDoctorAtHome = lazy(() => import("./components/DoctorsAppointmentsForDoctorsAtHome").catch(() => ({ default: () => <div>DoctorsAppointmentsForDoctors failed to load</div> })));
const AppointmentForLabFromPatient = lazy(() => import("./components/LabAppointmentsForPatient").catch(() => ({ default: () => <div>LabAppointments failed to load</div> })));
const LandingPage = lazy(() => import("./Pages/Landing").catch(() => ({ default: () => <div>Landing failed to load</div> })));
const TravelComponent = lazy(() => import("./components/TravelComponent").catch(() => ({ default: () => <div>TravelComponent failed to load</div> })));
const ContactUs = lazy(() => import("./components/ContactUs").catch(() => ({ default: () => <div>ContactUs failed to load</div> })));
const Footer2 = lazy(() => import("./components/Footer").catch(() => ({ default: () => <div>Footer failed to load</div> })));
const NavbarPublic = lazy(() => import("./components/NavBar").catch(() => ({ default: () => <div>NavBar failed to load</div> })));
const NavPublic = lazy(() => import("./components/Nav").catch(() => ({ default: () => <div>Nav failed to load</div> })));
const Maps = lazy(() => import("./components/Maps").catch(() => ({ default: () => <div>Maps failed to load</div> })));
const AskedPage = lazy(() => import("./components/AskedFeedBack").catch(() => ({ default: () => <div>AskedFeedBack failed to load</div> })));
const Paginations = lazy(() => import("./components/Paginations").catch(() => ({ default: () => <div>Paginations failed to load</div> })));
const AcceptReject = lazy(() => import("./DASHBOARD DOCTOR/AcceptReject").catch(() => ({ default: () => <div>AcceptReject failed to load</div> })));
const AppointmentAtHome = lazy(() => import("./DASHBOARD DOCTOR/AppointmentAtHome").catch(() => ({ default: () => <div>AppointmentAtHome failed to load</div> })));
const AppointmentsOnline = lazy(() => import("./DASHBOARD DOCTOR/AppointmentsOnline").catch(() => ({ default: () => <div>AppointmentsOnline failed to load</div> })));
const Clinicss = lazy(() => import("./DASHBOARD DOCTOR/Clinics").catch(() => ({ default: () => <div>Clinics failed to load</div> })));
const DoctorClinicManagementAtAll = lazy(() => import("./DASHBOARD DOCTOR/DoctorClinicManagement").catch(() => ({ default: () => <div>DoctorClinicManagement failed to load</div> })));
const FetchAll = lazy(() => import("./DASHBOARD DOCTOR/FetchAll").catch(() => ({ default: () => <div>FetchAll failed to load</div> })));
const FetchAllAtClinic = lazy(() => import("./DASHBOARD DOCTOR/FetchAllAtClinic").catch(() => ({ default: () => <div>FetchAllAtClinic failed to load</div> })));
const FetchAllAtOnline = lazy(() => import("./DASHBOARD DOCTOR/FetchAllAtOnline").catch(() => ({ default: () => <div>FetchAllAtOnline failed to load</div> })));
const AppointmentAtClinic = lazy(() => import("./DASHBOARD DOCTOR/AppointmentAtClinics").catch(() => ({ default: () => <div>AppointmentAtClinics failed to load</div> })));
const ServicesLab = lazy(() => import("./DashBoardLabratory/ServicesLab").catch(() => ({ default: () => <div>ServicesLab failed to load</div> })));
const AddAnalysis = lazy(() => import("./DashBoardLabratory/AddAnalysis").catch(() => ({ default: () => <div>AddAnalysis failed to load</div> })));
const GetAllAnalysis = lazy(() => import("./DashBoardLabratory/GetAllAtAnalysis").catch(() => ({ default: () => <div>GetAllAnalysis failed to load</div> })));
const CreateAnalysisAtCities = lazy(() => import("./DashBoardLabratory/CreateAnalysisAtCities").catch(() => ({ default: () => <div>CreateAnalysisAtCities failed to load</div> })));
const CreateAppointmentAtCity = lazy(() => import("./DashBoardLabratory/CreateAppointmentAtCity").catch(() => ({ default: () => <div>CreateAppointmentAtCity failed to load</div> })));
const GETAppointmentAtCity = lazy(() => import("./DashBoardLabratory/GETAppointmentAtCity").catch(() => ({ default: () => <div>GETAppointmentAtCity failed to load</div> })));
const PatientBookLabAllLab = lazy(() => import("./DashBoardLabratory/PatientBookLabAllLab").catch(() => ({ default: () => <div>PatientBookLabAllLab failed to load</div> })));
const AcceptBook = lazy(() => import("./DashBoardLabratory/AcceptBook").catch(() => ({ default: () => <div>AcceptBook failed to load</div> })));
const EditProfileForLab = lazy(() => import("./DashBoardLabratory/EditProfileForLab").catch(() => ({ default: () => <div>EditProfileForLab failed to load</div> })));
const ForgetPasswordForLab = lazy(() => import("./DashBoardLabratory/ForgetPasswordForLab").catch(() => ({ default: () => <div>ForgetPasswordForLab failed to load</div> })));
const DashBoardLaboratoryOfficial = lazy(() => import("./DashBoardLabratory/Layout").catch(() => ({ default: () => <div>LayoutForLab failed to load</div> })));
const SubscribeLab = lazy(() => import("./DashBoardLabratory/SubscribeLab").catch(() => ({ default: () => <div>LayoutForLab failed to load</div> })));
const AddAppointmentForNurse = lazy(() => import("./DashBoardNurse/AddAppointment").catch(() => ({ default: () => <div>AddAppointment failed to load</div> })));
const AddNursingForNurse = lazy(() => import("./DashBoardNurse/AddNursing").catch(() => ({ default: () => <div>AddNursing failed to load</div> })));
const AddPlaceForNurse = lazy(() => import("./DashBoardNurse/AddPlace").catch(() => ({ default: () => <div>AddPlace failed to load</div> })));
const BookingListForNurse = lazy(() => import("./DashBoardNurse/BookingList").catch(() => ({ default: () => <div>BookingList failed to load</div> })));
const ManageBookingsForNurse = lazy(() => import("./DashBoardNurse/ManageBookings").catch(() => ({ default: () => <div>ManageBookings failed to load</div> })));
const ManagePlacesForNurse = lazy(() => import("./DashBoardNurse/ManagePlaces").catch(() => ({ default: () => <div>ManagePlaces failed to load</div> })));
const PlacesByCityForNurse = lazy(() => import("./DashBoardNurse/PlacesByCity").catch(() => ({ default: () => <div>PlacesByCity failed to load</div> })));
const DashBoardNurseToNurse = lazy(() => import("./DashBoardNurse/DashboardNurseHome").catch(() => ({ default: () => <div>DashBoardNurse failed to load</div> })));
const MiniDrawer = lazy(() => import("./Adminn/Dashboard/MiniDrawer").catch(() => ({ default: () => <div>MiniDrawer failed to load</div> })));
const Dashboard = lazy(() => import("./Adminn/Dashboard/page/dashboard/Dashboard").catch(() => ({ default: () => <div>Dashboard failed to load</div> })));
const BarChart = lazy(() => import("./Adminn/Dashboard/page/barChart/BarChart").catch(() => ({ default: () => <div>BarChart failed to load</div> })));
const ManageTeam = lazy(() => import("./Adminn/Dashboard/page/team/Team").catch(() => ({ default: () => <div>Team failed to load</div> })));
const Contacts = lazy(() => import("./Adminn/Dashboard/page/contacts/Contacts").catch(() => ({ default: () => <div>Contacts failed to load</div> })));
const Invoices = lazy(() => import("./Adminn/Dashboard/page/invoices/Invoices").catch(() => ({ default: () => <div>Invoices failed to load</div> })));
const ProfileForm = lazy(() => import("./Adminn/Dashboard/page/form/Form").catch(() => ({ default: () => <div>Form failed to load</div> })));
const Calendar = lazy(() => import("./Adminn/Dashboard/page/calendar/Calendar").catch(() => ({ default: () => <div>Calendar failed to load</div> })));
const FAQ = lazy(() => import("./Adminn/Dashboard/page/faq/FAQ").catch(() => ({ default: () => <div>FAQ failed to load</div> })));
const PieChart = lazy(() => import("./Adminn/Dashboard/page/pieChart/PieChart").catch(() => ({ default: () => <div>PieChart failed to load</div> })));
const GetUsers = lazy(() => import("./Register Admin/Components/GetUser").catch(() => ({ default: () => <div>Get Users</div> })));
const ForgetPasswordForAdmin = lazy(() => import("./Register Admin/Components/ResetPasswordForAdmin").catch(() => ({ default: () => <div>ForgetPassword failed to load</div> })));
const VerifyOtpForAdmin = lazy(() => import("./Register Admin/Components/VerifyOtpForAdmin").catch(() => ({ default: () => <div>ForgetPassword failed to load</div> })));
const EditProfileForAdmin = lazy(() => import("./Register Admin/Components/EditProfileForAdmin").catch(() => ({ default: () => <div>ForgetPassword failed to load</div> })));
const RegisterDoctor = lazy(() => import("./Register Admin/Components/RegisterDoctor").catch(() => ({ default: () => <div>RegisterDoctor failed to load</div> })));
const RegisterPatient = lazy(() => import("./Register Admin/Components/RegisterPatient").catch(() => ({ default: () => <div>RegisterPatient failed to load</div> })));
const RegisterNurse = lazy(() => import("./Register Admin/Components/RegisterNurse").catch(() => ({ default: () => <div>RegisterNurse failed to load</div> })));
const AddLaboratory = lazy(() => import("./Register Admin/Components/RegisterLabratory").catch(() => ({ default: () => <div>RegisterLabratory failed to load</div> })));
const AddCity = lazy(() => import("./Register Admin/Components/RegisterCities").catch(() => ({ default: () => <div>RegisterCities failed to load</div> })));
const AddService = lazy(() => import("./Register Admin/Components/RegisterNursings").catch(() => ({ default: () => <div>RegisterNursings failed to load</div> })));
const RegisterAdmin = lazy(() => import("./Register Admin/Components/RegisterAdmin").catch(() => ({ default: () => <div>RegisterAdmin failed to load</div> })));
const RegisterLaboratory = lazy(() => import("./Register Admin/Components/RegisterLabratory").catch(() => ({ default: () => <div>RegisterLabratory failed to load</div> })));
const RegisterCities = lazy(() => import("./Register Admin/Components/RegisterCities").catch(() => ({ default: () => <div>RegisterCities failed to load</div> })));
const RegisterNursings = lazy(() => import("./Register Admin/Components/RegisterNursings").catch(() => ({ default: () => <div>RegisterNursings failed to load</div> })));
const RegisterNurses = lazy(() => import("./Register Admin/Components/RegisterNurses").catch(() => ({ default: () => <div>RegisterNurses failed to load</div> })));
const DashNO = lazy(() => import("./DASHBOARD NURSE/Components/Dash").catch(() => ({ default: () => <div>Dash failed to load</div> })));
const DashNurse = lazy(() => import("./DASHBOARD NURSE/Components/DashNurse").catch(() => ({ default: () => <div>DashNurse failed to load</div> })));
const Nurse1 = lazy(() => import("./Nursing/NursingAr").catch(() => ({ default: () => <div>NursingAr failed to load</div> })));
const Nurse2 = lazy(() => import("./Nursing/NursingEn").catch(() => ({ default: () => <div>NursingEn failed to load</div> })));
const Labratory1 = lazy(() => import("./Labratory/Labratory").catch(() => ({ default: () => <div>Labratory failed to load</div> })));
const Labratory2 = lazy(() => import("./Labratory/LabratoyAr").catch(() => ({ default: () => <div>LabratoyAr failed to load</div> })));
const EditProfilePage = lazy(() => import("./DASHBOARD NURSE/Components/EditProfile").catch(() => ({ default: () => <div>EditProfile failed to load</div> })));
const SettingsPage = lazy(() => import("./DASHBOARD NURSE/Components/Setting").catch(() => ({ default: () => <div>Setting failed to load</div> })));
const Patientssss = lazy(() => import("./DASHBOARD NURSE/Components/patientsss").catch(() => ({ default: () => <div>patientsss failed to load</div> })));
const Appoinrmentsss = lazy(() => import("./DASHBOARD NURSE/Components/Apointmentssss").catch(() => ({ default: () => <div>Apointmentssss failed to load</div> })));
const Asp = lazy(() => import("./DASHBOARD NURSE/Components/Pages/AppointmentsPage").catch(() => ({ default: () => <div>AppointmentsPage failed to load</div> })));
const Net = lazy(() => import("./DASHBOARD NURSE/Components/Pages/ConsultationsPage").catch(() => ({ default: () => <div>ConsultationsPage failed to load</div> })));
const Teacher = lazy(() => import("./DASHBOARD NURSE/Components/Pages/DashboardPage").catch(() => ({ default: () => <div>DashboardPage failed to load</div> })));
const Lista = lazy(() => import("./DASHBOARD NURSE/Components/Pages/Patients").catch(() => ({ default: () => <div>Patients failed to load</div> })));
const AccountNurse = lazy(() => import("./DASHBOARD NURSE/Components/Pages/Profile").catch(() => ({ default: () => <div>Profile failed to load</div> })));
const AccountSetting = lazy(() => import("./DASHBOARD NURSE/Components/Pages/Settings").catch(() => ({ default: () => <div>Settings failed to load</div> })));
const ForgetPasswordForNurse = lazy(() => import("./DashBoardNurse/ForgetPasswordForNurse").catch(() => ({ default: () => <div>Settings failed to load</div> })));
const EditProfileForNurse = lazy(() => import("./DashBoardNurse/EditProfileForNurse").catch(() => ({ default: () => <div>Settings failed to load</div> })));
const AppointmantLab = lazy(() => import("./DASHBOARD LABRATORY/Components/Pages/AppointmentsPage").catch(() => ({ default: () => <div>AppointmentsPage failed to load</div> })));
const ConsultantionLab = lazy(() => import("./DASHBOARD LABRATORY/Components/Pages/ConsultationsPage").catch(() => ({ default: () => <div>ConsultationsPage failed to load</div> })));
const Boss = lazy(() => import("./DASHBOARD LABRATORY/Components/Pages/DashboardPage").catch(() => ({ default: () => <div>DashboardPage failed to load</div> })));
const PatientLab = lazy(() => import("./DASHBOARD LABRATORY/Components/Pages/Patients").catch(() => ({ default: () => <div>Patients failed to load</div> })));
const ProfileLab = lazy(() => import("./DASHBOARD LABRATORY/Components/Pages/Profile").catch(() => ({ default: () => <div>Profile failed to load</div> })));
const SettingLab = lazy(() => import("./DASHBOARD LABRATORY/Components/Pages/Settings").catch(() => ({ default: () => <div>Settings failed to load</div> })));
const ChatApp = lazy(() => import("./Chat/Chat").catch(() => ({ default: () => <div>Chat failed to load</div> })));
const DashBoardDoctorOffical = lazy(() => import("./DashDdddd").catch(() => ({ default: () => <div>DashDdddd failed to load</div> })));
const Dashboarddoctorww = lazy(() => import("./DashDoctor").catch(() => ({ default: () => <div>DashDoctor failed to load</div> })));
const ChatAppforLabAndNurseAndDoctor = lazy(() => import("./DashboardDoctor/Chat").catch(() => ({ default: () => <div>Chat failed to load</div> })));

// Nurse Logout Component
const NurseLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/login', { replace: true });
    }
  };

  React.useEffect(() => {
    handleLogout();
  }, [logout, navigate]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const accessToken = localStorage.getItem('accessToken');
  const isAuthenticated = !!user && !!accessToken;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Wrapper Component for Navbar
const NavbarWrapper = ({ Component }) => {
  const navigate = useNavigate();
  const handleNavigate = (path) => {
    navigate(path);
  };
  return <Component onNavigate={handleNavigate} />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/page2" element={<ProfilePage />} />
            <Route path="/registration-success" element={<SuccessPage />} />
            <Route path="/forgot-password" element={<PasswordResetComponent />} />
            <Route path="/settings" element={<PasswordResetComponent />} />
            <Route path="/AboutUs" element={<AboutUs />} />
            <Route path="/HeroSection" element={<HeroSection />} />
            <Route path="/ContactUsService" element={<ServiceContactUs />} />
            <Route path="/land" element={<LandingPage />} />
            <Route path="/travel" element={<TravelComponent />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/footer" element={<Footer2 />} />
            <Route path="/nav" element={<NavbarWrapper Component={NavbarPublic} />} />
            <Route path="/navvv" element={<NavbarWrapper Component={NavPublic} />} />
            <Route path="/Maps" element={<Maps />} />
            <Route path="/hallasks" element={<AskedPage />} />
            <Route path="/paginations" element={<Paginations />} />
            <Route path="/NavBarForgetPassword" element={<NavBarForgetPassword />} />
            {/* Patient-Accessible Routes */}
            <Route
              path="/video-advices"
              element={
                <ProtectedRoute allowedRoles={["Patient", "Doctor", "Nurse", "Laboratory", "Admin", "SuperAdmin"]}>
                  <VideosAdvices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Chat"
              element={
                <ProtectedRoute allowedRoles={["Patient", "Doctor", "Nurse", "Laboratory", "Admin", "SuperAdmin"]}>
                  <ChatAppforLabAndNurseAndDoctor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resetpasswordforpatient"
              element={
                <ProtectedRoute allowedRoles={["Patient", "Doctor", "Nurse", "Laboratory", "Admin", "SuperAdmin"]}>
                  <ResetPasswordForPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-recoreds"
              element={
                <ProtectedRoute allowedRoles={["Patient", "Doctor", "Nurse", "Laboratory", "Admin", "SuperAdmin"]}>
                  <MedicalRecordsForPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["Patient", "Doctor", "Nurse", "Laboratory", "Admin", "SuperAdmin"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor-appointment"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <DoctorAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments-list"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor-payment"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <DoctorPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicedoctoronlineofflineathome"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <DoctorASService />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicedoctoronlineofflineathome/online"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <OnlineConsultantion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentPatientOfflineInDoctors"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentsPatientToDoctorOffline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentPatientInDoctorsAtHome"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentsPatientToDoctorAtHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentForDoctorsOnline"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentForDoctorsOnline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentsNurseForPatients"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentsNurseForPatients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentForLabFromPatient"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentForLabFromPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicedoctoronlineofflineathome/offline"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <OfflineConsultantion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicedoctoronlineofflineathome/athome"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AtHomeConsultantion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Chats"
              element={
                <ProtectedRoute allowedRoles={["Patient", "Doctor", "Laboratory", "Admin", "SuperAdmin", "Nurse"]}>
                  <ChatApp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse1"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <Nurse1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse2"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <Nurse2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab1"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <Labratory1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab2"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <Labratory2 />
                </ProtectedRoute>
              }
            />
            {/* Doctor Dashboard Routes */}
            <Route
              path="/DashboardDoctorOfficial"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <DashBoardDoctorOffical />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AcceptReject"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <AcceptReject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentAtHome"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <AppointmentAtHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentsOnline"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <AppointmentsOnline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentAtClinic"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <AppointmentAtClinic />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Clinics"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <Clinicss />
                </ProtectedRoute>
              }
            />
            <Route
              path="/DoctorClinicManagement"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <DoctorClinicManagementAtAll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/FetchAll"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <FetchAll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/FetchAllAtClinic"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <FetchAllAtClinic />
                </ProtectedRoute>
              }
            />
            <Route
              path="/FetchAllAtOnline"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <FetchAllAtOnline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/DashboardDoctor"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <Dashboarddoctorww />
                </ProtectedRoute>
              }
            />
            {/* Laboratory Dashboard Routes */}
            <Route
              path="/DashBoardLaboratoryOfficial"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <DashBoardLaboratoryOfficial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AcceptBook"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <AcceptBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AddAnalysis"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <AddAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/CreateAnalysisAtCities"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <CreateAnalysisAtCities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/CreateAppointmentAtCity"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <CreateAppointmentAtCity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/GetAllAnalysis"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <GetAllAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/GETAppointmentAtCity"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <GETAppointmentAtCity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/PatientBookLabAllLab"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <PatientBookLabAllLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/EditProfileForLab"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <EditProfileForLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ForgetPasswordForLab"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <ForgetPasswordForLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ServicesLab"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <ServicesLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/appointments"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <AppointmantLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/consultations"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <ConsultantionLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <Boss />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/patients"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <PatientLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/profile"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <ProfileLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <SettingLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscribeLab"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <SubscribeLab />
                </ProtectedRoute>
              }
            />
            {/* Nurse Dashboard Routes */}
            <Route element={<NurseDashboardLayout />}>
              <Route
                path="/dashboard-nurse"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dash-nurse"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-appointment-for-nurse"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-nursing-for-nurse"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-place-for-nurse"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-list-for-nurse"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nurse-dashboard-home"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-bookings-for-nurse"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-places-for-nurse"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/places-by-city-for-nurse"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nurse/edit-profile"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nurse/settings"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nurse/logout"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseLogout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forgetpasswordnurse"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editprofilenurse"
                element={
                  <ProtectedRoute allowedRoles={["Nurse"]}>
                    <NurseDashboardLayout />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route
              path="/nurse/patients"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <NurseDashboardLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse/appointments"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <NurseDashboardLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/appointments"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <NurseDashboardLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/consultations"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <NurseDashboardLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <NurseDashboardLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/patients"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <NurseDashboardLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/profile"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <NurseDashboardLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <NurseDashboardLayout />
                </ProtectedRoute>
              }
            />
            {/* Admin Dashboard Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]}>
                  <MiniDrawer />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="team" element={<ManageTeam />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="form" element={<ProfileForm />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="bar" element={<BarChart />} />
              <Route path="pie" element={<PieChart />} />
              <Route path="register-doctor" element={<RegisterDoctor />} />
              <Route path="register-patient" element={<RegisterPatient />} />
              <Route path="register-nurse" element={<RegisterNurse />} />
              <Route path="add-laboratory" element={<AddLaboratory />} />
              <Route path="add-city" element={<AddCity />} />
              <Route path="add-service" element={<AddService />} />
              <Route path="register-admin" element={<RegisterAdmin />} />
              <Route path="register-laboratory" element={<RegisterLaboratory />} />
              <Route path="register-cities" element={<RegisterCities />} />
              <Route path="register-nursings" element={<RegisterNursings />} />
              <Route path="register-nurses" element={<RegisterNurses />} />
              <Route path="getUser" element={<GetUsers />} />
              <Route path="forgetpasswordadmin" element={<ForgetPasswordForAdmin />} />
              <Route path="verifyotpadmin" element={<VerifyOtpForAdmin />} />
              <Route path="editProfileForAdmin" element={<EditProfileForAdmin />} />
            </Route>
            {/* Catch-all Route */}
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
/*
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./Pages/AuthPage"; // Import AuthProvider and useAuth
import ErrorBoundary from "./ErrorBoundary";
import VerifyOTPPage from './Pages/VerifyOTPPage';
// Public Pages




const HomePage = lazy(() =>
  import("./Pages/HomePage").catch(() => ({ default: () => <div>HomePage failed to load</div> }))
);
const Login = lazy(() =>
  import("./Pages/LoginPage").catch(() => ({ default: () => <div>LoginPage failed to load</div> }))
);
const Register = lazy(() =>
  import("./Pages/PersonalInfoPage").catch(() => ({ default: () => <div>PersonalInfoPage failed to load</div> }))
);
const ProfilePage = lazy(() =>
  import("./Pages/ProfilePage").catch(() => ({ default: () => <div>ProfilePage failed to load</div> }))
);
const HeroSection = lazy(() =>
  import("./components/HeroSection").catch(() => ({ default: () => <div>HeroSection failed to load</div> }))
);
const ForgotPasswordPage = lazy(() =>
  import("./Pages/ForgotPasswordPage").catch(() => ({ default: () => <div>ForgotPasswordPage failed to load</div> }))
);
const SuccessPage = lazy(() =>
  import("./Pages/Success").catch(() => ({ default: () => <div>Success failed to load</div> }))
);
const ResetPassword = lazy(() =>
  import("./components/PasswordResetComponent").catch(() => ({ default: () => <div>Reset password</div> }))
);

// AboutUs Component
const AboutUs = lazy(() =>
  import("./components/AboutUsVersion").catch(() => ({ default: () => <div>About Us Component</div> }))
);

// Service Components
const DoctorAppointment = lazy(() =>
  import("./ServicesConsultantions/AppointmentPage").catch(() => ({ default: () => <div>AppointmentPage failed to load</div> }))
);
const AppointmentsList = lazy(() =>
  import("./ServicesConsultantions/AppointmentList").catch(() => ({ default: () => <div>AppointmentList failed to load</div> }))
);
const DoctorPayment = lazy(() =>
  import("./ServicesConsultantions/PaymentPage").catch(() => ({ default: () => <div>PaymentPage failed to load</div> }))
);
const OnlineConsultantion = lazy(() =>
  import("./ServicesConsultantions/OnlineConsultantion").catch(() => ({ default: () => <div>OnlineConsultantion failed to load</div> }))
);
const DoctorASService = lazy(() =>
  import("./ServicesConsultantions/DoctorService").catch(() => ({ default: () => <div>DoctorService failed to load</div> }))
);
const AtHomeConsultantion = lazy(() =>
  import("./ServicesConsultantions/AtHomeConsultantion").catch(() => ({ default: () => <div>AtHomeConsultantion failed to load</div> }))
);
const OfflineConsultantion = lazy(() =>
  import("./ServicesConsultantions/OfflineConsultantion").catch(() => ({ default: () => <div>OfflineConsultantion failed to load</div> }))
);
const NurseDashboardHome = lazy(() => import("./DashBoardNurse/DashboardNurseHome")); // Import NurseDashboardHome
// Other Components
const VideosAdvices = lazy(() =>
  import("./components/VideosAdvices").catch(() => ({ default: () => <div>VideosAdvices failed to load</div> }))
);
const Profile = lazy(() =>
  import("./components/Profile").catch(() => ({ default: () => <div>Profile failed to load</div> }))
);
const ServiceContactUs = lazy(() =>
  import("./components/ContactusService").catch(() => ({ default: () => <div>ContactusService failed to load</div> }))
);
const AppointmentsNurseForPatients = lazy(() =>
  import("./components/NurseAppointmentsForPatient").catch(() => ({ default: () => <div>NurseAppointmentsForPatient failed to load</div> }))
);
const NavBarForgetPassword = lazy(() =>
  import("./components/NavBarForForgetPassword").catch(() => ({ default: () => <div>NavBarForForgetPassword failed to load</div> }))
);
const AppointmentForDoctorsOnline = lazy(() =>
  import("./components/DoctorsAppointmentsForDoctorsOnline").catch(() => ({ default: () => <div>DoctorsAppointmentsForDoctors failed to load</div> }))
);
const AppointmentsPatientToDoctorOffline = lazy(() =>
  import("./components/DoctorsAppointmentsForDoctorsOffline").catch(() => ({ default: () => <div>DoctorsAppointmentsForDoctors failed to load</div> }))
);
const AppointmentsPatientToDoctorAtHome = lazy(() =>
  import("./components/DoctorsAppointmentsForDoctorsAtHome").catch(() => ({ default: () => <div>DoctorsAppointmentsForDoctors failed to load</div> }))
);
const AppointmentForLabFromPatient = lazy(() =>
  import("./components/LabAppointmentsForPatient").catch(() => ({ default: () => <div>LabAppointments failed to load</div> }))
);

const LandingPage = lazy(() =>
  import("./Pages/Landing").catch(() => ({ default: () => <div>Landing failed to load</div> }))
);
const TravelComponent = lazy(() =>
  import("./components/TravelComponent").catch(() => ({ default: () => <div>TravelComponent failed to load</div> }))
);
const ContactUs = lazy(() =>
  import("./components/ContactUs").catch(() => ({ default: () => <div>ContactUs failed to load</div> }))
);
const Footer2 = lazy(() =>
  import("./components/Footer").catch(() => ({ default: () => <div>Footer failed to load</div> }))
);
const NavbarPublic = lazy(() =>
  import("./components/NavBar").catch(() => ({ default: () => <div>NavBar failed to load</div> }))
);
const NavPublic = lazy(() =>
  import("./components/Nav").catch(() => ({ default: () => <div>Nav failed to load</div> }))
);
const Maps = lazy(() =>
  import("./components/Maps").catch(() => ({ default: () => <div>Maps failed to load</div> }))
);
const AskedPage = lazy(() =>
  import("./components/AskedFeedBack").catch(() => ({ default: () => <div>AskedFeedBack failed to load</div> }))
);
const Paginations = lazy(() =>
  import("./components/Paginations").catch(() => ({ default: () => <div>Paginations failed to load</div> }))
);

// Doctor Dashboard Components
const AcceptReject = lazy(() =>
  import("./DASHBOARD DOCTOR/AcceptReject").catch(() => ({ default: () => <div>AcceptReject failed to load</div> }))
);
const AppointmentAtHome = lazy(() =>
  import("./DASHBOARD DOCTOR/AppointmentAtHome").catch(() => ({ default: () => <div>AppointmentAtHome failed to load</div> }))
);
const AppointmentsOnline = lazy(() =>
  import("./DASHBOARD DOCTOR/AppointmentsOnline").catch(() => ({ default: () => <div>AppointmentsOnline failed to load</div> }))
);
const Clinicss = lazy(() =>
  import("./DASHBOARD DOCTOR/Clinics").catch(() => ({ default: () => <div>Clinics failed to load</div> }))
);
const DoctorClinicManagementAtAll = lazy(() =>
  import("./DASHBOARD DOCTOR/DoctorClinicManagement").catch(() => ({ default: () => <div>DoctorClinicManagement failed to load</div> }))
);
const FetchAll = lazy(() =>
  import("./DASHBOARD DOCTOR/FetchAll").catch(() => ({ default: () => <div>FetchAll failed to load</div> }))
);
const FetchAllAtClinic = lazy(() =>
  import("./DASHBOARD DOCTOR/FetchAllAtClinic").catch(() => ({ default: () => <div>FetchAllAtClinic failed to load</div> }))
);
const FetchAllAtOnline = lazy(() =>
  import("./DASHBOARD DOCTOR/FetchAllAtOnline").catch(() => ({ default: () => <div>FetchAllAtOnline failed to load</div> }))
);
const AppointmentAtClinic = lazy(() =>
  import("./DASHBOARD DOCTOR/AppointmentAtClinics").catch(() => ({ default: () => <div>AppointmentAtClinics failed to load</div> }))
);

// Laboratory Dashboard Components
const ServicesLab = lazy(() =>
  import("./DashBoardLabratory/ServicesLab").catch(() => ({ default: () => <div>ServicesLab failed to load</div> }))
);
const AddAnalysis = lazy(() =>
  import("./DashBoardLabratory/AddAnalysis").catch(() => ({ default: () => <div>AddAnalysis failed to load</div> }))
);
const GetAllAnalysis = lazy(() =>
  import("./DashBoardLabratory/GetAllAtAnalysis").catch(() => ({ default: () => <div>GetAllAtAnalysis failed to load</div> }))
);
const CreateAnalysisAtCities = lazy(() =>
  import("./DashBoardLabratory/CreateAnalysisAtCities").catch(() => ({ default: () => <div>CreateAnalysisAtCities failed to load</div> }))
);
const CreateAppointmentAtCity = lazy(() =>
  import("./DashBoardLabratory/CreateAppointmentAtCity").catch(() => ({ default: () => <div>CreateAppointmentAtCity failed to load</div> }))
);
const GETAppointmentAtCity = lazy(() =>
  import("./DashBoardLabratory/GETAppointmentAtCity").catch(() => ({ default: () => <div>GETAppointmentAtCity failed to load</div> }))
);
const PatientBookLabAllLab = lazy(() =>
  import("./DashBoardLabratory/PatientBookLabAllLab").catch(() => ({ default: () => <div>PatientBookLabAllLab failed to load</div> }))
);
const AcceptBook = lazy(() =>
  import("./DashBoardLabratory/AcceptBook").catch(() => ({ default: () => <div>AcceptBook failed to load</div> }))
);
const DashBoardlabratoryOffical = lazy(() =>
  import("./DashBoardLabratory/DashBoardsssssss").catch(() => ({ default: () => <div>DashBoardsssssss failed to load</div> }))
);
const EditProfileForLab = lazy(() =>
  import("./DashBoardLabratory/EditProfileForLab").catch(() => ({ default: () => <div>EditProfileForLab failed to load</div> }))
);
const ForgetPasswordForLab = lazy(() =>
  import("./DashBoardLabratory/ForgetPasswordForLab").catch(() => ({ default: () => <div>ForgetPasswordForLab failed to load</div> }))
);
const LayoutForLab = lazy(() =>
  import("./DashBoardLabratory/Layout").catch(() => ({ default: () => <div>LayoutForLab failed to load</div> }))
);
// Dashboard Nurse Components
const AddAppointmentForNurse = lazy(() =>
  import("./DashBoardNurse/AddAppointment").catch(() => ({ default: () => <div>AddAppointment failed to load</div> }))
);
const AddNursingForNurse = lazy(() =>
  import("./DashBoardNurse/AddNursing").catch(() => ({ default: () => <div>AddNursing failed to load</div> }))
);
const AddPlaceForNurse = lazy(() =>
  import("./DashBoardNurse/AddPlace").catch(() => ({ default: () => <div>AddPlace failed to load</div> }))
);
const BookingListForNurse = lazy(() =>
  import("./DashBoardNurse/BookingList").catch(() => ({ default: () => <div>BookingList failed to load</div> }))
);
const ManageBookingsForNurse = lazy(() =>
  import("./DashBoardNurse/ManageBookings").catch(() => ({ default: () => <div>ManageBookings failed to load</div> }))
);
const ManagePlacesForNurse = lazy(() =>
  import("./DashBoardNurse/ManagePlaces").catch(() => ({ default: () => <div>ManagePlaces failed to load</div> }))
);
const PlacesByCityForNurse = lazy(() =>
  import("./DashBoardNurse/PlacesByCity").catch(() => ({ default: () => <div>PlacesByCity failed to load</div> }))
);
const DashBoardNurseToNurse = lazy(() =>
  import("./DashBoardNurse/DashBoardNurse").catch(() => ({ default: () => <div>DashBoardNurse failed to load</div> }))
);

// Admin Dashboard Components
const MiniDrawer = lazy(() =>
  import("./Adminn/Dashboard/MiniDrawer").catch(() => ({ default: () => <div>MiniDrawer failed to load</div> }))
);
const Dashboard = lazy(() =>
  import("./Adminn/Dashboard/page/dashboard/Dashboard").catch(() => ({ default: () => <div>Dashboard failed to load</div> }))
);
const BarChart = lazy(() =>
  import("./Adminn/Dashboard/page/barChart/BarChart").catch(() => ({ default: () => <div>BarChart failed to load</div> }))
);
const ManageTeam = lazy(() =>
  import("./Adminn/Dashboard/page/team/Team").catch(() => ({ default: () => <div>Team failed to load</div> }))
);
const Contacts = lazy(() =>
  import("./Adminn/Dashboard/page/contacts/Contacts").catch(() => ({ default: () => <div>Contacts failed to load</div> }))
);
const Invoices = lazy(() =>
  import("./Adminn/Dashboard/page/invoices/Invoices").catch(() => ({ default: () => <div>Invoices failed to load</div> }))
);
const ProfileForm = lazy(() =>
  import("./Adminn/Dashboard/page/form/Form").catch(() => ({ default: () => <div>Form failed to load</div> }))
);
const Calendar = lazy(() =>
  import("./Adminn/Dashboard/page/calendar/Calendar").catch(() => ({ default: () => <div>Calendar failed to load</div> }))
);
const FAQ = lazy(() =>
  import("./Adminn/Dashboard/page/faq/FAQ").catch(() => ({ default: () => <div>FAQ failed to load</div> }))
);
const PieChart = lazy(() =>
  import("./Adminn/Dashboard/page/pieChart/PieChart").catch(() => ({ default: () => <div>PieChart failed to load</div> }))
);

// Admin Register Components
const GetUsers = lazy(() =>
  import("./Register Admin/Components/GetUser").catch(() => ({ default: () => <div>Get Users</div> }))
);

 const ForgetPasswordForAdmin = lazy(() =>
  import("./Register Admin/Components/ResetPasswordForAdmin").catch(() => ({ default: () => <div>ForgetPassword failed to load</div> }))
);
const VerifyOtpForAdmin  = lazy(() =>
  import("./Register Admin/Components/VerifyOtpForAdmin").catch(() => ({ default: () => <div>ForgetPassword failed to load</div> }))
);
const EditProfileForAdmin  = lazy(() =>
  import("./Register Admin/Components/EditProfileForAdmin").catch(() => ({ default: () => <div>ForgetPassword failed to load</div> }))
);


const RegisterDoctor = lazy(() =>
  import("./Register Admin/Components/RegisterDoctor").catch(() => ({ default: () => <div>RegisterDoctor failed to load</div> }))
);
const RegisterPatient = lazy(() =>
  import("./Register Admin/Components/RegisterPatient").catch(() => ({ default: () => <div>RegisterPatient failed to load</div> }))
);
const RegisterNurse = lazy(() =>
  import("./Register Admin/Components/RegisterNurse").catch(() => ({ default: () => <div>RegisterNurse failed to load</div> }))
);
const AddLaboratory = lazy(() =>
  import("./Register Admin/Components/RegisterLabratory").catch(() => ({ default: () => <div>RegisterLabratory failed to load</div> }))
);
const AddCity = lazy(() =>
  import("./Register Admin/Components/RegisterCities").catch(() => ({ default: () => <div>RegisterCities failed to load</div> }))
);
const AddService = lazy(() =>
  import("./Register Admin/Components/RegisterNursings").catch(() => ({ default: () => <div>RegisterNursings failed to load</div> }))
);
const RegisterAdmin = lazy(() =>
  import("./Register Admin/Components/RegisterAdmin").catch(() => ({ default: () => <div>RegisterAdmin failed to load</div> }))
);
const RegisterLaboratory = lazy(() =>
  import("./Register Admin/Components/RegisterLabratory").catch(() => ({ default: () => <div>RegisterLabratory failed to load</div> }))
);
const RegisterCities = lazy(() =>
  import("./Register Admin/Components/RegisterCities").catch(() => ({ default: () => <div>RegisterCities failed to load</div> }))
);
const RegisterNursings = lazy(() =>
  import("./Register Admin/Components/RegisterNursings").catch(() => ({ default: () => <div>RegisterNursings failed to load</div> }))
);
const RegisterNurses = lazy(() =>
  import("./Register Admin/Components/RegisterNurses").catch(() => ({ default: () => <div>RegisterNurses failed to load</div> }))
);

// Main Dashboard Components
const DashNO = lazy(() =>
  import("./DASHBOARD NURSE/Components/Dash").catch(() => ({ default: () => <div>Dash failed to load</div> }))
);
const DashNurse = lazy(() =>
  import("./DASHBOARD NURSE/Components/DashNurse").catch(() => ({ default: () => <div>DashNurse failed to load</div> }))
);
const DashDoctor = lazy(() =>
  import("./DashboardDoctor/DoctorDashboard").catch(() => ({ default: () => <div>DoctorDashboard failed to load</div> }))
);
const LaboratoryDashboard = lazy(() =>
  import("./DASHBOARD LABRATORY/Components/LaboratoryDashboard").catch(() => ({ default: () => <div>LaboratoryDashboard failed to load</div> }))
);

// Service Components
const Nurse1 = lazy(() =>
  import("./Nursing/NursingAr").catch(() => ({ default: () => <div>NursingAr failed to load</div> }))
);
const Nurse2 = lazy(() =>
  import("./Nursing/NursingEn").catch(() => ({ default: () => <div>NursingEn failed to load</div> }))
);
const Labratory1 = lazy(() =>
  import("./Labratory/Labratory").catch(() => ({ default: () => <div>Labratory failed to load</div> }))
);
const Labratory2 = lazy(() =>
  import("./Labratory/LabratoyAr").catch(() => ({ default: () => <div>LabratoyAr failed to load</div> }))
);

// Nurse Dashboard Additional Pages
const EditProfilePage = lazy(() =>
  import("./DASHBOARD NURSE/Components/EditProfile").catch(() => ({ default: () => <div>EditProfile failed to load</div> }))
);
const SettingsPage = lazy(() =>
  import("./DASHBOARD NURSE/Components/Setting").catch(() => ({ default: () => <div>Setting failed to load</div> }))
);
const LogoutPage = lazy(() =>
  import("./DASHBOARD NURSE/Components/logout").catch(() => ({ default: () => <div>logout failed to load</div> }))
);
const Patientssss = lazy(() =>
  import("./DASHBOARD NURSE/Components/patientsss").catch(() => ({ default: () => <div>patientsss failed to load</div> }))
);
const Appoinrmentsss = lazy(() =>
  import("./DASHBOARD NURSE/Components/Apointmentssss").catch(() => ({ default: () => <div>Apointmentssss failed to load</div> }))
);

// Nurse Dashboard Number 2 Pages
const Asp = lazy(() =>
  import("./DASHBOARD NURSE/Components/Pages/AppointmentsPage").catch(() => ({ default: () => <div>AppointmentsPage failed to load</div> }))
);
const Net = lazy(() =>
  import("./DASHBOARD NURSE/Components/Pages/ConsultationsPage").catch(() => ({ default: () => <div>ConsultationsPage failed to load</div> }))
);
const Teacher = lazy(() =>
  import("./DASHBOARD NURSE/Components/Pages/DashboardPage").catch(() => ({ default: () => <div>DashboardPage failed to load</div> }))
);
const Bader = lazy(() =>
  import("./DASHBOARD NURSE/Components/Pages/Logout").catch(() => ({ default: () => <div>Logout failed to load</div> }))
);
const Lista = lazy(() =>
  import("./DASHBOARD NURSE/Components/Pages/Patients").catch(() => ({ default: () => <div>Patients failed to load</div> }))
);
const AccountNurse = lazy(() =>
  import("./DASHBOARD NURSE/Components/Pages/Profile").catch(() => ({ default: () => <div>Profile failed to load</div> }))
);
const AccountSetting = lazy(() =>
  import("./DASHBOARD NURSE/Components/Pages/Settings").catch(() => ({ default: () => <div>Settings failed to load</div> }))
);
const ForgetPasswordForNurse  = lazy(() =>
  import("../src/DashBoardNurse/ForgetPasswordForNurse").catch(() => ({ default: () => <div>Settings failed to load</div> }))
);
const EditProfileForNurse = lazy(() =>
  import("../src/DashBoardNurse/EditProfileForNurse").catch(() => ({ default: () => <div>Settings failed to load</div> }))
);
// Dashboard Laboratory Pages
const AppointmantLab = lazy(() =>
  import("./DASHBOARD LABRATORY/Components/Pages/AppointmentsPage").catch(() => ({ default: () => <div>AppointmentsPage failed to load</div> }))
);
const ConsultantionLab = lazy(() =>
  import("./DASHBOARD LABRATORY/Components/Pages/ConsultationsPage").catch(() => ({ default: () => <div>ConsultationsPage failed to load</div> }))
);
const Boss = lazy(() =>
  import("./DASHBOARD LABRATORY/Components/Pages/DashboardPage").catch(() => ({ default: () => <div>DashboardPage failed to load</div> }))
);
const LogLog = lazy(() =>
  import("./DASHBOARD LABRATORY/Components/Pages/Logout").catch(() => ({ default: () => <div>Logout failed to load</div> }))
);
const PatientLab = lazy(() =>
  import("./DASHBOARD LABRATORY/Components/Pages/Patients").catch(() => ({ default: () => <div>Patients failed to load</div> }))
);
const ProfileLab = lazy(() =>
  import("./DASHBOARD LABRATORY/Components/Pages/Profile").catch(() => ({ default: () => <div>Profile failed to load</div> }))
);
const SettingLab = lazy(() =>
  import("./DASHBOARD LABRATORY/Components/Pages/Settings").catch(() => ({ default: () => <div>Settings failed to load</div> }))
);

// Additional Components
const ChatApp = lazy(() =>
  import("./Chat/Chat").catch(() => ({ default: () => <div>Chat failed to load</div> }))
);
const DashBoardDoctorOffical = lazy(() =>
  import("./DashDdddd").catch(() => ({ default: () => <div>DashDdddd failed to load</div> }))
);
const Dashboarddoctorww = lazy(() =>
  import("./DashDoctor").catch(() => ({ default: () => <div>DashDoctor failed to load</div> }))
);import Appointment from './DashboardDoctor/Appointment';


// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const accessToken = localStorage.getItem('accessToken');
  const isAuthenticated = !!user && !!accessToken;

  // Add logging for debugging
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - AccessToken:', accessToken);
  console.log('ProtectedRoute - IsAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    console.warn('Unauthenticated access attempt, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`Unauthorized role: ${user.role}, redirecting to /homepage`);
    return <Navigate to="/homepage" replace />;
  }

  return children;
};

// Wrapper Component for Navbar
const NavbarWrapper = ({ Component }) => {
  const navigate = useNavigate();
  const handleNavigate = (path) => {
    navigate(path);
  };
  return <Component onNavigate={handleNavigate} />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/page2" element={<ProfilePage />} />
            <Route path="/registration-success" element={<SuccessPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/settings" element={<ResetPassword />} />
            <Route path="/AboutUs" element={<AboutUs />} />
            <Route path="/HeroSection" element={<HeroSection />} />
            <Route path="/ContactUsService" element={<ServiceContactUs />} />
            <Route path="/land" element={<LandingPage />} />
            <Route path="/travel" element={<TravelComponent />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/footer" element={<Footer2 />} />
            <Route path="/nav" element={<NavbarWrapper Component={NavbarPublic} />} />
            <Route path="/navvv" element={<NavbarWrapper Component={NavPublic} />} />
            <Route path="/Maps" element={<Maps />} />
            <Route path="/hallasks" element={<AskedPage />} />
            <Route path="/paginations" element={<Paginations />} />
            <Route path="/NavBarForgetPassword" element={<NavBarForgetPassword />} />

            <Route
              path="/video-advices"
              element={
                <ProtectedRoute allowedRoles={["Patient", "Doctor", "Nurse", "Laboratory", "Admin", "SuperAdmin"]}>
                  <VideosAdvices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["Patient", "Doctor", "Nurse", "Laboratory", "Admin", "SuperAdmin"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/doctor-appointment"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <DoctorAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments-list"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor-payment"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <DoctorPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicedoctoronlineofflineathome"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <DoctorASService />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicedoctoronlineofflineathome/online"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <OnlineConsultantion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentPatientOfflineInDoctors"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentsPatientToDoctorOffline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentPatientInDoctorsAtHome"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentsPatientToDoctorAtHome />
                </ProtectedRoute>
              }
            />
 <Route
              path="/AppointmentForDoctorsOnline"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentForDoctorsOnline />
                </ProtectedRoute>
              }
            />

<Route
              path="/AppointmentsNurseForPatients"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentsNurseForPatients />
                </ProtectedRoute>
              }
            />
             <Route
              path="/AppointmentForLabFromPatient"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AppointmentForLabFromPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicedoctoronlineofflineathome/offline"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <OfflineConsultantion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicedoctoronlineofflineathome/athome"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <AtHomeConsultantion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Chats"
              element={
                <ProtectedRoute allowedRoles={["Patient", "Doctor", "Nurse"]}>
                  <ChatApp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse1"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <Nurse1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse2"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <Nurse2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab1"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <Labratory1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab2"
              element={
                <ProtectedRoute allowedRoles={["Patient"]}>
                  <Labratory2 />
                </ProtectedRoute>
              }
            />

            <Route
              path="/DashboardDoctorOffical"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <DashBoardDoctorOffical />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AcceptReject"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <AcceptReject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentAtHome"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <AppointmentAtHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentsOnline"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <AppointmentsOnline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AppointmentAtClinic"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <AppointmentAtClinic />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Clinics12"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <Clinicss />
                </ProtectedRoute>
              }
            />
            <Route
              path="/DoctorClinicManagement"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <DoctorClinicManagementAtAll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/FetchAll"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <FetchAll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/FetchAllAtClinic"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <FetchAllAtClinic />
                </ProtectedRoute>
              }
            />
            <Route
              path="/FetchAllAtOnline"
              element={
                <ProtectedRoute allowedRoles={["Doctor"]}>
                  <FetchAllAtOnline />
                </ProtectedRoute>
              }
            />
           
           <Route element={<Layout />}>
        <Route
          path="/DashBoardLabratoryOffical"
          element={
            <ProtectedRoute allowedRoles={['Laboratory']}>
              <DashBoardLabratoryOffical />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AcceptBook"
          element={
            <ProtectedRoute allowedRoles={['Laboratory']}>
              <AcceptBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddAnalysis"
          element={
            <ProtectedRoute allowedRoles={['Laboratory']}>
              <AddAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/CreateAnalysisAtCities"
          element={
            <ProtectedRoute allowedRoles={['Laboratory']}>
              <CreateAnalysisAtCities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/CreateAppointmentAtCity"
          element={
            <ProtectedRoute allowedRoles={['Laboratory']}>
              <CreateAppointmentAtCity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/GetAllAnalysis"
          element={
            <ProtectedRoute allowedRoles={['Laboratory']}>
              <GetAllAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/GETAppointmentAtCity"
          element={
            <ProtectedRoute allowedRoles={['Laboratory']}>
              <GETAppointmentAtCity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PatientBookLabAllLab"
          element={
            <ProtectedRoute allowedRoles={['Laboratory']}>
              <PatientBookLabAllLab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/EditProfileForLab"
          element={
            <ProtectedRoute allowedRoles={['Laboratory']}>
              <EditProfileForLab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ForgetPasswordForLab"
          element={
            <ProtectedRoute allowedRoles={['Laboratory']}>
              <ForgetPasswordForLab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ServicesLab"
          element={
            <ProtectedRoute allowedRoles={['Laboratory']}>
              <ServicesLab />
            </ProtectedRoute>
          }
        />
           </Route>
            <Route
              path="/lab-dashboard/appointments"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <AppointmantLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/consultations"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <ConsultantionLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <Boss />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/logout"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <LogLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/patients"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <PatientLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/profile"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <ProfileLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={["Laboratory"]}>
                  <SettingLab />
                </ProtectedRoute>
              }
            />

            <Route
              path="/DashBoardNurseToNurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <DashBoardNurseToNurse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dash-nurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <DashNO />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-nurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <DashNurse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AddAppointmentForNurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <AddAppointmentForNurse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AddNursingForNurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <AddNursingForNurse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AddPlaceForNurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <AddPlaceForNurse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/BookingListForNurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <BookingListForNurse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/NurseDashboardHome"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <NurseDashboardHome  />
                </ProtectedRoute>
              }
            /> 
            <Route
              path="/ManageBookingsForNurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <ManageBookingsForNurse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ManagePlacesForNurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <ManagePlacesForNurse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/PlacesByCityForNurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <PlacesByCityForNurse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse/edit-profile"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse/settings"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse/logout"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <LogoutPage />
                </ProtectedRoute>
              }
            />
             <Route
              path="/forgetpasseordnurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <ForgetPasswordForNurse />
                </ProtectedRoute>
              }
            />
             <Route
              path="/editprofilenurse"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <EditProfileForNurse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse/patients"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <Patientssss />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse/appointments"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <Appoinrmentsss />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/appointments"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <Asp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/consultations"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <Net />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <Teacher />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/logout"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <Bader />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/patients"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <Lista />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/profile"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <AccountNurse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={["Nurse"]}>
                  <AccountSetting />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["Admin","SuperAdmin"]}>
                  <MiniDrawer />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="team" element={<ManageTeam />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="form" element={<ProfileForm />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="bar" element={<BarChart />} />
              <Route path="pie" element={<PieChart />} />
              <Route path="register-doctor" element={<RegisterDoctor />} />
              <Route path="register-patient" element={<RegisterPatient />} />
              <Route path="register-nurse" element={<RegisterNurse />} />
              <Route path="add-laboratory" element={<AddLaboratory />} />
              <Route path="add-city" element={<AddCity />} />
              <Route path="add-service" element={<AddService />} />
              <Route path="register-admin" element={<RegisterAdmin />} />
              <Route path="register-laboratory" element={<RegisterLaboratory />} />
              <Route path="register-cities" element={<RegisterCities />} />
              <Route path="register-nursings" element={<RegisterNursings />} />
              <Route path="register-nurses" element={<RegisterNurses />} />
              <Route path="getUser" element={<GetUsers />} />
              <Route path="forgetpasswordadmin" element={<ForgetPasswordForAdmin />} />
              <Route path="verifyotpadmin" element={<VerifyOtpForAdmin />} />
              <Route path="editProfileForAdmin" element={<EditProfileForAdmin />} /> 
            </Route>

            

            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;


*/