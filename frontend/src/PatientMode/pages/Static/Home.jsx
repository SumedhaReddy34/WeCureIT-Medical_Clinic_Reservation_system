import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer'; // Import the Footer component

const Home = () => {
  const [specialities, setSpecialities] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specialitiesResponse, facilitiesResponse, doctorsResponse] = await Promise.all([
          axios.get('http://localhost:4000/api/specializations'),
          axios.get('http://localhost:4000/api/facilities'),
          axios.get('http://localhost:4000/api/doctors'),
        ]);

        const specialitiesData = specialitiesResponse.data.map((speciality) => speciality.name);
        const facilitiesData = facilitiesResponse.data.map((facility) => facility.name);
        const doctorsData = doctorsResponse.data.map((doctor) => doctor.name);

        setSpecialities(specialitiesData);
        setFacilities(facilitiesData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center text-lg">Loading...</p>;
  }

  return (
    <div>
      <Header />

      {/* Banner Section */}
      <div className="container mx-auto px-4 py-8">
        <section className="relative w-[95%] mx-auto mb-8">
          <div className="flex justify-start items-center bg-blue-600 text-white py-16 rounded-lg mx-auto w-[100%] shadow-md">
            <div className="text-align-left pl-16">
              <h1 className="text-4xl font-bold mb-4">Book Appointment</h1>
              <p className="text-xl mb-6">With Trusted Doctors</p>
              <button
                className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold text-lg hover:scale-105 transition-all"
                onClick={() => window.location.href = '/patientlogin'}
              >
                Login →
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Find by Preferred Section */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-2 text-blue-600">
          Find by Preferred Speciality, Facility or Doctor
        </h2>
        <p className="text-center text-gray-700 mb-6">
          Simply browse through our different facilities offering different specialities from our trusted doctors, schedule your appointment hassle free.
        </p>

        {/* Specialities Section */}
        <div className="bg-gray-100 shadow-lg rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-center text-blue-600">Specialities</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {specialities.map((speciality, index) => (
              <div
                key={index}
                className="bg-white text-blue-600 font-medium text-center py-2 px-4 rounded-lg shadow-sm"
              >
                {speciality}
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Section with Scroller */}
        <div className="bg-gray-100 shadow-lg rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-center text-blue-600">Facilities</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
            {facilities.map((facility, index) => (
              <div
                key={index}
                className="bg-white text-blue-600 font-medium text-center py-2 px-4 rounded-lg shadow-sm whitespace-nowrap"
              >
                {facility}
              </div>
            ))}
          </div>
        </div>

        {/* Doctors Section with Scroller */}
        <div className="bg-gray-100 shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-center text-blue-600">Doctors</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
            {doctors.map((doctor, index) => (
              <div
                key={index}
                className="bg-white text-blue-600 font-medium text-center py-2 px-4 rounded-lg shadow-sm whitespace-nowrap"
              >
                {doctor}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Footer */}
      <Footer />
    </div>
  );
};

export default Home;
