const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Admin = require('../../models/Admin'); // Import the Admin model
const jwt = require('jsonwebtoken'); // For token generation

const secretKey = process.env.SECRET_KEY; // Secure key from environment variables
const jwtSecret = process.env.JWT_SECRET; // JWT secret key

// Validate SECRET_KEY and JWT_SECRET
if (!secretKey || Buffer.from(secretKey, 'hex').length !== 32) {
    throw new Error('Invalid SECRET_KEY. Ensure it is a 32-byte (64-character hex) string.');
}
if (!jwtSecret) {
    throw new Error('JWT_SECRET is not set. Please define it in your environment variables.');
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

// Authentication API
router.post('/authenticate', async (req, res) => {
    try {
        const { user_id, password } = req.body;

        // Validate inputs
        if (!user_id || !password) {
            return res.status(400).json({ error: 'User ID and password are required' });
        }

        // Find the admin by user_id
        const admin = await Admin.findOne({ user_id, isDeleted: false });

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' }); // Admin not found
        }

        // Decrypt the stored password
        const decryptedPassword = decryptPassword(admin.password);

        // Compare the decrypted password with the provided password
        if (decryptedPassword !== password) {
            return res.status(401).json({ error: 'Invalid credentials' }); // Password mismatch
        }

        // Generate a JWT token
        const token = jwt.sign({ id: admin._id, user_id: admin.user_id }, jwtSecret, { expiresIn: '1h' });

        res.status(200).json({ message: 'Authentication successful', token });
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).json({ error: 'Server error: Unable to authenticate admin' });
    }
});

router.post('/add-admin', async (req, res) => {
    try {
        const { user_id, password } = req.body;

        // Validate inputs
        if (!user_id || !password) {
            return res.status(400).json({ error: 'User ID and password are required' });
        }

        // Check if an admin with the same user_id already exists
        const existingAdmin = await Admin.findOne({ user_id });
        if (existingAdmin) {
            return res.status(409).json({ error: 'Admin with this User ID already exists' });
        }

        // Encrypt the password
        const encryptedPassword = encryptPassword(password);

        // Create a new admin
        const newAdmin = new Admin({
            user_id,
            password: encryptedPassword,
            isDeleted: false,
        });

        // Save the new admin to the database
        await newAdmin.save();

        res.status(201).json({ message: 'Admin added successfully', admin: { user_id: newAdmin.user_id } });
    } catch (error) {
        console.error('Error adding new admin:', error);
        res.status(500).json({ error: 'Server error: Unable to add admin' });
    }
});


module.exports = router;
