import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './HeaderProfile';

const PatientProfile = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [showFields, setShowFields] = useState({
    credit_card_no: false,
    credit_card_cvv: false,
    credit_card_exp_date: false,
  });
  const [errors, setErrors] = useState({}); // State for validation errors

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const patientId = sessionStorage.getItem('patientId');
        if (!patientId) {
          throw new Error('Patient ID not found. Please log in again.');
        }

        const response = await axios.get(
          `http://localhost:4000/api/patients/get-patient/${patientId}`
        );

        setPatient(response.data.patient);
      } catch (error) {
        console.error('Error fetching patient details:', error);
        setError('Unable to fetch patient details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, []);

  const handleEditClick = () => {
    setFormData({
      email: patient.email || '',
      phone_number: patient.phone_number || '',
      dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
      gender: patient.gender || '',
      credit_card_no: patient.credit_card_no || '',
      credit_card_cvv: patient.credit_card_cvv || '',
      credit_card_exp_date: patient.credit_card_exp_date || '',
      zip_code: patient.zip_code || '',
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveChanges = async () => {
    // Validate mandatory fields
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.credit_card_no) {
      newErrors.credit_card_no = 'Credit card number is required';
    }
    if (!formData.credit_card_cvv) {
      newErrors.credit_card_cvv = 'CVV is required';
    }
    if (!formData.credit_card_exp_date) {
      newErrors.credit_card_exp_date = 'Expiry date is required';
    }
    if (!formData.zip_code) {
      newErrors.zip_code = 'Zip code is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors
    setErrors({});

    try {
      const patientId = sessionStorage.getItem('patientId');
      if (!patientId) {
        throw new Error('Patient ID not found. Please log in again.');
      }

      const response = await axios.put(
        `http://localhost:4000/api/patients/edit-patient/${patientId}`,
        formData
      );

      if (response.data) {
        setPatient({ ...patient, ...formData });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving changes:', error);

      // Check if the error response contains the specific "Email already exists" message
      if (
        error.response &&
        error.response.data &&
        error.response.data.error === 'Email already exists, please try another email'
      ) {
        setErrors({ email: error.response.data.error });
      } else {
        setError('Unable to save changes. Please try again later.');
      }

    }
  };

  const toggleFieldVisibility = (field) => {
    setShowFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCancel = () => {
    setIsCancelConfirmationOpen(true);
  };

  const confirmCancel = () => {
    setIsCancelConfirmationOpen(false);
    setIsModalOpen(false);
  };

  const closeCancelConfirmation = () => {
    setIsCancelConfirmationOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <p className="text-center text-lg">Loading patient details...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">{patient?.full_name || 'N/A'}</h1>
        <hr className="mb-6" />

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
          <p className="mb-1">
            <strong>Email:</strong> {patient?.email || 'N/A'}
          </p>
          <p>
            <strong>Phone:</strong> {patient?.phone_number || 'N/A'}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
          <p className="mb-1">
            <strong>Gender:</strong> {patient?.gender || 'N/A'}
          </p>
          <p>
            <strong>Date of Birth:</strong>{' '}
            {patient?.dob
              ? new Date(patient.dob).toLocaleDateString('en-US', { timeZone: 'UTC' })
              : 'N/A'}
          </p>
          <p>
            <strong>Zip Code:</strong> {patient?.zip_code || 'N/A'}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Card Credentials</h2>
          <p className="mb-1 flex items-center">
            <strong>Card Number:</strong>{' '}
            {showFields.credit_card_no ? patient?.credit_card_no || 'N/A' : '*****'}
            <button
              onClick={() => toggleFieldVisibility('credit_card_no')}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              {showFields.credit_card_no ? 'Hide' : 'Show'}
            </button>
          </p>
          <p className="mb-1 flex items-center">
            <strong>CVV:</strong>{' '}
            {showFields.credit_card_cvv ? patient?.credit_card_cvv || 'N/A' : '***'}
            <button
              onClick={() => toggleFieldVisibility('credit_card_cvv')}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              {showFields.credit_card_cvv ? 'Hide' : 'Show'}
            </button>
          </p>
          <p className="mb-1 flex items-center">
            <strong>Expiry Date:</strong>{' '}
            {showFields.credit_card_exp_date ? patient?.credit_card_exp_date || 'N/A' : '*****'}
            <button
              onClick={() => toggleFieldVisibility('credit_card_exp_date')}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              {showFields.credit_card_exp_date ? 'Hide' : 'Show'}
            </button>
          </p>
        </div>

        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          onClick={handleEditClick}
        >
          Edit Profile
        </button>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md max-h-[95vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="border rounded w-full p-2"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Phone:</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="border rounded w-full p-2"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Gender:</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="border rounded w-full p-2"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">DOB:</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="border rounded w-full p-2"
              />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Card Number:</label>
              <input
                type={showFields.credit_card_no ? 'text' : 'password'}
                name="credit_card_no"
                value={formData.credit_card_no}
                onChange={handleInputChange}
                className="border rounded w-full p-2"
              />
              <button
                onClick={() => toggleFieldVisibility('credit_card_no')}
                className="text-blue-600 hover:text-blue-800 mt-1"
              >
                {showFields.credit_card_no ? 'Hide' : 'Show'}
              </button>
              {errors.credit_card_no && (
                <p className="text-red-500 text-xs mt-1">{errors.credit_card_no}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">CVV:</label>
              <input
                type={showFields.credit_card_cvv ? 'text' : 'password'}
                name="credit_card_cvv"
                value={formData.credit_card_cvv}
                onChange={handleInputChange}
                className="border rounded w-full p-2"
              />
              <button
                onClick={() => toggleFieldVisibility('credit_card_cvv')}
                className="text-blue-600 hover:text-blue-800 mt-1"
              >
                {showFields.credit_card_cvv ? 'Hide' : 'Show'}
              </button>
              {errors.credit_card_cvv && (
                <p className="text-red-500 text-xs mt-1">{errors.credit_card_cvv}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Expiry Date:</label>
              <input
                type={showFields.credit_card_exp_date ? 'month' : 'password'}
                name="credit_card_exp_date"
                value={formData.credit_card_exp_date}
                onChange={handleInputChange}
                className="border rounded w-full p-2"
              />
              <button
                onClick={() => toggleFieldVisibility('credit_card_exp_date')}
                className="text-blue-600 hover:text-blue-800 mt-1"
              >
                {showFields.credit_card_exp_date ? 'Hide' : 'Show'}
              </button>
              {errors.credit_card_exp_date && (
                <p className="text-red-500 text-xs mt-1">{errors.credit_card_exp_date}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Zip Code:</label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                className="border rounded w-full p-2"
              />
              {errors.zip_code && (
                <p className="text-red-500 text-xs mt-1">{errors.zip_code}</p>
              )}
            </div>

            <p className="text-xs text-red-500 mb-4">
              Note: Credit/Debit card is required for reservation, but you can pay with a
              different card at the end of your appointment. Cancellations or missed appointments
              within 24 hours will be charged to the saved card.
            </p>

            <div className="flex justify-between">
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {isCancelConfirmationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm">
            <h2 className="text-lg font-bold mb-4">Discard Changes?</h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to discard your changes?
            </p>
            <div className="flex justify-between">
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg"
                onClick={closeCancelConfirmation}
              >
                Back to Edit
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                onClick={confirmCancel}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
