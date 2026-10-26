import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

API.interceptors.request.use(
  (config) => {
    const path = config.url || "";
    const isEmployeeEndpoint = path.startsWith("/employees/me/");

    const token = isEmployeeEndpoint
      ? sessionStorage.getItem("employeeToken")
      : sessionStorage.getItem("adminToken");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
