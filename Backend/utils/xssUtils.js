const xss = require('xss');

// Define the fields you need to sanitize as strings
const stringFields = [
  'idUsers',
  'Name',
  'Price',
  'MaxCars',
  'features' // Add "features" to indicate it's an array of strings
];

const sanitizeObject = (obj, stringFields) => {
  if (!Array.isArray(stringFields)) {
    throw new Error('stringFields must be an array');
  }

  const sanitizedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (stringFields.includes(key)) {
        if (typeof obj[key] === 'string') {
          // Sanitize string fields
          sanitizedObj[key] = xss(obj[key]);
        } else if (Array.isArray(obj[key])) {
          // Sanitize arrays of strings
          sanitizedObj[key] = obj[key].map((item) => (typeof item === 'string' ? xss(item) : item));
        } else {
          // If the field is not a string and not an array, keep it unchanged
          sanitizedObj[key] = obj[key];
        }
      } else {
        // For fields not in stringFields, keep them unchanged
        sanitizedObj[key] = obj[key];
      }
    }
  }
  return sanitizedObj;
};

module.exports = {
  sanitizeObject
};
