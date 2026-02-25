const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Patient = require('../../models/Patients'); // Adjust the path to the Patient model

const secretKey = process.env.SECRET_KEY;
const jwtSecret = process.env.JWT_SECRET;

// Validate SECRET_KEY and JWT_SECRET
if (!secretKey || Buffer.from(secretKey, 'hex').length !== 32) {
    throw new Error('Invalid SECRET_KEY. Ensure it is a 32-byte (64-character hex) string.');
}
if (!jwtSecret) {
    throw new Error('JWT_SECRET is not set. Please define it in your environment variables.');
}

// Helper functions for encryption and decryption
const encryptData = (data) => {
    const key = Buffer.from(secretKey, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex'),
        tag: authTag.toString('hex'),
    };
};

const decryptData = (encryptedData) => {
    const key = Buffer.from(secretKey, 'hex');
    const { iv, content, tag } = encryptedData;
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
};

// Add new patient
router.post('/add-patient', async (req, res) => {
    const {
        full_name,
        email,
        password,
        phone_number,
        gender,
        dob,
        credit_card_no,
        credit_card_exp_date,
        credit_card_cvv,
        zip_code,
    } = req.body;

    try {
        // Check if a patient with the same email already exists
        const existingPatient = await Patient.findOne({ email });

        if (existingPatient) {
            if (existingPatient.isDeleted) {
                 //Reactivate the soft-deleted patient
                existingPatient.isDeleted = false;
               existingPatient.full_name = full_name;
                existingPatient.password = encryptData(password); // Encrypt the new password
                existingPatient.phone_number = phone_number;
                existingPatient.gender = gender;
                existingPatient.dob = dob;
                existingPatient.credit_card_no = encryptData(credit_card_no);
                existingPatient.credit_card_exp_date = encryptData(credit_card_exp_date);
                existingPatient.credit_card_cvv = encryptData(credit_card_cvv);
                existingPatient.zip_code = zip_code;

                const reactivatedPatient = await existingPatient.save();
               return res.status(200).json({
                   message: 'Patient reactivated successfully',
                   patient: reactivatedPatient,
              });
            } else {
                // If the patient exists and is not soft-deleted, return an error
                return res.status(400).json({ error: 'A patient with this email already exists' });
            }
        }

        // Encrypt sensitive fields
        const encryptedPassword = encryptData(password);
        const encryptedCardNumber = encryptData(credit_card_no);
        const encryptedCardExpDate = encryptData(credit_card_exp_date);
        const encryptedCardCVV = encryptData(credit_card_cvv);

        // Create a new patient
        const newPatient = new Patient({
            full_name,
            email,
            password: encryptedPassword,
            phone_number,
            gender,
            dob,
            credit_card_no: encryptedCardNumber,
            credit_card_exp_date: encryptedCardExpDate,
            credit_card_cvv: encryptedCardCVV,
            zip_code,
        });

        // Save the new patient to the database
        const savedPatient = await newPatient.save();
        res.status(201).json({ message: 'Patient added successfully', patient: savedPatient });
    } catch (err) {
        console.error('Error adding patient:', err);
        res.status(500).json({ error: 'Server error: Unable to add patient' });
    }
});

// Get a single patient by ID (with decryption)
router.get('/get-patient/:id', async (req, res) => {
    try {
        // Find patient by ID
        const patient = await Patient.findOne({ _id: req.params.id, isDeleted: false });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found or has been deleted' });
        }

        // Decrypt sensitive fields
        const decryptedPassword = decryptData(patient.password);
        const decryptedCardNumber = decryptData(patient.credit_card_no);
        const decryptedCardExpDate = decryptData(patient.credit_card_exp_date);
        const decryptedCardCVV = decryptData(patient.credit_card_cvv);

        // Prepare the patient data for response
        const patientData = patient.toObject();
        patientData.password = decryptedPassword;
        patientData.credit_card_no = decryptedCardNumber;
        patientData.credit_card_exp_date = decryptedCardExpDate;
        patientData.credit_card_cvv = decryptedCardCVV;

        res.json({ message: 'Patient retrieved successfully', patient: patientData });
    } catch (err) {
        console.error('Error retrieving patient:', err);
        res.status(500).json({ error: 'Server error: Unable to retrieve patient' });
    }
});

