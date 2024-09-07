const { verifyGoogleUser } = require('../models/authModel'); // Adjust the path as necessary
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const googleCallback = async (req, res, next) => {
  const { code } = req.query;
  try {
    const { user, jwtToken } = await verifyGoogleUser(code);
    if (user) {
      // Set JWT token as HTTP-only cookie
      res.cookie('jwt', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
        sameSite: 'Strict', // Protect against CSRF
        maxAge: 3600000 // 1 hour
      });

      // Redirect to frontend without token in URL
      res.redirect(`${process.env.FRONTEND_URL}`);
    } else {
      res.status(400).send('User not found');
    }
  } catch (err) {
    console.error('Error during Google callback handling:', err);
    res.status(500).send('Authentication failed.');
  }
};

module.exports = {
  googleCallback
};
