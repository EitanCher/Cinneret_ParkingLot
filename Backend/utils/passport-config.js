const dotenv = require('dotenv');
dotenv.config();

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const prisma = require('../prisma/prismaClient');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.jwt]),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      console.log('JWT Payload:', jwt_payload);
      const user = await prisma.users.findUnique({
        where: { idUsers: jwt_payload.id }
      });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      if (user.Active === false) {
        return done(null, false, { message: 'User is not active' });
      }

      return done(null, user);
    } catch (err) {
      console.error('Error in JWT strategy:', err.message);
      return done(err, false);
    }
  })
);

passport.use(
  new LocalStrategy({ usernameField: 'Email', passwordField: 'Password' }, async (email, password, done) => {
    try {
      console.log('Local strategy try block');
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
        console.log('Extracting user by email with Prisma');
        const user = await prisma.users.findUnique({
          where: { Email: profile.emails[0].value }
        });

        if (user) {
          return done(null, user);
        } else {
          // Optionally create a new user
          return done(new Error('User not found'), null);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
