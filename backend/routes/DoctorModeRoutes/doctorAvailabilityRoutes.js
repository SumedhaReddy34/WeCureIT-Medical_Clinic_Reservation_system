const express = require("express");
const router = express.Router();
const DoctorAvailability = require("../../models/DoctorAvailability");
const Doctor = require('../../models/Doctor'); // Import Doctor model
const Facility = require('../../models/Facility'); // Import Facility model
const Appointment = require('../../models/Appointment');

{/*// Add Doctor Availability
router.post("/add-availability", async (req, res) => {
  try {
    const {
      doctor_id,
      availability_date,
      start_time,
      end_time,
      facility_name,
      speciality_names,
    } = req.body;

    // Validate that start_time is before end_time
    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).send({ message: "Start time must be before end time." });
    }

    const newAvailability = new DoctorAvailability({
      doctor_id,
      availability_date,
      start_time,
      end_time,
      facility_name,
      speciality_names,
    });

    await newAvailability.save();

    res.status(201).send({ message: "Availability added successfully." });
  } catch (error) {
    res.status(500).send({ message: "Error adding availability.", error });
  }
});

// Update Doctor Availability
router.put("/update-availability/:id", async (req, res) => {
  try {
    const availabilityId = req.params.id;
    const { start_time, end_time, facility_name, speciality_names } = req.body;

    // Validate that start_time is before end_time
    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).send({ message: "Start time must be before end time." });
    }

    const updatedAvailability = await DoctorAvailability.findByIdAndUpdate(
      availabilityId,
      {
        start_time,
        end_time,
        facility_name,
        speciality_names,
      },
      { new: true } // Return the updated document
    );

    if (!updatedAvailability) {
      return res.status(404).send({ message: "Availability not found." });
    }

    res.status(200).send({ message: "Availability updated successfully." });
  } catch (error) {
    res.status(500).send({ message: "Error updating availability.", error });
  }
});

// Delete Doctor Availability (Soft Delete)
router.delete("/delete-availability/:id", async (req, res) => {
  try {
    const availabilityId = req.params.id;

    const deletedAvailability = await DoctorAvailability.findByIdAndUpdate(
      availabilityId,
      { isDelete: true },
      { new: true }
    );

    if (!deletedAvailability) {
      return res.status(404).send({ message: "Availability not found." });
    }

    res.status(200).send({ message: "Availability deleted successfully." });
  } catch (error) {
    res.status(500).send({ message: "Error deleting availability.", error });
  }
});*/}


router.post('/add-availability', async (req, res) => {
  const {
    availability_date,
    doctor_id,
    start_time,
    end_time,
    facility_name,
    speciality_names
  } = req.body;

  if (!availability_date || !doctor_id || !start_time || !end_time || !facility_name || speciality_names.length === 0) {
    return res.status(400).json({
      error: 'All fields (availability_date, doctor_id, start_time, end_time, facility_name, speciality_names) are required.'
    });
  }

  // Ensure start_time is before end_time
  if (new Date(start_time) >= new Date(end_time)) {
    return res.status(400).json({ error: 'Start time must be earlier than end time.' });
  }

  try {
    const newAvailability = new DoctorAvailability({
      availability_date: new Date(availability_date),
      doctor_id,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      facility_name: facility_name.trim(),
      speciality_names,
      validForScheduling: true, // Default to true
    });

    const savedAvailability = await newAvailability.save();

    res.status(201).json({
      message: 'Availability added successfully.',
      availability: savedAvailability
    });
  } catch (error) {
    console.error('Error adding availability:', error);
    res.status(500).json({ error: 'Server error: Unable to add availability.' });
  }
});

router.get('/availability/:doctor_id', async (req, res) => {
  const { doctor_id } = req.params;

  try {
    const availabilities = await DoctorAvailability.find({
      doctor_id,
      isDelete: false, // Exclude deleted entries
      validForScheduling: true // Include only valid entries
    });

    res.status(200).json(availabilities);
  } catch (error) {
    console.error('Error fetching availabilities:', error);
    res.status(500).json({ error: 'Server error: Unable to fetch availabilities.' });
  }
});

