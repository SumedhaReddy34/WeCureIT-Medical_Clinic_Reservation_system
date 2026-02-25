import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorCard from './DoctorCard';
import AddDoctorForm from './AddDoctorForm';
import Modal from '../components/Modal';

function DoctorGrid({ doctorAdded }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch doctors from the backend
  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/doctors');
      setDoctors(response.data); // Directly set doctors from backend
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [doctorAdded]); // Re-fetch when doctorAdded changes

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleSaveDoctor = async (doctorData) => {
    try {
      if (selectedDoctor) {
        // Update existing doctor
        await axios.put(`http://localhost:4000/api/doctors/${selectedDoctor._id}`, doctorData);
      } else {
        // Add new doctor
        await axios.post('http://localhost:4000/api/doctors', doctorData);
      }
      fetchDoctors(); // Refresh the list of doctors immediately
    } catch (error) {
      console.error("Error saving doctor:", error);
    } finally {
      handleCloseModal();
    }
  };

  const handleRemoveDoctor = async (doctorId) => {
    try {
      await axios.delete(`http://localhost:4000/api/doctors/${doctorId}`);
      fetchDoctors(); // Refresh the list of doctors after deletion
    } catch (error) {
      console.error("Error removing doctor:", error);
    }
  };

  return (
    <section className="mt-8">
      <h3 className="text-xl font-medium mb-6">All Doctors</h3>
      <div className="grid grid-cols-4 gap-6">
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor._id}
            doctor={doctor}
            onEdit={() => handleEdit(doctor)}
            onRemove={() => handleRemoveDoctor(doctor._id)}
          />
        ))}
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <AddDoctorForm
            doctor={selectedDoctor}
            onSave={handleSaveDoctor}
            onCancel={handleCloseModal}
            onDoctorAdded={fetchDoctors} // Call fetchDoctors after adding a new doctor
          />
        </Modal>
      )}
    </section>
  );
}

export default DoctorGrid;
