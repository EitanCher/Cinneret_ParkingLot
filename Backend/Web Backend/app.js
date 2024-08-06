import express from "express";
import path from "path";
import authRoutes from "./authentication/authRoutes.js"; // Import your authentication routes
import adminRoutes from "./admin/routes/adminRoutes.js";
import clientRoutes from "./client/routes/clientRoutes.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, "../../frontend/build"))); // Adjust to your build directory

// Routes
app.use("/", authRoutes); // Authentication routes for login, register, etc.
app.use("/admin", adminRoutes); // Admin-specific routes
app.use("/client", clientRoutes); // Client-specific routes

// Handle any other routes or errors
app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
