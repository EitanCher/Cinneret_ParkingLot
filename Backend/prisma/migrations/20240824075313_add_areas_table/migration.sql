/*
  Warnings:

  - You are about to drop the column `CityID` on the `Slots` table. All the data in the column will be lost.
  - You are about to drop the `HW_Alive` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `AreaID` to the `Slots` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Slots" DROP CONSTRAINT "Slots_CityID_fkey";

-- AlterTable
ALTER TABLE "Slots" DROP COLUMN "CityID",
ADD COLUMN     "AreaID" INTEGER NOT NULL;

-- DropTable
DROP TABLE "HW_Alive";

-- CreateTable
CREATE TABLE "Areas" (
    "idAreas" SERIAL NOT NULL,
    "AreaName" VARCHAR(45) NOT NULL,
    "CityID" INTEGER NOT NULL,

    CONSTRAINT "Areas_pkey" PRIMARY KEY ("idAreas")
);

-- CreateIndex
CREATE UNIQUE INDEX "Areas_AreaName_key" ON "Areas"("AreaName");

-- AddForeignKey
ALTER TABLE "Areas" ADD CONSTRAINT "Areas_CityID_fkey" FOREIGN KEY ("CityID") REFERENCES "Cities"("idCities") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Slots" ADD CONSTRAINT "Slots_AreaID_fkey" FOREIGN KEY ("AreaID") REFERENCES "Areas"("idAreas") ON DELETE NO ACTION ON UPDATE NO ACTION;
