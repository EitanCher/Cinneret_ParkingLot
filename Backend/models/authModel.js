const { OAuth2Client } = require('google-auth-library');
const prisma = require('../prisma/prismaClient');
const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
});
const jwt = require('jsonwebtoken');
const { findUserByEmail } = require('./userModel');

const verifyGoogleUser = async (code) => {
  try {
    const { tokens } = await client.getToken({ code, redirect_uri: process.env.CALLBACK_URL });
    const userInfo = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = userInfo.getPayload();
    const user = await findUserByEmail(payload.email);

    if (user) {
      const jwtToken = jwt.sign(
        {
          id: user.idUsers,
          email: user.Email,
          role: user.Role // Add the role to the JWT payload
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '72h' // Adjust expiration time if necessary
        }
      );
      return { user, jwtToken };
    }
    return { user: null, jwtToken: null };
  } catch (err) {
    console.error('Detailed Error:', err);
    throw new Error('Error verifying Google OAuth user');
  }
};

module.exports = {
  verifyGoogleUser
};
