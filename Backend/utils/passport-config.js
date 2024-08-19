const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy; // Import LocalStrategy
const bcrypt = require('bcrypt');
const prisma = require('../prisma/prismaClient'); // Adjust the path to your Prisma client
const dotenv = require('dotenv');
dotenv.config();

// JWT Strategy options
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

// JWT Strategy
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
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
      return done(err, false);
    }
  })
);

// Local Strategy (for login)
passport.use(
  new LocalStrategy(
    { usernameField: 'Email', passwordField: 'Password' },
    async (email, password, done) => {
      try {
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
    }
  )
);

module.exports = passport;
