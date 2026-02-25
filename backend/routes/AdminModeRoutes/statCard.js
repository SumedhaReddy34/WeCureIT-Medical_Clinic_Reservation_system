const express = require('express');
const router = express.Router();
const Appointment = require('../../models/Appointment'); // Import the Appointment model
const Patient = require('../../models/Patients'); // Import the Patient model

// Route to fetch the total count of patients
router.get('/patients/count', async (req, res) => {
    try {
        // Use mongoose countDocuments to get the total count of patients
        const totalPatients = await Patient.countDocuments({ isDeleted: false }); // Exclude deleted patients
        res.status(200).json({
            message: 'Total patients count retrieved successfully',
            totalPatients,
        });
    } catch (err) {
        console.error('Error fetching total patients count:', err);
        res.status(500).json({ error: 'Server error: Unable to retrieve total patients count' });
    }
});

// Route to fetch the total count of appointments
router.get('/appointments/count', async (req, res) => {
    try {
        // Use mongoose countDocuments to get the total count of appointments
        const totalAppointments = await Appointment.countDocuments({ isDelete: false }); // Exclude deleted appointments
        res.status(200).json({
            message: 'Total appointments count retrieved successfully',
            totalAppointments
        });
    } catch (err) {
        console.error('Error fetching total appointments count:', err);
        res.status(500).json({ error: 'Server error: Unable to retrieve total appointments count' });
    }
});

module.exports = router;
