import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FacilitiesList() {
  const [facilities, setFacilities] = useState([]); // State to store facilities
  const [loading, setLoading] = useState(true); // State to manage loading

  useEffect(() => {
    // Function to fetch facilities from the backend
    const fetchFacilities = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/facilities'); // Replace with your backend route if different
        //const limitedFacilities = response.data.slice(0, 5); // Limit to 5 facilities
        setFacilities(response.data);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchFacilities();
  }, []);

  if (loading) {
    return <p>Loading facilities...</p>; // Show loading text while fetching
  }

  return (
    <section className="flex flex-col mt-0 bg-white border rounded-lg p-4 w-[500px]">
      <h3 className="sr-only">Facilities List</h3>
      
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Facilities List</h3>
      </div>

      {/* Facilities list */}
      <ul className="flex flex-col w-full border-t">
        {facilities.map((facility, index) => (
          <li key={index} className="flex items-center py-3 w-full border-b">
            <div className="text-gray-700">{facility.name}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default FacilitiesList;
