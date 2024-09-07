const { OAuth2Client } = require('google-auth-library');
const prisma = require('../prisma/prismaClient'); // Adjust path as necessary
const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
});
const jwt = require('jsonwebtoken');
const { findUserByEmail } = require('./userModel');

const verifyGoogleUser = async (code) => {
  try {
    console.log('entered first try block in auth model');
    const { tokens } = await client.getToken({ code, redirect_uri: process.env.CALLBACK_URL });
    console.log('tokens: ' + JSON.stringify(tokens));
    const userInfo = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    console.log('userInfo: ' + JSON.stringify(userInfo));
    const payload = userInfo.getPayload();
    console.log('payload: ' + JSON.stringify(payload));
    const user = await findUserByEmail(payload.email);
    if (user) {
      console.log('user data found: ' + JSON.stringify(user));
      const jwtToken = jwt.sign(
        {
          id: user.idUsers,
          email: user.Email,
          role: user.Role // Add the role to the JWT payload
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '72h' // Set token expiration time to 1 hour
        }
      );
      return { user, jwtToken };
    }
    return { user: null, jwtToken: null };
  } catch (err) {
    console.error('Detailed Error:', err); // Log detailed error
    throw new Error('Error verifying Google OAuth user');
  }
};

module.exports = {
  verifyGoogleUser
};
