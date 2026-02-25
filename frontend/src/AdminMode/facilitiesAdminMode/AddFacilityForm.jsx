import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddRoom from './AddRoom';  // Import the AddRoom component

function AddFacilityForm({ facility, onCancel, onSaveSuccess }) {  
  const [rooms, setRooms] = useState([]);
  const [facilityName, setFacilityName] = useState("");
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [roomIdCounter, setRoomIdCounter] = useState(1); // Room ID counter to generate unique IDs

  useEffect(() => {
    if (facility) {
      setFacilityName(facility.name);
      setRooms(
        facility.rooms.map((room, index) => ({
          ...room,
          id: index + 1, // Assign a unique id for each room
        }))
      );
      setRoomIdCounter(facility.rooms.length + 1); // Initialize counter based on number of rooms
    }
  }, [facility]);

  const addRoom = () => {
    setRooms([...rooms, { id: roomIdCounter, specializations: [] }]); // Add room with unique ID
    setRoomIdCounter(roomIdCounter + 1); // Increment the roomIdCounter for the next room
  };

  const removeRoom = (roomId) => {
    setRooms(rooms.filter((room) => room.id !== roomId));
  };

  const handleRoomChange = (roomId, value) => {
    const updatedRooms = rooms.map((room) =>
      room.id === roomId ? { ...room, specializations: value } : room
    );
    setRooms(updatedRooms);
  };

  const handleDiscardChanges = () => {
    setIsDiscardModalOpen(true); 
  };

  const handleCloseDiscardModal = () => {
    setIsDiscardModalOpen(false); 
  };

  const handleConfirmDiscard = () => {
    setIsDiscardModalOpen(false); 
    if (onCancel) onCancel(); 
  };

  const validateForm = () => {
    let formErrors = {};

    // Validate facility name
    if (!facilityName.trim()) {
      formErrors.facilityName = "Facility name is required.";
    }

    // Ensure at least one room is added
    if (rooms.length === 0) {
      formErrors.facilityName = "At least one room must be added.";
    }

    // Removed specialization validation
// rooms.forEach((room) => {
// if (room.specializations.length === 0) {
// formErrors[`room_${room.id}`] = "At least one specialization is required for each room.";
// }
// });

    return formErrors;
  };

  const handleSave = async () => {
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      const facilityData = {
        name: facilityName,
        rooms,
      };

      try {
        if (facility && facility._id) {
          // Editing existing facility
          await axios.put(`http://localhost:4000/api/facilities/${facility._id}`, facilityData);
        } else {
          // Adding new facility
          await axios.post('http://localhost:4000/api/facilities', facilityData);
        }

        // Reset form after successful save
        setFacilityName("");
        setRooms([]);
        setRoomIdCounter(1);
        setErrors("");

        // Call the success callback to trigger a refresh
        if (onSaveSuccess) {
          onSaveSuccess();
        } else if (onCancel) {
          onCancel();
        }
      } catch (error) {
        if (error.response && error.response.data.message) {
          // Handle backend error and display message
          setErrors({ facilityName: error.response.data.message });
        } else {
          console.error("Error saving facility:", error);
        }
      }
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <>
      <section className="flex flex-col bg-white border rounded-lg p-8 w-full min-w-[450px] max-w-[800px]">
        {/* Facility Name */}
        <div>
          <label htmlFor="facility-name" className="block mb-2">Facility Name</label>
          <input
            id="facility-name"
            name="facility-name"
            type="text"
            className={`w-full p-2 border rounded-md ${errors.facilityName ? 'border-red-500' : ''}`}
            placeholder="Name"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            disabled={!!facility} // Disable field in edit mode
          />
          {errors.facilityName && (
            <p className="text-red-500 text-sm mt-1">{errors.facilityName}</p>
          )}
        </div>

        {/* Room Counter */}
        <div className="mb-4">
          <p className="text-gray-700">Number of Rooms: <strong>{rooms.length}</strong></p>
        </div>

        {/* Dynamically rendered rooms */}
        {rooms.map((room, index) => (
          <div key={room.id} className="mb-4">
            <AddRoom
              room={room}
              onRemoveRoom={removeRoom}
              onRoomChange={handleRoomChange}
              index={index}  // Pass the index to AddRoom
            />
            {errors[`room_${room.id}`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`room_${room.id}`]}</p>
            )}
          </div>
        ))}

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full"
            onClick={addRoom}
          >
            Add Room
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full"
            onClick={handleSave}
          >
            {facility ? 'Save Changes' : 'Add Facility'}
          </button>
          {facility && (
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

      {/* Discard Confirmation Modal */}
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

export default AddFacilityForm;
