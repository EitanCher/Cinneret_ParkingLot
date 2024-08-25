// dateUtils.js

// Convert a date string to an ISO string
function convertToISODate(dateString) {
  return new Date(dateString).toISOString();
}

// Calculate the end date given a start date and duration (in years)
function calculateEndDate(startDate, years = 1) {
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + years);
  return endDate.toISOString(); // Return ISO string format
}

// Get the current date in ISO string format
function getCurrentISODate() {
  return new Date().toISOString();
}

module.exports = {
  convertToISODate,
  calculateEndDate,
  getCurrentISODate
};
