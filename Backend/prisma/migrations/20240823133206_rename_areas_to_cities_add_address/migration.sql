/*
  Warnings:

  - You are about to drop the column `AreaID` on the `Gates` table. All the data in the column will be lost.
  - You are about to drop the column `Area` on the `Slots` table. All the data in the column will be lost.
  - You are about to drop the `Areas` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[UserID,Status]` on the table `UserSubscriptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `CityID` to the `Gates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CityID` to the `Slots` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Gates" DROP CONSTRAINT "Gates_AreaID_fkey";

-- DropForeignKey
ALTER TABLE "Slots" DROP CONSTRAINT "Slots_Area_fkey";

-- AlterTable
ALTER TABLE "Gates" DROP COLUMN "AreaID",
ADD COLUMN     "CityID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Slots" DROP COLUMN "Area",
ADD COLUMN     "CityID" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Areas";

-- CreateTable
CREATE TABLE "Cities" (
    "idCities" SERIAL NOT NULL,
    "CityName" VARCHAR(45) NOT NULL,
    "FullAddress" VARCHAR(255) NOT NULL,

    CONSTRAINT "Cities_pkey" PRIMARY KEY ("idCities")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cities_CityName_key" ON "Cities"("CityName");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscriptions_UserID_Status_key" ON "UserSubscriptions"("UserID", "Status");

-- AddForeignKey
ALTER TABLE "Gates" ADD CONSTRAINT "Gates_CityID_fkey" FOREIGN KEY ("CityID") REFERENCES "Cities"("idCities") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Slots" ADD CONSTRAINT "Slots_CityID_fkey" FOREIGN KEY ("CityID") REFERENCES "Cities"("idCities") ON DELETE NO ACTION ON UPDATE NO ACTION;
