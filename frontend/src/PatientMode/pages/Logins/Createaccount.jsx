import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Header from './HeaderLogin'; // Import the Header component

const CreateAccount = () => {
  const [state, setState] = useState('Sign Up'); // Current state for Sign Up/Login toggle

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState(''); // Default gender is Male
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [zipcode, setZipcode] = useState('');

  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) return 'Full Name is required';
    if (!email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return 'Valid Email is required';
    if (!password.trim() || password.length < 6) return 'Password must be at least 6 characters';
    if (!phone.trim() || !/^\d{10}$/.test(phone)) return 'Valid Phone Number is required';
    if (!dob.trim()) return 'Date of Birth is required';
    if (!gender.trim()) return 'Gender is required';
    if (!cardNumber.trim() || !/^\d{16}$/.test(cardNumber)) return 'Valid Credit Card Number is required';
    if (!expDate.trim()) return 'Expiration Date is required';
    if (!cvv.trim() || !/^\d{3}$/.test(cvv)) return 'Valid CVV is required';
    if (!zipcode.trim() || !/^\d{5}$/.test(zipcode)) return 'Valid Zipcode is required';
    return null; // No errors
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validate form before sending the request
    const errorMessage = validateForm();
    if (errorMessage) {
      toast.error(errorMessage); // Show validation error
      return;
    }

    // Patient Registration
    if (state === 'Sign Up') {
      try {
        const { data } = await axios.post('http://localhost:4000/api/patients/add-patient', {
          full_name: name,
          email,
          password,
          phone_number:phone,
          gender,
          dob,
          credit_card_no: cardNumber,
          credit_card_exp_date: expDate,
          credit_card_cvv: cvv,
          zip_code: zipcode,
        });

        if (data.message) {
          toast.success(data.message);
          navigate('/patientlogin'); // Redirect to login page after successful registration
        } else {
          toast.error('Failed to create account. Please try again.');
        }
      } catch (error) {
        if (error.response && error.response.data) {
          toast.error(error.response.data.error); // Show backend error message
        } else {
          toast.error('An error occurred. Please try again later.');
        }
        console.error('Error:', error);
      }
    }
  };

  return (
    <div>
      {/* Add Header */}
      <Header />

      {/* Main Content */}
      <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center justify-center mt-16">
        <div className="flex flex-col gap-3 p-8 max-w-[75%] sm:max-w-[60%] lg:max-w-[40%] border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
          <h2 className="text-lg font-large text-gray-800 mb-1">
            <span className="text-indigo-800 font-bold">Create</span> Account
          </h2>
          <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book an appointment</p>
          {state === 'Sign Up' && (
            <div className="w-full">
              <p>Full Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="border border-[#DADADA] rounded w-full p-2 mt-1"
                type="text"
                required
              />
            </div>
          )}
          <div className="w-full">
            <p>Email</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="email"
              required
            />
          </div>
          <div className="w-full">
            <p>Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="password"
              required
            />
          </div>
          <div className="w-full">
            <p>Phone</p>
            <input
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="tel"
              required
            />
          </div>
          <div className="w-full">
            <p>Gender</p>
            <select
              onChange={(e) => setGender(e.target.value)}
              value={gender}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              required
            >
               <option value="" disabled>
                  Select Gender
                </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="w-full">
            <p>Date of Birth</p>
            <input
              onChange={(e) => setDob(e.target.value)}
              value={dob}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="date"
              required
            />
          </div>
          <div className="w-full">
            <p>Credit Card Number</p>
            <input
              onChange={(e) => setCardNumber(e.target.value)}
              value={cardNumber}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="text"
              required
            />
          </div>
          <div className="w-full">
            <p>Expiration Date</p>
            <input
              onChange={(e) => setExpDate(e.target.value)}
              value={expDate}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="month"
              required
            />
          </div>
          <div className="w-full">
            <p>CVV</p>
            <input
              onChange={(e) => setCvv(e.target.value)}
              value={cvv}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="text"
              required
            />
          </div>
          <div className="w-full">
            <p>Zipcode</p>
            <input
              onChange={(e) => setZipcode(e.target.value)}
              value={zipcode}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="text"
              required
            />
            <p className="text-xs text-red-500 mt-1">
              Note: Credit/Debit card is required for reservation, but you can pay with a different card at the end of
              your appointment. Cancellations or missed appointments within 24 hours will be charged to the saved card.
            </p>
          </div>

          <button className="bg-blue-600 text-white w-full py-2 my-2 rounded-md text-base">
            {state === 'Sign Up' ? 'Create account' : 'Login'}
          </button>
          {state === 'Sign Up' ? (
            <p>
              Already have an account?{' '}
              <span
                onClick={() => {
                  setState('Login');
                  navigate('/patientlogin'); // Redirect to login page
                }}
                className="text-blue-600 underline cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <span onClick={() => setState('Sign Up')} className="text-blue-600 underline cursor-pointer">
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateAccount;
