/*
  Warnings:

  - A unique constraint covering the columns `[GateIP]` on the table `Gates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[CameraIP]` on the table `Gates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[SlotIP]` on the table `Slots` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[CameraIP]` on the table `Slots` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `CameraIP` to the `Slots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `SlotIP` to the `Slots` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Slots" ADD COLUMN     "CameraIP" VARCHAR(15) NOT NULL,
ADD COLUMN     "SlotIP" VARCHAR(15) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Gates_GateIP_key" ON "Gates"("GateIP");

-- CreateIndex
CREATE UNIQUE INDEX "Gates_CameraIP_key" ON "Gates"("CameraIP");

-- CreateIndex
CREATE UNIQUE INDEX "Slots_SlotIP_key" ON "Slots"("SlotIP");

-- CreateIndex
CREATE UNIQUE INDEX "Slots_CameraIP_key" ON "Slots"("CameraIP");
