import axios from 'axios';

const axiosClient = axios.create();

axiosClient.defaults.baseURL = process.env.NODE_ENV === "production"
                                ? "https://webserver.com/api"
                                : "http://localhost:5000/api";

//All request will wait 10 seconds before timeout
axiosClient.defaults.timeout = 10000;

axiosClient.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token');
  if (token !== undefined || token !== null) config.headers.Authorization =  `Bearer ${token}`
  return config;
});

export default axiosClient
