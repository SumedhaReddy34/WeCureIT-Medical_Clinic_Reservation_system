import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance"; // Axios instance
import { toast } from "react-toastify";

function UpcomingBookings() { // Default doctorId
  const [bookings, setBookings] = useState([]);

  const [doctorId, setDoctorId] = useState("");

  // Fetch doctorId from sessionStorage
  useEffect(() => {
    const storedDoctorId = sessionStorage.getItem("DoctorId"); // Retrieve doctorId from sessionStorage
    if (storedDoctorId) {
      setDoctorId(storedDoctorId); // Set the doctorId state
    } else {
      toast.error("Doctor ID is missing. Please log in again.");
    }
  }, []);

  // Fetch upcoming bookings
  useEffect(() => {
    if (!doctorId) return; 
    const fetchUpcomingBookings = async () => {
      try {
        const response = await axiosInstance.get(`/appointments/${doctorId}`);
        console.log("Upcoming Bookings:", response.data); // Debugging response
        setBookings(response.data); // Set fetched bookings
      } catch (error) {
        console.error("Error fetching upcoming bookings:", error);

        // Check if the error message is "No appointments found for the doctor."
        if (
          error.response &&
          error.response.data &&
          (error.response.data.message === "No appointments found for the doctor." ||
           error.response.data.error === "No appointments found for the doctor.")
        ) {
          // Do not display the toast error, bookings will remain empty
          setBookings([]); // Ensure bookings is an empty array
        } else {
          toast.error("Failed to fetch upcoming bookings.");
        }}
    };

    fetchUpcomingBookings();
  }, [doctorId]);

  // Function to format time to 12-hour format
  const formatTo12Hour = (time) => {
    if (!time) return "N/A";
    const [hour, minute] = time.split(":");
    let hour12 = parseInt(hour, 10) % 12 || 12; // Convert 24-hour to 12-hour format
    const ampm = parseInt(hour, 10) >= 12 ? "PM" : "AM";
    return `${hour12}:${minute} ${ampm}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <img src="https://cdn-icons-png.flaticon.com/512/1256/1256657.png" alt="Upcoming Icon" className="w-6 h-6 mr-2" />
        Upcoming Bookings
      </h3>
      {bookings.length === 0 ? (
        <p>No upcoming bookings for this doctor.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((booking, index) => (
            <li key={index} className="flex justify-between text-gray-700">
              <div>
                <p className="font-semibold">{booking.patient_name}</p>
                <p className="text-sm text-gray-500">
                  Booking on {booking.appointment_date || "MM/DD/YY"} at {formatTo12Hour(booking.appointment_time)}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-600">{booking.facility_name || "Unknown Facility"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UpcomingBookings;
