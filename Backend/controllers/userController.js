const { deleteUserById, updateUserById, getSubscriptions, createUser, createCars, updateCarsModel } = require('../models/userModel');
const { sanitizeObject } = require('../utils/xssUtils');
const prisma = require('../prisma/prismaClient');
const jwt = require('jsonwebtoken');
const passport = require('../utils/passport-config'); // Import from the correct path

const bcrypt = require('bcrypt');
const saltRounds = 10;

//hashing should move to controller
//--------------------------------------------------------------------------------------------------------------------------------//

//TODO: some controllers will need a subscription status check (important!)
const getActiveUsers = (req, res) => {
  res.status(200).json({ message: 'Users retrieved successfully' });
};
const updateUser = async (req, res) => {
  const id = parseInt(req.params.id); // Convert id to integer if it's a string
  const idFromToken = req.user.idUsers;

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
  // Extract user ID from JWT token

  const idUsers = req.user.idUsers; // Ensure this matches how the user ID is stored in req.user

  const { cars } = req.body;

  try {
    // Sanitize input data
    console.log('sanitizing cars');
    const sanitizedCars = cars.map((car) => sanitizeObject(car, ['make', 'model']));

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
    await createCars(idUsers, sanitizedCars, SubscriptionPlanID);

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
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.idUsers,
        email: user.Email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 2592000000 // 30 days
    });

    // Send user data
    res.status(200).json({
      user: {
        id: user.idUsers,
        email: user.Email,
        role: user.role
      }
    });
  })(req, res, next);
};

//might not need it
const logout = (req, res) => {
  console.log('Logout process started in controller');
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 0 // Set to 0 to immediately expire the cookie
    });

    // Optionally log additional information or perform cleanup here
    console.log('before res.status');
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

// TODO: when building frontend part, remember this is a bulk edit
const updateCars = async (req, res) => {
  console.log('Received PATCH request for /api/users/cars');
  console.log('User:', req.user); // Log authenticated user
  console.log('Request Body:', req.body); // Log request body
  // Extract user ID from JWT token
  console.log('extracting user from JWT token');
  const idUsers = req.user.idUsers; // Ensure this matches how the user ID is stored in req.user

  const { cars } = req.body;

  try {
    console.log('start of try block in updateCars conntroller');

    // Sanitize input data
    console.log('sanitizing');
    const sanitizedCars = cars.map((car) => sanitizeObject(car, ['RegistrationID', 'Model']));

    // Update cars in the database
    console.log('calling updateCarsModel');
    await updateCarsModel(idUsers, sanitizedCars);

    // Respond with success

    res.status(200).json({
      message: 'Cars updated successfully.'
    });
  } catch (err) {
    console.error('Error updating cars:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getUserCarsController = async (req, res) => {
  const userId = req.user.idUsers; // Extract user ID from the JWT token

  try {
    const result = await getCarsByUserId(userId);

    if (result.success) {
      return res.status(200).json(result.cars);
    } else {
      return res.status(404).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in getUserCarsController:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    console.log('start of try block in getUserDetails controller');
    const user = req.user; // Correctly getting userId
    console.log('userID in getUserDetails controller:', user);
    if (!user) {
      // Check if userId is undefined or null
      console.log('User ID is not found');
      return res.status(404).send('User ID is not provided');
    }

    const resultUser = await prisma.users.findUnique({
      where: { idUsers: user.id }
    });

    if (!resultUser) {
      console.log('User not found');
      return res.status(404).send('User not found');
    }

    res.json(resultUser);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).send('Internal Server Error');
  }
};

// add delete cars controller

const deleteCarById = async (req, res) => {
  console.log('Received DELETE request for /api/users/cars/:idCars');
  console.log('User:', req.user); // Log authenticated user
  console.log('Request Params:', req.params); // Log request parameters

  // Extract car ID from request parameters
  const { idCars } = req.params;
  const userId = req.user.idUsers; // User ID from JWT token

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

module.exports = {
  updateUser,
  deleteUser,
  getSubscriptionTiers,
  addUserController,
  login,
  addCarsController,
  updateCars,
  deleteCarById,
  getUserDetails,
  logout
};
