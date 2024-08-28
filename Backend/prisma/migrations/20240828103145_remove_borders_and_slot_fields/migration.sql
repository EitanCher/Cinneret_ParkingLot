/*
  Warnings:

  - You are about to drop the column `BorderLeft` on the `Slots` table. All the data in the column will be lost.
  - You are about to drop the column `Size` on the `Slots` table. All the data in the column will be lost.
  - You are about to drop the `Borders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SlotSizes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Slots" DROP CONSTRAINT "Slots_BorderLeft_fkey";

-- DropForeignKey
ALTER TABLE "Slots" DROP CONSTRAINT "Slots_BorderRight_fkey";

-- DropForeignKey
ALTER TABLE "Slots" DROP CONSTRAINT "Slots_Size_fkey";

-- AlterTable
ALTER TABLE "Slots" DROP COLUMN "BorderLeft",
DROP COLUMN "Size";

-- DropTable
DROP TABLE "Borders";

-- DropTable
DROP TABLE "SlotSizes";
