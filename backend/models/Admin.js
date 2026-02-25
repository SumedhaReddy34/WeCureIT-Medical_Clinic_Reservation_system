const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    password: {
        iv: { type: String, required: true },
        content: { type: String, required: true },
        tag: { type: String, required: true },
    }, 
    isDeleted: { type: Boolean, default: false } // Soft delete field
});

module.exports = mongoose.model('Admin', AdminSchema);