router.delete('/availability/:availability_id', async (req, res) => {
  const { availability_id } = req.params;

  try {
    const deletedAvailability = await DoctorAvailability.findByIdAndUpdate(
      availability_id,
      { isDelete: true },
      { new: true }
    );

    if (!deletedAvailability) {
      return res.status(404).json({ error: 'Availability not found.' });
    }

    res.status(200).json({
      message: 'Availability deleted successfully.',
      availability: deletedAvailability
    });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: 'Server error: Unable to delete availability.' });
  }
});

router.put('/availability/validity/:availability_id', async (req, res) => {
  const { availability_id } = req.params;
  const { validForScheduling } = req.body;

  try {
    const updatedAvailability = await DoctorAvailability.findByIdAndUpdate(
      availability_id,
      { validForScheduling },
      { new: true }
    );

    if (!updatedAvailability) {
      return res.status(404).json({ error: 'Availability not found.' });
    }

    res.status(200).json({
      message: 'Availability validity updated successfully.',
      availability: updatedAvailability
    });
  } catch (error) {
    console.error('Error updating validity:', error);
    res.status(500).json({ error: 'Server error: Unable to update validity.' });
  }
});

router.get('/facilities/:doctorId', async (req, res) => {
  const { doctorId } = req.params;

  try {
    // Fetch doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.isDeleted) {
      return res.status(404).json({ message: 'Doctor not found or has been deleted.' });
    }

    const doctorSpecialties = doctor.specialty;

    // Fetch facilities whose rooms contain matching specializations
    const facilities = await Facility.find({
      isDeleted: false,
      rooms: {
        $elemMatch: {
          specializations: { $in: doctorSpecialties } // Check for overlapping specializations
        }
      }
    });

    res.status(200).json({
      message: 'Matching facilities fetched successfully.',
      data: facilities,
    });
  } catch (error) {
    console.error('Error fetching matching facilities:', error.message);
    res.status(500).json({
      message: 'Server error: Unable to fetch matching facilities.',
      error: error.message,
    });
  }
});


// Fetch common specializations between doctor and facility room
router.get('/common-specializations/:doctorId/:facilityId', async (req, res) => {
  const { doctorId, facilityId } = req.params;

  try {
    // Fetch the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.isDeleted) {
      return res.status(404).json({ message: 'Doctor not found or has been deleted.' });
    }

    // Fetch the facility by ID
    const facility = await Facility.findById(facilityId);
    if (!facility || facility.isDeleted) {
      return res.status(404).json({ message: 'Facility not found or has been deleted.' });
    }

    const doctorSpecialties = doctor.specialty;

    // Extract all specializations from the facility's rooms
    const facilitySpecializations = facility.rooms.reduce((acc, room) => {
      return acc.concat(room.specializations);
    }, []);

    // Find common specializations
    const commonSpecializations = doctorSpecialties.filter((specialty) =>
      facilitySpecializations.includes(specialty)
    );

    res.status(200).json({
      message: 'Common specializations fetched successfully.',
      data: commonSpecializations,
    });
  } catch (error) {
    console.error('Error fetching common specializations:', error.message);
    res.status(500).json({
      message: 'Server error: Unable to fetch common specializations.',
      error: error.message,
    });
  }
});


// Fetch availability for a doctor within a specific date range
// Fetch availabilities for a doctor within a specific date range
router.get('/fetch-availability/:doctorID', async (req, res) => {
  try {
    const { doctorID } = req.params;
    const { nextWeekStart, nextWeekEnd } = req.query;

    // Validate input parameters
    if (!nextWeekStart || !nextWeekEnd) {
      return res.status(400).json({
        error: 'Both nextWeekStart and nextWeekEnd are required as query parameters.',
      });
    }

    // Parse the dates from the query parameters
    const startDate = new Date(nextWeekStart);
    const endDate = new Date(nextWeekEnd);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: 'Invalid date format for nextWeekStart or nextWeekEnd.' });
    }

    // Query the database for doctor availabilities within the date range
    const availabilities = await DoctorAvailability.find({
      doctor_id: doctorID,
      availability_date: {
        $gte: startDate,
        $lte: endDate,
      },
      isDelete: false, // Exclude soft-deleted entries
    }).select('availability_date facility_name speciality_names start_time end_time');

    if (!availabilities || availabilities.length === 0) {
      return res.status(404).json({
        message: 'No availabilities found for the specified date range and doctor.',
      });
    }

    // Extract unique facility names from availabilities
    const facilityNames = [...new Set(availabilities.map((a) => a.facility_name))];

    // Fetch facilities matching the names
    const facilities = await Facility.find({ name: { $in: facilityNames } }).select('_id name');

    // Create a mapping from facility name to facility ID
    const facilityMap = {};
    facilities.forEach((facility) => {
      facilityMap[facility.name] = facility._id;
    });

    // Attach the facility ID to each availability
    const availabilitiesWithFacilityID = availabilities.map((availability) => {
      return {
        ...availability._doc,
        facility_id: facilityMap[availability.facility_name] || null, // Attach facility_id
      };
    });

    // Send the response with the fetched availabilities including facility IDs
    res.status(200).json({
      message: 'Doctor availabilities fetched successfully.',
      data: availabilitiesWithFacilityID,
    });
  } catch (error) {
    console.error('Error fetching doctor availabilities:', error);
    res.status(500).json({ error: 'Server error: Unable to fetch doctor availabilities.' });
  }
});


