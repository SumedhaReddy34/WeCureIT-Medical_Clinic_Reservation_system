const express = require('express');
const router = express.Router();
const Appointment = require('../../models/Appointment'); 
const DoctorAvailability = require('../../models/DoctorAvailability'); // Adjust the path as per your structure
const Facility = require('../../models/Facility');




router.get('/filter/facilities', async (req, res) => {
    try {
        const { speciality_name, doctor_id, availability_date } = req.query;

        const filter = { validForScheduling: true, isDelete: false };
        if (speciality_name) filter.speciality_names = { $in: [speciality_name] };
        if (doctor_id) filter.doctor_id = doctor_id;
        if (availability_date) filter.availability_date = new Date(availability_date);

        const availabilities = await DoctorAvailability.find(filter);
        const facilities = [...new Set(availabilities.map(a => a.facility_name))];

        res.status(200).json({ message: 'Facilities retrieved successfully', facilities });
    } catch (err) {
        console.error('Error retrieving facilities:', err);
        res.status(500).json({ error: 'Server error: Unable to retrieve facilities' });
    }
});

router.get('/filter/doctors', async (req, res) => {
    try {
        const { facility_name, speciality_name, availability_date } = req.query;

        const filter = { validForScheduling: true, isDelete: false };
        if (facility_name) filter.facility_name = facility_name;
        if (speciality_name) filter.speciality_names = { $in: [speciality_name] };
        if (availability_date) filter.availability_date = new Date(availability_date);

        const availabilities = await DoctorAvailability.find(filter)
            .populate('doctor_id', 'name');

        // Use a Map to ensure unique doctor IDs and names
        const uniqueDoctorsMap = new Map();
        availabilities.forEach((a) => {
            if (!uniqueDoctorsMap.has(a.doctor_id._id.toString())) {
                uniqueDoctorsMap.set(a.doctor_id._id.toString(), { 
                    id: a.doctor_id._id, 
                    name: a.doctor_id.name 
                });
            }
        });

        // Convert the Map to an array of unique doctors
        const doctors = Array.from(uniqueDoctorsMap.values());

        res.status(200).json({ message: 'Doctors retrieved successfully', doctors });
    } catch (err) {
        console.error('Error retrieving doctors:', err);
        res.status(500).json({ error: 'Server error: Unable to retrieve doctors' });
    }
});


router.get('/filter/specialities', async (req, res) => {
    try {
        const { facility_name, doctor_id, availability_date } = req.query;

        const filter = { validForScheduling: true, isDelete: false };
        if (facility_name) filter.facility_name = facility_name;
        if (doctor_id) filter.doctor_id = doctor_id;
        if (availability_date) filter.availability_date = new Date(availability_date);

        const availabilities = await DoctorAvailability.find(filter);
        const specialities = [...new Set(availabilities.flatMap(a => a.speciality_names))];

        res.status(200).json({ message: 'Specialities retrieved successfully', specialities });
    } catch (err) {
        console.error('Error retrieving specialities:', err);
        res.status(500).json({ error: 'Server error: Unable to retrieve specialities' });
    }
});

router.get('/filter/dates', async (req, res) => {
    try {
        const { facility_name, speciality_name, doctor_id } = req.query;

        const filter = { validForScheduling: true, isDelete: false };
        if (facility_name) filter.facility_name = facility_name;
        if (speciality_name) filter.speciality_names = { $in: [speciality_name] };
        if (doctor_id) filter.doctor_id = doctor_id;

        const availabilities = await DoctorAvailability.find(filter);
        const dates = [...new Set(availabilities.map(a => a.availability_date.toISOString().split('T')[0]))];

        res.status(200).json({ message: 'Dates retrieved successfully', dates });
    } catch (err) {
        console.error('Error retrieving dates:', err);
        res.status(500).json({ error: 'Server error: Unable to retrieve dates' });
    }
});
/**
 * Get filtered doctor availability based on the selected options.
 * The filter object dynamically adjusts based on user input.
 */
router.get('/filter', async (req, res) => {
    try {
        const {
            facility_name,
            speciality_name,
            doctor_id,
            availability_date
        } = req.query;

        const filter = { validForScheduling: true }; // Only consider valid availabilities

        if (facility_name) filter.facility_name = facility_name;
        if (speciality_name) filter.speciality_names = { $in: [speciality_name] };
        if (doctor_id) filter.doctor_id = doctor_id;
        if (availability_date) filter.availability_date = new Date(availability_date);

        const availabilities = await DoctorAvailability.find(filter)
            .populate('doctor_id', 'name');

        res.status(200).json({ message: 'Filtered doctor availability retrieved successfully', data: availabilities });
    } catch (err) {
        console.error('Error retrieving doctor availability:', err);
        res.status(500).json({ error: 'Server error: Unable to retrieve doctor availability' });
    }
});










