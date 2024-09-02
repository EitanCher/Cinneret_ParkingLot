const dotenv = require('dotenv');
dotenv.config();

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy; // Import LocalStrategy
const bcrypt = require('bcrypt');
const prisma = require('../prisma/prismaClient'); // Adjust the path to your Prisma client
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel'); // Adjust the path to your User model

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      console.log('JWT Payload:', jwt_payload); // Log JWT payload
      const user = await prisma.users.findUnique({
        where: { idUsers: jwt_payload.id }
      });
      console.log('user in jwtstrategy', user);
      if (!user) {
        console.log('User not found');
        return done(null, false, { message: 'User not found' });
      }

      if (user.Active === false) {
        console.log('User is not active');
        return done(null, false, { message: 'User is not active' });
      }

      console.log('User found and active');
      return done(null, user);
    } catch (err) {
      console.error('Error in JWT strategy:', err.message);
      return done(err, false);
    }
  })
);

// Local Strategy (for login)
passport.use(
  new LocalStrategy({ usernameField: 'Email', passwordField: 'Password' }, async (email, password, done) => {
    try {
      console.log('local strategy try block');
      const user = await prisma.users.findUnique({
        where: { Email: email }
      });

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.Password);

      if (!isMatch) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, user);
    } catch (error) {
      console.error('Error authenticating user:', error.message);
      return done(error);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        // Find user by email
        console.log('extracting user by email-prisma');
        const user = await prisma.users.findUnique({
          where: { Email: profile.emails[0].value } // Use the email from the Google profile
        });

        if (user) {
          console.log('user exists');
          // User exists, log them in
          return done(null, user);
        } else {
          // User does not exist, handle it as an error or redirect to sign up page
          return done(new Error('User not found'), null);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
