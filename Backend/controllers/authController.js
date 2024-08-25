const { verifyGoogleUser } = require('../models/authModel'); // Adjust the path as necessary

const googleCallback = async (req, res, next) => {
  const { code } = req.query;
  try {
    const { user, jwtToken } = await verifyGoogleUser(code);
    if (user) {
      res.json({
        message: 'User authenticated successfully',
        user,
        token: jwtToken
      });
    } else {
      res.status(400).send('User not found');
    }
  } catch (err) {
    // Change 'error' to 'err'
    console.error('Error during Google callback handling:', err); // Use 'err' here
    res.status(500).send('Authentication failed.');
  }
};

module.exports = {
  googleCallback
};

module.exports = {
  googleCallback
};
