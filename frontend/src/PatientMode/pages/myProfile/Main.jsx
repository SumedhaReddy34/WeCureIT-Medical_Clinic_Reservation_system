import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./HeaderProfile";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const [filters, setFilters] = useState({
    specialization: null,
    doctor: null,
    facility: null,
    date: null,
    length: null,
    timeSlot: null,
  });

  const [showDropdown, setShowDropdown] = useState({
    specialization: false,
    doctor: false,
    facility: false,
    date: false,
    length: false,
    timeSlot: false,
  });

  const [isLoading, setIsLoading] = useState({
    specialization: false,
    doctor: false,
    facility: false,
    date: false,
    length: false,
    timeSlot: false,
  });

  // Retrieve patientId from session storage
  const [patientId, setPatientId] = useState(() => sessionStorage.getItem("patientId"));

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [facilityOptions, setFacilityOptions] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);
  const [specialityOptions, setSpecialityOptions] = useState([]);
  const [timeSlotOptions, setTimeSlotOptions] = useState([]);
  const [lengthOptions] = useState([
    { id: 15, name: "15 mins" },
    { id: 30, name: "30 mins" },
    { id: 60, name: "1 hr" },
  ]);
  const token = localStorage.getItem("authToken");

  const navigate = useNavigate();

  // Fetch Options for a Dropdown
  const fetchOptions = async (type) => {
    try {
      // Set loading state to true
      setIsLoading((prev) => ({ ...prev, [type]: true }));

      // Clear previous options
      if (type === "specialization") {
        setSpecialityOptions([]);
      } else if (type === "doctor") {
        setDoctorOptions([]);
      } else if (type === "facility") {
        setFacilityOptions([]);
      } else if (type === "date") {
        setDateOptions([]);
      }

      let url;
      let params = {
        facility_name: filters.facility,
        speciality_name: filters.specialization,
        doctor_id: filters.doctor,
        availability_date: filters.date,
      };

      if (type === "specialization") {
        url = "http://localhost:4000/api/bookAppointment/filter/specialities";
        delete params.speciality_name;
      } else if (type === "doctor") {
        url = "http://localhost:4000/api/bookAppointment/filter/doctors";
      } else if (type === "facility") {
        url = "http://localhost:4000/api/bookAppointment/filter/facilities";
      } else if (type === "date") {
        url = "http://localhost:4000/api/bookAppointment/filter/dates";
      }

      const response = await axios.get(url, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;

      if (type === "specialization") {
        setSpecialityOptions(
          data.specialities.map((speciality) => ({ id: speciality, name: speciality }))
        );
      } else if (type === "doctor") {
        setDoctorOptions(
          data.doctors.map((doctor) => ({ id: doctor.id, name: doctor.name }))
        );
      } else if (type === "facility") {
        setFacilityOptions(
          data.facilities.map((facility) => ({ id: facility, name: facility }))
        );
      } else if (type === "date") {
        setDateOptions(data.dates.map((date) => ({ id: date, value: date })));
      }
    } catch (error) {
      console.error(`Error fetching ${type} options:`, error);
    } finally {
      // Set loading state to false
      setIsLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Fetch Time Slots
  const fetchTimeSlots = async () => {
    try {
      // Set loading state to true
      setIsLoading((prev) => ({ ...prev, timeSlot: true }));

      // Clear previous time slots
      setTimeSlotOptions([]);

      const { doctor, specialization, facility, length, date } = filters;
      const params = {
        doctor_id: doctor,
        speciality_name: specialization,
        facility_name: facility,
        slot_duration: length,
        date: date,
      };

      console.log("Fetching time slots with params:", params);

      const response = await axios.get(
        "http://localhost:4000/api/bookAppointment/generate-time-slots",
        { params }
      );

      console.log("Received time slots data:", response.data);

      const data = response.data;

      // Map over data.slots and format the time slots
      const formattedSlots = data.slots.map((slot) => {
        const startTime = new Date(slot.start);
        const endTime = new Date(slot.end);

        // Format the times as 'HH:MM' in UTC
        const startStr = startTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
          hour12: false,
        });
        const endStr = endTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
          hour12: false,
        });

        return {
          id: slot.start,
          name: `${startStr} - ${endStr}`,
          value: slot.start,
          endTime: slot.end, // Store end time for computing appointment_end_time
        };
      });

      setTimeSlotOptions(formattedSlots);
    } catch (error) {
      console.error(
        "Error fetching time slots:",
        error.response ? error.response.data : error.message
      );
    } finally {
      // Set loading state to false
      setIsLoading((prev) => ({ ...prev, timeSlot: false }));
    }
  };

  // Handle Dropdown Selection
  const handleSelection = (type, value, name) => {
    console.log(`Selected ${type}:`, { value, name });
    setFilters((prevFilters) => ({ ...prevFilters, [type]: value }));
    setShowDropdown((prevShow) => ({
      specialization: false,
      doctor: false,
      facility: false,
      date: false,
      length: false,
      timeSlot: false,
    }));

    setSelectedOptions((prevSelectedOptions) => {
      const updatedOptions = prevSelectedOptions.filter(
        (option) => option.type !== type
      );
      return [...updatedOptions, { type, value, name }];
    });
  };

  // Handle Change Button
  const handleChange = (type) => {
    const filterOrder = [
      "specialization",
      "doctor",
      "facility",
      "date",
      "length",
      "timeSlot",
    ];
    const typeIndex = filterOrder.indexOf(type);

    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      filterOrder.slice(typeIndex).forEach((key) => {
        updatedFilters[key] = null;
      });
      return updatedFilters;
    });

    setSelectedOptions((prevSelectedOptions) => {
      return prevSelectedOptions.filter((option) => {
        const optionIndex = filterOrder.indexOf(option.type);
        return optionIndex < typeIndex;
      });
    });

    setShowDropdown((prevShow) => ({
      specialization: false,
      doctor: false,
      facility: false,
      date: false,
      length: false,
      timeSlot: false,
      [type]: true,
    }));
  };

  // Toggle Dropdown
  const toggleDropdown = (type) => {
    setShowDropdown((prevShow) => {
      const updatedShow = {
        specialization: false,
        doctor: false,
        facility: false,
        date: false,
        length: false,
        timeSlot: false,
      };
      updatedShow[type] = !prevShow[type];
      return updatedShow;
    });

    if (type === "timeSlot") {
      fetchTimeSlots();
    } else {
      fetchOptions(type);
    }
  };

  // Booking Appointment
  const bookAppointment = async () => {
    try {
      const { doctor, date, facility, specialization, length, timeSlot } = filters;

      if (
        !doctor ||
        !date ||
        !facility ||
        !specialization ||
        !length ||
        !timeSlot
      ) {
        toast.error("Please fill in all required fields before booking");
        return;
      }

      // Compute appointment_end_time
      const startTime = new Date(timeSlot);
      const endTime = new Date(startTime.getTime() + length * 60000); // Add duration in milliseconds
      const appointment_end_time = endTime.toISOString();

      const payload = {
        patient_id: patientId,
        facility_name: facility,
        doctor_id: doctor,
        speciality_name: specialization,
        appointment_date: date,
        appointment_start_time: timeSlot, // ISO string
        appointment_end_time: appointment_end_time, // ISO string
        appointment_scheduled_duration: length,
      };

      console.log("Booking appointment with payload:", payload);

      const response = await axios.post(
        "http://localhost:4000/api/bookAppointment/add-appointment",
        payload
      );

      if (response?.data?.message) {
        toast.success("Appointment booked successfully!");
        navigate("/patient-dashboard"); // Redirect to /patient-dashboard
      } else {
        toast.error("Error booking appointment");
      }
    } catch (error) {
      toast.error("Error booking appointment");
      console.error("Error booking appointment:", error);
    }
  };

  return (
    <div>
      {/* Include Header */}
      <Header />

      {/* Add spacing below the header */}
      <div className="mb-8"></div>

      <div className="max-w-[500px] mx-auto p-5 bg-gray-100 rounded-lg shadow-lg text-center">
        <h2 className="text-gray-800 text-2xl mb-5">Book Your Appointment</h2>

        {/* Specialization */}
        <div>
          <button
            className="inline-block w-full py-3 px-6 my-2.5 text-lg text-white bg-blue-500 rounded-full cursor-pointer transition duration-300 ease-in-out shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transform"
            onClick={() => toggleDropdown("specialization")}
          >
            Specialization
          </button>
          {showDropdown.specialization && (
            <div className="mt-2.5 flex justify-center">
              {isLoading.specialization ? (
                <p>Loading...</p>
              ) : (
                <select
                  onChange={(e) =>
                    handleSelection(
                      "specialization",
                      e.target.value,
                      e.target.options[e.target.selectedIndex].text
                    )
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Specialization
                  </option>
                  {specialityOptions.map((speciality) => (
                    <option key={speciality.id} value={speciality.id}>
                      {speciality.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Doctor */}
        <div>
          <button
            className="inline-block w-full py-3 px-6 my-2.5 text-lg text-white bg-blue-500 rounded-full cursor-pointer transition duration-300 ease-in-out shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transform"
            onClick={() => toggleDropdown("doctor")}
          >
            Doctor
          </button>
          {showDropdown.doctor && (
            <div className="mt-2.5 flex justify-center">
              {isLoading.doctor ? (
                <p>Loading...</p>
              ) : (
                <select
                  onChange={(e) =>
                    handleSelection(
                      "doctor",
                      e.target.value,
                      e.target.options[e.target.selectedIndex].text
                    )
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Doctor
                  </option>
                  {doctorOptions.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Facility */}
        <div>
          <button
            className="inline-block w-full py-3 px-6 my-2.5 text-lg text-white bg-blue-500 rounded-full cursor-pointer transition duration-300 ease-in-out shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transform"
            onClick={() => toggleDropdown("facility")}
          >
            Facility
          </button>
          {showDropdown.facility && (
            <div className="mt-2.5 flex justify-center">
              {isLoading.facility ? (
                <p>Loading...</p>
              ) : (
                <select
                  onChange={(e) =>
                    handleSelection(
                      "facility",
                      e.target.value,
                      e.target.options[e.target.selectedIndex].text
                    )
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Facility
                  </option>
                  {facilityOptions.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          <button
            className="inline-block w-full py-3 px-6 my-2.5 text-lg text-white bg-blue-500 rounded-full cursor-pointer transition duration-300 ease-in-out shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transform"
            onClick={() => toggleDropdown("date")}
          >
            Date
          </button>
          {showDropdown.date && (
            <div className="mt-2.5 flex justify-center">
              {isLoading.date ? (
                <p>Loading...</p>
              ) : (
                <select
                  onChange={(e) =>
                    handleSelection(
                      "date",
                      e.target.value,
                      e.target.options[e.target.selectedIndex].text
                    )
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Date
                  </option>
                  {dateOptions.map((date) => (
                    <option key={date.id} value={date.value}>
                      {date.value}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Appointment Length */}
        {filters.specialization &&
          filters.doctor &&
          filters.facility &&
          filters.date && (
            <div>
              <button
                className="inline-block w-full py-3 px-6 my-2.5 text-lg text-white bg-blue-500 rounded-full cursor-pointer transition duration-300 ease-in-out shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transform"
                onClick={() => toggleDropdown("length")}
              >
                Appointment Length
              </button>
              {showDropdown.length && (
                <div className="mt-2.5 flex justify-center">
                  <select
                    onChange={(e) =>
                      handleSelection(
                        "length",
                        Number(e.target.value),
                        e.target.options[e.target.selectedIndex].text
                      )
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select Length
                    </option>
                    {lengthOptions.map((length) => (
                      <option key={length.id} value={length.id}>
                        {length.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

        {/* Time Slot */}
        {filters.specialization &&
          filters.doctor &&
          filters.facility &&
          filters.date &&
          filters.length && (
            <div>
              <button
                className="inline-block w-full py-3 px-6 my-2.5 text-lg text-white bg-blue-500 rounded-full cursor-pointer transition duration-300 ease-in-out shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transform"
                onClick={() => toggleDropdown("timeSlot")}
              >
                Time Slot
              </button>
              {showDropdown.timeSlot && (
                <div className="mt-2.5 flex justify-center">
                  {isLoading.timeSlot ? (
                    <p>Loading...</p>
                  ) : (
                    <select
                      onChange={(e) =>
                        handleSelection(
                          "timeSlot",
                          e.target.value,
                          e.target.options[e.target.selectedIndex].text
                        )
                      }
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select Time Slot
                      </option>
                      {timeSlotOptions.map((slot) => (
                        <option key={slot.id} value={slot.value}>
                          {slot.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Selected Options */}
        <div className="mt-5 flex flex-col items-center gap-3">
          {selectedOptions.map((option, index) => (
            <div
              key={index}
              className="bg-gray-200 border border-gray-300 rounded-full py-3 px-5 text-base text-blue-500 flex justify-between items-center w-full max-w-[500px] shadow-md"
            >
              <h4 className="text-base text-blue-500 font-bold capitalize flex-grow">
                {option.type.charAt(0).toUpperCase() + option.type.slice(1)}
              </h4>
              <p className="m-0 text-gray-700 text-base flex-grow">
                {option.name}
              </p>
              <button
                className="bg-blue-800 text-white text-sm py-2 px-4 rounded-full cursor-pointer transition duration-300 ease-in-out hover:bg-blue-900 active:scale-95 transform"
                onClick={() => handleChange(option.type)}
              >
                Change
              </button>
            </div>
          ))}
        </div>

        {/* Booking Button */}
        {Object.values(filters).every((value) => value !== null) && (
          <button
            className="inline-block w-full py-3.5 px-6 mt-5 text-xl text-white bg-blue-600 rounded-full cursor-pointer transition duration-300 ease-in-out shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transform"
            onClick={bookAppointment}
          >
            Book Appointment
          </button>
        )}
      </div>
    </div>
  );
};

export default Main;
