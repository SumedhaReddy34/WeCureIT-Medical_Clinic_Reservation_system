import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddDoctorForm({ doctor, onSave, onCancel, onDoctorAdded }) {
  const [doctorName, setDoctorName] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [email, setEmail] = useState("");
  const [degree, setDegree] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("");
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [specialtiesOptions, setSpecialtiesOptions] = useState([]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/specializations');
        setSpecialtiesOptions(response.data);
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };

    fetchSpecialties();

    if (doctor) {
      setDoctorName(doctor.name);
      setSelectedSpecialties(doctor.specialty || []);
      setEmail(doctor.email || "");
      setDegree(doctor.degree || "");
      setPassword("");
      setExperience(doctor.experience || "");
    } else {
      resetForm();
    }
  }, [doctor]);

  const resetForm = () => {
    setDoctorName("");
    setSelectedSpecialties([]);
    setEmail("");
    setDegree("");
    setPassword("");
    setExperience("");
    setErrors({});
  };

  const handleSpecialtyChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedSpecialties.includes(selectedValue)) {
      setSelectedSpecialties([...selectedSpecialties, selectedValue]);
    }
    event.target.value = "";
  };

  const removeSpecialty = (specialty) => {
    setSelectedSpecialties(selectedSpecialties.filter((item) => item !== specialty));
  };

  const handleSave = async () => {
    const validationErrors = {};
    if (!doctorName) validationErrors.doctorName = "Doctor's name is required";
    if (selectedSpecialties.length === 0) validationErrors.specialties = "At least one specialty is required";
    if (!email) validationErrors.email = "Email is required";
    if (!degree) validationErrors.degree = "Degree is required";
    if (!password && !doctor) validationErrors.password = "Password is required";
    if (!experience) validationErrors.experience = "Experience is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const doctorData = {
      name: doctorName,
      specialty: selectedSpecialties,
      email,
      degree,
      password: doctor ? undefined : password, // Send plaintext password for new doctors
      experience,
    };

    try {
      if (doctor) {
        // Update existing doctor
        await axios.put(`http://localhost:4000/api/doctors/${doctor._id}`, doctorData);
      } else {
        // Add new doctor
        await axios.post('http://localhost:4000/api/doctors', doctorData);
        resetForm();
        if (onDoctorAdded) onDoctorAdded(); // Call to refresh doctor grid after addition
      }
      onSave(doctorData); // Close modal and refresh doctor grid
    } catch (error) {
      if (error.response && error.response.data) {
        // Check for specific backend errors
        if (error.response.data.message && error.response.data.message.includes("email already exists")) {
          // Set email error message
          setErrors({ email: "This email is already registered." });
        } else if (error.response.data.errors) {
          // Map other backend validation errors to the frontend
          setErrors(error.response.data.errors);
        } else {
          console.error("Unexpected error response:", error.response.data);
        }
      } else {
        console.error("Error saving doctor:", error);
      }
    }
    
  };

  const handleDiscardChanges = () => {
    setIsDiscardModalOpen(true);
  };

  const handleCloseDiscardModal = () => {
    setIsDiscardModalOpen(false);
  };

  const handleConfirmDiscard = async () => {
    handleCloseDiscardModal();
    if (doctor) {
      try {
        const response = await axios.get(`http://localhost:4000/api/doctors/${doctor._id}`);
        const { name, specialty, email, degree, experience } = response.data;
        setDoctorName(name);
        setSelectedSpecialties(specialty);
        setEmail(email);
        setDegree(degree);
        setExperience(experience);
        setPassword("");
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      }
    } else {
      resetForm();
    }
    onCancel();
  };

  return (
    <>
      <section className="flex flex-col bg-white border rounded-lg p-8 w-full">
        <form className="grid grid-cols-1 gap-4 mb-6">
          <div>
            <label className="block mb-2">Doctor's Name</label>
            <input
              type="text"
              className={`w-full p-2 border rounded-md ${errors.doctorName ? 'border-red-500' : ''}`}
              placeholder="Name"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              disabled={!!doctor} // Disable field in edit mode
            />
            {errors.doctorName && <p className="text-red-500 text-sm mt-1">{errors.doctorName}</p>}
          </div>

          <div>
            <label className="block mb-2">Specialties</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedSpecialties.map((specialty, index) => (
                <div key={index} className="flex items-center bg-indigo-100 text-indigo-700 p-2 rounded-full">
                  <span>{specialty}</span>
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => removeSpecialty(specialty)}
                  >
                    &#x2715;
                  </button>
                </div>
              ))}
            </div>
            <select
              value=""
              onChange={handleSpecialtyChange}
              className={`w-full p-2 border rounded-md text-gray-400 ${errors.specialties ? 'border-red-500' : ''}`}
            >
              <option value="" disabled>Select Specialization</option>
              {specialtiesOptions.map((specialty, index) => (
                <option key={index} value={specialty.name}>
                  {specialty.name}
                </option>
              ))}
            </select>
            {errors.specialties && <p className="text-red-500 text-sm mt-1">{errors.specialties}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Doctor's Email</label>
              <input
                type="email"
                className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email:undefined}));
                }}

                disabled={!!doctor} // Disable field in edit mode
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block mb-2">Degree</label>
              <input
                type="text"
                className={`w-full p-2 border rounded-md ${errors.degree ? 'border-red-500' : ''}`}
                placeholder="Degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              />
              {errors.degree && <p className="text-red-500 text-sm mt-1">{errors.degree}</p>}
            </div>

            <div>
              <label className="block mb-2">{doctor ? 'Change Password' : 'Set Password'}</label>
              <input
                type="password"
                className={`w-full p-2 border rounded-md ${!doctor && errors.password ? 'border-red-500' : ''}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!doctor && errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block mb-2">Experience (in years)</label>
              <input
                type="text"
                className={`w-full p-2 border rounded-md ${errors.experience ? 'border-red-500' : ''}`}
                placeholder="Experience (e.g., 5)"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
              {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
            </div>
          </div>
        </form>
        
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full"
            onClick={handleSave}
          >
            {doctor ? 'Save Changes' : 'Add Doctor'}
          </button>
          {doctor && (
            <button
              type="button"
              className="px-4 py-2 bg-red-500 hover:bg-red-800 text-white rounded-full"
              onClick={handleDiscardChanges}
            >
              Discard Changes
            </button>
          )}
        </div>
      </section>

      {isDiscardModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <p className="mb-4">Are you sure you want to discard the unsaved changes?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-full"
                onClick={handleCloseDiscardModal}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                onClick={handleConfirmDiscard}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddDoctorForm;
