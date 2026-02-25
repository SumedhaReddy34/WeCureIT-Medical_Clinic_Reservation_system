import React, { useState } from 'react';
import AddDoctorForm from './AddDoctorForm';
import DoctorGrid from './DoctorGrid';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';

function ManageDoctors() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [doctorAdded, setDoctorAdded] = useState(false); // New state variable

  // Function to open the modal for editing a doctor
  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  // Function to close the edit modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  // Function to save the doctor data
  const handleSaveDoctor = (doctorData) => {
    if (selectedDoctor) {
      console.log('Edited Doctor:', doctorData);
    } else {
      console.log('New Doctor:', doctorData);
    }
    setDoctorAdded(!doctorAdded); // Toggle to trigger DoctorGrid update
    handleCloseModal();
  };

  // Show discard changes confirmation
  //const handleDiscardChanges = () => {
  //  setIsModalOpen(true);
  //};

  // Confirm discard changes and close both modals
  const handleConfirmDiscard = () => {
    setIsDiscardModalOpen(false); // Close discard confirmation modal
    handleCloseModal(); // Close the main doctor form modal
  };

  // Close the discard confirmation modal
  const handleCloseDiscardModal = () => {
    setIsDiscardModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      <div className="flex w-full min-h-screen bg-gray-50">
        <Sidebar className="w-[289px] max-w-[289px] max-md:w-[200px] min-w-[150px]" />
        <main className="flex-1 px-8 py-4 w-full">
          <div className="flex flex-col gap-2">
            <div className="min-w-[700px] max-w-[1000px]">
              {/* For adding a new doctor */}
              <AddDoctorForm onSave={handleSaveDoctor} isEditMode={false} />
            </div>
            <div className="min-w-[900px] max-w-[1200px]">
              <DoctorGrid onEdit={handleEditDoctor} doctorAdded={doctorAdded} /> {/* Pass doctorAdded */}
            </div>
          </div>
        </main>
      </div>

      {/* Modal for AddDoctorForm (Editing Mode) */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedDoctor && (
          <AddDoctorForm
            doctor={selectedDoctor}
            onSave={handleSaveDoctor}
            onCancel={handleCloseModal}
            isEditMode={true} // Correctly passing isEditMode for edit case
          />
        )}
      </Modal>

      {/* Discard Confirmation Modal */}
      {isDiscardModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <p className="mb-4">Are you sure you want to discard the unsaved changes?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
                onClick={handleCloseDiscardModal}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                onClick={handleConfirmDiscard} // Closes both modals when confirmed
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageDoctors;
