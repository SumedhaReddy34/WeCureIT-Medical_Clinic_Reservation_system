const express = require('express');
const router = express.Router();
const Specialization = require('../../models/Specialization');

// Get all specializations
router.get('/', async (req, res) => {
    try {
        const specializations = await Specialization.find();
        res.json(specializations);
    } catch (err) {
        res.status(500).json({ message: 'Server Error: Unable to retrieve specializations' });
    }
});

module.exports = router;
