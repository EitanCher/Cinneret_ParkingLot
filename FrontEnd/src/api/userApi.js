import axios from 'axios';
import Cookies from 'js-cookie';

// Create an axios instance with a base URL
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/users`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Ensure cookies are sent with requests
});

//add total spaces to each city

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - maybe need to refresh token or login again');
    }
    return Promise.reject(error);
  }
);

export const fetchUserDetails = async () => {
  try {
    console.log('fetched user details function triggered');
    const response = await api.get('/details');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('response.data in fetchUserDetails is:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

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

export const signUpUser = async (persId, firstName, lastName, email, phone, password) => {
  try {
    console.log('Payload being sent:', {
      persId: persId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      password: password
    });
    const response = await api.post(
      '/signup',
      {
        persId: persId,
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
        Password: password
      },
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
};
export const login = async (Email, Password) => {
  try {
    const response = await api.post(
      '/login',
      {
        Email: Email,
        Password: Password
      },
      { withCredentials: true }
    ); // Ensure cookies are sent and received
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/logout', {}, { withCredentials: true });
    // Check the response status to ensure the logout was successful
    console.log('Response:', response.status);
    if (response.status == 200) {
      return response; // Return response data if needed
    } else {
      throw new Error('Logout failed on the server side. (userapi)');
    }
  } catch (error) {
    console.error('Error during logout request:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};
