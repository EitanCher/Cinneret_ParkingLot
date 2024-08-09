// authentication/authRoutes.js

import express from "express";
const router = express.Router();

// Define your authentication routes here
router.post("/login", (req, res) => {
  // Handle login
  res.send("Login route");
});

// Export the router as the default export
export default router;
