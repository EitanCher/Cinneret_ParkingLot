const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const prisma = require("./prisma/prismaClient"); // Adjust the path to your Prisma client
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

passport.use(
  //change here to use other fields such as username instead of email
  new LocalStrategy({ usernameField: "email", passwordField: "password" }),
  async (email, password, done) => {
    try {
      const user = await prisma.users.findUnique({
        where: { Email: email },
      });
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      const isMatch = await bcrypt.compare(password, user.Password);
      if (!isMatch) {
        return done(null, false, { message: "Invalid credentials" });
      } else {
        return done(null, user);
      }
    } catch (error) {
      console.error("Error authenticating user:", error.message);
      return done(error);
    }
  }
);

module.exports = passport;
