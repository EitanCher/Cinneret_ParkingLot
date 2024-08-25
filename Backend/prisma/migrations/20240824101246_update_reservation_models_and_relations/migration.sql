/*
  Warnings:

  - You are about to drop the column `ParkingEnd` on the `ParkingLog` table. All the data in the column will be lost.
  - You are about to drop the column `ParkingStart` on the `ParkingLog` table. All the data in the column will be lost.
  - You are about to drop the column `SavingEnd` on the `ParkingLog` table. All the data in the column will be lost.
  - You are about to drop the column `SavingStart` on the `ParkingLog` table. All the data in the column will be lost.
  - You are about to drop the column `SavedFor` on the `Slots` table. All the data in the column will be lost.
  - You are about to drop the column `TakenBy` on the `Slots` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ParkingLog" DROP CONSTRAINT "ParkingLog_CarID_fkey";

-- DropForeignKey
ALTER TABLE "ParkingLog" DROP CONSTRAINT "ParkingLog_SlotID_fkey";

-- DropForeignKey
ALTER TABLE "Slots" DROP CONSTRAINT "Slots_SavedFor_fkey";

-- DropForeignKey
ALTER TABLE "Slots" DROP CONSTRAINT "Slots_TakenBy_fkey";

-- AlterTable
ALTER TABLE "ParkingLog" DROP COLUMN "ParkingEnd",
DROP COLUMN "ParkingStart",
DROP COLUMN "SavingEnd",
DROP COLUMN "SavingStart";

-- AlterTable
ALTER TABLE "Slots" DROP COLUMN "SavedFor",
DROP COLUMN "TakenBy";

-- CreateTable
CREATE TABLE "Reservations" (
    "idReservation" SERIAL NOT NULL,
    "UserID" INTEGER NOT NULL,
    "CarID" INTEGER NOT NULL,
    "SlotID" INTEGER NOT NULL,
    "ReservationStart" TIMESTAMPTZ(6) NOT NULL,
    "ReservationEnd" TIMESTAMPTZ(6) NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "Reservations_pkey" PRIMARY KEY ("idReservation")
);

-- AddForeignKey
ALTER TABLE "ParkingLog" ADD CONSTRAINT "ParkingLog_CarID_fkey" FOREIGN KEY ("CarID") REFERENCES "Cars"("idCars") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingLog" ADD CONSTRAINT "ParkingLog_SlotID_fkey" FOREIGN KEY ("SlotID") REFERENCES "Slots"("idSlots") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservations" ADD CONSTRAINT "Reservations_SlotID_fkey" FOREIGN KEY ("SlotID") REFERENCES "Slots"("idSlots") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservations" ADD CONSTRAINT "Reservations_CarID_fkey" FOREIGN KEY ("CarID") REFERENCES "Cars"("idCars") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservations" ADD CONSTRAINT "Reservations_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "Users"("idUsers") ON DELETE RESTRICT ON UPDATE CASCADE;
