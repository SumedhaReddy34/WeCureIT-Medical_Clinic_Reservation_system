import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import Modal from './Modal';  // Assuming you have a Modal component

function Header() {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true); // Open the logout confirmation modal
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false); // Close the logout confirmation modal
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('authToken'); // Clear token
    navigate('/');
    // Add actual logout logic here, such as redirecting to a login page or clearing session
    setIsLogoutModalOpen(false); // Close the modal after confirming logout
  };

  return (
    <header className="flex justify-between items-center w-full px-4 py-1 bg-white border-b border-gray-300">
      <div className="flex items-center gap-5">
        <h1 className="text-2xl font-bold text-indigo-800">WeCureIt</h1>
        <span className="px-3 py-1 text-xs font-thin leading-4 text-gray-600 rounded-full border border-gray-500">
          Admin
        </span>
      </div>

      {/* Logout button aligned to the right */}
      <button
        onClick={handleLogoutClick}  // Show confirmation modal when clicked
        className="px-6 py-2 text-sm text-white bg-indigo-500 rounded-full transition-colors duration-200 hover:bg-indigo-600 hover:shadow-lg"
      >
        Logout
      </button>

      {/* Logout Confirmation Modal */}

      {isLogoutModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-lg">
              <p className="text-lg mb-4">Are you sure you want to Logout?</p>
              <div className="flex justify-center gap-2">
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
