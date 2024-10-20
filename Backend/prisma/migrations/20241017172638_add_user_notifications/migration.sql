-- CreateTable
CREATE TABLE "UserNotifications" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "notificationId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNotifications_userId_notificationId_key" ON "UserNotifications"("userId", "notificationId");

-- AddForeignKey
ALTER TABLE "UserNotifications" ADD CONSTRAINT "UserNotifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("idUsers") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotifications" ADD CONSTRAINT "UserNotifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
