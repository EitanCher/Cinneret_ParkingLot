// admin/routes/adminRoutes.js

import express from "express";
const router = express.Router();

// Define your routes here
router.get("/some-route", (req, res) => {
  res.send("Hello from admin route");
});

// Export the router as the default export
export default router;
