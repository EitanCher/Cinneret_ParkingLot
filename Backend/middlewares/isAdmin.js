const express = require('express');
const app = express();
const checkAdminRole = (req, res, next) => {
  console.log(req.user);
  const userRole = req.user?.Role; // Optional chaining in case req.user is undefined
  console.log('user role is ' + userRole);
  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Only admins are authorized to access this route' });
  }

  next(); // Call the next middleware or route handler if the user is an admin
};

module.exports = { checkAdminRole };
