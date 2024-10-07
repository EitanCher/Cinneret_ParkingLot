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

    return response.data; // Ensure response.data is returned
  } catch (error) {
    console.error('Error fetching income data:', error);
    throw error; // Re-throw the error to handle it in the component
  }
};

export const fetchFaultySlotsGates = async () => {
  try {
    const response = await api.get('/parking/faulty/:cityId', { withCredentials: true });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching fault slots and gates (origina: adminAPI):', error);
    throw error;
  }
};

export const fetchRecentSubscriptions = async () => {
  try {
    const response = await api.get('/users/recent/', {
      params: { limit: 12 }, // Pass the limit as a query parameter
      withCredentials: true
    });
    console.log('recent users in adminAPI: ', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent subscriptions:', error);
    throw error;
  }
};

//parking/average-parking-time

export const fetchAverageParkingTimeAllUsers = async () => {
  try {
    const response = await api.get('/parking/average-parking-time', {
      withCredentials: true
    });
    console.log('average parking time for all users: ', response.data);
    return response.data;
  } catch (error) {}
};

export const fetchRecentParkingLogs = async () => {
  try {
    const response = await api.get('/parking/recent-parking-logs', {
      params: { limit: 12 }, // Pass the limit as a query parameter
      withCredentials: true
    });
    console.log('recent parking logs in adminAPI: ', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent parking logs:', error);
    throw error;
  }
};

export const postNewParkingLot = async (CityName, FullAddress, pictureUrl) => {
  try {
    console.log('posting');
    const response = await api.post(
      '/parking/add-parking-lot',
      {
        CityName: CityName,
        FullAddress: FullAddress,
        pictureUrl: pictureUrl
      },
      {
        withCredentials: true
      }
    );
    console.log('New parking lot added successfully: ', response.data);
    console.log('response form backend', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding new parking lot:', error);
    throw error;
  }
};

export const updateParkingLot = async (idCities, CityName, FullAddress, pictureUrl) => {
  try {
    console.log('Updating parking lot...');

    const response = await api.put(
      `/parking/update-parking-lot/${idCities}`,
      {
        CityName,
        FullAddress,
        pictureUrl
      },
      { withCredentials: true }
    );

    console.log('Parking lot updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating parking lot:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteCity = async (idCities) => {
  try {
    const response = await api.delete(`/parking/parkinglot/${idCities}`, {
      withCredentials: true
    });

    if ((await response.status) == 200) console.log('delete city updated successfully: ', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting city:', error);
    throw error;
  }
};

// Client-side function to add a new area
export const postAddArea = async (idCities, areaName) => {
  try {
    // Make sure to send CityID and AreaName in the request body
    const response = await api.post(
      `/parking/areas`, // The URL endpoint, without cityId as a parameter
      {
        CityID: idCities, // Send CityID in the request body
        AreaName: areaName // Send AreaName in the request body
      },
      {
        withCredentials: true // Pass options like withCredentials separately
      }
    );

    console.log('New area added successfully: ', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding new area:', error);
    throw error;
  }
};

//      /parking/areas/:cityId
export const getAreas = async (idCities) => {
  try {
    const response = await api.get(`/parking/areas/${idCities}`, { withCredentials: true });
    console.log('areas by city id:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching areas:', error);
    throw error;
  }
};

// '/parking/areas/:idAreas'

export const deleteArea = async (idAreas) => {
  try {
    const response = await api.delete(`/parking/areas/${idAreas}`, { withCredentials: true });
    console.log('deleted area:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting area:', error);
    throw error;
  }
};

export const editArea = async (idAreas, AreaName) => {
  // /parking/areas/:idAreas
  console.log('start of editarea api');
  try {
    const response = await api.put(
      `/parking/areas/${idAreas}`,
      {
        AreaName: AreaName
      },
      { withCredentials: true }
    );
    console.log('edited area:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error editing area:', error);
    throw error;
  }
};

//  /parking/slots',

export const getSlots = async ({ cityId, active, areaId, busy }) => {
  try {
    // Construct query parameters object based on provided values
    const queryParams = new URLSearchParams();

    // Add each parameter to queryParams only if it is defined
    if (cityId !== undefined) queryParams.append('cityId', cityId);
    if (active !== undefined) queryParams.append('active', active);
    if (areaId !== undefined) queryParams.append('areaId', areaId);
    if (busy !== undefined) queryParams.append('busy', busy);

    // Construct the full URL with query parameters
    const url = `/parking/slots?${queryParams.toString()}`;

    // Make the GET request with the constructed URL
    const response = await api.get(url, { withCredentials: true });
    console.log('Slots by city id and criteria:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching slots:', error);
    throw error;
  }
};

// /parking/slots/:idSlots
export const deleteSlotByID = async (idSlots) => {
  try {
    const response = await api.delete(`/parking/slots/${idSlots}`, { withCredentials: true });
    console.log(`Slot with ID ${idSlots} deleted successfully.`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting slot with ID ${idSlots}:`, error);
    throw new Error('Failed to delete slot');
  }
};

export const updateIndividualSlot = async (idSlots, slotData) => {
  try {
    const { BorderRight, Active, Busy, Fault, AreaID, CameraIP, SlotIP } = slotData;

    const payload = { BorderRight, Active, Busy, Fault, AreaID, CameraIP, SlotIP };

    const response = await api.patch(`/parking/slots/update/${idSlots}`, payload, {
      withCredentials: true
    });

    console.log('Updated slot data:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error updating slot:', error);
    throw error;
  }
};

//  /parking/slots/add-individual

export const addIndividualSlot = async (slotData) => {
  try {
    const { BorderRight, Active, Busy, Fault, AreaID, CameraIP, SlotIP } = slotData;

    const payload = { BorderRight, Active, Busy, Fault, AreaID, CameraIP, SlotIP };

    const response = await api.post('/parking/slots/add-individual', payload, {
      withCredentials: true
    });

    console.log('New slot added successfully:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error adding new slot:', error);
    throw error;
  }
};

//  /parking/slots/add

export const addSlotsToArea = async (areaId, slots) => {
  try {
    const response = await api.post(`/parking/slots/add/${areaId}`, slots, {
      withCredentials: true
    });

    console.log('Slots added to area successfully:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error adding slots to area:', error);
    throw error;
  }
};

export const addSlotsToAreaBulk = async (areaId, numOfSlots) => {
  try {
    // Prepare payload with area ID and number of slots
    const payload = {
      idAreas: areaId,
      numOfSlots: numOfSlots
    };

    // Make a POST request to the backend endpoint `/parking/slots/add`
    const response = await api.post('/parking/slots/add', payload, {
      withCredentials: true // Include credentials if needed for authentication
    });

    console.log('Slots added to area successfully:', response.data);

    // Return response data
    return response.data;
  } catch (error) {
    console.error('Error adding slots to area:', error);
    throw error; // Propagate the error so it can be handled by the caller
  }
};
