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

// Defer Until Core Functionality is Stable:
// Cross-Site Request Forgery (CSRF):

// CSRF Protection: Implement CSRF protection once you have authentication in place. It becomes crucial when you have forms or actions that change user data.
// Cross-Site Scripting (XSS):

// XSS Protection: While important, XSS protection can be complex. Start with sanitization and validation. Implement more advanced XSS defenses, like Content Security Policy (CSP), once your core functionality is stable.
// Content Security Policy (CSP):

// CSP Implementation: CSP can be complex and might interfere with development. Implement it once your application is functional to protect against XSS and data injection attacks.
// Secure Cookies:

// Cookie Flags (e.g., HttpOnly, Secure): Set secure cookie attributes after you have your authentication and session management working.
// Rate Limiting and IP Blocking:

// Rate Limiting: Implement rate limiting to prevent abuse. It's useful but might be added after core functionality.
// HTTPS:

// HTTPS: Ensure your application uses HTTPS before deploying it to production. It protects data in transit but can be set up towards the end of your development process.
