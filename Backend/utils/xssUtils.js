const xss = require("xss");

// Define the fields you need to sanitize as strings
const stringFields = [
  "FirstName",
  "LastName",
  "Email",
  "Phone",
  // Add more fields as needed based on your application
];
const sanitizeObject = (obj, stringFields) => {
  if (!Array.isArray(stringFields)) {
    throw new Error("stringFields must be an array");
  }

  const sanitizedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (stringFields.includes(key) && typeof obj[key] === "string") {
        sanitizedObj[key] = xss(obj[key]);
      } else {
        sanitizedObj[key] = obj[key]; // No change for non-string fields
      }
    }
  }
  return sanitizedObj;
};

module.exports = {
  sanitizeObject,
};
