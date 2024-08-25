-- CreateTable
CREATE TABLE "test_table" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "test_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Areas" (
    "idAreas" SERIAL NOT NULL,
    "AreaName" VARCHAR(45) NOT NULL,

    CONSTRAINT "Areas_pkey" PRIMARY KEY ("idAreas")
);

-- CreateTable
CREATE TABLE "Borders" (
    "idBorders" SERIAL NOT NULL,
    "Violated" BOOLEAN NOT NULL,

    CONSTRAINT "Borders_pkey" PRIMARY KEY ("idBorders")
);

-- CreateTable
CREATE TABLE "Cars" (
    "idCars" SERIAL NOT NULL,
    "RegistrationID" VARCHAR(11) NOT NULL,
    "Model" VARCHAR(45) NOT NULL,
    "OwnerID" INTEGER NOT NULL,

    CONSTRAINT "Cars_pkey" PRIMARY KEY ("idCars")
);

-- CreateTable
CREATE TABLE "Gates" (
    "idGates" SERIAL NOT NULL,
    "Entrance" BOOLEAN NOT NULL,
    "AreaID" INTEGER NOT NULL,
    "Fault" BOOLEAN NOT NULL,

    CONSTRAINT "Gates_pkey" PRIMARY KEY ("idGates")
);

-- CreateTable
CREATE TABLE "HW_Alive" (
    "Fault" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "ParkingLog" (
    "idParkingLog" SERIAL NOT NULL,
    "CarID" INTEGER NOT NULL,
    "SlotID" INTEGER NOT NULL,
    "Entrance" TIMESTAMPTZ(6) NOT NULL,
    "Exit" TIMESTAMPTZ(6) NOT NULL,
    "ParkingStart" TIMESTAMPTZ(6) NOT NULL,
    "ParkingEnd" TIMESTAMPTZ(6) NOT NULL,
    "SavingStart" TIMESTAMPTZ(6) NOT NULL,
    "SavingEnd" TIMESTAMPTZ(6) NOT NULL,
    "Violation" BOOLEAN NOT NULL,

    CONSTRAINT "ParkingLog_pkey" PRIMARY KEY ("idParkingLog")
);

-- CreateTable
CREATE TABLE "SlotSizes" (
    "idSlotSizes" SERIAL NOT NULL,
    "Size" VARCHAR(45) NOT NULL,

    CONSTRAINT "SlotSizes_pkey" PRIMARY KEY ("idSlotSizes")
);

-- CreateTable
CREATE TABLE "Slots" (
    "idSlots" SERIAL NOT NULL,
    "Busy" BOOLEAN NOT NULL,
    "Area" INTEGER NOT NULL,
    "SavedFor" INTEGER NOT NULL,
    "TakenBy" INTEGER NOT NULL,
    "BorderLeft" INTEGER NOT NULL,
    "BorderRight" INTEGER NOT NULL,
    "Size" INTEGER NOT NULL,
    "Active" BOOLEAN NOT NULL,
    "Fault" BOOLEAN NOT NULL,

    CONSTRAINT "Slots_pkey" PRIMARY KEY ("idSlots")
);

-- CreateTable
CREATE TABLE "SubscriptionPlans" (
    "idSubscriptionPlans" SERIAL NOT NULL,
    "Name" VARCHAR(45) NOT NULL,
    "Price" DECIMAL(10,2) NOT NULL,
    "MaxCars" INTEGER NOT NULL,
    "Features" TEXT[],

    CONSTRAINT "SubscriptionPlans_pkey" PRIMARY KEY ("idSubscriptionPlans")
);

-- CreateTable
CREATE TABLE "UserSubscriptions" (
    "idUserSubscriptions" SERIAL NOT NULL,
    "UserID" INTEGER NOT NULL,
    "SubscriptionPlanID" INTEGER NOT NULL,
    "StartDate" DATE NOT NULL,
    "EndDate" DATE NOT NULL,
    "Status" VARCHAR(20) NOT NULL,

    CONSTRAINT "UserSubscriptions_pkey" PRIMARY KEY ("idUserSubscriptions")
);

-- CreateTable
CREATE TABLE "Users" (
    "idUsers" SERIAL NOT NULL,
    "persId" INTEGER NOT NULL,
    "FirstName" VARCHAR(40) NOT NULL,
    "LastName" VARCHAR(45) NOT NULL,
    "Phone" VARCHAR(20) NOT NULL,
    "Email" VARCHAR(100) NOT NULL,
    "Password" VARCHAR(255) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("idUsers")
);

-- CreateIndex
CREATE UNIQUE INDEX "Areas_AreaName_key" ON "Areas"("AreaName");

-- CreateIndex
CREATE UNIQUE INDEX "Cars_RegistrationID_key" ON "Cars"("RegistrationID");

-- CreateIndex
CREATE UNIQUE INDEX "SlotSizes_Size_key" ON "SlotSizes"("Size");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlans_Name_key" ON "SubscriptionPlans"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- AddForeignKey
ALTER TABLE "Cars" ADD CONSTRAINT "Cars_OwnerID_fkey" FOREIGN KEY ("OwnerID") REFERENCES "Users"("idUsers") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Gates" ADD CONSTRAINT "Gates_AreaID_fkey" FOREIGN KEY ("AreaID") REFERENCES "Areas"("idAreas") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ParkingLog" ADD CONSTRAINT "ParkingLog_CarID_fkey" FOREIGN KEY ("CarID") REFERENCES "Cars"("idCars") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ParkingLog" ADD CONSTRAINT "ParkingLog_SlotID_fkey" FOREIGN KEY ("SlotID") REFERENCES "Slots"("idSlots") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Slots" ADD CONSTRAINT "Slots_Area_fkey" FOREIGN KEY ("Area") REFERENCES "Areas"("idAreas") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Slots" ADD CONSTRAINT "Slots_BorderLeft_fkey" FOREIGN KEY ("BorderLeft") REFERENCES "Borders"("idBorders") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Slots" ADD CONSTRAINT "Slots_BorderRight_fkey" FOREIGN KEY ("BorderRight") REFERENCES "Borders"("idBorders") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Slots" ADD CONSTRAINT "Slots_SavedFor_fkey" FOREIGN KEY ("SavedFor") REFERENCES "Cars"("idCars") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Slots" ADD CONSTRAINT "Slots_Size_fkey" FOREIGN KEY ("Size") REFERENCES "SlotSizes"("idSlotSizes") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Slots" ADD CONSTRAINT "Slots_TakenBy_fkey" FOREIGN KEY ("TakenBy") REFERENCES "Cars"("idCars") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserSubscriptions" ADD CONSTRAINT "SubscriptionPlan_fk" FOREIGN KEY ("SubscriptionPlanID") REFERENCES "SubscriptionPlans"("idSubscriptionPlans") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserSubscriptions" ADD CONSTRAINT "User_fk" FOREIGN KEY ("UserID") REFERENCES "Users"("idUsers") ON DELETE CASCADE ON UPDATE NO ACTION;
