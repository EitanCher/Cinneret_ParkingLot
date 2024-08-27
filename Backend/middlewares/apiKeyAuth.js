require('dotenv').config(); // Load environment variablesconst express = require('express');
const express = require('express');
const app = express();
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['api-key'];

  // Check if the provided API key matches the expected API key
  if (apiKey === process.env.EXTERNAL_API_KEY) {
    next(); // Allow the request to proceed
  } else {
    res.status(403).json({ error: 'Forbidden' }); // Reject the request
  }
};

module.exports = { apiKeyAuth };