router.put('/edit-availability/:availabilityID', async (req, res) => {
  const { availabilityID } = req.params;
  const {
    availability_date,
    doctor_id,
    start_time,
    end_time,
    facility_name,
    speciality_names,
  } = req.body;

  // Validate required fields
  if (!availability_date || !doctor_id || !start_time || !end_time || !facility_name || speciality_names.length === 0) {
    return res.status(400).json({
      error: 'All fields (availability_date, doctor_id, start_time, end_time, facility_name, speciality_names) are required.',
    });
  }

  // Ensure start_time is before end_time
  if (new Date(start_time) >= new Date(end_time)) {
    return res.status(400).json({ error: 'Start time must be earlier than end time.' });
  }

  try {
    // Find conflicting appointments
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    const conflictingAppointments = await Appointment.find({
      doctor_id,
      facility_name,
      speciality_name: { $in: speciality_names },
      appointment_date: new Date(availability_date),
      appointment_start_time: { $lt: endTime },
      appointment_end_time: { $gt: startTime },
      isCancel: false, // Check only non-cancelled appointments
      isDelete: false, // Check only non-deleted appointments
    });

    // Cancel all conflicting appointments
    if (conflictingAppointments.length > 0) {
      const appointmentIds = conflictingAppointments.map((app) => app._id);
      await Appointment.updateMany(
        { _id: { $in: appointmentIds } },
        { $set: { isCancel: true } }
      );
      //console.log(`Cancelled ${conflictingAppointments.length} conflicting appointments.`);
    }

    // Find and update the availability record
    const updatedAvailability = await DoctorAvailability.findByIdAndUpdate(
      availabilityID,
      {
        availability_date: new Date(availability_date),
        doctor_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        facility_name: facility_name.trim(),
        speciality_names,
      },
      { new: true } // Return the updated document
    );

    if (!updatedAvailability) {
      return res.status(404).json({ error: 'Availability not found.' });
    }

    res.status(200).json({
      message: 'Availability updated successfully. Conflicting appointments if found were canceled and patients are noticed.',
      availability: updatedAvailability,
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Server error: Unable to update availability.' });
  }
});


router.delete('/delete-availability/:availabilityID', async (req, res) => {
  const { availabilityID } = req.params;

  try {
    // Find the availability being deleted
    const availabilityToDelete = await DoctorAvailability.findById(availabilityID);

    if (!availabilityToDelete) {
      return res.status(404).json({ error: 'Availability not found.' });
    }

    const { doctor_id, facility_name, availability_date } = availabilityToDelete;

    // Cancel all appointments matching the deleted availability
    const conflictingAppointments = await Appointment.updateMany(
      {
        doctor_id,
        facility_name,
        appointment_date: availability_date,
        isCancel: false, // Only update non-cancelled appointments
        isDelete: false, // Only update non-deleted appointments
      },
      { $set: { isCancel: true } }
    );

    //console.log(`Cancelled ${conflictingAppointments.modifiedCount} appointments due to availability deletion.`);

    // Perform a soft delete by setting isDelete to true
    const deletedAvailability = await DoctorAvailability.findByIdAndUpdate(
      availabilityID,
      { isDelete: true },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: `Availability deleted successfully. ${conflictingAppointments.modifiedCount} appointments were canceled. The patients are notified about the cancellation`,
      availability: deletedAvailability,
    });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: 'Server error: Unable to delete availability.' });
  }
});




