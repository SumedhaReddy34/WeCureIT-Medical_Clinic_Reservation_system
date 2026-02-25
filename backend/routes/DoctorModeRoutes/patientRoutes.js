const express = require("express");
const router = express.Router();
const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patients");

router.get("/appointments/:doctorId", async (req, res) => {
  const { doctorId } = req.params;

  try {
    const appointments = await Appointment.find({
      doctor_id: doctorId,
      isDelete: false,
      isComplete: false,
      isCancel: false
    })
      .select("patient_id appointment_date _id speciality_name doctor_id facility_name appointment_start_time")
      .sort({ appointment_date: 1 });

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found for the doctor." });
    }

    const patientIds = [...new Set(appointments.map((appointment) => appointment.patient_id))];
    const patients = await Patient.find({ _id: { $in: patientIds } }).select("full_name email");

    const result = appointments.map((appointment) => {
      const patient = patients.find((p) => p._id.equals(appointment.patient_id));
      
      // Use the correct field `appointment_start_time`
      const startTime = new Date(appointment.appointment_start_time);
      const appointmentDateOnly = startTime.toISOString().split('T')[0]; // Extract YYYY-MM-DD
      const appointmentTime = startTime.toISOString().split('T')[1].substring(0, 5); // Extract HH:MM

      return {
        facility_name: appointment.facility_name,
        speciality_name: appointment.speciality_name,
        patient_id: appointment.patient_id,
        appointment_id: appointment._id,
        patient_name: patient?.full_name || "Unknown Patient",
        patient_email: patient?.email || "N/A",
        appointment_date: appointmentDateOnly, // Send only the date as YYYY-MM-DD
        appointment_time: appointmentTime, // Send time from the appointment_start_time field as HH:MM
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching scheduled patients:", error.stack);
    res.status(500).json({ message: "Failed to fetch scheduled patients", error: error.message });
  }
});



// Fetch all completed appointments for a specific doctor
router.get("/completed-appointments/:doctorId", async (req, res) => {
  const { doctorId } = req.params;

  try {
    // Fetch completed appointments for the given doctor
    const completedAppointments = await Appointment.find({
      doctor_id: doctorId,
      isComplete: true, // Only completed appointments
      isDelete: false,  // Exclude deleted appointments
    })
      .select("patient_id appointment_date appointment_time") // Select necessary fields
      .sort({ appointment_date: -1 }); // Sort by date descending (most recent first)

    // If no completed appointments are found
    if (completedAppointments.length === 0) {
      return res.status(404).json({ message: "No completed appointments found for the doctor." });
    }

    // Extract unique patient IDs
    const patientIds = [...new Set(completedAppointments.map((appointment) => appointment.patient_id))];

    // Fetch patient details
    const patients = await Patient.find({ _id: { $in: patientIds } }).select("full_name email");

    // Merge completed appointment data with patient details
    const result = completedAppointments.map((appointment) => {
      const patient = patients.find((p) => p._id.equals(appointment.patient_id));
      return {
        appointment_id: appointment._id,
        patient_name: patient?.full_name || "Unknown Patient",
        patient_email: patient?.email || "N/A",
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
      };
    });

    // Respond with the completed appointments
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching completed appointments:", error);
    res.status(500).json({ message: "Failed to fetch completed appointments", error: error.message });
  }
});

module.exports = router;



