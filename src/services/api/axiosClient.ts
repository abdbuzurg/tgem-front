import axios from 'axios';

const axiosClient = axios.create();

axiosClient.defaults.baseURL = "http://127.0.0.1:8080"

axiosClient.defaults.headers.common = {
  'Content-Type': 'application/json, x-www-form-urlencoded',
  Accept: 'application/json',
};

//All request will wait 10 seconds before timeout
axiosClient.defaults.timeout = 10000;

axiosClient.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token');
  if (token !== undefined || token !== null) config.headers.Authorization =  `Bearer ${token}`
  return config;
});

export default axiosClient