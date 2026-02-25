import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance"; // Axios instance
import { toast } from "react-toastify";

function CompletedBookings() { // Default doctorId
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState("");

  // Fetch doctorId from sessionStorage
  useEffect(() => {
    const storedDoctorId = sessionStorage.getItem("DoctorId"); // Get doctorId from sessionStorage
    if (storedDoctorId) {
      setDoctorId(storedDoctorId); // Set doctorId state
    } else {
      toast.error("Doctor ID is missing. Please log in again.");
    }
  }, []);

  // Fetch completed appointments
  useEffect(() => {
    if (!doctorId) return; 
    const fetchCompletedAppointments = async () => {
      try {
        const response = await axiosInstance.get(`/completed-appointments/${doctorId}`);
        console.log("Completed Appointments:", response.data);
        setCompletedAppointments(response.data); // Set completed appointments data
      } catch (error) {
        console.error("Error fetching completed appointments:", error);

        // Check if the error message is "No completed appointments found for this doctor."
        if (
          error.response &&
          error.response.data &&
          (error.response.data.message === "No completed appointments found for this doctor." ||
           error.response.data.error === "No completed appointments found for this doctor.")
        ) {
          // Do not display the toast error, ensure appointments are empty
          setCompletedAppointments([]); // Ensure completedAppointments is an empty array
        } else {
          toast.error("Failed to fetch completed appointments.");
        }
      }
    };

    fetchCompletedAppointments();
  }, [doctorId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Completed Appointments</h3>
      {completedAppointments.length === 0 ? (
        <p>No completed appointments found for this doctor.</p>
      ) : (
        <ul className="space-y-4">
          {completedAppointments.map((appointment, index) => (
            <li key={index} className="flex justify-between items-center text-gray-700">
              <div>
                <p className="font-semibold">{appointment.patient_name}</p>
                <p className="text-sm text-gray-500">
                Appointment Date: {appointment.appointment_date.split('T')[0] || "N/A"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CompletedBookings;
