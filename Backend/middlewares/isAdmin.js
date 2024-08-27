const express = require('express');
const app = express();
const checkAdminRole = (req, res, next) => {
  const userRole = req.user?.role; // Optional chaining in case req.user is undefined

  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Only admin can add a parking lot' });
  }

  next(); // Call the next middleware or route handler if the user is an admin
};

module.exports = { checkAdminRole };
