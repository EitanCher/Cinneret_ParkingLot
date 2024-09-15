/*
  Warnings:

  - You are about to drop the column `StripeProductId` on the `SubscriptionPlans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlans" DROP COLUMN "StripeProductId";

-- AlterTable
ALTER TABLE "UserSubscriptions" ADD COLUMN     "subscriptionId" VARCHAR(255),
ALTER COLUMN "StripeSessionId" SET DATA TYPE TEXT;