router.post('/add-availability', async (req, res) => {
    const {
        availability_date,
        doctor_id,
        start_time,
        end_time,
        facility_name,
        speciality_names
    } = req.body;

    // Validate required fields
    if (!availability_date || !doctor_id || !start_time || !end_time || !facility_name || !speciality_names || speciality_names.length === 0) {
        return res.status(400).json({
            error: 'All fields (availability_date, doctor_id, start_time, end_time, facility_name, speciality_names) are required and speciality_names must not be empty.'
        });
    }

    try {
        // Check if an availability entry already exists for the same doctor, same facility, date, and time slot
        const existingEntry = await DoctorAvailability.findOne({
            doctor_id,
            facility_name, // Include facility_name in the match criteria
            availability_date: new Date(availability_date),
            $or: [
                { start_time: { $lt: new Date(end_time), $gte: new Date(start_time) } }, // Overlapping start time
                { end_time: { $gt: new Date(start_time), $lte: new Date(end_time) } }   // Overlapping end time
            ]
        });

        if (existingEntry) {
            return res.status(409).json({ error: 'An availability entry already exists for this doctor, facility, date, and time slot.' });
        }

        // Create a new availability entry
        const newAvailability = new DoctorAvailability({
            availability_date: new Date(availability_date),
            doctor_id,
            start_time: new Date(start_time),
            end_time: new Date(end_time),
            facility_name,
            speciality_names, // Accepts an array of specialities
            isDelete: false
        });

        // Save the entry to the database
        const savedAvailability = await newAvailability.save();
        res.status(201).json({
            message: 'New availability entry created successfully.',
            availability: savedAvailability
        });
    } catch (error) {
        console.error('Error creating availability entry:', error);
        res.status(500).json({ error: 'Server error: Unable to create availability entry.' });
    }
});





router.post('/add-appointment', async (req, res) => {
    const {
        patient_id,
        facility_name,
        doctor_id,
        speciality_name,
        appointment_date,
        appointment_start_time,
        appointment_end_time,
        appointment_scheduled_duration,
        medical_diagnose,
        medical_history,
        current_signs,
        additional_notes
    } = req.body;

    // Validate required fields
    if (
        !patient_id || !facility_name || !doctor_id || !speciality_name ||
        !appointment_date || !appointment_start_time || !appointment_end_time || !appointment_scheduled_duration
    ) {
        return res.status(400).json({
            error: 'All fields (patient_id, facility_name, doctor_id, speciality_name, appointment_date, appointment_start_time, appointment_end_time, appointment_scheduled_duration) must be provided.'
        });
    }

    try {
        // Check if the doctor has availability for this date, time, and facility
        const availability = await DoctorAvailability.findOne({
            doctor_id,
            facility_name,
            availability_date: new Date(appointment_date),
            validForScheduling: true
        });

        if (!availability) {
            return res.status(404).json({ error: 'No valid availability found for the selected doctor, date, and facility.' });
        }

        // Calculate the end time with break
        let breakDuration = 0;
        if (appointment_scheduled_duration === 15 || appointment_scheduled_duration === 30) {
            breakDuration = 5; // Add 5 minutes for 15-min or 30-min appointments
        } else if (appointment_scheduled_duration === 60) {
            breakDuration = 10; // Add 10 minutes for 60-min appointments
        }
        const appointmentEndTimeWithBreak = new Date(
            new Date(appointment_end_time).getTime() + breakDuration * 60000 // Add break time in milliseconds
        );

        // Create the appointment
        const newAppointment = new Appointment({
            patient_id,
            facility_name,
            doctor_id,
            speciality_name,
            appointment_date: new Date(appointment_date),
            appointment_start_time: new Date(appointment_start_time),
            appointment_end_time: new Date(appointment_end_time),
            appointment_end_time_with_break: appointmentEndTimeWithBreak, // Include the calculated end time with break
            appointment_scheduled_duration,
            appointment_original_duration: null, // Leave empty for later update
            medical_diagnose,
            medical_history,
            current_signs,
            additional_notes,
            isComplete: false,
            isDelete: false
        });

        const savedAppointment = await newAppointment.save();

        // Update `validForScheduling` in DoctorAvailability for the same date
        await DoctorAvailability.updateMany(
            {
                doctor_id,
                availability_date: new Date(appointment_date),
                facility_name: { $ne: facility_name } // Set `validForScheduling` to false for different facilities
            },
            { $set: { validForScheduling: false } }
        );

        // Ensure the `validForScheduling` for the selected facility remains true
        await DoctorAvailability.updateOne(
            {
                doctor_id,
                availability_date: new Date(appointment_date),
                facility_name
            },
            { $set: { validForScheduling: true } }
        );

        res.status(201).json({
            message: 'Appointment booked successfully.',
            appointment: savedAppointment
        });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Server error: Unable to book appointment.' });
    }
});








