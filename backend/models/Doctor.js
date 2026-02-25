const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: [String],
    email: { type: String, required: true, unique: true },
    degree: String,
    experience: String,
    password: {
        iv: { type: String, required: true },
        content: { type: String, required: true },
        tag: { type: String, required: true },
    }, 
    isDeleted: { type: Boolean, default: false } // Soft delete field
});

module.exports = mongoose.model('Doctor', DoctorSchema);
