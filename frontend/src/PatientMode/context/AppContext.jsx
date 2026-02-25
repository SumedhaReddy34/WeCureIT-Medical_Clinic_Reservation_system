import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios';

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const currencySymbol = '$';
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [doctors, setDoctors] = useState([]);
    const [userData, setUserData] = useState(null);

    // Helper function for error handling
    const handleError = (error) => {
        console.error(error);
        toast.error(error.response?.data?.message || 'Something went wrong!');
    };


    // Fetch user profile and load userData
    const loadUserProfileData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return; // If no token, skip API call

            const { data } = await axios.get(`${backendUrl}/api/user/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            

            if (data.success) {
                setUserData(data.userData); // Update user data in context
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    // Load data on mount or when token changes
    useEffect(() => {
        // getDoctorsData();
        loadUserProfileData(); // Only loads if the user is logged in (has token)
    }, []); // Run it on initial load or token change

    const value = {
        doctors,
        // getDoctorsData,
        currencySymbol,
        backendUrl,
        userData,
        setUserData,
        loadUserProfileData,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;