// Edit patient information using ID
router.put('/edit-patient/:id', async (req, res) => {
    const {
        full_name,
        password,
        phone_number,
        gender,
        dob,
        credit_card_no,
        credit_card_exp_date,
        credit_card_cvv,
        zip_code,
        email
    } = req.body;

    try {
        if (email) {
            const existingPatient = await Patient.findOne({ email, isDeleted: false, _id: { $ne: req.params.id } });
            if (existingPatient) {
                return res.status(400).json({ error: 'Email already exists, please try another email' });
            }
        }
        // Find patient by ID
        const patient = await Patient.findOne({ _id: req.params.id, isDeleted: false });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Update patient information
        if (full_name) patient.full_name = full_name;
        if (password) patient.password = encryptData(password);
        if (phone_number) patient.phone_number = phone_number;
        if (gender) patient.gender = gender;
        if (dob) patient.dob = dob;
        if (credit_card_no) patient.credit_card_no = encryptData(credit_card_no);
        if (credit_card_exp_date) patient.credit_card_exp_date = encryptData(credit_card_exp_date);
        if (credit_card_cvv) patient.credit_card_cvv = encryptData(credit_card_cvv);
        if (zip_code) patient.zip_code = zip_code;
        if (email) patient.email = email;

        const updatedPatient = await patient.save();
        res.json({ message: 'Patient updated successfully', patient: updatedPatient });
    } catch (err) {
        console.error('Error updating patient:', err);
        res.status(500).json({ error: 'Server error: Unable to update patient' });
    }
});

// Get a single patient by email (with decryption)
router.get('/get-patient/:email', async (req, res) => {
    try {
        // Find patient by email
        const patient = await Patient.findOne({ email: req.params.email, isDeleted: false });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found or has been deleted' });
        }

        // Decrypt sensitive fields
        const decryptedPassword = decryptData(patient.password);
        const decryptedCardNumber = decryptData(patient.credit_card_no);
        const decryptedCardExpDate = decryptData(patient.credit_card_exp_date);
        const decryptedCardCVV = decryptData(patient.credit_card_cvv);

        // Prepare the patient data for response
        const patientData = patient.toObject();
        patientData.password = decryptedPassword;
        patientData.credit_card_no = decryptedCardNumber;
        patientData.credit_card_exp_date = decryptedCardExpDate;
        patientData.credit_card_cvv = decryptedCardCVV;

        res.json({ message: 'Patient retrieved successfully', patient: patientData });
    } catch (err) {
        console.error('Error retrieving patient:', err);
        res.status(500).json({ error: 'Server error: Unable to retrieve patient' });
    }
});

// Edit patient information using email
router.put('/edit-patient/:email', async (req, res) => {
    const {
        full_name,
        password,
        gender,
        dob,
        credit_card_no,
        credit_card_exp_date,
        credit_card_cvv,
        zip_code,
    } = req.body;

    try {
        // Find patient by email
        const patient = await Patient.findOne({ email: req.params.email, isDeleted: false });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Update patient information
        if (full_name) patient.full_name = full_name;
        if (password) patient.password = encryptData(password);
        if (gender) patient.gender = gender;
        if (dob) patient.dob = dob;
        if (credit_card_no) patient.credit_card_no = encryptData(credit_card_no);
        if (credit_card_exp_date) patient.credit_card_exp_date = encryptData(credit_card_exp_date);
        if (credit_card_cvv) patient.credit_card_cvv = encryptData(credit_card_cvv);
        if (zip_code) patient.zip_code = zip_code;

        const updatedPatient = await patient.save();
        res.json({ message: 'Patient updated successfully', patient: updatedPatient });
    } catch (err) {
        console.error('Error updating patient:', err);
        res.status(500).json({ error: 'Server error: Unable to update patient' });
    }
});

// Soft delete a patient using email
router.delete('/delete-patient/:email', async (req, res) => {
    try {
        // Find patient by email
        const patient = await Patient.findOne({ email: req.params.email });
        if (!patient || patient.isDeleted) {
            return res.status(404).json({ error: 'Patient not found or already deleted' });
        }

        // Soft delete the patient
        patient.isDeleted = true;
        await patient.save();

        res.json({ message: 'Patient deleted successfully', patient });
    } catch (err) {
        console.error('Error deleting patient:', err);
        res.status(500).json({ error: 'Server error: Unable to delete patient' });
    }
});

// Authenticate patient login
router.post('/authenticate', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate inputs
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
  
      // Find the patient by email
      const patient = await Patient.findOne({ email, isDeleted: false });
  
      if (!patient) {
        return res.status(401).json({ error: 'Invalid credentials' }); // Patient not found
      }
  
      // Decrypt the stored password
      const decryptedPassword = decryptData(patient.password);
  
      // Compare the decrypted password with the provided password
      if (decryptedPassword !== password) {
        return res.status(401).json({ error: 'Invalid credentials' }); // Password mismatch
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { id: patient._id, email: patient.email },
        jwtSecret,
        { expiresIn: '1h' }
      );
  
      // Include patientId in the response
      res.status(200).json({
        message: 'Authentication successful',
        token,
        patientId: patient._id,
      });
    } catch (error) {
      console.error('Error during authentication:', error);
      res.status(500).json({ error: 'Server error: Unable to authenticate patient' });
    }
  });
  

module.exports = router;