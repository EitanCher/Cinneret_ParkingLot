// passwordUtils.js
const bcrypt = require("bcrypt");
const saltRounds = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, saltRounds);
}

module.exports = { hashPassword };
