import React, { useState, useEffect } from 'react';

function AddRoom({ room, onRemoveRoom, onRoomChange, index }) {
  const [selectedSpecialties, setSelectedSpecialties] = useState(room.specializations || []);

  const specialties = [
    "General Physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Gastroenterologist",
  ];

  useEffect(() => {
    setSelectedSpecialties(room.specializations || []);
  }, [room]);

  const handleSpecialtyChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedSpecialties.includes(selectedValue)) {
      const updatedSpecialties = [...selectedSpecialties, selectedValue];
      setSelectedSpecialties(updatedSpecialties);
      onRoomChange(room.id, updatedSpecialties);
    }
    event.target.value = ""; // Reset select field after selecting an option
  };

  const removeSpecialty = (specialty) => {
    const updatedSpecialties = selectedSpecialties.filter((item) => item !== specialty);
    setSelectedSpecialties(updatedSpecialties);
    onRoomChange(room.id, updatedSpecialties);
  };

  return (
    <div className="flex flex-col mb-4">
      <label htmlFor={`room-${room.id}`} className="block mb-2">
        Room's Specialization {/* No numbering here */}
      </label>

      {/* Selected Specialties Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedSpecialties.map((specialty, index) => (
          <div
            key={index}
            className="flex items-center bg-indigo-100 text-indigo-700 p-2 rounded-full"
          >
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

      {/* Dropdown for Selecting Specialties */}
      <select
        value=""
        onChange={handleSpecialtyChange}
        className="w-full p-2 border rounded-md text-gray-400"
      >
        <option value="" disabled>Select Specialization</option>
        {specialties.map((specialty, index) => (
          <option key={index} value={specialty}>
            {specialty}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600"
        onClick={() => onRemoveRoom(room.id)}
      >
        Remove Room
      </button>
    </div>
  );
}

export default AddRoom;
