// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api", // Replace with your backend base URL
});

export default axiosInstance;
