-- PostgreSQL Script converted from MySQL
-- Sat Aug  3 23:19:02 2024
-- Model: New Model    Version: 1.0

-- -----------------------------------------------------
-- Schema ParkingLot_DB
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS "ParkingLot_DB";
SET search_path TO "ParkingLot_DB";

-- -----------------------------------------------------
-- Table "ParkingLot_DB"."Users"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "Users" (
  "idUsers" SERIAL PRIMARY KEY,
  "persId" INTEGER NOT NULL UNIQUE,
  "FirstName" VARCHAR(40) NOT NULL,
  "LastName" VARCHAR(45) NOT NULL,
  "Phone" VARCHAR(20) NOT NULL,
  "Email" VARCHAR(100) NOT NULL,
  "SubscriptStart" DATE NOT NULL,
  "SubscriptEnd" DATE NOT NULL,
  "Active" BOOLEAN,
  "Password" VARCHAR(255) NOT NULL -- Add the Password column
);

-- -----------------------------------------------------
-- Table "ParkingLot_DB"."HW_Alive"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "HW_Alive" (
  "Fault" BOOLEAN NOT NULL DEFAULT FALSE
);

-- -----------------------------------------------------
-- Table "ParkingLot_DB"."Cars"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "Cars" (
  "idCars" SERIAL PRIMARY KEY,
  "RegistrationID" VARCHAR(11) NOT NULL UNIQUE,
  "Model" VARCHAR(45) NOT NULL,
  "OwnerID" INTEGER NOT NULL,
  CONSTRAINT "OwnerID_fk" FOREIGN KEY ("OwnerID") REFERENCES "Users" ("idUsers") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- -----------------------------------------------------
-- Table "ParkingLot_DB"."Areas"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "Areas" (
  "idAreas" SERIAL PRIMARY KEY,
  "AreaName" VARCHAR(45) NOT NULL UNIQUE
);

-- -----------------------------------------------------
-- Table "ParkingLot_DB"."Gates"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "Gates" (
  "idGates" SERIAL PRIMARY KEY,
  "Entrance" BOOLEAN NOT NULL,
  "AreaID" INTEGER NOT NULL,
  "Fault" BOOLEAN NOT NULL,
  CONSTRAINT "AreaID_fk" FOREIGN KEY ("AreaID") REFERENCES "Areas" ("idAreas") ON DELETE CASCADE ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table "ParkingLot_DB"."SlotSizes"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "SlotSizes" (
  "idSlotSizes" SERIAL PRIMARY KEY,
  "Size" VARCHAR(45) NOT NULL UNIQUE
);

-- -----------------------------------------------------
-- Table "ParkingLot_DB"."Borders"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "Borders" (
  "idBorders" SERIAL PRIMARY KEY,
  "Violated" BOOLEAN NOT NULL
);

-- -----------------------------------------------------
-- Table "ParkingLot_DB"."Slots"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "Slots" (
  "idSlots" SERIAL PRIMARY KEY,
  "Busy" BOOLEAN NOT NULL,
  "Area" INTEGER NOT NULL,
  "SavedFor" INTEGER NOT NULL,
  "TakenBy" INTEGER NOT NULL,
  "BorderLeft" INTEGER NOT NULL,
  "BorderRigth" INTEGER NOT NULL,
  "Size" INTEGER NOT NULL,
  "Active" BOOLEAN NOT NULL,
  "Fault" BOOLEAN NOT NULL,
  CONSTRAINT "SavedFor_fk" FOREIGN KEY ("SavedFor") REFERENCES "Cars" ("idCars") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "TakenBy_fk" FOREIGN KEY ("TakenBy") REFERENCES "Cars" ("idCars") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "BorderL_fk" FOREIGN KEY ("BorderLeft") REFERENCES "Borders" ("idBorders") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "BorderR_fk" FOREIGN KEY ("BorderRigth") REFERENCES "Borders" ("idBorders") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "Size_fk" FOREIGN KEY ("Size") REFERENCES "SlotSizes" ("idSlotSizes") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "Area_fk" FOREIGN KEY ("Area") REFERENCES "Areas" ("idAreas") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- -----------------------------------------------------
-- Table "ParkingLot_DB"."ParkingLog"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "ParkingLog" (
  "idParkingLog" SERIAL PRIMARY KEY,
  "CarID" INTEGER NOT NULL,
  "SlotID" INTEGER NOT NULL,
  "Entrance" TIMESTAMP NOT NULL,
  "Exit" TIMESTAMP NOT NULL,
  "ParkingStart" TIMESTAMP NOT NULL,
  "ParkingEnd" TIMESTAMP NOT NULL,
  "SavingStart" TIMESTAMP NOT NULL,
  "SavingEnd" TIMESTAMP NOT NULL,
  "Violation" BOOLEAN NOT NULL,
  CONSTRAINT "CarID_fk" FOREIGN KEY ("CarID") REFERENCES "Cars" ("idCars") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "SlotID_fk" FOREIGN KEY ("SlotID") REFERENCES "Slots" ("idSlots") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Create the SubscriptionPlans table
CREATE TABLE IF NOT EXISTS "ParkingLot_DB"."SubscriptionPlans" (
  "idSubscriptionPlans" SERIAL PRIMARY KEY,
  "Name" VARCHAR(45) NOT NULL UNIQUE,
  "Price" DECIMAL(10, 2) NOT NULL,
  "MaxCars" INTEGER NOT NULL,
  "Features" TEXT[]  -- Store additional features as an array of text
);

-- Insert subscription plans with features
INSERT INTO "ParkingLot_DB"."SubscriptionPlans" ("Name", "Price", "MaxCars", "Features")
VALUES 
('Single Vehicle Subscription', 40.00, 1, ARRAY['Access to parking for 1 vehicle', '24/7 access to parking spaces', 'Priority parking spots', 'Dedicated customer support line', 'Monthly parking spot reservation']),
('Family Subscription', 70.00, 3, ARRAY['Access to parking for up to 3 vehicles', '24/7 access to parking spaces', 'Priority parking spots', 'Dedicated customer support line', 'Monthly parking spot reservation', 'Family account management']),
('Enterprise Subscription', 120.00, 10, ARRAY['Access to parking for up to 10 vehicles', '24/7 access to parking spaces', 'Premium parking spots with guaranteed availability', 'Dedicated account manager', 'Advanced reporting and analytics', 'Integration with company systems', 'Enterprise-level customer support']);

-- Reset search path to default
RESET search_path;

