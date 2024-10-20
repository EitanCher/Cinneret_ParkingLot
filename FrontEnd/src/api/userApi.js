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
    const response = await api.get('/details');

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
    console.log(response.data);
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

export const fetchStripeSessionID = async (subscriptionPlanId) => {
  try {
    // Make POST request to create a checkout session
    const response = await api.post(
      '/create-checkout-session',
      { subscriptionPlanId }, // Simplified object shorthand
      { withCredentials: true }
    );

    console.log('Response in fetchStripeSessionID:', response);

    // Return sessionId from response data
    return response.data.sessionId;
  } catch (error) {
    console.error('Error during subscription:', error);
    throw error; // Re-throw the error to be handled in the calling function
  }
};

export const getUserSubscription = async () => {
  try {
    const response = await api.get('/user-subscription', {
      withCredentials: true // Important to include credentials (cookies) in request
    });
    return response.data; // Return the subscription data
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw error; // Optionally throw error to be handled by caller
  }
};

export const fetchSlotCountsByCityId = async (cityId) => {
  try {
    const response = await api.get(`/parking/slots-count/${cityId}`, { withCredentials: true });

    return response.data;
  } catch (error) {
    console.error('Error fetching slot counts:', error);
    throw error;
  }
};

export const fetchUserCars = async () => {
  try {
    const response = await api.get('/cars', {
      withCredentials: true
    });
    console.log('user cars in userapi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user cars:', error);
    throw error;
  }
};
export const fetchMatchingSlots = async (idCities, startDateTime) => {
  try {
    const response = await api.get('/parking/find-best-slot', {
      params: { idCities, StartDate: startDateTime },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    // Check if the error response has a specific message
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error); // Propagate the error message
    } else {
      throw new Error('An error occurred while fetching matching slots.');
    }
  }
};

export const postBookSlot = async (slotId, StartDate, EndDate, idCars) => {
  try {
    console.log('Sending booking request with:', {
      slotId,
      StartDate,
      EndDate,
      idCars
    });

    // Ensure `EndDate` is passed instead of `Duration`
    const response = await api.post(
      '/parking/reservation',
      {
        slotId,
        StartDate,
        EndDate, // Ensure EndDate is passed correctly
        idCars
      },
      { withCredentials: true }
    );
    console.log('Booking request successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error booking slot:', error);
    throw error;
  }
};

export const checkReservation = async () => {
  try {
    console.log('start of check reservation user api');
    const response = await api.get('/parking/reservations', { withCredentials: true });
    console.log('reservations in user api:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

export const cancelReservation = async (idReservation) => {
  try {
    console.log('start of cancel reservation user api');
    const response = await api.delete('/parking/reservation', { data: { idReservation }, withCredentials: true });

    console.log('canceled reservation:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

export const addCar = async (RegistrationID, Model) => {
  try {
    const car = {
      RegistrationID: RegistrationID,
      Model: Model
    };
    const response = await api.post('/cars/add', { data: car, withCredentials: true });
    console.log('added car:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding car:', error);
    throw error;
  }
};

// '/cars'

export const getUserCars = async () => {
  try {
    console.log('start of getusercars');
    const response = await api.get('/cars', { withCredentials: true });
    console.log('user cars in userapi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user cars:', error);
    throw error;
  }
};

export const updateCar = async (idCars, updatedCarData) => {
  try {
    const response = await api.put(`/cars/${idCars}`, updatedCarData, { withCredentials: true });
    console.log('updated car:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating car:', error);
    throw error;
  }
};

export const deleteCar = async (idCars) => {
  try {
    const response = await api.delete(`/cars/${idCars}`, { withCredentials: true });
    console.log('deleted car:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting car:', error);
    throw error;
  }
};

//  router.get('notifications', fetchUnreadNotificationsCount);

export const fetchUnreadNotificationsCount = async () => {
  try {
    const response = await api.get('/notifications/unread', { withCredentials: true });
    console.log('unread notifications:', response.data);
    return response.data.count;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
};

export const markNotificationsAsRead = async () => {
  try {
    const response = await api.post('/notifications/clear', {}, { withCredentials: true });
    console.log('marked notifications as read:', response);
    return response;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

export const fetchAllUserNotifications = async () => {
  try {
    const response = await api.get('/notifications', { withCredentials: true });
    console.log('user specific notifications:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all user notifications:', error);
    throw error;
  }
};

// router.post('/notifications/:notificationId', authenticateJWT, markSingleNotificationRead);

export const markSingleNotificationRead = async (notificationId) => {
  try {
    const response = await api.post(`/notifications/${notificationId}`, { withCredentials: true });
    console.log('marked notification as read:', response);
    return response;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};
