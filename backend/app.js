const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json()); // To handle JSON data in requests

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Import Routes
const facilityRoutes = require('./routes/AdminModeRoutes/facilityRoutes');
const doctorRoutes = require('./routes/AdminModeRoutes/doctorRoutes');
const specializationRoutes = require('./routes/AdminModeRoutes/specializationRoutes'); // Add Specialization routes
const adminLoginRoutes = require('./routes/AdminModeRoutes/adminLoginRoutes'); // Add Admin Login routes
const adminStat = require('./routes/AdminModeRoutes/statCard'); 

const PatientLoginRoutes = require('./routes/PatientModeRoutes/PatientLoginRoutes');
const bookAppointment = require('./routes/PatientModeRoutes/bookAppointment');
const myProfile = require('./routes/PatientModeRoutes/myProfile');


const DoctorLogin = require('./routes/DoctorModeRoutes/DoctorLogin')
const doctorStat = require('./routes/DoctorModeRoutes/doctorStat'); 


const doctorAvailabilityRoutes = require('./routes/DoctorModeRoutes/doctorAvailabilityRoutes');
const appointmentRoutes = require("./routes/DoctorModeRoutes/appointmentRoutes");
const facilityRoutesDoctorMode = require("./routes/DoctorModeRoutes/facilityRoutes");
const specialityRoutes = require("./routes/DoctorModeRoutes/specialityRoutes");
const patientRoutes = require("./routes/DoctorModeRoutes/patientRoutes");



// Routes
app.use('/api/facilities', facilityRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/specializations', specializationRoutes); // Use Specialization routes
app.use('/api/admin', adminLoginRoutes); // Use Admin Login routes
app.use('/api/adminstat',adminStat);




app.use('/api/patients', PatientLoginRoutes);
app.use('/api/bookAppointment', bookAppointment);
app.use('/api/myprofile', myProfile);

app.use('/api/doctorlogin', DoctorLogin);
app.use('/api/doctorStat', doctorStat);


app.use('/api/doctor-availability', doctorAvailabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/facility", facilityRoutesDoctorMode);
app.use("/api/speciality", specialityRoutes);
app.use("/api", patientRoutes);


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
