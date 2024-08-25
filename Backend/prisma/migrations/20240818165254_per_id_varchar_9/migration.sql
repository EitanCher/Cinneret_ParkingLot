/*
  Warnings:

  - You are about to alter the column `persId` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(9)`.

*/
-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "persId" SET DATA TYPE VARCHAR(9),
ALTER COLUMN "Password" SET DATA TYPE VARCHAR(255);
