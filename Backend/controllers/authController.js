const { verifyGoogleUser } = require('../models/authModel');
const cookieParser = require('cookie-parser');

const googleCallback = async (req, res, next) => {
  const { code } = req.query;
  try {
    const { user, jwtToken } = await verifyGoogleUser(code);
    if (user) {
      res.cookie('jwt', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Ensure HTTPS in production
        sameSite: 'Strict', // Consider 'Lax' for local development
        maxAge: 3600000 // 1 hour
      });

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
