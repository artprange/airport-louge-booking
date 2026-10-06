-- CreateTable
CREATE TABLE "Lounge" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "airportCode" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Lounge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "loungeId" UUID NOT NULL,
    "customerName" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "bookingDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lounge_airportCode_idx" ON "Lounge"("airportCode");

-- CreateIndex
CREATE INDEX "Booking_loungeId_bookingDate_idx" ON "Booking"("loungeId", "bookingDate");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_loungeId_fkey" FOREIGN KEY ("loungeId") REFERENCES "Lounge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
