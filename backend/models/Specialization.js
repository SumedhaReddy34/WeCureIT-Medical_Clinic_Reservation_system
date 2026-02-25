// models/Specialization.js
const mongoose = require('mongoose');

const SpecializationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Specialization', SpecializationSchema);
