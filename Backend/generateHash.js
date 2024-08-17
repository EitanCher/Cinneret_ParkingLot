const bcrypt = require("bcrypt");
const saltRounds = 10;
const password = "123456";

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Generated Hash:", hash);
  }
});
