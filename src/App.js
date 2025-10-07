import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { AdminProtectedRoute } from "./components/auth/AdminProtectedRoute";

// Auth
import DentistSignUp from "./components/auth/DentistSignUp";
import AdminSignUp from "./components/auth/AdminSignUp";
import PatientSignUp from "./components/auth/PatientSignUp";

import { PatientSignIn } from "./components/auth/PatientSignIn";
import { DentistSignIn } from "./components/auth/DentistSignIn";
import { AdminSignIn } from "./components/auth/AdminSignIn";
import { PatientAuth } from "./components/auth/PatientAuth";
import { DentistAuth } from "./components/auth/DentistAuth";
import { AdminAuth } from "./components/auth/AdminAuth";
import { PasswordReset } from "./components/auth/PasswordReset";
import { VerifyEmail } from "./components/auth/VerifyEmail";
import RoleSelection from "./components/auth/RoleSelection";

// Dashboards
import { Dashboard } from "./components/Dashboard";
import { AdminDashboard } from "./components/Admin/AdminDashboard";
import { DentistDashboard } from "./components/dentist/DentistDashboard";
import { PatientDashboard } from "./components/patient/PatientDashboard";

// Admin Components
import AdminAppointmentManagement from "./components/Admin/AppointmentManagement";
import Enquiries from "./components/Admin/Enquiries";
import AdminChat from "./components/Admin/AdminChat";
import Feedback from "./components/Admin/Feedback";
import RecordsAndAnalytics from "./components/Admin/RecordsAndAnalytics";
import AnnouncementsManagement from "./components/Admin/AnnouncementsManagement";
import { ManageUsers } from './components/Admin/ManageUsers';


// Dentist Components
import AppointmentScheduling from "./components/dentist/AppointmentScheduling";
import Profile from "./components/dentist/Profile";
import CariesDetection from "./components/dentist/Caries_detection";
import DentalCharts from "./components/dentist/DentalCharts";

// Patient Components
import BookAppointment from "./components/patient/BookAppointment";
// import TreatmentHistory from "./components/patient/TreatmentHistory";
import UpcomingAppointments from "./components/patient/UpcomingAppointments";
import PatientProfile from "./components/patient/PatientProfile";
import AppointmentInfo from "./components/patient/AppointmentInfo";
import PatientChat from "./components/patient/PatientChat";
import ChatBot from "./components/patient/ChatBot";
import PatientFeedback from "./components/patient/PatientFeedback";
import Announcements from "./components/Announcements";
import AddBeneficiaries from "./components/patient/AddBeneficiaries";
import ViewBeneficiaries from "./components/patient/ViewBeneficiaries";



// Public / Misc
import Welcome from "./components/Welcome";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import FileSidebar from "./components/FileSidebar";
import { Unauthorized } from "./components/Unauthorized";
import XRaySemanticSegmentation from './components/XRaySemanticSegmentation';
import DetectionHistory from './components/DetectionHistory';

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <FileSidebar />

        <Routes>
          {/* Public Routes */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/patient-signup" element={<PatientSignUp />} />
          <Route path="/dentist-signup" element={<DentistSignUp />} />
          <Route path="/admin-signup" element={<AdminSignUp />} />
          
          <Route path="/patient-auth" element={<PatientAuth />} />
          <Route path="/dentist-auth" element={<DentistAuth />} />
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/patient-signin" element={<PatientSignIn />} />
          <Route path="/dentist-signin" element={<DentistSignIn />} />
          <Route path="/admin-signin" element={<AdminSignIn />} />
          <Route path="/reset" element={<PasswordReset />} />
         
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/semantic-segmentation" element={<XRaySemanticSegmentation />} />

          {/* Private Routes */}
          <Route
            path="/verify-email"
            element={
              <PrivateRoute requireVerification={false}>
                <VerifyEmail />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Admin Routes - Protected by IP validation */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminProtectedRoute>
                  <AdminAppointmentManagement />
                </AdminProtectedRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/enquiries"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminProtectedRoute>
                  <Enquiries />
                </AdminProtectedRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/chat"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminProtectedRoute>
                  <AdminChat />
                </AdminProtectedRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminProtectedRoute>
                  <Feedback />
                </AdminProtectedRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminProtectedRoute>
                  <RecordsAndAnalytics />
                </AdminProtectedRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminProtectedRoute>
                  <AnnouncementsManagement />
                </AdminProtectedRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/manage-users"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminProtectedRoute>
                  <ManageUsers />
                </AdminProtectedRoute>
              </PrivateRoute>
            }
          />

          {/* Dentist Routes */}
          <Route
            path="/dentist"
            element={
              <PrivateRoute requiredRole="dentist">
                <DentistDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dentist/appointments"
            element={
              <PrivateRoute requiredRole="dentist">
                <AppointmentScheduling />
              </PrivateRoute>
            }
          />
          <Route
            path="/dentist/patients"
            element={
              <PrivateRoute requiredRole="dentist">
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/dentist/caries-detection"
            element={
              <PrivateRoute requiredRole="dentist">
                <CariesDetection />
              </PrivateRoute>
            }
          />
          <Route
            path="/dentist/charts"
            element={
              <PrivateRoute requiredRole="dentist">
                <DentalCharts />
              </PrivateRoute>
            }
          />
          <Route
            path="/dentist/semantic-segmentation"
            element={
              <PrivateRoute requiredRole="dentist">
                <XRaySemanticSegmentation />
              </PrivateRoute>
            }
          />
          <Route
            path="/dentist/feedback"
            element={
              <PrivateRoute requiredRole="dentist">
                <Feedback />
              </PrivateRoute>
            }
          />
          <Route
            path="/dentist/detection-history"
            element={
              <PrivateRoute requiredRole="dentist">
                <DetectionHistory />
              </PrivateRoute>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patient"
            element={
              <PrivateRoute requiredRole="patient">
                <PatientDashboard />
              </PrivateRoute>
            }
          />
          <Route
  path="/patient/appointments"
  element={
    <PrivateRoute requiredRole="patient">
      <AppointmentInfo />
    </PrivateRoute>
  }
/>
          <Route
            path="/book-appointment"
            element={
              <PrivateRoute requiredRole="patient">
                <BookAppointment />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-beneficiaries"
            element={
              <PrivateRoute requiredRole="patient">
                <AddBeneficiaries />
              </PrivateRoute>
            }
          />
          <Route
            path="/beneficiaries"
            element={
              <PrivateRoute requiredRole="patient">
                <ViewBeneficiaries />
              </PrivateRoute>
            }
          />
          <Route
            path="/appointment-info"
            element={
              <PrivateRoute requiredRole="patient">
                <AppointmentInfo />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/patient/profile"
            element={
              <PrivateRoute requiredRole="patient">
                <PatientProfile />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/patient/chat"
            element={
              <PrivateRoute requiredRole="patient">
                <PatientChat />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/ChatBot"
            element={
              <PrivateRoute requiredRole="patient">
                <ChatBot />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/feedback"
            element={
              <PrivateRoute requiredRole="patient">
                <PatientFeedback />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/announcements"
            element={
              <PrivateRoute requiredRole="patient">
                <Announcements />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/detection-history"
            element={
              <PrivateRoute requiredRole="patient">
                <DetectionHistory />
              </PrivateRoute>
            }
          />

          {/* Default & Fallback Routes */}
          <Route path="/" element={<Navigate to="/welcome" />} />
          <Route path="*" element={<Navigate to="/welcome" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
