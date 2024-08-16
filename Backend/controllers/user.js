const xss = require("xss");
const {
  deleteUserById,
  getUserById,
  updateUserById,
  getSubscriptions,
} = require("../models/userModel");
const { z } = require("zod"); // Import Zod for validation
const { updateUserSchema, addUserSchema } = require("../db-postgres/zodSchema");
const pool = require("../db-postgres/db_config");

const getUsers = (req, res) => {
  res.status(200).json({ message: "Users retrieved successfully" });
};

const updateUser = async (req, res) => {
  const id = req.params.id;

  let data = req.body;

  console.log(data);

  // Validate the incoming data
  try {
    // Use partial validation
    const validatedData = updateUserSchema.partial().parse(data);

    // Fetch the current user data to compare
    const currentUserResult = await pool.query(
      'SELECT "FirstName", "LastName", "Phone", "Email", "SubscriptStart", "SubscriptEnd", "Active" FROM "ParkingLot_DB"."Users" WHERE "idUsers" = $1',
      [id]
    );

    if (currentUserResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = currentUserResult.rows[0];

    let query = 'UPDATE "ParkingLot_DB"."Users" SET ';
    let values = [];
    let setString = "";
    let index = 1;

    // Construct the query based on the validated data and only update changed fields
    const entries = Object.entries(validatedData);
    for (const [key, value] of entries) {
      if (value !== undefined && value !== currentUser[key]) {
        setString += ` "${key}" = $${index++},`;
        values.push(value);
      }
    }

    // If no fields have changed, return early
    if (setString === "") {
      return res.status(200).json({ message: "No changes detected" });
    }

    // Remove trailing comma and construct final query
    setString = setString.slice(0, -1); // Remove the trailing comma
    query += setString + ` WHERE "idUsers" = $${index}`;
    values.push(id);

    //TODO this should be done with the model fix this
    try {
      const result = await pool.query(query, values);
      if (result.rowCount > 0) {
        return res.status(200).json({ message: "User updated successfully" });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (e) {
      console.error("Unexpected error:", e);
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(400).json({
      message: `Invalid input: ${error.errors
        .map((e) => e.message)
        .join(", ")}`,
    });
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

const addUser = async (req, res) => {};
async function getSubscriptionTiers(req, res) {
  try {
    const subscriptions = await getSubscriptions();
    res.json(subscriptions);
  } catch (err) {
    console.error("Error in getSubscriptionTiers:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  getSubscriptionTiers,
  addUser,
};