router.get("/copy-previous-week-schedule/:doctorId", async (req, res) => {
  const { doctorId } = req.params;
  const { nextWeekStart, nextWeekEnd } = req.query; // Fetch nextWeekStart and nextWeekEnd from UI

  try {
    console.log(`Received request to fetch schedules for doctorId: ${doctorId}`);
    console.log(`Next week start: ${nextWeekStart}, Next week end: ${nextWeekEnd}`);

    // Parse nextWeekStart and nextWeekEnd into Date objects and set to midnight UTC
    const nextWeekStartDate = new Date(nextWeekStart);
    const nextWeekEndDate = new Date(nextWeekEnd);

    if (isNaN(nextWeekStartDate) || isNaN(nextWeekEndDate)) {
      console.error("Invalid nextWeekStart or nextWeekEnd date");
      return res.status(400).json({ message: "Invalid nextWeekStart or nextWeekEnd provided." });
    }

    // Set both dates to UTC midnight
    nextWeekStartDate.setUTCHours(0, 0, 0, 0);
    nextWeekEndDate.setUTCHours(23, 59, 59, 999);

    console.log(`Next week start (UTC): ${nextWeekStartDate}`);
    console.log(`Next week end (UTC): ${nextWeekEndDate}`);

    // Calculate current week dates based on nextWeekStart and nextWeekEnd
    const daysDifference = 7; // Move one week back
    const currentWeekStart = new Date(nextWeekStartDate);
    currentWeekStart.setDate(currentWeekStart.getDate() - daysDifference);

    const currentWeekEnd = new Date(nextWeekEndDate);
    currentWeekEnd.setDate(currentWeekEnd.getDate() - daysDifference);

    console.log(`Current week start (UTC): ${currentWeekStart.toISOString()}`);
    console.log(`Current week end (UTC): ${currentWeekEnd.toISOString()}`);

    // Find current week's schedules
    const currentWeekSchedules = await DoctorAvailability.find({
      doctor_id: doctorId,
      availability_date: { $gte: currentWeekStart, $lte: currentWeekEnd },
      isDelete: false,
    });

    console.log(`Found ${currentWeekSchedules.length} schedules for the current week.`);

    if (!currentWeekSchedules || currentWeekSchedules.length === 0) {
      console.log("No schedules found for the current week.");
      return res.status(404).json({ message: "No schedule found for the current week." });
    }

    // Prepare schedules for the upcoming week
    const upcomingWeekSchedules = currentWeekSchedules.map((schedule) => {
      const newDate = new Date(schedule.availability_date);
      newDate.setDate(newDate.getDate() + daysDifference);
      newDate.setUTCHours(0, 0, 0, 0); // Set new date to midnight UTC

      const adjustedStartTime = new Date(schedule.start_time);
      adjustedStartTime.setDate(adjustedStartTime.getDate() + daysDifference);

      const adjustedEndTime = new Date(schedule.end_time);
      adjustedEndTime.setDate(adjustedEndTime.getDate() + daysDifference);

      console.log(`Adjusting schedule: ${schedule._id}`);
      console.log(`New date (UTC): ${newDate.toISOString()}`);
      console.log(`New start time (UTC): ${adjustedStartTime.toISOString()}`);
      console.log(`New end time (UTC): ${adjustedEndTime.toISOString()}`);

      return {
        availability_date: newDate.toISOString(),
        doctor_id: schedule.doctor_id,
        start_time: adjustedStartTime.toISOString(),
        end_time: adjustedEndTime.toISOString(),
        facility_name: schedule.facility_name,
        speciality_names: schedule.speciality_names,
        availabilityID: schedule._id, // Include original availability ID for reference
      };
    });

    console.log("Prepared schedules for the upcoming week:", upcomingWeekSchedules);

    // Return the adjusted schedules without storing them
    res.status(200).json({
      message: "Current week's schedule fetched successfully.",
      copiedSchedules: upcomingWeekSchedules,
    });
  } catch (error) {
    console.error("Error fetching current week's schedule:", error);
    res.status(500).json({ message: "An error occurred while fetching the schedule.", error });
  }
});





module.exports = router;


