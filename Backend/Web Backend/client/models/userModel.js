// models/user.js
import db from "../../db.js"; // Database connection
import queries from "../../../queries";

// Define model methods
export default {
  getUsers: () => db.query(queries.getUsers),

  getUserById: (id) => db.query(queries.getUserById, [id]),

  insertUser: (userData) => db.query(queries.insertUser, userData),

  updateUser: (id, userData) => {
    // Ensure userData array contains values in the correct order for SQL query
    const values = [...userData, id];
    return db.query(queries.updateUser, values);
  },

  deleteUser: (id) => db.query(queries.deleteUser, [id]),

  getUserByEmail: (email) => db.query(queries.getUserByEmail, [email]),
};
