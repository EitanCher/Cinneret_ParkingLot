const bcrypt = require('bcrypt');

const hashPassword = async () => {
  try {
    const password = 'plaintextpassword'; // Your plain text password
    const saltRounds = 10; // Number of salt rounds
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Hashed Password:', hashedPassword);
  } catch (error) {
    console.error('Error hashing password:', error);
  }
};

hashPassword();
