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

const userSubscriptionSchema = z.object({
  SubscriptionPlanID: z.number(),
  StartDate: z.string(),
  EndDate: z.string(),
  Status: z.string().optional()
});

const userSubscriptionDateSchema = z.object({
  StartDate: z.string(),
  EndDate: z.string()
});
const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be a positive number'),
  maxCars: z.number().int().positive('MaxCars must be a positive integer'),
  maxActiveReservations: z.number().int().nonnegative('MaxActiveReservations cannot be negative'),
  features: z.array(z.string()).nonempty('Features array cannot be empty')
});

const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial();

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

// Slot Schema
const SlotSchema = z.object({
  idSlots: z.number().int(),
  Busy: z.boolean(),
  AreaID: z.number().int(),
  BorderRight: z.number().int(),
  Active: z.boolean(),
  Fault: z.boolean()
});
const SlotCreateSchema = SlotSchema.omit({ idSlots: true });

const updateSlotSchema = z.object({
  BorderRight: z.number().optional(),
  Active: z.boolean().optional() // Active status, true or false
});
const updateCriteriaSchema = z.object({
  cityId: z.number().int().min(1),
  areaId: z.number().int().optional(),
  active: z.boolean().optional()
});
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

const deleteReservationSchema = z.object({
  idReservation: z.number().int().positive(), // Ensure this matches your expected type
  idUsers: z.number().int().positive().optional() // Optional if not always provided
});

const setExitTimeModelSchema = z.object({
  idCars: z.number().int().positive(), // Assuming idCars is a positive integer
  exitTime: z.instanceof(Date) // Validate that exitTime is a Date object
});

const rangeSchema = z
  .object({
    startId: z.number().int().nonnegative(),
    endId: z.number().int().nonnegative()
  })
  .refine((data) => data.startId <= data.endId, {
    message: 'startId must be less than or equal to endId'
  });
const viewSlotsSchema = z.object({
  cityId: z
    .number()
    .int()
    .positive()
    .refine((value) => value > 0, { message: 'cityId must be a positive number' }),
  active: z.boolean().optional(),
  areaId: z.number().int().positive().optional(),
  busy: z.boolean().optional() // Adding the busy criterion
});

const deleteSlotsCriteriaSchema = z.object({
  cityId: z.number().int().positive(), // Required and must be a positive integer
  AreaID: z.number().int().positive().optional(), // Optional positive integer
  Active: z.boolean().optional() // Optional boolean
});
const UserCriteriaSchema = z.object({
  subscriptionStatus: z.string().optional(),
  SubscriptionPlanName: z.string().optional(),
  FirstName: z.string().optional(),
  LastName: z.string().optional(),
  Phone: z.string().optional(),
  Email: z.string().optional(),
  Violations: z.number().optional(),
  Role: z.string().optional()
});

const IdSchema = z.number().int().positive();

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
  updateSlotSchema,
  updateCriteriaSchema,
  SlotSchema,
  SlotCreateSchema,
  addUserControllerSchema,
  updateUserSchema,
  subscriptionSchema: userSubscriptionSchema,
  ReservationBaseSchema,
  ReservationCreateSchema,
  deleteReservationSchema,
  setExitTimeModelSchema,
  CityCreateSchema,
  CityUpdateSchema,
  AreaCreateSchema,
  AreaUpdateSchema,
  rangeSchema,
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  userSubscriptionDateSchema,
  viewSlotsSchema,
  deleteSlotsCriteriaSchema,
  UserCriteriaSchema,
  IdSchema

  // ReservationUpdateSchema
};
