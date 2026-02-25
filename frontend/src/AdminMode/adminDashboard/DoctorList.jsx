import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Make sure axios is installed

function DoctorsList() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    // Fetch the list of doctors from the backend and limit to 5
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/doctors');  // Adjust the path if needed
        //const limitedDoctors = response.data.slice(0, 5); // Get only the first 5 doctors
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <section className="flex flex-col mt-0 bg-white border rounded-lg p-4 w-[500px]">
      <h3 className="sr-only">Doctors List</h3>    

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Doctors List</h3>
      </div>
      
      {/* Doctors list */}
      <ul className="flex flex-col w-full border-t">
        {doctors.map((doctor, index) => (
          <li key={index} className="flex items-center py-3 w-full border-b">
            <div className="text-gray-700">{doctor.name}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default DoctorsList;
