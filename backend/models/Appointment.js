const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    facility_name: { type: String, required: true }, // Changed from facility_id to facility_name
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    speciality_name: { type: String, required: true }, // Changed from speciality_id to speciality_name
    appointment_date: { type: Date, required: true },
    appointment_scheduled_duration: { type: Number, required: true },
    appointment_original_duration: { type: Number },
    appointment_start_time: { type: Date, required: true },
    appointment_end_time: { type: Date, required: true }, // New field for appointment end time
    appointment_end_time_with_break: { type: Date, required: true },
    medical_diagnose: { type: String },
    medical_history: { type: String },
    current_signs: { type: String },
    additional_notes: { type: String },
    isComplete: { type: Boolean, default: false },
    isCancel: { type: Boolean, default: false},
    isDelete: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
