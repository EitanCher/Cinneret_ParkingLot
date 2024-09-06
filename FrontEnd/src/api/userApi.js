import axios from 'axios';

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/users` // Adjust the environment variable name as needed
});

//add total spaces to each city

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
