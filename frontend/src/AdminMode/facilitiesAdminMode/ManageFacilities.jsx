// ManageFacilities.js
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AddFacilityForm from './AddFacilityForm';
import FacilityGrid from './FacilityGrid';
import Modal from '../components/Modal';

function ManageFacilities() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [refresh, setRefresh] = useState(0); // Added refresh state

  // Function to open the modal and pass selected facility data
  //const handleEditFacility = (facility) => {
  //  setSelectedFacility(facility);
  //  setIsModalOpen(true);
  //};

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFacility(null);
  };

  // Function to handle save success when adding or editing a facility
  const handleAddFacilitySuccess = () => {
    setRefresh(refresh + 1); // Update refresh state
    setIsModalOpen(false); // Close the modal if open
    setSelectedFacility(null); // Reset selected facility
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      <div className="flex w-full min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 px-8 py-4 w-full">
          {/* Form and Facilities Grid */}
          <div className="flex flex-col gap-6">
            {/* Add Facility Form */}
            <AddFacilityForm onSaveSuccess={handleAddFacilitySuccess} />
            {/* Facilities Grid */}
            <FacilityGrid
              refresh={refresh} // Pass refresh prop
            />
          </div>
        </main>
      </div>

      {/* Modal to show the AddFacilityForm with pre-filled data */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <AddFacilityForm
          facility={selectedFacility}
          onCancel={handleCloseModal}
          onSaveSuccess={handleAddFacilitySuccess} // Use same handler
        />
      </Modal>
    </div>
  );
}

export default ManageFacilities;
