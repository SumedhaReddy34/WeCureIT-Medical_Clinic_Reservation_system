const express = require('express');
const router = express.Router();
const Appointment = require('../../models/Appointment'); // Adjust the path as necessary
const Doctor = require('../../models/Doctor'); // Adjust the path as necessary

router.get('/appointments/completed/:patient_id', async (req, res) => {
    const { patient_id } = req.params;

    if (!patient_id) {
        return res.status(400).json({ error: 'Patient ID is required' });
    }

    try {
        // Fetch appointments where isComplete is true or isCancel is true, and isDelete is false
        const completedAppointments = await Appointment.find({
            patient_id,
            isDelete: false, // Exclude deleted appointments
            $or: [
                { isComplete: true }, // Include completed appointments
                { isCancel: true },   // Include cancelled appointments
            ],
        }).sort({ appointment_date: -1 }); // Sort by latest appointment date

        // Enrich appointments with doctor details and additional conditions
        const enrichedAppointments = await Promise.all(
            completedAppointments.map(async (appointment) => {
                const doctor = await Doctor.findOne({ _id: appointment.doctor_id, isDeleted: false });

                let additionalMessage = null;

                // Check if the appointment is canceled
                if (appointment.isCancel) {
                    additionalMessage =
                        'The appointment has been cancelled by the doctor, sorry for the inconvenience';
                }

                // Check if the duration exceeds scheduled duration
                if (
                    appointment.appointment_original_duration &&
                    appointment.appointment_original_duration > appointment.appointment_scheduled_duration
                ) {
                    additionalMessage =
                        'The appointment duration has extended beyond the selected scheduled time. There will be extra charge deducted from your payment method.';
                }

                return {
                    ...appointment.toObject(),
                    doctor_name: doctor ? doctor.name : 'Unknown Doctor', // Include doctor's name
                    doctor_specialty: doctor ? doctor.specialty : 'Unknown Specialty', // Include specialty if available
                    additionalMessage, // Add message to the appointment object
                };
            })
        );

        res.status(200).json({
            message: 'Completed appointments fetched successfully.',
            appointments: enrichedAppointments,
        });
    } catch (error) {
        console.error('Error fetching completed appointments:', error);
        res.status(500).json({ error: 'Server error: Unable to fetch completed appointments.' });
    }
});



// Fetch Incomplete Appointments for a Patient
router.get('/appointments/incomplete/:patient_id', async (req, res) => {
    const { patient_id } = req.params;

    if (!patient_id) {
        return res.status(400).json({ error: 'Patient ID is required' });
    }

    try {
        const incompleteAppointments = await Appointment.find({
            patient_id,
            isComplete: false,
            isDelete: false, // Exclude deleted appointments
            isCancel: { $ne: true } // Exclude canceled appointments
        }).sort({ appointment_date: 1 }); // Sort by earliest appointment date

        // Fetch doctor details for each appointment
        const enrichedAppointments = await Promise.all(
            incompleteAppointments.map(async (appointment) => {
                const doctor = await Doctor.findOne({ _id: appointment.doctor_id, isDeleted: false });

                return {
                    ...appointment.toObject(),
                    doctor_name: doctor ? doctor.name : 'Unknown Doctor', // Include doctor's name
                    doctor_specialty: doctor ? doctor.specialty : 'Unknown Specialty', // Include specialty if available
                };
            })
        );

        res.status(200).json({
            message: 'Incomplete appointments fetched successfully.',
            appointments: enrichedAppointments
        });
    } catch (error) {
        console.error('Error fetching incomplete appointments:', error);
        res.status(500).json({ error: 'Server error: Unable to fetch incomplete appointments.' });
    }
});



/**
 * Mark an appointment as deleted
 * @route PATCH /appointments/delete/:appointmentId
 */
router.patch('/appointments/delete/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;

    try {
        // Find and update the appointment by ID
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId, // The ID of the appointment to update
            { isDelete: true }, // Set isDelete to true
            { new: true } // Return the updated document
        );

        if (!updatedAppointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        res.status(200).json({
            message: 'Appointment marked as deleted successfully.',
            appointment: updatedAppointment
        });
    } catch (error) {
        console.error('Error marking appointment as deleted:', error);
        res.status(500).json({ error: 'Server error: Unable to mark appointment as deleted.' });
    }
});


module.exports = router;
