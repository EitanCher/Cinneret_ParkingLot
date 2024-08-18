const xss = require("xss");
const {
  deleteUserById,
  updateUserById,
  getSubscriptions,
  createUser,
} = require("../models/userModel");
const {
  sanitizeAndValidateData,
  handleZodErrorResponse,
  logAndRespondWithError,
} = require("../utils/validationUtils");
const { z } = require("zod"); // Import Zod for validation
const {
  updateUserSchema,
  addUserSchema,
  subscriptionSchema,
  addCarSchema,
} = require("../db-postgres/zodSchema");
const pool = require("../db-postgres/db_config");
const queries = require("../queries/queries");
const { sanitizeObject } = require("../utils/xssUtils");
const prisma = require("../prisma/prismaClient");

const bcrypt = require("bcrypt");
const saltRounds = 10;

//hashing should move to controller
//--------------------------------------------------------------------------------------------------------------------------------//

const getUsers = (req, res) => {
  res.status(200).json({ message: "Users retrieved successfully" });
};

const updateUser = async (req, res) => {
  const id = parseInt(req.params.id); // Convert id to integer if it's a string
  const { currentPassword, newPassword, confirmNewPassword, ...data } =
    req.body;

  try {
    // Sanitize the input data
    const sanitizedData = sanitizeObject(data, [
      "FirstName",
      "LastName",
      "Phone",
      "Email",
    ]);

    // Validate the sanitized data
    const validatedData = updateUserSchema.partial().parse(sanitizedData);

    // Fetch the current user data to compare
    const currentUser = await prisma.users.findUnique({
      where: { idUsers: id },
      select: {
        FirstName: true,
        LastName: true,
        Phone: true,
        Email: true,
        Password: true,
      },
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Stored Password:", currentUser.Password); // Debugging line

    if (currentPassword && newPassword && confirmNewPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.Password
      );

      console.log("Provided Password:", currentPassword); // Debugging line
      console.log("Password Valid:", isPasswordValid); // Debugging line

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid current password" });
      }

      // Validate new password
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      validatedData.Password = hashedPassword;
    }

    // Construct the data to update based on the validated data and only update changed fields
    const updates = {};
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== null && value !== undefined && value !== currentUser[key]) {
        updates[key] = value;
      }
    }

    // If no fields have changed, return early
    if (Object.keys(updates).length === 0) {
      return res.status(200).json({ message: "No changes detected" });
    }

    // Update the user using the model function
    const result = await updateUserById(id, updates);

    if (result.success) {
      return res
        .status(200)
        .json({ message: result.message, user: result.user });
    } else {
      return res.status(404).json({ message: result.message });
    }
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: `Invalid input: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      });
    }

    console.error("Error updating user:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await deleteUserById(id); // Make sure to await the result
    if (result.success) {
      return res.status(200).json({ message: "User deleted successfully" });
    }
    return res.status(404).json({ message: result.message });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

const stringFields = [
  "FirstName",
  "LastName",
  "Email",
  "Phone",
  "SubscriptionPlanID",
  "StartDate",
  "EndDate",
];

const addUser = async (req, res) => {
  const {
    user: userData,
    subscription: subscriptionData,
    cars: carsData = [],
  } = req.body;

  try {
    // Sanitize and validate input data
    const { validatedUserData, validatedSubscriptionData, validatedCarData } =
      await sanitizeAndValidateData(userData, subscriptionData, carsData);

    // Ensure password is provided
    if (!validatedUserData.Password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Call the model function to handle user creation
    const user = await createUser(
      validatedUserData,
      validatedSubscriptionData,
      validatedCarData
    );

    // Respond with success
    res
      .status(201)
      .json({ message: "User and subscription added successfully", user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodErrorResponse(res, error);
    }
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

async function getSubscriptionTiers(req, res) {
  try {
    const subscriptions = await getSubscriptions();
    res.json(subscriptions);
  } catch (err) {
    console.error("Error in getSubscriptionTiers:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//update subscription plans

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  getSubscriptionTiers,
  addUser,
};
