import axios from 'axios';

const axiosConfig = {
  baseURL: 'https://bhepdemoapi.azurewebsites.net/Api/V1',
  timeout: 5000,
};

export const axiosInstance = axios.create(axiosConfig);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  },
);
