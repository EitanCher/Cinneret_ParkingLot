// backend/web-backend/db.js
import { Pool } from "pg"; // Assuming you're using PostgreSQL

const pool = new Pool({
  user: "your_database_user",
  host: "localhost",
  database: "ParkingLot_DB",
  password: "1144ad",
  port: 5432, // or your database port
});

export default pool;
