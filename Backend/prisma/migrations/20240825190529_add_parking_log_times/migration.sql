/*
  Warnings:

  - Added the required column `NeedToExitBy` to the `ParkingLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ParkingLog" ADD COLUMN     "NeedToExitBy" TIMESTAMPTZ(6) NOT NULL;
