import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode }from 'jwt-decode'; // Corrected import

const ProtectedRoute = ({ children, mode }) => {
    let token = null;
    let validUser = false;

    if (mode === 'admin') {
        token = localStorage.getItem('authToken'); // Admin uses localStorage
        validUser = token !== null;
    } else if (mode === 'patient') {
        token = sessionStorage.getItem('authToken');
        const patientID = sessionStorage.getItem('patientId');
        const doctorID = sessionStorage.getItem('DoctorId');
        // For patient mode, must have patientID and not have doctorID
        validUser = token !== null && patientID !== null && doctorID === null;
    } else if (mode === 'doctor') {
        token = sessionStorage.getItem('authToken');
        const doctorID = sessionStorage.getItem('DoctorId');
        const patientID = sessionStorage.getItem('patientId');
        // For doctor mode, must have doctorID and not have patientID
        validUser = token !== null && doctorID !== null && patientID === null;
    } else {
        // If mode is not specified, redirect to login
        return <Navigate to="/" />;
    }

    if (!validUser) {
        // Clear storage and redirect to login if token or IDs are invalid
        if (mode === 'admin') {
            localStorage.removeItem('authToken');
        } else {
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('patientId');
            sessionStorage.removeItem('DoctorId');
        }
        return <Navigate to="/" />;
    } 

    try {
        // Decode the token and check for expiry
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            // Token is expired; clear storage and redirect
            if (mode === 'admin') {
                localStorage.removeItem('authToken');
            } else {
                sessionStorage.removeItem('authToken');
                sessionStorage.removeItem('patientId');
                sessionStorage.removeItem('DoctorId');
            }
            return <Navigate to="/" />;
        }
    } catch (error) {
        // Token is invalid; clear storage and redirect
        if (mode === 'admin') {
            localStorage.removeItem('authToken');
        } else {
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('patientId');
            sessionStorage.removeItem('DoctorId');
        }
        return <Navigate to="/" />;
    }

    // Token and IDs are valid; render the protected component
    return children;
};

export default ProtectedRoute;
