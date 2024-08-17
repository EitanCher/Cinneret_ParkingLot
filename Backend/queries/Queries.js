module.exports = {
  // User-Specific Queries
  getUsers: `SELECT * FROM "ParkingLot_DB"."Users";`,

  createUser: `INSERT INTO "ParkingLot_DB"."Users" 
       ("persId", "FirstName", "LastName", "Email", "Phone", "Password") 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING "idUsers"`,

  getUserById: `SELECT * FROM "ParkingLot_DB"."Users" WHERE "idUsers" = $1;`,

  updateUser: `
    UPDATE "ParkingLot_DB"."Users"
    SET "persId" = $1, "FirstName" = $2, "LastName" = $3, "Phone" = $4, "Email" = $5, "SubscriptStart" = $6, "SubscriptEnd" = $7
    WHERE "idUsers" = $8 RETURNING *;
  `,

  getSubscriptions: `
    SELECT 
      "idSubscriptionPlans" AS "ID",
      "Name",
      "Price",
      "MaxCars",
      "Features"
    FROM 
      "ParkingLot_DB"."SubscriptionPlans";
  `,

  maxCarsByPlanID: `SELECT "MaxCars" FROM "ParkingLot_DB"."SubscriptionPlans" WHERE "idSubscriptionPlans" = $1;`,

  createUserSubscription: `INSERT INTO "ParkingLot_DB"."UserSubscriptions" 
       ("UserID", "SubscriptionPlanID", "StartDate", "EndDate", "Status") 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING "idUserSubscriptions"`,

  createCar: `INSERT INTO "ParkingLot_DB"."Cars" ("RegistrationID", "Model", "OwnerID")
VALUES ($1, $2, $3) RETURNING "idCars";`,

  deleteUser: `DELETE FROM "ParkingLot_DB"."Users" WHERE "idUsers" = $1;`,

  getUserByEmail: `SELECT * FROM "ParkingLot_DB"."Users" WHERE "Email" = $1;`,

  // Admin-Specific Queries
  getCars: `SELECT * FROM "ParkingLot_DB"."Cars";`,

  getCarById: `SELECT * FROM "ParkingLot_DB"."Cars" WHERE "idCars" = $1;`,

  insertCar: `
    INSERT INTO "ParkingLot_DB"."Cars" ("RegistrationID", "Model", "OwnerID")
    VALUES ($1, $2, $3) RETURNING *;
  `,

  updateCar: `
    UPDATE "ParkingLot_DB"."Cars"
    SET "RegistrationID" = $1, "Model" = $2, "OwnerID" = $3
    WHERE "idCars" = $4 RETURNING *;
  `,

  deleteCar: `DELETE FROM "ParkingLot_DB"."Cars" WHERE "idCars" = $1;`,

  getParkingLog: `SELECT * FROM "ParkingLot_DB"."ParkingLog";`,

  getParkingLogById: `SELECT * FROM "ParkingLot_DB"."ParkingLog" WHERE "idParkingLog" = $1;`,

  insertParkingLog: `
    INSERT INTO "ParkingLot_DB"."ParkingLog" ("CarID", "SlotID", "Entrance", "Exit", "ParkingStart", "ParkingEnd", "SavingStart", "SavingEnd", "Violation")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
  `,

  updateParkingLog: `
    UPDATE "ParkingLot_DB"."ParkingLog"
    SET "CarID" = $1, "SlotID" = $2, "Entrance" = $3, "Exit" = $4, "ParkingStart" = $5, "ParkingEnd" = $6, "SavingStart" = $7, "SavingEnd" = $8, "Violation" = $9
    WHERE "idParkingLog" = $10 RETURNING *;
  `,

  deleteParkingLog: `DELETE FROM "ParkingLot_DB"."ParkingLog" WHERE "idParkingLog" = $1;`,

  // Shared Queries
  getAreas: `SELECT * FROM "ParkingLot_DB"."Areas";`,

  getAreaById: `SELECT * FROM "ParkingLot_DB"."Areas" WHERE "idAreas" = $1;`,

  insertArea: `
    INSERT INTO "ParkingLot_DB"."Areas" ("AreaName")
    VALUES ($1) RETURNING *;
  `,

  updateArea: `
    UPDATE "ParkingLot_DB"."Areas"
    SET "AreaName" = $1
    WHERE "idAreas" = $2 RETURNING *;
  `,

  deleteArea: `DELETE FROM "ParkingLot_DB"."Areas" WHERE "idAreas" = $1;`,

  getSlotSizes: `SELECT * FROM "ParkingLot_DB"."SlotSizes";`,

  getSlotSizeById: `SELECT * FROM "ParkingLot_DB"."SlotSizes" WHERE "idSlotSizes" = $1;`,

  insertSlotSize: `
    INSERT INTO "ParkingLot_DB"."SlotSizes" ("Size")
    VALUES ($1) RETURNING *;
  `,

  updateSlotSize: `
    UPDATE "ParkingLot_DB"."SlotSizes"
    SET "Size" = $1
    WHERE "idSlotSizes" = $2 RETURNING *;
  `,

  deleteSlotSize: `DELETE FROM "ParkingLot_DB"."SlotSizes" WHERE "idSlotSizes" = $1;`,

  getBorders: `SELECT * FROM "ParkingLot_DB"."Borders";`,

  getBorderById: `SELECT * FROM "ParkingLot_DB"."Borders" WHERE "idBorders" = $1;`,

  insertBorder: `
    INSERT INTO "ParkingLot_DB"."Borders" ("Violated")
    VALUES ($1) RETURNING *;
  `,

  updateBorder: `
    UPDATE "ParkingLot_DB"."Borders"
    SET "Violated" = $1
    WHERE "idBorders" = $2 RETURNING *;
  `,

  deleteBorder: `DELETE FROM "ParkingLot_DB"."Borders" WHERE "idBorders" = $1;`,

  getSlots: `SELECT * FROM "ParkingLot_DB"."Slots";`,

  getSlotById: `SELECT * FROM "ParkingLot_DB"."Slots" WHERE "idSlots" = $1;`,

  insertSlot: `
    INSERT INTO "ParkingLot_DB"."Slots" ("Busy", "Area", "SavedFor", "TakenBy", "BorderLeft", "BorderRigth", "Size", "Active", "Fault")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
  `,

  updateSlot: `
    UPDATE "ParkingLot_DB"."Slots"
    SET "Busy" = $1, "Area" = $2, "SavedFor" = $3, "TakenBy" = $4, "BorderLeft" = $5, "BorderRigth" = $6, "Size" = $7, "Active" = $8, "Fault" = $9
    WHERE "idSlots" = $10 RETURNING *;
  `,

  deleteSlot: `DELETE FROM "ParkingLot_DB"."Slots" WHERE "idSlots" = $1;`,
};
