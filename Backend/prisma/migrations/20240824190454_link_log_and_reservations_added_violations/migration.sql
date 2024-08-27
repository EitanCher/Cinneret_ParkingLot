-- AlterTable
ALTER TABLE "ParkingLog" ADD COLUMN     "ReservationID" INTEGER;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "violations" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "ParkingLog" ADD CONSTRAINT "ParkingLog_ReservationID_fkey" FOREIGN KEY ("ReservationID") REFERENCES "Reservations"("idReservation") ON DELETE SET NULL ON UPDATE CASCADE;
