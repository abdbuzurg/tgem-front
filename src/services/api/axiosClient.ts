import axios from 'axios';

const axiosClient = axios.create();

axiosClient.defaults.baseURL = process.env.NODE_ENV === "production"
                                ? "http://79.141.74.35/api"
                                : "http://localhost:5000/api";

//All request will wait 180 seconds before timeout
axiosClient.defaults.timeout = 180000;

axiosClient.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token');
  if (token !== undefined || token !== null) {
    config.headers.Authorization =  `Bearer ${token}`
  }
  return config;
});

export default axiosClient
