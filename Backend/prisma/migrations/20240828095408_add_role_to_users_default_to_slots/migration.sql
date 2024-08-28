-- AlterTable
ALTER TABLE "Slots" ALTER COLUMN "Busy" DROP NOT NULL,
ALTER COLUMN "Busy" SET DEFAULT false,
ALTER COLUMN "Active" DROP NOT NULL,
ALTER COLUMN "Active" SET DEFAULT true,
ALTER COLUMN "Fault" DROP NOT NULL,
ALTER COLUMN "Fault" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "role" VARCHAR(50) NOT NULL DEFAULT 'user';
