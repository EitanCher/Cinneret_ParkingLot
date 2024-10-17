const { deleteUserById, updateUserById, getSubscriptions, createUser, createCars, updateCarModel } = require('../models/userModel');
const { sanitizeObject } = require('../utils/xssUtils');
const prisma = require('../prisma/prismaClient');
const jwt = require('jsonwebtoken');
const passport = require('../utils/passport-config'); // Import from the correct path
const axios = require('axios');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const getActiveUsers = (req, res) => {
  res.status(200).json({ message: 'Users retrieved successfully' });
};
const updateUser = async (req, res) => {
  const id = parseInt(req.params.id); // Convert id to integer if it's a string
  const idFromToken = req.user.id;

  if (id !== idFromToken) {
    return res.status(403).json({ message: 'You are not authorized to update this account' });
  }

  const { currentPassword, newPassword, confirmNewPassword, ...data } = req.body;

  try {
    // Sanitize the input data
    const sanitizedData = sanitizeObject(data, ['FirstName', 'LastName', 'Phone', 'Email']);

    // Handle password update
    let passwordUpdate = {};
    if (currentPassword && newPassword && confirmNewPassword) {
      // Fetch the current user data to compare
      const currentUser = await prisma.users.findUnique({
        where: { idUsers: id },
        select: { Password: true }
      });

      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.Password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid current password' });
      }

      // Validate new password
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'New passwords do not match' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      passwordUpdate.Password = hashedPassword;
    }

    // Combine sanitized data and password update
    const combinedData = { ...sanitizedData, ...passwordUpdate };

    // Update the user using the model function
    const result = await updateUserById(id, combinedData);

    if (result.success) {
      return res.status(200).json({ message: result.message, user: result.user });
    } else {
      return res.status(404).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error updating user:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const idFromToken = req.user.idUsers;

    console.log('type of id params: ' + typeof id);
    console.log('type of req.user.id: ' + typeof idFromToken);
    console.log('req.params.id: ' + id);
    console.log('req.user.id: ' + idFromToken);
    if (id !== idFromToken.toString()) return res.status(403).json({ message: 'You are not authorized to delete this account' });

    const result = await deleteUserById(id); // Make sure to await the result
    if (result.success) {
      return res.status(200).json({ message: 'User deleted successfully' });
    }
    return res.status(404).json({ message: result.message });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

const stringFields = ['FirstName', 'LastName', 'Email', 'Phone', 'SubscriptionPlanID', 'StartDate', 'EndDate'];

const addUserController = async (req, res) => {
  const userData = req.body; // Adjust based on how user data is sent
  console.log('user data in controller: ', req.body);
  try {
    // Sanitize the input data
    const sanitizedUserData = sanitizeObject(userData, ['persId', 'FirstName', 'LastName', 'Email', 'Phone', 'Password']);

    // Create user
    const user = await createUser(sanitizedUserData);
    // Ensure user was created successfully
    if (!user || !user.idUsers) {
      return res.status(400).json({ message: 'User creation failed' });
    }

    // Generate JWT token with a 2-hour expiration
    const token = jwt.sign(
      {
        id: user.idUsers,
        email: user.Email,
        role: user.Role // Include the role in the token payload
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' } // Set token expiration time to 2 hours
    );

    // Set the token in a secure, HTTP-only cookie with a 30-day max age
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Strict', // Prevent CSRF attacks
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Respond with success and user ID
    res.status(201).json({
      message: 'User created successfully. Proceed to payment to select a subscription.',
      userId: user.idUsers
    });
  } catch (error) {
    console.error('Error:', error.message);

    // Respond with appropriate status code and message
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
      });
    }

    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const addCarsController = async (req, res) => {
  const idUsers = req.user.id;

  const { data } = req.body;

  console.log('req body:', req.body);
  try {
    // Sanitize input data
    console.log('sanitizing cars');
    const sanitizedCar = sanitizeObject(data, ['RegistrationID', 'Model']);

    // Fetch user's subscription plan
    console.log('fetching user subscription');
    const userSubscription = await prisma.userSubscriptions.findFirst({
      where: { UserID: idUsers, Status: 'active' },
      select: { SubscriptionPlanID: true }
    });

    if (!userSubscription) {
      return res.status(400).json({ message: 'User does not have an active subscription' });
    }

    const { SubscriptionPlanID } = userSubscription;

    // Add cars to the database
    console.log('triggering create cars model');
    await createCars(idUsers, sanitizedCar, SubscriptionPlanID);

    // Respond with success
    res.status(201).json({
      message: 'Cars added successfully.'
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const login = (req, res, next) => {
  // Clear any existing JWT cookie to avoid conflicts
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });

  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });

    // Generate a new JWT token for the authenticated user
    const token = jwt.sign(
      {
        id: user.idUsers,
        email: user.Email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    console.log('Generated JWT Token:', token);

    // Set the new JWT token in the HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 2592000000 // 30 days
    });

    // Respond with user data and a success message
    res.status(200).json({
      user: {
        id: user.idUsers,
        email: user.Email,
        role: user.role
      },
      message: 'Login successful'
    });
  })(req, res, next);
};

