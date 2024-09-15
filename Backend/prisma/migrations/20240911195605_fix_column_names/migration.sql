/*
  Warnings:

  - You are about to drop the column `role` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `violations` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cities" ADD COLUMN     "pictureUrl" VARCHAR(255);

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "role",
DROP COLUMN "violations",
ADD COLUMN     "Role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "Violations" INTEGER NOT NULL DEFAULT 0;
