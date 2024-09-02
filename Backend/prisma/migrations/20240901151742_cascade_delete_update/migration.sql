-- DropForeignKey
ALTER TABLE "Areas" DROP CONSTRAINT "Areas_CityID_fkey";

-- DropForeignKey
ALTER TABLE "Gates" DROP CONSTRAINT "Gates_CityID_fkey";

-- DropForeignKey
ALTER TABLE "Slots" DROP CONSTRAINT "Slots_AreaID_fkey";

-- AddForeignKey
ALTER TABLE "Areas" ADD CONSTRAINT "Areas_CityID_fkey" FOREIGN KEY ("CityID") REFERENCES "Cities"("idCities") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gates" ADD CONSTRAINT "Gates_CityID_fkey" FOREIGN KEY ("CityID") REFERENCES "Cities"("idCities") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slots" ADD CONSTRAINT "Slots_AreaID_fkey" FOREIGN KEY ("AreaID") REFERENCES "Areas"("idAreas") ON DELETE CASCADE ON UPDATE CASCADE;
