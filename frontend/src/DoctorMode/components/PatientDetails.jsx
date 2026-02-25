import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS
import axiosInstance from "../api/axiosInstance"; // Axios instance
import NotesModal from "./NotesModal"; // NotesModal component

function PatientDetails() {
  const [patients, setPatients] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [scheduleType, setScheduleType] = useState("original");
  const [appointmentDuration, setAppointmentDuration] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);


  // Fetch doctorId from sessionStorage
  useEffect(() => {
    const storedDoctorId = sessionStorage.getItem("DoctorId");
    if (storedDoctorId) {
      setDoctorId(storedDoctorId); // Set the doctorId state dynamically
    } else {
      toast.error("Doctor ID is missing. Please log in again.");
    }
  }, []);

  // Fetch patient data from backend
  const refreshPatients = async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/appointments/${doctorId}?timestamp=${Date.now()}`
      );
      console.log("Refreshed Patient Data:", response.data);
      setPatients(response.data);
    } catch (error) {
      if (
        error.response?.data?.message !== "No appointments found for the doctor."
      ) {
        console.error(
          "Error refreshing patient data:",
          error.response?.data || error.message
        );
        toast.error("Failed to refresh patient data.");
      } else {
        console.log("No appointments found for the doctor.");
        setPatients([]); // Clear patients if no appointments are found
      }
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    console.log("Fetching patients for doctor ID:", doctorId);
    refreshPatients();
  }, [doctorId]);

  useEffect(() => {
    console.log("Patients state updated:", patients);
  }, [patients]);

  // Open the complete modal
  const handleCompleteClick = (patient) => {
    console.log("complete button clicked")
    setSelectedPatient(patient);
    setIsCompleteModalOpen(true);
  };

  // Close the complete modal
  const handleCloseCompleteModal = () => {
    setIsCompleteModalOpen(false);
    setSelectedPatient(null);
    setErrorMessage("");
  };

  // Open the Notes modal
  const handleNotesClick = (patient) => {
    console.log("Selected patient for notes:", patient);
    refreshPatients();
    setSelectedPatient(patient);
    setIsNotesModalOpen(true);
  };

  // Close the Notes modal
  const handleCloseNotesModal = () => {
    setIsNotesModalOpen(false);
    setSelectedPatient(null);
  };

  // Open the cancel confirmation modal
  const handleCancelClick = (patient) => {
    setSelectedPatient(patient);
    setIsCancelModalOpen(true);
  };

  // Handle confirmation of cancellation
  const handleConfirmCancel = async () => {
    if (!selectedPatient) {
      toast.error("No appointment selected for cancellation.");
      return;
    }
  
    try {
      const response = await axiosInstance.put(
        `/appointments/cancel-appointment/${selectedPatient.appointment_id}`
      );
      toast.success(response.data.message || "Appointment cancelled successfully.");
      setIsCancelModalOpen(false);
      setSelectedPatient(null);
  
      // Refresh the patient details after cancellation
      await refreshPatients();
    } catch (error) {
      console.error("Error canceling appointment:", error);
      toast.error("Failed to cancel the appointment. Please try again.");
    }
  };
  

  // Close the cancel modal
  const handleCancelClose = () => {
    setIsCancelModalOpen(false);
  };

  // Handle appointment duration input (numbers only)
  const handleDurationChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setAppointmentDuration(value);
      setErrorMessage("");
    }
  };

  // Handle save button click with validation
  const handleSave = async () => {
    if (
      scheduleType === "new" &&
      (!appointmentDuration || appointmentDuration <= 0)
    ) {
      setErrorMessage("Appointment duration is required.");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/appointments/update-appointment/${selectedPatient.appointment_id}`,
        {
          isOriginalSchedule: scheduleType === "original",
          newScheduleDuration:
            scheduleType === "new" ? parseInt(appointmentDuration, 10) : null,
        }
      );
      toast.success(response.data.message);

      // Refresh patient data and close the modal
      await refreshPatients();
      setIsCompleteModalOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete the appointment. Please try again.");
    }
  };

  // Helper function to format time in 12-hour format
  const formatTo12Hour = (time) => {
    if (!time) return "N/A";
    const [hour, minute] = time.split(":");
    let hour12 = parseInt(hour, 10) % 12 || 12; // Convert 24-hour to 12-hour format
    const ampm = parseInt(hour, 10) >= 12 ? "PM" : "AM";
    return `${hour12}:${minute} ${ampm}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Appointment Details</h3>
      <ul className="space-y-4">
        {patients.length === 0 ? (
          <p>No patients scheduled for this doctor.</p>
        ) : (
          patients.map((patient, index) => (
            <li
              key={index}
              className="flex justify-between items-center text-gray-700"
            >
              <div>
                <p className="font-semibold">Patient Name : {patient.patient_name}</p>
                <p className="text-sm text-gray-500">
                  Appointment Date:{" "}
                  {patient.appointment_date
                    ? patient.appointment_date
                    : "N/A"}{" "}
                  <br />
                  Appointment Time:{formatTo12Hour(patient.appointment_time) || "N/A"}
                </p>
              </div>

              <div className="flex space-x-2">
                {/* Complete Button */}
                <button
                  className="bg-black text-white px-4 py-2 rounded-lg"
                  onClick={() => handleCompleteClick(patient)}
                >
                  Complete
                </button>

                {/* Notes Button */}
                <button
                  className="bg-black text-white px-4 py-2 rounded-lg"
                  onClick={() => handleNotesClick(patient)}
                >
                  Notes
                </button>

                {/* Cancel Button */}
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  onClick={() => handleCancelClick(patient)}
                >
                  Cancel
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-[480px] p-6 bg-white rounded-lg shadow-lg space-y-6">
            <h2 className="text-xl font-semibold text-center">
              Confirm Cancellation
            </h2>
            <p className="text-center text-gray-600">
              Are you sure you want to cancel this appointment?
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleConfirmCancel}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Yes, Cancel
              </button>
              <button
                onClick={handleCancelClose}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                No, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-[480px] p-6 bg-white rounded-lg shadow-lg space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                Patient Appointment Timings
              </h2>
            </div>

            <div className="flex justify-center space-x-10 mt-4">
              <div className="flex items-center">
                <input
                  id="original-schedule"
                  type="radio"
                  value="original"
                  name="scheduleType"
                  checked={scheduleType === "original"}
                  onChange={() => setScheduleType("original")}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="original-schedule"
                  className="ml-3 block text-sm font-medium text-gray-900"
                >
                  Original Schedule
                  <p className="text-xs text-gray-500">
                    Patient appointment remains the same
                  </p>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="new-schedule"
                  type="radio"
                  value="new"
                  name="scheduleType"
                  checked={scheduleType === "new"}
                  onChange={() => setScheduleType("new")}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="new-schedule"
                  className="ml-3 block text-sm font-medium text-gray-900"
                >
                  New Schedule
                  <p className="text-xs text-gray-500">
                    Enter new scheduled time for patient
                  </p>
                </label>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <label className="block text-sm font-semibold">
                Appointment Duration (minutes)
              </label>
              <input
                type="text"
                value={appointmentDuration}
                onChange={handleDurationChange}
                disabled={scheduleType === "original"}
                className={`w-32 p-2 border border-gray-300 rounded-md text-center "${
                  scheduleType === "original" ? "bg-gray-100" : "bg-white"
                }`}
                placeholder="Enter minutes"
              />
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
              <button
                onClick={handleCloseCompleteModal}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {isNotesModalOpen && (
        <NotesModal
          isOpen={isNotesModalOpen}
          onClose={handleCloseNotesModal}
          patientDetails={selectedPatient}
        />
      )}
    </div>
  );
}

export default PatientDetails;
