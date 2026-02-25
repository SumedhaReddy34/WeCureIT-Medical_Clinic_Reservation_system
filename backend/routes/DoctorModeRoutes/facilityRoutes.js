const express = require('express');
const router = express.Router();
const Speciality = require('../../models/Specialization');

router.get('/facilities', async (req, res) => {
    try {
      const facilities = await FacilityModel.find(); // Replace with your Mongoose model
      res.status(200).json(facilities);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      res.status(500).json({ message: 'Failed to fetch facilities.' });
    }
  });

  module.exports = router;