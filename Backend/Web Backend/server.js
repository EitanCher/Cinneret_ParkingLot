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
app.use(express.static("../../FrontEnd/src/pages"));

// Routes
app.use("/auth", authRoutes); // Authentication routes for login, register, etc.
app.use("/admin", adminRoutes); // Admin-specific routes
app.use("/client", clientRoutes); // Client-specific routes

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
