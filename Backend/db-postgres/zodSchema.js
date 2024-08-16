// schemas/schemas.js
const { z } = require("zod");

const addUserSchema = z.object({
  persId: z.number().int().nonnegative(),
  FirstName: z.string().max(40),
  LastName: z.string().max(45),
  Phone: z.string().max(20),
  Email: z.string().email().max(100),
  SubscriptStart: z.string(),
  SubscriptEnd: z.string(),
  Active: z.boolean(),
});

const updateUserSchema = z.object({
  idUsers: z.number().int().optional(),
  persId: z.number().int().optional(),
  FirstName: z.string().max(40).optional(),
  LastName: z.string().max(45).optional(),
  Phone: z.string().max(20).optional(),
  Email: z.string().email().max(100).optional(),
  SubscriptStart: z.string().optional(),
  SubscriptEnd: z.string().optional(),
  Active: z.boolean().optional(),
});

// HW_Alive Schema
const hwAliveSchema = z.object({
  Fault: z.boolean().default(false),
});

// Cars Schema
const carSchema = z.object({
  idCars: z.number().int().optional(),
  RegistrationID: z.string().length(11),
  Model: z.string().max(45),
  OwnerID: z.number().int().min(1),
});

// Areas Schema
const areaSchema = z.object({
  idAreas: z.number().int().optional(),
  AreaName: z.string().max(45),
});

// Gates Schema
const gateSchema = z.object({
  idGates: z.number().int().optional(),
  Entrance: z.boolean(),
  AreaID: z.number().int().min(1),
  Fault: z.boolean(),
});

// SlotSizes Schema
const slotSizeSchema = z.object({
  idSlotSizes: z.number().int().optional(),
  Size: z.string().max(45),
});

// Borders Schema
const borderSchema = z.object({
  idBorders: z.number().int().optional(),
  Violated: z.boolean(),
});

// Slots Schema
const slotSchema = z.object({
  idSlots: z.number().int().optional(),
  Busy: z.boolean(),
  Area: z.number().int().min(1),
  SavedFor: z.number().int().min(1),
  TakenBy: z.number().int().min(1),
  BorderLeft: z.number().int().min(1),
  BorderRigth: z.number().int().min(1),
  Size: z.number().int().min(1),
  Active: z.boolean(),
  Fault: z.boolean(),
});

// ParkingLog Schema
const parkingLogSchema = z.object({
  idParkingLog: z.number().int().optional(),
  CarID: z.number().int().min(1),
  SlotID: z.number().int().min(1),
  Entrance: z.string(), // Assuming timestamps are passed as strings (e.g., "2024-08-03T10:00:00Z")
  Exit: z.string(),
  ParkingStart: z.string(),
  ParkingEnd: z.string(),
  SavingStart: z.string(),
  SavingEnd: z.string(),
  Violation: z.boolean(),
});

module.exports = {
  userSchema,
  hwAliveSchema,
  carSchema,
  areaSchema,
  gateSchema,
  slotSizeSchema,
  borderSchema,
  slotSchema,
  parkingLogSchema,
};
