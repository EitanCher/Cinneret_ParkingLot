// schemas/schemas.js
const { z } = require('zod');

const stringToDate = z.string().transform((val) => new Date(val));
const dateToString = z.date().transform((date) => date.toISOString());

const addUserControllerSchema = z.object({
  persId: z.string().max(20), // Adjust length to match your database
  FirstName: z.string().max(50), // Adjust length to match your database
  LastName: z.string().max(50), // Adjust length to match your database
  Email: z.string().email().max(255), // Adjust length to match your database
  Phone: z.string().max(20), // Adjust length to match your database
  Password: z.string().min(6).max(100) // Adjust length to match your database
});

const subscriptionSchema = z.object({
  SubscriptionPlanID: z.number(),
  StartDate: z.string(),
  EndDate: z.string(),
  Status: z.string().optional()
});

const updateUserSchema = z.object({
  persId: z.string().optional(), // Change to string
  FirstName: z.string().max(40).optional(),
  LastName: z.string().max(45).optional(),
  Phone: z.string().max(20).optional(),
  Email: z.string().email().max(100).optional(),
  Password: z.string().min(6).optional()
});

// HW_Alive Schema
const hwAliveSchema = z.object({
  Fault: z.boolean().default(false)
});

// Cars Schema
const carSchema = z.object({
  idCars: z.number().int().positive(), // Ensure `idCars` is a positive integer
  RegistrationID: z.string().length(11),
  Model: z.string().max(45),
  OwnerID: z.number().int().min(1)
});
const carsArraySchema = z.array(carSchema);

// City Schema
const CitySchema = z.object({
  idCities: z.number().int(),
  CityName: z.string().max(45),
  FullAddress: z.string().max(255)
});
const CityCreateSchema = CitySchema.omit({ idCities: true });
const CityUpdateSchema = CitySchema.partial();

// Area Schema
const AreaSchema = z.object({
  idAreas: z.number().int(),
  AreaName: z.string().max(45),
  CityID: z.number().int()
});
const AreaCreateSchema = AreaSchema.omit({ idAreas: true });
const AreaUpdateSchema = AreaSchema.partial();

// Border Schema
const BorderSchema = z.object({
  idBorders: z.number().int(),
  Violated: z.boolean()
});
const BorderCreateSchema = BorderSchema.omit({ idBorders: true });
const BorderUpdateSchema = BorderSchema.partial();

// Gate Schema
const GateSchema = z.object({
  idGates: z.number().int(),
  Entrance: z.boolean(),
  CityID: z.number().int(),
  Fault: z.boolean()
});
const GateCreateSchema = GateSchema.omit({ idGates: true });
const GateUpdateSchema = GateSchema.partial();

// ParkingLog Schema
const ParkingLogSchema = z.object({
  idParkingLog: z.number().int(),
  CarID: z.number().int(),
  SlotID: z.number().int(),
  Entrance: z.date(), // DateTime in Prisma
  Exit: z.date(), // DateTime in Prisma
  ParkingStart: z.date(), // DateTime in Prisma
  ParkingEnd: z.date(), // DateTime in Prisma
  SavingStart: z.date(), // DateTime in Prisma
  SavingEnd: z.date(), // DateTime in Prisma
  Violation: z.boolean()
});
const ParkingLogCreateSchema = ParkingLogSchema.omit({ idParkingLog: true });
const ParkingLogUpdateSchema = ParkingLogSchema.partial();

// SlotSize Schema
const SlotSizeSchema = z.object({
  idSlotSizes: z.number().int(),
  Size: z.string().max(45)
});
const SlotSizeCreateSchema = SlotSizeSchema.omit({ idSlotSizes: true });
const SlotSizeUpdateSchema = SlotSizeSchema.partial();

// Slot Schema
const SlotSchema = z.object({
  idSlots: z.number().int(),
  Busy: z.boolean(),
  AreaID: z.number().int(),
  SavedFor: z.number().int(),
  TakenBy: z.number().int(),
  BorderLeft: z.number().int(),
  BorderRight: z.number().int(),
  Size: z.number().int(),
  Active: z.boolean(),
  Fault: z.boolean()
});
const SlotCreateSchema = SlotSchema.omit({ idSlots: true });
const SlotUpdateSchema = SlotSchema.partial();

const ReservationBaseSchema = z
  .object({
    CarID: z.number().int().positive(), // Matches Prisma's CarID
    UserID: z.number().int().positive(), // Matches Prisma's UserID
    SlotID: z.number().int().positive(), // Matches Prisma's SlotID
    ReservationStart: z.date().refine((date) => date > new Date(), {
      message: 'Reservation start date must be in the future.'
    }),
    ReservationEnd: z.date().refine((date) => date > new Date(), {
      message: 'Reservation end date must be in the future.'
    })
  })
  .refine((data) => data.ReservationEnd > data.ReservationStart, {
    message: 'Reservation end date must be after the start date.',
    path: ['reservationEnd']
  });

// Create schema requires all fields
const ReservationCreateSchema = ReservationBaseSchema;
// Update schema makes all fields optional
// const ReservationUpdateSchema = ReservationBaseSchema.partial();

module.exports = {
  hwAliveSchema,
  carSchema,
  carsArraySchema,
  CitySchema,
  CityCreateSchema,
  CityUpdateSchema,
  AreaSchema,
  AreaCreateSchema,
  AreaUpdateSchema,
  BorderSchema,
  BorderCreateSchema,
  BorderUpdateSchema,
  GateSchema,
  GateCreateSchema,
  GateUpdateSchema,
  ParkingLogSchema,
  ParkingLogCreateSchema,
  ParkingLogUpdateSchema,
  SlotSizeSchema,
  SlotSizeCreateSchema,
  SlotSizeUpdateSchema,
  SlotSchema,
  SlotCreateSchema,
  SlotUpdateSchema,
  addUserControllerSchema,
  updateUserSchema,
  subscriptionSchema,
  ReservationBaseSchema,
  ReservationCreateSchema
  // ReservationUpdateSchema
};
