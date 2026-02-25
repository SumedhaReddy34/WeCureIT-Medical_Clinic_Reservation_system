const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../../models/Appointment');

// Fetch count of completed appointments for a doctor
router.get('/appointments/count/:doctor_id', async (req, res) => {
    const { doctor_id } = req.params;

    // Validate doctor_id
    if (!mongoose.Types.ObjectId.isValid(doctor_id)) {
        return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    try {
        const Count = await Appointment.countDocuments({
            doctor_id: new mongoose.Types.ObjectId(doctor_id),
            isDelete: false, // Exclude deleted appointments
            isCancel: false,
        });

        res.status(200).json({
            message: 'Count of appointments retrieved successfully',
            Count,
        });
    } catch (error) {
        console.error('Error fetching appointment count:', error);
        res.status(500).json({ error: 'Server error: Unable to fetch data' });
    }
});

// Fetch count of unique patients for a doctor
router.get('/appointments/patients/:doctor_id', async (req, res) => {
    const { doctor_id } = req.params;

    // Validate doctor_id
    if (!mongoose.Types.ObjectId.isValid(doctor_id)) {
        return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    try {
        const uniquePatients = await Appointment.distinct('patient_id', {
            doctor_id: new mongoose.Types.ObjectId(doctor_id),
            isDelete: false, // Exclude deleted appointments
            isCancel: false,
        });

        res.status(200).json({
            message: 'Count of unique patients retrieved successfully',
            uniquePatientCount: uniquePatients.length,
        });
    } catch (error) {
        console.error('Error fetching unique patient count:', error);
        res.status(500).json({ error: 'Server error: Unable to fetch data' });
    }
});


module.exports = router;
