import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const NotesModal = ({ isOpen, onClose, patientDetails }) => {
  const [appointments, setAppointments] = useState([]); // Current appointment details
  const [previousAppointments, setPreviousAppointments] = useState([]); // Previous appointments
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Selected appointment for notes
  const [isFormEditable, setIsFormEditable] = useState(false); // To enable Save Changes button only for current appointments

  // Fetch appointments from the backend when the modal opens
  useEffect(() => {
    if (isOpen && patientDetails) {
      const patientId = patientDetails.patient_id;

      if (!patientId) {
        toast.error("Patient ID is missing.");
        return;
      }

      // Fetch previous appointments
      axiosInstance
        .get(`/appointments/previous-notes/${patientId}`)
        .then((response) => {
          setPreviousAppointments(response.data.previousAppointments || []);
        })
        .catch((error) => console.error("Error fetching previous appointments:", error));

      // Set the current appointment as the selected one by default
      setSelectedAppointment({
        ...patientDetails,
        doctor_name: patientDetails.doctor_name,
      });
      setIsFormEditable(true); // Editable by default for current appointment
    }
  }, [isOpen, patientDetails]);

  // Handle clicking an appointment to highlight it and display its details
  const handleAppointmentClick = (appointment, type) => {
    setSelectedAppointment(appointment);
    setIsFormEditable(type === "appointments"); // Only enable the form for current appointments
  };

  // Save updated notes to the backend
  const handleSaveNotes = async () => {
    if (!selectedAppointment) {
      toast.error("No appointment selected to save notes.");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/appointments/update-notes/${selectedAppointment._id || patientDetails.appointment_id}`, // Ensure correct ID is used
        {
          medical_diagnose: selectedAppointment.medical_diagnose || "",
          medical_history: selectedAppointment.medical_history || "",
          current_signs: selectedAppointment.current_signs || "",
          additional_notes: selectedAppointment.additional_notes || "",
        }
      );
      toast.success(response.data.message);
      setIsFormEditable(false); // Lock the form after saving
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes. Please try again.");
    }
  };

  if (!isOpen) return null;

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[1000px] max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">Patient Notes</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            Close
          </button>
        </div>

        {/* Patient Details */}
        <div className="flex items-center space-x-4 border-b pb-4">
          <img
            src="https://via.placeholder.com/40"
            alt="Patient"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="text-lg font-semibold">{patientDetails.patient_name}</p>
            <p className="text-sm text-gray-500">
              Booking on {formatDate(patientDetails.appointment_date)}
            </p>
          </div>
        </div>

        {/* Appointments and Previous Appointments */}
        <div className="grid grid-cols-3 gap-6 mt-4">
          <div className="col-span-1 bg-white p-4 border-r">
            <h3 className="text-lg font-semibold mb-2">Appointments</h3>
            <ul className="space-y-2">
              <li
                className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-md transition-colors ${
                  selectedAppointment === patientDetails
                    ? "bg-blue-50 border-r-4 border-blue-500 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => handleAppointmentClick(patientDetails, "appointments")}
              >
                <span className="inline-block text-gray-400">+</span>
                <div className="flex flex-col">
                  <span className="text-sm">{patientDetails.speciality_name}</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(patientDetails.appointment_date)}
                  </span>
                </div>
              </li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-2">Previous Appointments</h3>
            <ul className="space-y-2">
              {previousAppointments.map((appointment, index) => (
                <li
                  key={index}
                  className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-md transition-colors ${
                    selectedAppointment === appointment
                      ? "bg-blue-50 border-r-4 border-blue-500 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => handleAppointmentClick(appointment, "previousAppointments")}
                >
                  <span className="inline-block text-gray-400">+</span>
                  <div className="flex flex-col">
                    <span className="text-sm">{appointment.speciality_name}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(appointment.appointment_date)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Medical Details Form */}
          <div className="col-span-2 bg-gray-50 p-6 rounded-lg space-y-4">
            {selectedAppointment ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Medical Diagnose
                    </label>
                    <input
                      type="text"
                      value={selectedAppointment.medical_diagnose || ""}
                      className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md ${
                        isFormEditable ? "bg-white" : "bg-gray-200"
                      }`}
                      readOnly={!isFormEditable}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          medical_diagnose: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
                    <input
                      type="text"
                      value={selectedAppointment.doctor_name || ""}
                      className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Medical History</label>
                  <textarea
                    value={selectedAppointment.medical_history || ""}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md ${
                      isFormEditable ? "bg-white" : "bg-gray-200"
                    }`}
                    rows={3}
                    readOnly={!isFormEditable}
                    onChange={(e) =>
                      setSelectedAppointment({
                        ...selectedAppointment,
                        medical_history: e.target.value,
                      })
                    }
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Signs and Symptoms
                  </label>
                  <textarea
                    value={selectedAppointment.current_signs || ""}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md ${
                      isFormEditable ? "bg-white" : "bg-gray-200"
                    }`}
                    rows={3}
                    readOnly={!isFormEditable}
                    onChange={(e) =>
                      setSelectedAppointment({
                        ...selectedAppointment,
                        current_signs: e.target.value,
                      })
                    }
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    value={selectedAppointment.additional_notes || ""}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md ${
                      isFormEditable ? "bg-white" : "bg-gray-200"
                    }`}
                    rows={3}
                    readOnly={!isFormEditable}
                    onChange={(e) =>
                      setSelectedAppointment({
                        ...selectedAppointment,
                        additional_notes: e.target.value,
                      })
                    }
                  ></textarea>
                </div>

                {/* Save Button */}
                {isFormEditable && (
                  <button
                    className="mt-4 w-full text-white px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600"
                    onClick={handleSaveNotes}
                  >
                    Save Changes
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-500">Select an appointment to view details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
