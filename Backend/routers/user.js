const express = require("express");
const router = express.Router();
const {
  getUsers,
  updateUser,
  deleteUser,
  getSubscriptionTiers,
  addUser,
} = require("../controllers/user");

// Route to get subscription tiers
router.get("/subscriptions", getSubscriptionTiers);

router.post("/register", addUser);

// // Route to create a Stripe Checkout session
// router.post("/create-checkout-session", createCheckoutSession);

// // Route to handle post-payment success
// router.get("/checkout-success", handleCheckoutSuccess);
router.patch("/:id", updateUser); // PATCH /api/users/:id - Update a user
router.get("/", getUsers); // GET /api/users/ - Fetch users
router.delete("/:id", deleteUser); // DELETE /api/users/:id - Delete a user

module.exports = router;
