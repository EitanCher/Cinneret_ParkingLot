// client/routes/clientRoutes.js

import express from "express";
const router = express.Router();

// Define your client routes here
router.get("/some-client-route", (req, res) => {
  res.send("Hello from client route");
});

// Export the router as the default export
export default router;
