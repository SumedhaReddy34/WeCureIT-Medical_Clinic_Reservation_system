import React, { useState, useEffect } from 'react';
import Schedule from './Schedule';
import UpcomingBookings from './UpcomingBookings';
import CompletedBookings from './CompletedBookings';
import Header from './Header';
import Sidebar from './Sidebar';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState([
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/bed9b7541659c2d430a307f8e5f21a44d44d0dc1d9446ba2a7cbd611df96bde3?placeholderIfAbsent=true&apiKey=8f0d2cc9bf764b679624a1d309a49f82",
      count: 0,
      label: "Appointments",
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/fd4001b3ce059345da6e2573f27283b4252a81f91fb09ee7d168ab983a1c21a2?placeholderIfAbsent=true&apiKey=8f0d2cc9bf764b679624a1d309a49f82",
      count: 0,
      label: "Patients",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const doctorID = sessionStorage.getItem('DoctorId');
        if (!doctorID) {
          setError('Doctor ID is missing. Please log in again.');
          return;
        }

        // Fetch appointments count
        const appointmentsRes = await axios.get(
          `http://localhost:4000/api/doctorStat/appointments/count/${doctorID}`
        );

        // Fetch unique patients count
        const patientsRes = await axios.get(
          `http://localhost:4000/api/doctorStat/appointments/patients/${doctorID}`
        );

        // Update stats with fetched data
        setStats([
          {
            icon: stats[0].icon,
            count: appointmentsRes.data.Count,
            label: stats[0].label,
          },
          {
            icon: stats[1].icon,
            count: patientsRes.data.uniquePatientCount,
            label: stats[1].label,
          },
        ]);

        setError('');
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to fetch stats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Top statistics section */}
          <div className="flex flex-wrap gap-6 mb-6">
            {loading ? (
              <div className="col-span-2 text-center">
                <p>Loading stats...</p>
              </div>
            ) : error ? (
              <div className="col-span-2 text-center text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              stats.map((stat, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow flex items-center min-w-[250px] max-w-[250px]">
                  <img src={stat.icon} alt={stat.label} className="w-16 h-16 mr-4" />
                  <div>
                    <h2 className="text-2xl font-bold">{stat.count}</h2>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Schedule, Upcoming, and Completed Bookings */}
          <div className="grid grid-cols-3 gap-6">
            <Schedule />
            <UpcomingBookings />
            <CompletedBookings />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
