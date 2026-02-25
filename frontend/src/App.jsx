import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './AdminMode/adminDashboard/Dashboard'; 
import ManageDoctors from './AdminMode/doctorsAdminMode/ManageDoctors'; 
import ManageFacilities from './AdminMode/facilitiesAdminMode/ManageFacilities';
import AdminLogin from './AdminMode/AdminLogin';
import ProtectedRoute from './ProtectedRoute'; // Import the updated ProtectedRoute component

import Login from './PatientMode/pages/Logins/Login';
import About from './PatientMode/pages/Static/About';
import Contact from './PatientMode/pages/Static/Contact';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Createaccount from './PatientMode/pages/Logins/Createaccount';
import PatientDashboard from './PatientMode/pages/myProfile/PatientDashboard';
import PatientProfile from './PatientMode/pages/myProfile/PatientProfile';
import Home from './PatientMode/pages/Static/Home';
import Main from './PatientMode/pages/myProfile/Main';


import DoctorLogin from './DoctorMode/DoctorLogin';


import DoctorDashboard from './DoctorMode/components/Dashboard';
import Appointments from './DoctorMode/components/Appointments';
import AvailabilityChanges from './DoctorMode/components/AvailabilityChanges';

function App() {
  return (
    <Router>
      <div className="flex">
        <main className="flex-1 p-1">
          <ToastContainer />
          <Routes>
            {/* Public Route */}
            <Route path="/adminlogin" element={<AdminLogin />} />

            {/* Admin Protected Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute mode="admin"> {/* Pass mode as "admin" */}
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-doctors"
              element={
                <ProtectedRoute mode="admin"> {/* Pass mode as "admin" */}
                  <ManageDoctors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-facilities"
              element={
                <ProtectedRoute mode="admin"> {/* Pass mode as "admin" */}
                  <ManageFacilities />
                </ProtectedRoute>
              }
            />



            {/* Patient Protected Routes */}
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute mode="patient"> {/* Pass mode as "patient" */}
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute mode="patient"> {/* Pass mode as "patient" */}
                  <PatientProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookAppointment"
              element={
                <ProtectedRoute mode="patient"> {/* Pass mode as "patient" */}
                  <Main />
                </ProtectedRoute>
              }
            />

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/patientlogin" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/create-account" element={<Createaccount />} />
            
            <Route path="/doctorlogin" element={<DoctorLogin />} />


            {/* Doctor Protected Routes */}
            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute mode="doctor"> {/* Pass mode as "doctor" */}
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute mode="doctor"> {/* Pass mode as "doctor" */}
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/availability"
              element={
                <ProtectedRoute mode="doctor"> {/* Pass mode as "doctor" */}
                  <AvailabilityChanges />
                </ProtectedRoute>
              }
            />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
