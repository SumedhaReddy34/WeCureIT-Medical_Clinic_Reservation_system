import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="relative flex items-center w-full px-6 py-4 bg-white border-b border-gray-300">
      {/* Logo Section */}
      <div className="flex items-center gap-4 flex-none">
        <h1
          className="text-2xl font-bold text-indigo-800 cursor-pointer"
          onClick={() => navigate('/')}
        >
          WeCureIT
        </h1>
      </div>

      {/* Authentication Buttons (Right) */}
      <div className="flex gap-4 flex-none ml-auto">
        <button
          onClick={() => navigate('/adminlogin')}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Admin Login
        </button>
        <button
          onClick={() => navigate('/doctorlogin')}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Doctor Login
        </button>
        <button
          onClick={() => navigate('/patientlogin')}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Patient Login
        </button>
        <button
          onClick={() => navigate('/create-account')}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Create Account
        </button>
      </div>

      {/* Navigation Links (Centered) */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <nav className="inline-flex gap-6 text-sm font-medium">
          <button
            onClick={() => navigate('/')}
            className="hover:text-indigo-600 transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => navigate('/about')}
            className="hover:text-indigo-600 transition-colors"
          >
            About
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="hover:text-indigo-600 transition-colors"
          >
            Contact
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
