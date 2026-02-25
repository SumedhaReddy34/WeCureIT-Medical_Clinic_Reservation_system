import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, startOfWeek, endOfWeek, differenceInMinutes, parseISO } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import Header from './Header';
import Sidebar from './Sidebar';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../api/axiosInstance';

const AvailabilityChanges = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [workingHours, setWorkingHours] = useState({ from: '', to: '' });
  const [errors, setErrors] = useState({
    facility: '',
    specialties: '',
    date: '',
    workingHours: '',
  });
  const [facilities, setFacilities] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [availabilityToDelete, setAvailabilityToDelete] = useState(null);


  const currentWeekStart = useMemo(() => {
    return startOfWeek(new Date(), { weekStartsOn: 0 });
  }, []);
  
  const nextWeekStart = useMemo(() => {
    return addDays(currentWeekStart, 7); // Start of next week
  }, [currentWeekStart]);
  
  const nextWeekEnd = useMemo(() => {
    return endOfWeek(nextWeekStart, { weekStartsOn: 0 }); // End of next week
  }, [nextWeekStart]);

  useEffect(() => {
    const storedDoctorId = sessionStorage.getItem("DoctorId");
    if (storedDoctorId) {
      setDoctorId(storedDoctorId); // Set the doctorId state dynamically
    } else {
      toast.error("Doctor ID is missing. Please log in again.");
    }
  }, []);

  // Fetch facilities
  useEffect(() => {
    if (!doctorId) return;
    const fetchFacilities = async () => {
      try {
        const response = await axiosInstance.get(`/doctor-availability/facilities/${doctorId}`);
        setFacilities(
          response.data.data.map((facility) => ({
            value: facility._id,
            label: facility.name,
          }))
        );
      } catch (error) {
        console.error('Error fetching facilities:', error);
        toast.error('Failed to fetch facilities.');
      }
    };
    

    fetchFacilities();
  }, [doctorId]);

  // Fetch specializations
  useEffect(() => {
    const fetchSpecialties = async () => {
      if (selectedFacility) {
        try {
          const response = await axiosInstance.get(
            `/doctor-availability/common-specializations/${doctorId}/${selectedFacility.value}`
          );
          setSpecialties(
            response.data.data.map((specialty) => ({
              value: specialty,
              label: specialty,
            }))
          );
        } catch (error) {
          console.error('Error fetching specialties:', error);
          toast.error('Failed to fetch specialties.');
        }
      } else {
        setSpecialties([]);
      }
    };

    fetchSpecialties();
  }, [selectedFacility, doctorId]);

  // Fetch availabilities
  const fetchAvailabilities = async () => {
    if (!doctorId) return;
    try {
      const params = {
        nextWeekStart: nextWeekStart.toISOString().split('T')[0],
        nextWeekEnd: nextWeekEnd.toISOString().split('T')[0],
      };
      const requestUrl = `/doctor-availability/fetch-availability/${doctorId}`;

      console.log('Request URL:', requestUrl);
      console.log('Query Params:', params);

      const response = await axiosInstance.get(requestUrl, { params });

      const fetchedAvailabilities = response.data.data || [];

      console.log('Fetched Availabilities:', fetchedAvailabilities);

      setAvailabilities(
        fetchedAvailabilities.map((availability) => ({
          facility: {
            value: availability.facility_id, // Use facility_id as the value
            label: availability.facility_name,
          },
          specialties: availability.speciality_names.map((specialty) => ({
            value: specialty,
            label: specialty,
          })),
          workingHours: {
            from: availability.start_time.split('T')[1].substring(0, 5), // Extract HH:MM
            to: availability.end_time.split('T')[1].substring(0, 5), // Extract HH:MM
          },
          date: availability.availability_date.split('T')[0], // Extract date part
          id: availability._id,
        }))
      );
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      toast.error('Failed to fetch availabilities.');
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, [doctorId]); // Run when component mounts or doctorId changes



  const handleCopyFromPreviousWeek = async () => {
    try {
      // Extract only the date (YYYY-MM-DD) for nextWeekStart and nextWeekEnd
      const nextWeekStartDate = nextWeekStart.toISOString().split("T")[0];
      const nextWeekEndDate = nextWeekEnd.toISOString().split("T")[0];
  
      // Log the calculated next week start and end
      console.log("Next Week Start (Date Only):", nextWeekStartDate);
      console.log("Next Week End (Date Only):", nextWeekEndDate);
  
      // Fetch the previous week's schedule
      const response = await axiosInstance.get(
        `/doctor-availability/copy-previous-week-schedule/${doctorId}`,
        {
          params: {
            nextWeekStart: nextWeekStartDate,
            nextWeekEnd: nextWeekEndDate,
          },
        }
      );
  
      const schedules = response.data.copiedSchedules || [];
  
      if (schedules.length === 0) {
        toast.info(response.data.message || "No schedule found for the previous week.");
        return;
      }
  
      // Confirm with the user before storing the schedule
      const confirmCopy = window.confirm(
        "Are you sure you want to copy the previous week's schedule?"
      );
      if (!confirmCopy) {
        return;
      }
  
      // Iterate over each schedule and store it using the edit API
      for (const schedule of schedules) {
        try {
          const { availabilityID, ...scheduleData } = schedule; // Extract the ID and remaining data
          await axiosInstance.post(
            `/doctor-availability/add-availability`,
            scheduleData
          );
        } catch (storeError) {
          console.error("Error storing schedule:", storeError);
          toast.error("Failed to store part of the schedule. Continuing with others.");
        }
      }
  
      // Refresh availabilities after all schedules are stored
      fetchAvailabilities();
      toast.success("Previous week's schedule copied and stored successfully!");
    } catch (error) {
      // Handle specific message from the API response
      if (error.response?.data?.message === "No schedule found for the previous week.") {
        toast.info("No schedule found for the previous week.");
      } else {
        console.error("Error copying from previous week:", error);
        toast.error("Failed to copy schedule from the previous week. Please try again.");
      }
    }
  };
  
  
  
  

  const handleFacilityChange = (selectedOption) => {
    if (!selectedDate) {
      setErrors((prev) => ({ ...prev, facility: 'Please select a working day first.' }));
      return;
    }
    setSelectedFacility(selectedOption || null);
    setErrors((prev) => ({ ...prev, facility: '' }));
  };

  const handleSpecialtyChange = (selectedOptions) => {
    if (!selectedDate) {
      setErrors((prev) => ({ ...prev, specialties: 'Please select a working day first.' }));
      return;
    }
    setSelectedSpecialties(selectedOptions || []);
    setErrors((prev) => ({ ...prev, specialties: '' }));
  };

  const handleWorkingHoursChange = (e) => {
    const { name, value } = e.target;
    if (!selectedDate) {
      setErrors((prev) => ({ ...prev, workingHours: 'Please select a working day first.' }));
      return;
    }
    setWorkingHours((prevHours) => ({ ...prevHours, [name]: value }));
    setErrors((prev) => ({ ...prev, workingHours: '' }));
  };

  const validateWorkingHours = () => {
    if (!workingHours.from || !workingHours.to) return false;
    const fromTime = new Date(`1970-01-01T${workingHours.from}:00`);
    const toTime = new Date(`1970-01-01T${workingHours.to}:00`);
    const timeDifference = differenceInMinutes(toTime, fromTime);

    if (timeDifference < 0) {
      setErrors((prev) => ({
        ...prev,
        workingHours: 'Start time cannot be after end time.',
      }));
      return false;
    }
    if (timeDifference < 240) {
      setErrors((prev) => ({
        ...prev,
        workingHours: 'Working hours must be at least 4 hours.',
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, workingHours: '' }));
    return true;
  };

  const handleAddOrUpdateFacility = async () => {
    let hasError = false;
    const newErrors = { facility: '', specialties: '', date: '', workingHours: '' };

    if (!selectedDate) {
      newErrors.date = 'Please select a working day.';
      hasError = true;
    }
    if (!selectedFacility) {
      newErrors.facility = 'Please select a facility.';
      hasError = true;
    }
    if (selectedSpecialties.length === 0) {
      newErrors.specialties = 'Please select at least one specialty.';
      hasError = true;
    }
    if (!workingHours.from || !workingHours.to || !validateWorkingHours()) {
      newErrors.workingHours = errors.workingHours || 'Please enter valid working hours.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
    } else {
      try {
        const availabilityDate = selectedDate.toISOString().split('T')[0];
        const startTime = new Date(`${availabilityDate}T${workingHours.from}:00Z`).toISOString();
        const endTime = new Date(`${availabilityDate}T${workingHours.to}:00Z`).toISOString();

        const availabilityData = {
          availability_date: availabilityDate,
          doctor_id: doctorId,
          start_time: startTime,
          end_time: endTime,
          facility_name: selectedFacility.label,
          speciality_names: selectedSpecialties.map((specialty) => specialty.label),
        };

        if (editIndex !== null) {
          // We're editing an existing availability
          const availabilityId = availabilities[editIndex].id;
          const response = await axiosInstance.put(
            `/doctor-availability/edit-availability/${availabilityId}`,
            availabilityData
          );
          toast.success(response.data.message || 'Availability updated successfully!');
        } else {
          // We're adding a new availability
          const response = await axiosInstance.post('/doctor-availability/add-availability', availabilityData);
          toast.success(response.data.message || 'Facility details added successfully!');
        }

        // Reset form fields and errors
        setSelectedFacility(null);
        setSelectedSpecialties([]);
        setSelectedDate(null);
        setWorkingHours({ from: '', to: '' });
        setErrors({ facility: '', specialties: '', date: '', workingHours: '' });
        setEditIndex(null);

        // Refresh availabilities
        fetchAvailabilities();
      } catch (error) {
        console.error('Error adding/updating facility:', error);
        toast.error('Failed to add/update availability. Please try again.');
      }
    }
  };

  const handleEditAvailability = (index) => {
    const availabilityToEdit = availabilities[index];
    setSelectedFacility(availabilityToEdit.facility);
    setSelectedDate(parseISO(availabilityToEdit.date));
    setWorkingHours({
      from: availabilityToEdit.workingHours.from,
      to: availabilityToEdit.workingHours.to,
    });
    setEditIndex(index);
  };

  const handleDeleteAvailability = async (index) => {
    const availabilityToDelete = availabilities[index];
    try {
      const response = await axiosInstance.delete(`/doctor-availability/delete-availability/${availabilityToDelete.id}`);
      toast.success(response.data.message || 'Availability deleted successfully!');
      fetchAvailabilities();
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error('Failed to delete availability.');
    } finally {
      closeDeleteModal();
    }
  };

  const handleDateChange = (date) => {
     if (editIndex === null) {
      setSelectedDate(date);
      setErrors((prev) => ({ ...prev, date: '' }));
     }
      

  };
  const handleDiscardChanges = () => {
    setSelectedFacility(null);
    setSelectedSpecialties([]);
    setSelectedDate(null);
    setWorkingHours({ from: '', to: '' });
    setErrors({ facility: '', specialties: '', date: '', workingHours: '' });
    setEditIndex(null);
  };

  // Helper function to format time in 12-hour format
  const formatTo12Hour = (time) => {
    if (!time) return "N/A";
    const [hour, minute] = time.split(":");
    let hour12 = parseInt(hour, 10) % 12 || 12; // Convert 24-hour to 12-hour format
    const ampm = parseInt(hour, 10) >= 12 ? "PM" : "AM";
    return `${hour12}:${minute} ${ampm}`;
  };
  
  const openDeleteModal = (index) => {
    setAvailabilityToDelete(availabilities[index]);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setAvailabilityToDelete(null);
  };
  
  

  return (

    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Details for Upcoming Week</h2>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Facility Name</label>
          <Select
            options={facilities}
            value={selectedFacility}
            onChange={handleFacilityChange}
            className="basic-single"
            classNamePrefix="select"
            placeholder="Select Facility..."
            isDisabled={!selectedDate}
          />
          {errors.facility && <p className="text-red-500 text-sm">{errors.facility}</p>}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Specialty</label>
          <Select
            options={specialties}
            value={selectedSpecialties}
            onChange={handleSpecialtyChange}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select Specialties..."
            isMulti
            isDisabled={!selectedFacility}
          />
          {errors.specialties && <p className="text-red-500 text-sm">{errors.specialties}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Working Days</label>
          <div className="border rounded-lg p-4">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              minDate={nextWeekStart}
              maxDate={nextWeekEnd}
              inline
              className="w-full"
              disabled={editIndex !== null}
            />
          </div>
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Working Hours</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                name="from"
                value={workingHours.from}
                onChange={handleWorkingHoursChange}
                className="px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                placeholder="From"
                disabled={!selectedDate}
              />
              <input
                type="time"
                name="to"
                value={workingHours.to}
                onChange={handleWorkingHoursChange}
                className="px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                placeholder="To"
                disabled={!selectedDate}
              />
            </div>
            {errors.workingHours && <p className="text-red-500 text-sm">{errors.workingHours}</p>}
          </div>
          {/* Copy from Previous Week Button */}
  <button
    className="bg-green-600 text-white px-6 py-3 rounded-md mt-8 hover:bg-green-700 transition-colors duration-300"
    onClick={handleCopyFromPreviousWeek}
  >
    Copy from Previous Week
  </button>
  {editIndex !== null ? (
  <>
    <button
      className="bg-gray-500 text-white px-6 py-3 rounded-md mt-8 hover:bg-gray-600 transition-colors duration-300"
      onClick={handleDiscardChanges}
    >
      Discard Changes
    </button>
    <button
      className="bg-blue-600 text-white px-6 py-3 rounded-md mt-8 hover:bg-blue-700 transition-colors duration-300"
      onClick={handleAddOrUpdateFacility}
    >
      Save Changes
    </button>
  </>
) : (
  <button
    className="bg-blue-600 text-white px-6 py-3 rounded-md mt-8 hover:bg-blue-700 transition-colors duration-300"
    onClick={handleAddOrUpdateFacility}
  >
    Add Next Facility
  </button>
)}

        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Added Availabilities:</h3>
        <ul>
          {availabilities.map((availability, index) => (
            <li key={index} className="flex justify-between items-center border-b pb-2">
              <div>
                {availability.facility.label} - {availability.date} - {formatTo12Hour(availability.workingHours.from)} to{' '}
                {formatTo12Hour(availability.workingHours.to)}
                <br />
                <strong>Specialties:</strong> {availability.specialties.map((s) => s.label).join(', ')}
              </div>
              <div>
                <button
                  className="text-blue-500 hover:underline mr-4"
                  onClick={() => handleEditAvailability(index)}
                >
                  Edit
                </button>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => openDeleteModal(index)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 max-w-sm mx-auto">
              <h2 className="text-lg font-semibold text-center leading-relaxed">
                Are you sure you want to delete this availability?
              </h2>
              <div className="flex justify-between">
                <button
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                  onClick={closeDeleteModal}
                >
                  Close
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  onClick={handleDeleteAvailability}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}


      <ToastContainer />
    </div>
    </div>
    </div>
  );
};

export default AvailabilityChanges;
