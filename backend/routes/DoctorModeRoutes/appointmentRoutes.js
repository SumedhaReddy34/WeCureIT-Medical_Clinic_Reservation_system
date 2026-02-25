const express = require("express");
const router = express.Router();
const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patients");
const Doctor = require("../../models/Doctor");

// Update Appointment: Mark as Complete or Reschedule
router.put("/update-appointment/:id", async (req, res) => {
  try {
    const { id } = req.params; // Appointment ID
    const { isOriginalSchedule, newScheduleDuration } = req.body;

    // Fetch the appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).send({ message: "Appointment not found." });
    }

    if (appointment.isComplete) {
      return res.status(400).send({ message: "Appointment is already marked as complete." });
    }

    // Process the request based on isOriginalSchedule
    if (isOriginalSchedule) {
      // Mark appointment as complete with original duration
      appointment.isComplete = true;
    } else {
      // Validate new schedule duration
      if (!newScheduleDuration || newScheduleDuration <= 0) {
        return res.status(400).send({
          message: "New schedule duration must be provided and greater than 0.",
        });
      }

      // Update duration and calculate new end times
      appointment.appointment_original_duration = newScheduleDuration;

      //appointment.appointment_end_time = new Date(
      //  new Date(appointment.appointment_start_time).getTime() +
      //    newScheduleDuration * 60 * 1000
      //);

      // Assuming no specific logic for breaks, keep this equal to appointment_end_time
      //appointment.appointment_end_time_with_break = appointment.appointment_end_time;

      appointment.isComplete = true; // Mark as complete
    }

    // Save the updated appointment
    await appointment.save();

    res.status(200).send({
      message: "Appointment updated successfully.",
      appointment,
    });
  } catch (error) {
    res.status(500).send({ message: "Error updating appointment.", error });
  }
});



// Update Notes for the Current Appointment
router.put("/update-notes/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { medical_diagnose, medical_history, current_signs, additional_notes } = req.body;

    // Validate input
    if (!medical_diagnose && !medical_history && !current_signs && !additional_notes) {
      return res.status(400).json({
        message: "At least one field (medical_diagnose, medical_history, current_signs, additional_notes) must be provided.",
      });
    }

    // Dynamically build the update object
    const updateFields = {};
    if (medical_diagnose !== undefined) updateFields.medical_diagnose = medical_diagnose;
    if (medical_history !== undefined) updateFields.medical_history = medical_history;
    if (current_signs !== undefined) updateFields.current_signs = current_signs;
    if (additional_notes !== undefined) updateFields.additional_notes = additional_notes;

    // Find and update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: updateFields },
      { new: true, runValidators: true } // Return updated document and validate input
    );

    // Handle case where appointment is not found
    if (!updatedAppointment) {
      return res.status(404).json({
        message: "Appointment not found. Please check the appointment ID.",
      });
    }

    // Success response
    res.status(200).json({
      message: "Appointment notes updated successfully.",
      updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment notes:", error);
    res.status(500).json({
      message: "An error occurred while updating appointment notes.",
      error: error.message,
    });
  }
});


// Get Notes from Previous Appointments of a Patient
router.get("/previous-notes/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    // Find all previous appointments for the given patient
    const previousAppointments = await Appointment.find({
      patient_id: patientId,
      isComplete: true, // Only completed appointments
      isDelete: false,  // Exclude deleted appointments
    })
      .select(
        "medical_diagnose medical_history current_signs additional_notes appointment_date speciality_name doctor_id"
      );

    if (!previousAppointments || previousAppointments.length === 0) {
      return res.status(404).send({ message: "No previous appointments found for this patient." });
    }

    // For each appointment, fetch the doctor name using the doctor ID
    const enrichedAppointments = await Promise.all(previousAppointments.map(async (appointment) => {
      // Fetch the doctor name from the Doctor collection
      const doctor = await Doctor.findById(appointment.doctor_id).select('name');
      return {
        ...appointment.toObject(),
        medical_diagnose: appointment.medical_diagnose || "No diagnosis available",
        medical_history: appointment.medical_history || "No medical history available",
        current_signs: appointment.current_signs || "No signs and symptoms available",
        additional_notes: appointment.additional_notes || "No additional notes available",
        doctor_name: doctor ? doctor.name : "Doctor not found",
      };
    }));

    res.status(200).send({
      message: "Previous appointment notes retrieved successfully.",
      previousAppointments: enrichedAppointments,
    });
  } catch (error) {
    console.error("Error fetching previous notes:", error);
    res.status(500).send({ message: "Error fetching previous notes.", error });
  }
});
  
  // Cancel an Appointment
router.put("/cancel-appointment/:appointmentId", async (req, res) => {
    try {
      const { appointmentId } = req.params;
  
      // Find and update the appointment
      const canceledAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { isCancel: true }, // Or update `status: "canceled"`
        { new: true } // Return the updated document
      );
  
      if (!canceledAppointment) {
        return res.status(404).send({ message: "Appointment not found." });
      }
  
      res.status(200).send({
        message: "Appointment canceled successfully.",
        canceledAppointment,
      });
    } catch (error) {
      res.status(500).send({ message: "Error canceling appointment.", error });
    }
  });

  // Fetch upcoming appointments for a doctor
router.get("/upcoming/:doctorId", async (req, res) => {
  const { doctorId } = req.params;

  try {
    const upcomingAppointments = await Appointment.find({
      doctor_id: doctorId,
      date: { $gte: new Date() }, // Filter for future dates
      isComplete: false,
      isDelete: false,
    }).sort({ date: 1 }); // Sort by date ascending

    res.status(200).json(upcomingAppointments);
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    res.status(500).json({ message: "Failed to fetch upcoming appointments" });
  }
});

// Fetch completed appointments for a doctor
router.get("/completed/:doctorId", async (req, res) => {
  const { doctorId } = req.params;

  try {
    // Convert doctorId to Number if needed (optional if IDs are stored as numbers)
    //const doctorIdNumber = parseInt(doctorId, 10);

    const completedAppointments = await Appointment.find({
      doctor_id: doctorId, // Match the doctor_id field
      isComplete: true, // Only completed appointments
      isDelete: false, // Exclude deleted appointments
    }).sort({ date: -1 }); // Sort by descending date

    if (completedAppointments.length === 0) {
      return res.status(404).json({ message: "No completed appointments found." });
    }

    res.status(200).json(completedAppointments);
  } catch (error) {
    console.error("Error fetching completed appointments:", error);
    res.status(500).json({ message: "Failed to fetch completed appointments", error: error.message });
  }
});


  
  module.exports = router;