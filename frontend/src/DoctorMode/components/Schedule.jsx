import React, { useState, useEffect } from 'react';
import axiosInstance from "../api/axiosInstance"; // Ensure this points to your Axios setup
import { toast } from "react-toastify";

function Schedule() {
  const [scheduleItems, setScheduleItems] = useState([]);

  const [doctorId, setDoctorId] = useState("");

  // Fetch `doctorId` from sessionStorage
  useEffect(() => {
    const storedDoctorId = sessionStorage.getItem("DoctorId"); // Retrieve doctorId from sessionStorage
    if (storedDoctorId) {
      setDoctorId(storedDoctorId); // Set the doctorId state
    } else {
      toast.error("Doctor ID is missing. Please log in again.");
    }
  }, []);

  useEffect(() => {
    if (!doctorId) return;
  
    const fetchSchedule = async () => {
      try {
        const response = await axiosInstance.get(`/doctor-availability/availability/${doctorId}`);
        const data = response.data;
  
        // Filter schedules based on `validForScheduling` and transform the API response
        const transformedData = data
          .filter((item) => item.validForScheduling) // Only include schedules with `validForScheduling: true`
          .map((item) => {
            const availabilityDate = new Date(item.availability_date);
            const startTime = new Date(item.start_time);
            const endTime = new Date(item.end_time);
  
            // Format the date
            const formattedDate = `${availabilityDate.getUTCFullYear()}-${String(availabilityDate.getUTCMonth() + 1).padStart(2, '0')}-${String(availabilityDate.getUTCDate()).padStart(2, '0')}`;
  
            // Format time to 12-hour format with AM/PM
            const formatTo12Hour = (date) => {
              let hours = date.getUTCHours();
              const minutes = String(date.getUTCMinutes()).padStart(2, '0');
              const ampm = hours >= 12 ? 'PM' : 'AM';
              hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
              return `${hours}:${minutes} ${ampm}`;
            };
  
            const formattedStartTime = formatTo12Hour(startTime);
            const formattedEndTime = formatTo12Hour(endTime);
  
            return {
              facility: item.facility_name,
              details: `Schedule on ${formattedDate} at ${formattedStartTime} to ${formattedEndTime}`,
              location: item.facility_name,
            };
          });
  
        setScheduleItems(transformedData);
      } catch (error) {
        console.error("Error fetching schedule data:", error);
      }
    };
  
    fetchSchedule();
  }, [doctorId]);
  

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3209/3209265.png"
          alt="Schedule Icon"
          className="w-5 h-5 mr-2"
        />
        Schedule
      </h3>
      <ul className="space-y-4">
        {scheduleItems.length > 0 ? (
          scheduleItems.map((item, index) => (
            <li key={index} className="flex justify-between items-center text-gray-700">
              {/* Left Column */}
              <div className="flex-1">
                <p className="text-xs text-gray-500">{item.details}</p>
              </div>
              {/* Vertical Line */}
              <div className="w-px h-full bg-gray-300 mx-4"></div>
              {/* Right Column */}
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-gray-600">{item.facility}</p>
                <p className="text-xs text-gray-500">{item.speciality}</p>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No schedules available.</p>
        )}
      </ul>
    </div>
  );
}

export default Schedule;
