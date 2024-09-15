// src/utils/validation.js

export function validatePersId(persId) {
  const persIdRegex = /^\d{9}$/;
  return persId && persIdRegex.test(persId) ? null : 'Personal ID must be exactly 9 digits.';
}

export function validateName(name) {
  return /^[a-zA-Z\s]+$/.test(name) ? null : 'Name cannot contain numbers.';
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && emailRegex.test(email) ? null : 'Please enter a valid email address.';
}

export function validatePhone(phone) {
  const phoneRegex = /^\+?\d{1,20}$/;
  return phone && phoneRegex.test(phone) ? null : 'Phone number is not valid.';
}

export function validatePassword(password) {
  return password.length >= 6 && password.length <= 255 ? null : 'Password must be between 6 and 255 characters long.';
}

export function validateConfirmPassword(password, confirmPassword) {
  return password === confirmPassword ? null : 'Passwords do not match.';
}

// Combined validation function
export function validateSignUpForm({ persId, firstName, lastName, email, phone, password, confirmPassword }) {
  let errorMessage;

  errorMessage = validatePersId(persId);
  if (errorMessage) return errorMessage;

  errorMessage = validateName(firstName);
  if (errorMessage) return errorMessage;

  errorMessage = validateName(lastName);
  if (errorMessage) return errorMessage;

  errorMessage = validateEmail(email);
  if (errorMessage) return errorMessage;

  errorMessage = validatePhone(phone);
  if (errorMessage) return errorMessage;

  errorMessage = validatePassword(password);
  if (errorMessage) return errorMessage;

  errorMessage = validateConfirmPassword(password, confirmPassword);
  if (errorMessage) return errorMessage;

  return null;
}