router.get('/generate-time-slots', async (req, res) => {
    try {
        const { doctor_id, facility_name, speciality_name, date, slot_duration } = req.query;

        // Validate required fields
        if (!doctor_id || !facility_name || !speciality_name || !date || !slot_duration) {
            return res.status(400).json({
                error: 'All fields (doctor_id, facility_name, speciality_name, date, slot_duration) are required.'
            });
        }

        // Parse inputs
        const parsedDate = new Date(date);
        const parsedSlotDuration = parseInt(slot_duration, 10);

        if (![15, 30, 60].includes(parsedSlotDuration)) {
            return res.status(400).json({
                error: 'Invalid slot duration. Allowed values are 15, 30, or 60 minutes.'
            });
        }

        // Fetch the doctor availability entry
        const availability = await DoctorAvailability.findOne({
            doctor_id,
            facility_name,
            speciality_names: { $in: [speciality_name] },
            availability_date: parsedDate,
            validForScheduling: true
        });

        if (!availability) {
            return res.status(404).json({
                error: 'No valid availability found for the selected doctor, facility, specialization, and date.'
            });
        }

        const { start_time, end_time } = availability;

        // Initialize variables
        let currentSlotStart = new Date(start_time);
        const endTime = new Date(end_time);
        let timeSlots = [];
        const availableSlots = [];

        // Helper function to get break duration based on appointment duration
        const getBreakDuration = (duration) => {
            if (duration === 15 || duration === 30) {
                return 5;
            } else if (duration === 60) {
                return 10;
            } else {
                return 0;
            }
        };

        // Helper function to regenerate time slots without break time included
        const regenerateTimeSlots = (start) => {
            const slots = [];
            let currentStart = new Date(start);

            while (currentStart < endTime) {
                const currentEnd = new Date(currentStart.getTime() + parsedSlotDuration * 60000);
                if (currentEnd > endTime) break;

                slots.push({ start: new Date(currentStart), end: new Date(currentEnd) });
                currentStart = currentEnd;
            }
            return slots;
        };

        // Generate all initial time slots without break time included
        timeSlots = regenerateTimeSlots(currentSlotStart);

        for (let i = 0; i < timeSlots.length; i++) {
            const slot = timeSlots[i];
            const { start, end } = slot;

            // Calculate the adjusted end time with break
            const breakDuration = getBreakDuration(parsedSlotDuration);
            const endWithBreak = new Date(end.getTime() + breakDuration * 60000);

            // Condition 1: Check for overlapping appointments for the same doctor
            const overlappingAppointments = await Appointment.find({
                doctor_id,
                appointment_date: parsedDate,
                appointment_start_time: { $lt: endWithBreak },
                appointment_end_time_with_break: { $gt: start }
            });

            if (overlappingAppointments.length > 0) {
                const latestOverlapEnd = overlappingAppointments.reduce(
                    (latest, appt) =>
                        new Date(appt.appointment_end_time_with_break) > latest
                            ? new Date(appt.appointment_end_time_with_break)
                            : latest,
                    endWithBreak
                );

                timeSlots = regenerateTimeSlots(latestOverlapEnd);
                i = -1; // Restart checking from the new time slots
                continue;
            }

            // Condition 2: Check room availability for the specialization in the facility
            const facility = await Facility.findOne({ name: facility_name, isDeleted: false });
            if (!facility) {
                return res.status(404).json({ error: 'Facility not found.' });
            }

            const roomsWithSpecialization = facility.rooms.filter((room) =>
                room.specializations.includes(speciality_name)
            );

            const overlappingSpecializationAppointments = await Appointment.find({
                facility_name,
                appointment_date: parsedDate,
                speciality_name,
                appointment_start_time: { $lt: endWithBreak },
                appointment_end_time_with_break: { $gt: start }
            });

            if (roomsWithSpecialization.length - overlappingSpecializationAppointments.length < 1) {
                const latestOverlapEnd = overlappingSpecializationAppointments.reduce(
                    (latest, appt) =>
                        new Date(appt.appointment_end_time_with_break) > latest
                            ? new Date(appt.appointment_end_time_with_break)
                            : latest,
                    endWithBreak
                );

                timeSlots = regenerateTimeSlots(latestOverlapEnd);
                i = -1; // Restart checking from the new time slots
                continue;
            }

            // Condition 3: Ensure at least 2 rooms remain available
            const totalRooms = facility.rooms.length;

            const overlappingAppointmentsInFacility = await Appointment.find({
                facility_name,
                appointment_date: parsedDate,
                appointment_start_time: { $lt: endWithBreak },
                appointment_end_time_with_break: { $gt: start }
            });

            if (totalRooms - overlappingAppointmentsInFacility.length < 2) {
                const latestOverlapEnd = overlappingAppointmentsInFacility.reduce(
                    (latest, appt) =>
                        new Date(appt.appointment_end_time_with_break) > latest
                            ? new Date(appt.appointment_end_time_with_break)
                            : latest,
                    endWithBreak
                );

                timeSlots = regenerateTimeSlots(latestOverlapEnd);
                i = -1; // Restart checking from the new time slots
                continue;
            }

            // If all conditions are satisfied, add the slot
            availableSlots.push(slot);
        }

        res.status(200).json({
            message: 'Available time slots retrieved successfully.',
            slots: availableSlots.map(slot => ({
                start: slot.start.toISOString(),
                end: slot.end.toISOString()
            })),
        });
    } catch (error) {
        console.error('Error generating time slots:', error);
        res.status(500).json({ error: 'Server error: Unable to generate time slots.' });
    }
});




















module.exports = router;
