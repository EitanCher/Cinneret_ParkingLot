module.exports = {
  // User-Specific Queries
  getUsers: `SELECT * FROM "Users";`,

  getUserById: `SELECT * FROM "Users" WHERE "idUsers" = $1;`,

  insertUser: `INSERT INTO "Users" ("persId", "FirstName", "LastName", "Phone", "Email", "SubscriptStart", "SubscriptEnd", "Active")
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,

  updateUser: `UPDATE "Users"
                  SET "persId" = $1, "FirstName" = $2, "LastName" = $3, "Phone" = $4, "Email" = $5, "SubscriptStart" = $6, "SubscriptEnd" = $7, "Active" = $8
                  WHERE "idUsers" = $9 RETURNING *;`,

  deleteUser: `DELETE FROM "Users" WHERE "idUsers" = $1;`,

  getUserByEmail: `SELECT * FROM "Users" WHERE "Email" = $1;`,

  // Admin-Specific Queries
  getCars: `SELECT * FROM "Cars";`,

  getCarById: `SELECT * FROM "Cars" WHERE "idCars" = $1;`,

  insertCar: `INSERT INTO "Cars" ("RegistrationID", "Model", "OwnerID")
                  VALUES ($1, $2, $3) RETURNING *;`,

  updateCar: `UPDATE "Cars"
                  SET "RegistrationID" = $1, "Model" = $2, "OwnerID" = $3
                  WHERE "idCars" = $4 RETURNING *;`,

  deleteCar: `DELETE FROM "Cars" WHERE "idCars" = $1;`,

  getParkingLog: `SELECT * FROM "ParkingLog";`,

  getParkingLogById: `SELECT * FROM "ParkingLog" WHERE "idParkingLog" = $1;`,

  insertParkingLog: `INSERT INTO "ParkingLog" ("CarID", "SlotID", "Entrance", "Exit", "ParkingStart", "ParkingEnd", "SavingStart", "SavingEnd", "Violation")
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,

  updateParkingLog: `UPDATE "ParkingLog"
                        SET "CarID" = $1, "SlotID" = $2, "Entrance" = $3, "Exit" = $4, "ParkingStart" = $5, "ParkingEnd" = $6, "SavingStart" = $7, "SavingEnd" = $8, "Violation" = $9
                        WHERE "idParkingLog" = $10 RETURNING *;`,

  deleteParkingLog: `DELETE FROM "ParkingLog" WHERE "idParkingLog" = $1;`,

  // Shared Queries
  getAreas: `SELECT * FROM "Areas";`,

  getAreaById: `SELECT * FROM "Areas" WHERE "idAreas" = $1;`,

  insertArea: `INSERT INTO "Areas" ("AreaName")
                  VALUES ($1) RETURNING *;`,

  updateArea: `UPDATE "Areas"
                  SET "AreaName" = $1
                  WHERE "idAreas" = $2 RETURNING *;`,

  deleteArea: `DELETE FROM "Areas" WHERE "idAreas" = $1;`,

  getSlotSizes: `SELECT * FROM "SlotSizes";`,

  getSlotSizeById: `SELECT * FROM "SlotSizes" WHERE "idSlotSizes" = $1;`,

  insertSlotSize: `INSERT INTO "SlotSizes" ("Size")
                      VALUES ($1) RETURNING *;`,

  updateSlotSize: `UPDATE "SlotSizes"
                      SET "Size" = $1
                      WHERE "idSlotSizes" = $2 RETURNING *;`,

  deleteSlotSize: `DELETE FROM "SlotSizes" WHERE "idSlotSizes" = $1;`,

  getBorders: `SELECT * FROM "Borders";`,

  getBorderById: `SELECT * FROM "Borders" WHERE "idBorders" = $1;`,

  insertBorder: `INSERT INTO "Borders" ("Violated")
                    VALUES ($1) RETURNING *;`,

  updateBorder: `UPDATE "Borders"
                    SET "Violated" = $1
                    WHERE "idBorders" = $2 RETURNING *;`,

  deleteBorder: `DELETE FROM "Borders" WHERE "idBorders" = $1;`,

  getSlots: `SELECT * FROM "Slots";`,

  getSlotById: `SELECT * FROM "Slots" WHERE "idSlots" = $1;`,

  insertSlot: `INSERT INTO "Slots" ("Busy", "Area", "SavedFor", "TakenBy", "BorderLeft", "BorderRigth", "Size", "Active", "Fault")
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,

  updateSlot: `UPDATE "Slots"
                  SET "Busy" = $1, "Area" = $2, "SavedFor" = $3, "TakenBy" = $4, "BorderLeft" = $5, "BorderRigth" = $6, "Size" = $7, "Active" = $8, "Fault" = $9
                  WHERE "idSlots" = $10 RETURNING *;`,

  deleteSlot: `DELETE FROM "Slots" WHERE "idSlots" = $1;`,
};
