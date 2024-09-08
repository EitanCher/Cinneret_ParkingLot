const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.jwt; // Extract JWT from cookie
  console.log('token in authenticateJWT middleware', token);
  if (!token) {
    return res.sendStatus(401); // Unauthorized if no token is present
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log(user);
    if (err) {
      return res.sendStatus(403); // Forbidden if token is invalid
    }

    req.user = user; // Attach user data to the request object
    next();
  });
};

module.exports = { authenticateJWT };
