const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
        iv: { type: String, required: true },
        content: { type: String, required: true },
        tag: { type: String, required: true },
    }, // Encrypted password
    phone_number: { type: String, required: true }, // Added phone number field
    gender: {
        type: String,
        required: true,
    }, // Added gender field
    dob: { type: Date, required: true }, // Date of Birth
    credit_card_no: {
        iv: { type: String, required: true },
        content: { type: String, required: true },
        tag: { type: String, required: true },
    }, // Encrypted credit card number
    credit_card_exp_date: {
        iv: { type: String, required: true },
        content: { type: String, required: true },
        tag: { type: String, required: true },
    }, // Encrypted credit card expiration date
    credit_card_cvv: {
        iv: { type: String, required: true },
        content: { type: String, required: true },
        tag: { type: String, required: true },
    }, // Encrypted credit card CVV
    zip_code: { type: String, required: true },
    isDeleted: { type: Boolean, default: false }, // Soft delete field
});

module.exports = mongoose.model('Patient', PatientSchema);
