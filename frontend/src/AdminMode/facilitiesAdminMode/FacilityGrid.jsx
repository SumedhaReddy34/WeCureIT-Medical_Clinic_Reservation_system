// FacilityGrid.js
import React, { useState, useEffect } from 'react';
import AddFacilityForm from './AddFacilityForm';
import Modal from '../components/Modal';
import axios from 'axios';

function FacilityGrid({ refresh }) {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [facilityToRemove, setFacilityToRemove] = useState(null);

  // Fetch facilities from the backend
  const fetchFacilities = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/facilities');
      setFacilities(response.data);
    } catch (error) {
      console.error("Error fetching facilities:", error);
    }
  };

  useEffect(() => {
    fetchFacilities(); // Fetch facilities on component mount and when 'refresh' changes
  }, [refresh]);

  const handleEdit = (facility) => {
    setSelectedFacility(facility); // Set the selected facility for editing
    setIsModalOpen(true); // Open the modal for editing
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal for editing
    setSelectedFacility(null); // Clear selected facility
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchFacilities(); // Refetch the facilities to reflect changes
  };

  // Handle remove facility button click
  const handleRemoveClick = (facility) => {
    setFacilityToRemove(facility); // Set the facility to remove
    setIsRemoveModalOpen(true); // Open the confirmation modal
  };

  // Confirm removal of the facility
  const handleConfirmRemove = async () => {
    console.log(`Removing facility: ${facilityToRemove.name}`);
    try {
      await axios.delete(`http://localhost:4000/api/facilities/${facilityToRemove._id}`);
      console.log("Facility removed successfully");
      setIsRemoveModalOpen(false); // Close the confirmation modal
      setFacilityToRemove(null); // Clear the facility to remove
      fetchFacilities(); // Refresh the list of facilities
    } catch (error) {
      console.error("Error removing facility:", error);
    }
  };

  // Close the remove confirmation modal
  const handleCloseRemoveModal = () => {
    setIsRemoveModalOpen(false); // Close the confirmation modal
    setFacilityToRemove(null); // Clear the facility to remove
  };

  return (
    <div className="flex">
      <div className="mt-8 bg-white p-6 shadow rounded-lg w-full max-w-[800px]">
        <h3 className="text-lg font-medium text-gray-900 mb-4">All Facilities</h3>
        <ul className="divide-y divide-gray-200">
          {facilities.map((facility) => (
            <li key={facility._id} className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-gray-900">{facility.name}</span>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-full hover:bg-indigo-600"
                  onClick={() => handleEdit(facility)}  // Open modal with facility data
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-full hover:bg-red-600"
                  onClick={() => handleRemoveClick(facility)}  // Open confirmation modal with facility data
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal for editing the facility */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <AddFacilityForm
          facility={selectedFacility}
          onCancel={handleCloseModal}
          onSaveSuccess={handleSaveSuccess}
        />
      </Modal>

      {/* Modal for confirming facility removal */}
      {isRemoveModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <p className="text-lg mb-4">Are you sure you want to remove <strong>{facilityToRemove?.name}</strong>?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-full"
                onClick={handleCloseRemoveModal}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                onClick={handleConfirmRemove}
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

export default FacilityGrid;
