// validationUtils.js

const { sanitizeObject } = require("../utils/xssUtils"); // Adjust import based on your utilities file
const {
  addUserSchema,
  subscriptionSchema,
  addCarSchema,
} = require("../db-postgres/zodSchema"); // Adjust based on your schema definitions
const prisma = require("../prisma/prismaClient"); // Adjust based on your Prisma client file

// Define the fields that need to be sanitized for each type of data
const userStringFields = [
  "FirstName",
  "LastName",
  "Email",
  "Phone",
  "Address",
  // Add more fields as needed
];

const subscriptionStringFields = [
  "PlanName",
  "Description",
  // Add more fields as needed
];

async function sanitizeAndValidateData(userData, subscriptionData, carsData) {
  // Sanitize input data
  const sanitizedUserData = sanitizeObject(userData, userStringFields);
  const sanitizedSubscriptionData = sanitizeObject(
    subscriptionData,
    subscriptionStringFields
  );
  const sanitizedCarsData = carsData.map(
    (car) => sanitizeObject(car, ["RegistrationID", "Model"]) // Adjust if needed
  );

  // Validate input data
  const validatedUserData = addUserSchema.parse(sanitizedUserData);
  const validatedSubscriptionData = subscriptionSchema.parse(
    sanitizedSubscriptionData
  );
  const validatedCarData = addCarSchema.array().parse(sanitizedCarsData);

  return { validatedUserData, validatedSubscriptionData, validatedCarData };
}

async function validateCarCount(carsData, subscriptionPlanID) {
  const maxCarsObj = await prisma.subscriptionPlans.findFirst({
    where: { idSubscriptionPlans: subscriptionPlanID },
    select: { MaxCars: true },
  });
  if (!maxCarsObj)
    throw new Error("Couldn't fetch subscription max cars count");

  const maxCars = maxCarsObj.MaxCars;
  if (carsData.length > maxCars)
    throw new Error(
      `This subscription plan only supports up to ${maxCars} cars`
    );
  if (carsData.length === 0) throw new Error("No cars were inputted");
}

function handleZodErrorResponse(res, error) {
  console.error("Validation Error:", error.errors);
  return res.status(400).json({ errors: error.errors });
}

module.exports = {
  sanitizeAndValidateData,
  validateCarCount,
  handleZodErrorResponse,
};
