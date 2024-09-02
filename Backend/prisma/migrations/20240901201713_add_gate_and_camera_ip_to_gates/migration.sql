/*
  Warnings:

  - Added the required column `CameraIP` to the `Gates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `GateIP` to the `Gates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gates" ADD COLUMN     "CameraIP" VARCHAR(15) NOT NULL,
ADD COLUMN     "GateIP" VARCHAR(15) NOT NULL;
