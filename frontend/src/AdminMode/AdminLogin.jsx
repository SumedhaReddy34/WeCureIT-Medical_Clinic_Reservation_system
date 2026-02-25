import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for API calls

function AdminLogin() {
  const navigate = useNavigate();
  const [user_id, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to hold error messages

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Call the authentication API
      const response = await axios.post('http://localhost:4000/api/admin/authenticate', {
        user_id,
        password,
      });

      // If authentication is successful, navigate to the dashboard
      if (response.status === 200) {
        const { token } = response.data; // Extract token from response
        localStorage.setItem('authToken', token); // Store the token in localStorage
        setError(''); // Clear error state
        navigate('/admin-dashboard'); // Redirect to Dashboard
      }
    } catch (error) {
      // Handle authentication failure
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error); // Set the error message from backend
      } else {
        setError('Server error. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full px-4 py-3 bg-white border-b border-gray-300 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left Section: Logo and Admin Badge */}
          <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-indigo-800">WeCureIt</h1>
            <span className="px-3 py-1 text-xs font-thin leading-4 text-gray-600 rounded-full border border-gray-500">
            Admin
            </span>
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
        </div>
      </header>

      {/* Login Card */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white border rounded-lg shadow-lg w-[400px] p-6">
          <h2 className="text-lg font-medium text-center text-gray-800 mb-6">
            <span className="text-indigo-800 font-bold">Admin</span> Login
          </h2>
          <form onSubmit={handleLogin}>
            {/* User ID Field */}
            <div className="mb-4">
              <label htmlFor="user_id" className="block text-sm text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                id="user_id"
                name="user_id"
                value={user_id}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                placeholder="Enter your user ID"
              />
            </div>
            {/* Password Field */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                placeholder="Enter your password"
              />
            </div>
            {/* Display Error Message */}
            {error && (
              <div className="mb-4 text-sm text-red-600 text-center">
                {error}
              </div>
            )}
            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-indigo-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
