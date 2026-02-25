const express = require('express');
const router = express.Router();
const Facility = require('../../models/Facility');
const Specialization = require('../../models/Specialization');
//const authenticate = require('../middleware/authenticate');

// Helper function to validate and set specializations
async function validateAndSetSpecializations(rooms) {
    // Fetch all valid specialization names from the database
    const validSpecializations = await Specialization.find().select('name -_id');
    const validSpecializationNames = validSpecializations.map(spec => spec.name);

    rooms.forEach(room => {
        if (room.specializations && room.specializations.length > 0) {
            // Check each specialization in the room
            const invalidSpecializations = room.specializations.filter(
                spec => !validSpecializationNames.includes(spec)
            );

            // If there are any invalid specializations, throw an error
            if (invalidSpecializations.length > 0) {
                throw new Error(
                    `Invalid specialization(s) found in room ${room.id}: ${invalidSpecializations.join(", ")}`
                );
            }
        } else {
            // If no specializations are provided, assign "General Physician"
            room.specializations = ["General Physician"];
        }
    });

    return rooms; // Return the rooms with validated (or defaulted) specializations
}

// Get all facilities (excluding soft-deleted ones)
router.get('/', async (req, res) => {
    try {
        const facilities = await Facility.find({ isDeleted: false });
        res.json(facilities);
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to retrieve facilities' });
    }
});

// Get a specific facility by ID (only if not soft-deleted)
router.get('/:id', async (req, res) => {
    try {
        const facility = await Facility.findOne({ _id: req.params.id, isDeleted: false });
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }
        res.json(facility);
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to retrieve the facility' });
    }
});

// Get a specific facility by Name (only if not soft-deleted)
router.get('/name/:name', async (req, res) => {
    try {
        const facility = await Facility.findOne({ name: req.params.name, isDeleted: false });
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }
        res.json(facility);
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to retrieve the facility' });
    }
});

// Add a new facility or reactivate a soft-deleted one
router.post('/',  async (req, res) => {
    const { name, rooms } = req.body;

    // Validation
    if (!name || !rooms || rooms.length === 0) {
        return res.status(400).json({ message: 'Name and at least one room are required' });
    }

    try {
        // Check if a facility with the same name exists
        const existingFacility = await Facility.findOne({ name });

        if (existingFacility) {
            if (existingFacility.isDeleted) {
                // If the facility is soft-deleted, reactivate it and validate rooms
                existingFacility.isDeleted = false;
                existingFacility.rooms = await validateAndSetSpecializations(rooms);
                const reactivatedFacility = await existingFacility.save();
                return res.status(200).json({
                    message: 'Facility reactivated successfully',
                    facility: reactivatedFacility
                });
            } else {
                // If the facility exists and is not soft-deleted, return an error
                return res.status(400).json({ message: 'A facility with this name already exists' });
            }
        }

        // Validate rooms and create a new facility if no errors
        const validatedRooms = await validateAndSetSpecializations(rooms);
        const facility = new Facility({ name, rooms: validatedRooms });
        const savedFacility = await facility.save();
        res.status(201).json(savedFacility);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an existing facility by ID (only if not soft-deleted)
router.put('/:id', async (req, res) => {
    const { name, rooms } = req.body;

    if (!name || !rooms || rooms.length === 0) {
        return res.status(400).json({ message: 'Name and at least one room are required' });
    }

    try {
        const validatedRooms = await validateAndSetSpecializations(rooms);
        const updatedFacility = await Facility.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { name, rooms: validatedRooms },
            { new: true, runValidators: true }
        );

        if (!updatedFacility) {
            return res.status(404).json({ message: 'Facility not found or has been deleted' });
        }

        res.json(updatedFacility);
    } catch (err) {
        res.status(400).json({ message: 'Error updating the facility', error: err.message });
    }
});

// Update an existing facility by Name (only if not soft-deleted)
router.put('/name/:name', async (req, res) => {
    const { name, rooms } = req.body;

    if (!name || !rooms || rooms.length === 0) {
        return res.status(400).json({ message: 'Name and at least one room are required' });
    }

    try {
        const validatedRooms = await validateAndSetSpecializations(rooms);
        const updatedFacility = await Facility.findOneAndUpdate(
            { name: req.params.name, isDeleted: false },
            { name, rooms: validatedRooms },
            { new: true, runValidators: true }
        );

        if (!updatedFacility) {
            return res.status(404).json({ message: 'Facility not found or has been deleted' });
        }

        res.json(updatedFacility);
    } catch (err) {
        res.status(400).json({ message: 'Error updating the facility', error: err.message });
    }
});

// Soft delete a facility by ID
router.delete('/:id', async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);

        if (!facility || facility.isDeleted) {
            return res.status(404).json({ message: 'Facility not found or already deleted' });
        }

        facility.isDeleted = true;
        await facility.save();

        res.json({ message: 'Facility soft deleted successfully', facility });
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to delete the facility' });
    }
});

// Soft delete a facility by Name
router.delete('/name/:name', async (req, res) => {
    try {
        const facility = await Facility.findOne({ name: req.params.name });

        if (!facility || facility.isDeleted) {
            return res.status(404).json({ message: 'Facility not found or already deleted' });
        }

        facility.isDeleted = true;
        await facility.save();

        res.json({ message: 'Facility soft deleted successfully', facility });
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to delete the facility' });
    }
});

// Get the count of facilities (excluding soft-deleted ones)
router.get('/count', async (req, res) => {
    try {
        const count = await Facility.countDocuments({ isDeleted: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to retrieve facility count', error: err.message });
    }
});


module.exports = router;
