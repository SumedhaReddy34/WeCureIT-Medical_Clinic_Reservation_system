const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Doctor = require('../../models/Doctor');
//const authenticate = require('../middleware/authenticate'); // Import the middleware

const secretKey = process.env.SECRET_KEY; // Secure key from environment variables

// Validate SECRET_KEY
if (!secretKey || Buffer.from(secretKey, 'hex').length !== 32) {
    throw new Error('Invalid SECRET_KEY. Ensure it is a 32-byte (64-character hex) string.');
}

// Helper functions for encryption and decryption
const encryptPassword = (password) => {
    const key = Buffer.from(secretKey, 'hex'); // Convert secret key to Buffer
    const iv = crypto.randomBytes(16); // Generate a random initialization vector
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv); // Use the key as Buffer
    const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex'),
        tag: authTag.toString('hex'),
    };
};

const decryptPassword = (encryptedData) => {
    const key = Buffer.from(secretKey, 'hex'); // Convert secret key to Buffer
    const { iv, content, tag } = encryptedData;
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
};

// Get all doctors (with password decryption)
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find({ isDeleted: false });
        const decryptedDoctors = doctors.map((doctor) => {
            const doctorData = doctor.toObject();
            if (doctorData.password) {
                doctorData.password = decryptPassword(doctorData.password);
            }
            return doctorData;
        });
        res.json(decryptedDoctors);
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to retrieve doctors' });
    }
});

// Get the count of doctors (excluding soft-deleted ones)
router.get('/count', async (req, res) => {
    try {
        const count = await Doctor.countDocuments({ isDeleted: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to retrieve facility count', error: err.message });
    }
});

// Get a specific doctor by ID (excluding soft-deleted ones)
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ _id: req.params.id, isDeleted: false });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Decrypt the password before sending
        const doctorData = doctor.toObject();
        if (doctorData.password) {
            doctorData.password = decryptPassword(doctorData.password);
        }

        res.json(doctorData);
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to retrieve the doctor' });
    }
});

// Get a specific doctor by Name (excluding soft-deleted ones)
router.get('/name/:name', async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ name: req.params.name, isDeleted: false });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Decrypt the password before sending
        const doctorData = doctor.toObject();
        if (doctorData.password) {
            doctorData.password = decryptPassword(doctorData.password);
        }

        res.json(doctorData);
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to retrieve the doctor' });
    }
});

router.post('/',  async (req, res) => {
    const { name, specialty, email, degree, experience, password } = req.body;

    const errors = {};

    if (!name) errors.name = "Doctor's name is required";
    if (!specialty || specialty.length === 0) errors.specialty = "At least one specialty is required";
    if (!email) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Invalid email format";
    }
    if (!degree) errors.degree = "Degree is required";
    if (!experience) {
        errors.experience = "Experience is required";
    } else if (!/^\d+$/.test(experience)) {
        errors.experience = "Experience must be a number";
    }
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Check if a doctor with the same email already exists
        const existingDoctor = await Doctor.findOne({ email });

        if (existingDoctor) {
            if (existingDoctor.isDeleted) {
                // Reactivate the soft-deleted doctor
                existingDoctor.isDeleted = false;
                existingDoctor.name = name;
                existingDoctor.specialty = specialty;
                existingDoctor.degree = degree;
                existingDoctor.experience = experience;
                existingDoctor.password = encryptPassword(password); // Encrypt new password
                const reactivatedDoctor = await existingDoctor.save();
                return res.status(200).json({
                    message: 'Doctor reactivated successfully',
                    doctor: reactivatedDoctor,
                });
            } else {
                // If the doctor exists and is not soft-deleted, return an error
                return res.status(400).json({ message: 'A doctor with this email already exists' });
            }
        }

        // Encrypt the password and create a new doctor
        const encryptedPassword = encryptPassword(password);
        const doctor = new Doctor({ name, specialty, email, degree, experience, password: encryptedPassword });
        const savedDoctor = await doctor.save();
        res.status(201).json(savedDoctor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an existing doctor by ID (only if not soft deleted)
router.put('/:id', async (req, res) => {
    const { name, specialty, email, degree, experience, password } = req.body;

    const errors = {};

    if (!name) errors.name = "Doctor's name is required";
    if (!specialty || specialty.length === 0) errors.specialty = "At least one specialty is required";
    if (!email) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Invalid email format";
    }
    if (!degree) errors.degree = "Degree is required";
    if (!experience) {
        errors.experience = "Experience is required";
    } else if (!/^\d+$/.test(experience)) {
        errors.experience = "Experience must be a number";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const updateData = { name, specialty, email, degree, experience };

        // Encrypt the password if provided
        if (password) {
            updateData.password = encryptPassword(password);
        }

        const updatedDoctor = await Doctor.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found or has been deleted' });
        }

        res.json(updatedDoctor);
    } catch (err) {
        res.status(400).json({ message: 'Error updating the doctor', error: err.message });
    }
});

// Update an existing doctor by Name (only if not soft deleted)
router.put('/name/:name', async (req, res) => {
    const { name, specialty, email, degree, experience, password } = req.body;

    const errors = {};

    if (!name) errors.name = "Doctor's name is required";
    if (!specialty || specialty.length === 0) errors.specialty = "At least one specialty is required";
    if (!email) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Invalid email format";
    }
    if (!degree) errors.degree = "Degree is required";
    if (!experience) {
        errors.experience = "Experience is required";
    } else if (!/^\d+$/.test(experience)) {
        errors.experience = "Experience must be a number";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const updateData = { name, specialty, email, degree, experience };

        // Encrypt the password if provided
        if (password) {
            updateData.password = encryptPassword(password);
        }

        const updatedDoctor = await Doctor.findOneAndUpdate(
            { name: req.params.name, isDeleted: false },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found or has been deleted' });
        }

        res.json(updatedDoctor);
    } catch (err) {
        res.status(400).json({ message: 'Error updating the doctor', error: err.message });
    }
});

// Soft delete a doctor by ID
router.delete('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        
        if (!doctor || doctor.isDeleted) {
            return res.status(404).json({ message: 'Doctor not found or already deleted' });
        }

        doctor.isDeleted = true;
        await doctor.save();

        res.json({ message: 'Doctor soft deleted successfully', doctor });
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to delete the doctor' });
    }
});

// Soft delete a doctor by Name
router.delete('/name/:name', async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ name: req.params.name });

        if (!doctor || doctor.isDeleted) {
            return res.status(404).json({ message: 'Doctor not found or already deleted' });
        }

        doctor.isDeleted = true;
        await doctor.save();

        res.json({ message: 'Doctor soft deleted successfully', doctor });
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to delete the doctor' });
    }
});

module.exports = router;
