const express = require('express');
const router = express.Router();
const Specialization = require('../../models/Specialization'); // Import the model

// Fetch all specializations
router.get('/specializations', async (req, res) => {
  try {
    const specializations = await Specialization.find().select('name'); // Only fetch the 'name' field
    res.status(200).json({
      message: 'Specializations fetched successfully.',
      data: specializations,
    });
  } catch (error) {
    console.error('Error fetching specializations:', error.message);
    res.status(500).json({
      message: 'Server error: Unable to fetch specializations.',
      error: error.message,
    });
  }
});

module.exports = router;