//might not need it
const logout = (req, res) => {
  console.log('Logout process started in controller');
  try {
    // Clear the JWT cookie to log out the user
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });

    console.log('JWT cookie cleared successfully');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Failed to log out. Please try again later.' });
  }
};

//TODO
const extendSubscription = (req, res) => {};

async function getSubscriptionTiers(req, res) {
  try {
    const subscriptions = await getSubscriptions();
    res.json(subscriptions);
  } catch (err) {
    console.error('Error in getSubscriptionTiers:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const updateCar = async (req, res) => {
  console.log('Extracting user from JWT token');
  const idUsers = req.user.idUsers;

  const { idCars } = req.params;
  const carId = parseInt(idCars, 10);

  const { RegistrationID, Model } = req.body;

  try {
    console.log('Start of try block in updateCarController');

    console.log('Sanitizing');
    const sanitizedCar = sanitizeObject({ RegistrationID, Model }, ['RegistrationID', 'Model']);

    console.log('Calling updateCarModel');
    await updateCarModel(idUsers, carId, sanitizedCar);

    res.status(200).json({
      message: 'Car updated successfully.'
    });
  } catch (err) {
    console.error('Error updating car:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = req.user; // Fetch the user object from the JWT payload
    console.log('user id in getUserDetails ', user.id); // Log to confirm the user ID being used

    if (!user) {
      // Check if userId is undefined or null
      return res.status(404).send('User ID is not provided');
    }

    // Find the user in the database using the ID from the JWT payload
    const resultUser = await prisma.users.findUnique({
      where: { idUsers: user.id }
    });

    if (!resultUser) {
      return res.status(404).send('User not found');
    }

    // Correct the user ID field used in the activeSubscription query
    const activeSubscription = await prisma.userSubscriptions.findFirst({
      where: { UserID: user.id, Status: 'active' } // Use user.id instead of user.idUsers
    });
    console.log(activeSubscription);
    // Attach the subscription status to the resultUser object
    resultUser.hasSubscription = !!activeSubscription;

    // Send the user object with the subscription status back to the client
    res.json(resultUser);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).send('Internal Server Error');
  }
};

const getUserSubscription = async (req, res) => {
  try {
    console.log('Start of getUserSubscription in user controller');
    const userId = req.user.id;

    // Fetch the user's active subscription
    const userSubscription = await prisma.userSubscriptions.findFirst({
      where: { UserID: userId, Status: 'active' }
    });

    if (!userSubscription) {
      // Return a 200 status with an empty object or a message if no active subscription is found
      return res.status(200).json({ message: 'No active subscription found', subscription: null });
    }

    // Respond with subscription details
    res.status(200).json(userSubscription);
  } catch (error) {
    console.error('Error fetching user subscription:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// add delete cars controller

const deleteCarById = async (req, res) => {
  console.log('Received DELETE request for /api/users/cars/:idCars');
  console.log('User:', req.user); // Log authenticated user
  console.log('Request Params:', req.params); // Log request parameters

  // Extract car ID from request parameters
  const { idCars } = req.params;
  const userId = req.user.id; // User ID from JWT token

  try {
    console.log('start of try block in deleteCarById controller');

    // Retrieve the car to check ownership
    const car = await prisma.cars.findUnique({
      where: { idCars: parseInt(idCars, 10) }
    });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if the car belongs to the authenticated user
    if (car.OwnerID !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this car' });
    }

    // Delete the car from the database
    const deletedCar = await prisma.cars.delete({
      where: { idCars: parseInt(idCars, 10) } // Ensure idCars is an integer
    });

    // Respond with success
    res.status(200).json({
      message: 'Car deleted successfully',
      deletedCar
    });
  } catch (err) {
    console.error('Error deleting car:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const fetchCheckoutSessionURL = async (req, res) => {
  console.log('Fetching Stripe Checkout Session...');
  const sessionId = req.params.sessionId;
  const stripeUrl = `https://api.stripe.com/v1/checkout/sessions/${sessionId}`;

  try {
    const response = await axios.get(stripeUrl, {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` // Use your environment variable for the Stripe secret key
      }
    });
    console.log('Response from Stripe:', response.data);

    // Return the response data to the frontend
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching Stripe session:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'An error occurred while fetching the Stripe session'
    });
  }
};

const getUserCars = async (req, res) => {
  try {
    console.log('start of get cars controller');
    const userId = req.user.id; // Extract user ID from JWT token
    const cars = await prisma.cars.findMany({
      where: { OwnerID: userId }
    });

    res.json(cars);
  } catch (error) {
    console.error('Error fetching user cars:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getUpcomingReservations = async (req, res) => {
  try {
    console.log('Start of get upcoming reservations controller');
    const userId = req.user.id; // Extract user ID from JWT token

    // Get the current date and time
    const currentDate = new Date();

    // Fetch all reservations for the user that are not in the past, including related city information
    const reservations = await prisma.reservations.findMany({
      where: {
        UserID: userId,
        ReservationEnd: {
          gte: currentDate // Filter out reservations that have already ended
        }
      },
      include: {
        Cars: true, // Include the Cars model
        Slots: {
          include: {
            Areas: {
              include: {
                Cities: true // Include the related Cities model to get city information
              }
            }
          }
        }
      },
      orderBy: {
        ReservationStart: 'asc' // Sort by start date in ascending order
      }
    });

    // Check if there are any reservations
    if (reservations && reservations.length > 0) {
      return res.json({ reservations, status: 'success' });
    }

    // If no reservations are found, return an appropriate message
    return res.json({ status: 'no reservations' });
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    res.status(500).json({ message: error.message });
  }
};
async function markNotificationsAsRead() {
  try {
    userId = req.user.id;
    await prisma.userNotifications.updateMany({
      where: {
        userId: userId
      },
      data: {
        isRead: true
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

async function fetchUnreadNotificationsCount(req, res) {
  const { userId } = req.params;

  try {
    const unreadCount = await prisma.userNotifications.count({
      where: {
        userId: userId,
        isRead: false
      }
    });

    res.json({ count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    res.status(500).json({ error: 'Failed to fetch unread notifications count' });
  }
}

module.exports = {
  updateUser,
  deleteUser,
  getSubscriptionTiers,
  addUserController,
  login,
  addCarsController,
  updateCar,
  deleteCarById,
  getUserDetails,
  logout,
  fetchCheckoutSessionURL,
  getUserSubscription,
  getUserCars,
  getUpcomingReservations,
  markNotificationsAsRead,
  fetchUnreadNotificationsCount
};
