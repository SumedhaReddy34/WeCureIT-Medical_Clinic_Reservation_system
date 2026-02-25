import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

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

      {/* Navigation Links */}
      <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-6 text-sm font-medium">
        <button
          onClick={() => navigate('/')}
          className="hover:text-indigo-600 transition-colors duration-200"
        >
          Home
        </button>
        <button
          onClick={() => navigate('/about')}
          className="hover:text-indigo-600 transition-colors duration-200"
        >
          About
        </button>
        <button
          onClick={() => navigate('/contact')}
          className="hover:text-indigo-600 transition-colors duration-200"
        >
          Contact
        </button>
      </nav>
    </header>
  );
}

export default Header;
