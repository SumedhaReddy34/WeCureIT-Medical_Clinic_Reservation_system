import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for the profile dropdown
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State for the logout confirmation modal

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle the dropdown
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true); // Open the logout confirmation modal
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false); // Close the logout confirmation modal
  };

  const handleConfirmLogout = () => {
    sessionStorage.removeItem('patientId'); // Clear session storage
    sessionStorage.removeItem('authToken');  // Clear authToken from session storage
    navigate('/'); // Redirect to login page
    setIsLogoutModalOpen(false); // Close the modal after confirming logout
  };

  return (
    <header className="flex justify-between items-center w-full px-6 py-4 bg-white border-b border-gray-300">
      {/* Logo Section */}
      <div className="flex items-center gap-4">
        <h1
          className="text-2xl font-bold text-indigo-800 cursor-pointer"
          onClick={() => navigate('/')}
        >
          WeCureIT
        </h1>
      </div>

      {/* Profile Section */}
      <div className="relative">
        <button
          className="flex items-center justify-between w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 px-4"
          onClick={toggleDropdown}
        >
          <span className="sr-only">Profile</span>
          <svg
            className={`w-4 h-4 transform ${
              isDropdownOpen ? 'rotate-180' : ''
            } transition-transform`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Profile Dropdown */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <button
              onClick={() => navigate('/my-profile')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              My Profile
            </button>
            <button
              onClick={() => navigate('/bookAppointment')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Book Appointment
            </button>
            <button
              onClick={() => navigate('/patient-dashboard')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </button>
            <hr className="my-1" />
            <button
              onClick={handleLogoutClick}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <p className="text-lg font-semibold mb-4 text-center">
              Are you sure you want to Logout?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-full"
                onClick={handleCloseLogoutModal}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                onClick={handleConfirmLogout}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
