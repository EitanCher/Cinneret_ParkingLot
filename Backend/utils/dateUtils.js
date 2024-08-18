// dateUtils.js
function convertToISODate(dateString) {
  return new Date(dateString).toISOString();
}

module.exports = { convertToISODate };
