import React from 'react';
import PatientDetails from './PatientDetails';
import CompletedBookings from './CompletedBookings';
import Header from './Header';
import Sidebar from './Sidebar';

function Appointments() {
  return (
    <div className="flex flex-col min-h-screen">
    <Header /> {/* Header stays at the top */}
    <div className="flex">
      <Sidebar /> {/* Sidebar on the left */}
          <div className="p-6 bg-gray-50 flex-1">
            <div className="grid grid-cols-2 gap-6">
              <PatientDetails />
              <CompletedBookings />
            </div>
          </div>
       </div>
    </div>
  );
}

export default Appointments;
