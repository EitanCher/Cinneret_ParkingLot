import axios from 'axios';
import Cookies from 'js-cookie';

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/users`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchUserDetails = async (token) => {
  try {
    // Make a GET request to the /user/details endpoint with the token in the Authorization header
    const response = await api.get('/details', {
      headers: {
        Authorization: `Bearer ${token}` // Include the token in the Authorization header
      }
    });
    return response.data; // Return the user details from the response
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error; // Re-throw the error for the calling code to handle
  }
};
//add total spaces to each city

api.interceptors.request.use(
  (config) => {
    // Retrieve the token from cookies
    const token = Cookies.get('authToken');
    if (token) {
      // Attach token to the request headers
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle specific status codes or errors
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, e.g., redirect to login page
      console.error('Unauthorized access - maybe need to refresh token or login again');
      // You can also redirect the user to the login page here
    }
    return Promise.reject(error);
  }
);

// Function to fetch cities data
export const fetchCities = async () => {
  try {
    console.log('api is: ' + `${import.meta.env.VITE_API_URL}`);
    const response = await api.get('/parkinglots'); // Make GET request to fetch cities
    return response.data; // Return the fetched data
  } catch (error) {
    console.error('Error fetching cities:', error); // Log the error
    throw error; // Re-throw the error for the component to handle
  }
};

export const fetchSubscriptions = async () => {
  try {
    const response = await api.get('/subscriptions'); // Adjust the endpoint
    return response.data; // Return the fetched data
  } catch (error) {
    console.error('Error fetching subscriptions:', error); // Log the error
    throw error; // Re-throw the error for the component to handle
  }
};

export const login = async (Email, Password) => {
  try {
    const response = await api.post('/login', {
      Email: Email,
      Password: Password
    });
    return response.data; // Return the response data
  } catch (error) {
    console.error('Error during login:', error); // Log the error
    throw error; // Re-throw the error for the component to handle
  }
};
