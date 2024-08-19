/*
  Warnings:

  - You are about to alter the column `Password` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(9)`.

*/
-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "persId" SET DATA TYPE TEXT,
ALTER COLUMN "Password" SET DATA TYPE VARCHAR(9);
