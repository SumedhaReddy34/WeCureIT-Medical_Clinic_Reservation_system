import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // For showing success or error messages
import { useNavigate } from 'react-router-dom'; // For navigation after login
import Header from './HeaderLogin'; // Import the Header component

const PatientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // To handle loading state

  const navigate = useNavigate(); // For redirecting after successful login

  // Function to handle form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Basic validation for email and password
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    setLoading(true); // Show loading spinner

    try {
      // Send POST request to authenticate the patient
      const response = await axios.post('http://localhost:4000/api/patients/authenticate', {
        email,
        password,
      });

      // If login is successful
      if (response.status === 200) {
        const { token, patientId } = response.data; // Assuming backend returns both token and patient ID

        // Store the token and patientId in sessionStorage
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('patientId', patientId);

        // Show success message
        toast.success('Login successful!');

        // Redirect to a protected route or patient dashboard
        navigate('/patient-dashboard'); // Update with your desired route
      }
    } catch (error) {
      // Handle login errors
      if (error.response && error.response.data) {
        toast.error(error.response.data.error); // Show backend error message
      } else {
        toast.error('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Add Header */}
      <Header />

      {/* Main Content */}
      <div className="flex items-center justify-center flex-grow">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
        >
          <h2 className="text-lg font-medium text-center text-gray-800 mb-6">
            <span className="text-indigo-800 font-bold">Patient</span> Login
          </h2>

          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your Email Address"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your Password"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`w-full py-2 text-white font-semibold rounded ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading} // Disable the button while loading
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* No Account? Create Account Link */}
          <div className="text-center mt-4">
            <p className="text-sm">
              Don't have an account?{' '}
              <span
                onClick={() => navigate('/create-account')}
                className="text-blue-600 underline cursor-pointer"
              >
                Create Account
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientLogin;
