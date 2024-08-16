const queries = require("../queries/queries");
const pool = require("../db-postgres/db_config");

async function getUserById(userId) {
  try {
    const result = await pool.query(queries.getUserById, [userId]);
    return result.rows[0];
  } catch (e) {
    console.error("Error fetching user by ID:", e.stack);
    throw e;
  }
}

async function deleteUserById(userId) {
  try {
    const result = await pool.query(queries.deleteUser, [userId]);
    if (result.rowCount > 0) {
      console.log("object deleted successfully");
      return { success: true, message: "User deleted successfully" };
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (e) {
    console.error("Error deleting user:", e.stack);
    return { success: false, message: e.message };
  }
}

async function updateUserById(query, values) {
  try {
    const result = await pool.query(query, values);
    if (result.rowCount > 0) {
      console.log("object updated successfully");
      return { success: true, message: "User updated successfully" };
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (e) {
    console.error("Error updating user:", e.stack);
    return { success: false, message: e.message };
  }
}

async function getSubscriptions() {
  try {
    const result = await pool.query(queries.getSubscriptions);
    return result.rows;
  } catch (e) {
    console.error("Error fetching subscriptions:", e.stack);
    throw e;
  }
}

module.exports = {
  deleteUserById,
  getUserById,
  updateUserById,
  getSubscriptions,
};
