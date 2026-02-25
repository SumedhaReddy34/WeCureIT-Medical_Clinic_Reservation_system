const mongoose = require('mongoose');

const DoctorAvailabilitySchema = new mongoose.Schema({
    availability_date: { type: Date, required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    facility_name: { type: String, required: true },
    speciality_names: { type: [String], required: true },
    validForScheduling: { type: Boolean, default: true }, // Field for scheduling validity
    isDelete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('DoctorAvailability', DoctorAvailabilitySchema);
