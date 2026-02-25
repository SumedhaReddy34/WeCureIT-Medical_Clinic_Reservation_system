import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { toast } from 'react-toastify';
import Header from './HeaderProfile';

const PatientDashboard = () => {
  const [patientId, setPatientId] = useState(null);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [incompleteAppointments, setIncompleteAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const storedPatientId = sessionStorage.getItem('patientId');
    if (!storedPatientId) {
      toast.error('Patient ID not found. Please log in again.');
      return;
    }
    setPatientId(storedPatientId);
  }, []);

  const fetchCompletedAppointments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/myprofile/appointments/completed/${patientId}`
      );
      setCompletedAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching completed appointments:', error);
      toast.error('Unable to fetch completed appointments.');
    }
  };

  const fetchIncompleteAppointments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/myprofile/appointments/incomplete/${patientId}`
      );
      setIncompleteAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching incomplete appointments:', error);
      toast.error('Unable to fetch incomplete appointments.');
    }
  };

  useEffect(() => {
    if (!patientId) return;

    const fetchAppointments = async () => {
      setLoading(true);
      await Promise.all([fetchCompletedAppointments(), fetchIncompleteAppointments()]);
      setLoading(false);
    };

    fetchAppointments();
  }, [patientId]);

  const handleCancelAppointment = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/myprofile/appointments/delete/${selectedAppointmentId}`
      );
      if (response.status === 200) {
        toast.success('Appointment canceled successfully');
        setShowModal(false);
        fetchIncompleteAppointments();
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast.error('Unable to cancel appointment.');
    }
  };

  const openModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointmentId(null);
  };

  return (
    <div>
      {/* Add Header */}
      <Header />


    <div className="container mx-auto px-4 py-8">
      {/* Banner Section */}
      <section className="relative w-[95%] mx-auto mb-8">
        <div className="flex justify-start items-center bg-blue-600 text-white py-16 rounded-lg mx-auto w-[100%]">
          <div className="text-align-left pl-16">
            <h1 className="text-4xl font-bold mb-4">Book Appointment</h1>
            <p className="text-xl mb-6">With Trusted Doctors</p>
            <button
              className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold text-lg hover:scale-105 transition-all"
              onClick={() => navigate('/bookAppointment')} // Navigate to /bookAppointment
            >
              Book appointment →
            </button>
          </div>
        </div>
      </section>

      {/* Appointments Section */}
      <div>
        

        {loading ? (
          <p className="text-center text-lg">Loading appointments...</p>
        ) : (
          <div>
            {/* Incomplete Appointments Section */}
            <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>
              {incompleteAppointments.length > 0 ? (
                <ul className="space-y-4">
                  {incompleteAppointments.map((appointment, index) => (
                    <li
                      key={index}
                      className="border rounded-xl p-6 bg-gray-100 shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <p>
                          <strong>Doctor:</strong> {appointment.doctor_name || 'N/A'}
                        </p>
                        <p>
                          <strong>Specialization:</strong> {appointment.speciality_name || 'N/A'}
                        </p>
                        <p>
                          <strong>Facility:</strong> {appointment.facility_name || 'N/A'}
                        </p>
                        <p>
                          <strong>Date:</strong>{' '}
                          {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                            timeZone: 'UTC',
                          })}
                        </p>
                        <p>
                          <strong>Time:</strong>{' '}
                          {new Date(appointment.appointment_start_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'UTC',
                          })}{' '}
                          -{' '}
                          {new Date(appointment.appointment_end_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'UTC',
                          })}
                        </p>
                      </div>
                      <div>
                        <button
                          className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600"
                          onClick={() => openModal(appointment._id)}
                        >
                          Cancel appointment
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming appointments found.</p>
              )}
            </section>

            {/* Completed Appointments Section */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Completed Appointments</h2>
              {completedAppointments.length > 0 ? (
                <ul className="space-y-4">
                  {completedAppointments.map((appointment, index) => (
                    <li
                      key={index}
                      className="border rounded-xl p-6 bg-gray-100 shadow-sm"
                    >
                      <div>
                        <p>
                          <strong>Doctor:</strong> {appointment.doctor_name || 'N/A'}
                        </p>
                        <p>
                          <strong>Specialization:</strong> {appointment.speciality_name || 'N/A'}
                        </p>
                        <p>
                          <strong>Facility:</strong> {appointment.facility_name || 'N/A'}
                        </p>
                        <p>
                          <strong>Date:</strong>{' '}
                          {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                            timeZone: 'UTC',
                          })}
                        </p>
                        <p>
                          <strong>Time:</strong>{' '}
                          {new Date(appointment.appointment_start_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'UTC',
                          })}{' '}
                          -{' '}
                          {new Date(appointment.appointment_end_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'UTC',
                          })}
                        </p>
                        {appointment.additionalMessage && (
                          <p className="text-red-500 mt-4">{appointment.additionalMessage}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No completed appointments found.</p>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4 text-center">
              Are you sure you want to cancel this appointment?
            </h3>
            <p className="text-red-500 mb-6 text-center">
              Note: If you cancel your appointment in the last 24 hours or less, you will be charged a
              cancellation fee of $50 on your saved credit card.
            </p>
            <div className="flex flex-col gap-4">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-3 rounded-full font-medium w-full"
                onClick={closeModal}
              >
                Close
              </button>
              <button
                className="bg-red-500 text-white px-4 py-3 rounded-full font-medium w-full hover:bg-red-600"
                onClick={handleCancelAppointment}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div> 
  );
};

export default PatientDashboard;
