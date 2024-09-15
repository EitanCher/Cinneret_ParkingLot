import axios from 'axios';

// Create the Axios instance for admin API
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Ensure cookies are sent with requests
});

// Add interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response, // If the response is successful, return it
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - maybe need to refresh token or login again');
      // You could also trigger a logout or redirect to the login page here
    }
    return Promise.reject(error); // Propagate the error further
  }
);

export const fetchUserCounts = async () => {
  try {
    const response = await api.get('/users/counts', { withCredentials: true });

    return response.data; // Ensure response.data is returned
  } catch (error) {
    console.error('Error fetching user counts:', error);
    throw error;
  }
};

export const fetchIncomeData = async ({ startDate, endDate }) => {
  try {
    console.log('startDate and endDate in admin api:', startDate, endDate);
    // Ensure startDate and endDate are provided and are valid Date objects
    if (!startDate || !endDate) {
      throw new Error('Both startDate and endDate are required.');
    }

    // Convert to ISO strings
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();

    const response = await api.get('/income-by-dates', {
      params: {
        startDate: formattedStartDate, // Ensure parameter names match those expected by the API
        endDate: formattedEndDate
      },
      withCredentials: true
    });

    console.log('response.data of fetchIncomeData in admin api:', response.data);
    return response.data; // Ensure response.data is returned
  } catch (error) {
    console.error('Error fetching income data:', error);
    throw error; // Re-throw the error to handle it in the component
  }
};
