/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `UserSubscriptions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ParkingLog" DROP CONSTRAINT "ParkingLog_SlotID_fkey";

-- AlterTable
ALTER TABLE "ParkingLog" ALTER COLUMN "SlotID" DROP NOT NULL,
ALTER COLUMN "Exit" DROP NOT NULL,
ALTER COLUMN "Exit" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "NeedToExitBy" DROP NOT NULL,
ALTER COLUMN "NeedToExitBy" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserSubscriptions" DROP COLUMN "subscriptionId",
ADD COLUMN     "SubscriptionId" VARCHAR(255);

-- AddForeignKey
ALTER TABLE "ParkingLog" ADD CONSTRAINT "ParkingLog_SlotID_fkey" FOREIGN KEY ("SlotID") REFERENCES "Slots"("idSlots") ON DELETE SET NULL ON UPDATE CASCADE;
