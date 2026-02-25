const jwt = require('jsonwebtoken'); // For generating JWT tokens
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Doctor = require('../../models/Doctor');


const secretKey = process.env.SECRET_KEY; // Secure key from environment variables
const jwtSecret = process.env.JWT_SECRET;

// Validate SECRET_KEY and JWT_SECRET
if (!secretKey || Buffer.from(secretKey, 'hex').length !== 32) {
    throw new Error('Invalid SECRET_KEY. Ensure it is a 32-byte (64-character hex) string.');
}
if (!jwtSecret) {
    throw new Error('JWT_SECRET is not set. Please define it in your environment variables.');
}

const decryptPassword = (encryptedData) => {
    const key = Buffer.from(secretKey, 'hex'); // Convert secret key to Buffer
    const { iv, content, tag } = encryptedData;
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
};

// Authenticate doctor login
router.post('/authenticate', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the doctor by email
    const doctor = await Doctor.findOne({ email, isDeleted: false });

    if (!doctor) {
      return res.status(401).json({ error: 'Invalid credentials' }); // Doctor not found
    }

    // Decrypt the stored password
    const decryptedPassword = decryptPassword(doctor.password);

    // Compare the decrypted password with the provided password
    if (decryptedPassword !== password) {
      return res.status(401).json({ error: 'Invalid credentials' }); // Password mismatch
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: doctor._id, email: doctor.email },
      jwtSecret,
      { expiresIn: '1h' } // Token expiration time
    );

    // Respond with the token
    res.status(200).json({
      message: 'Authentication successful',
      token,
      doctorId: doctor._id,
    });
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).json({ error: 'Server error: Unable to authenticate doctor' });
  }
});

module.exports = router;
