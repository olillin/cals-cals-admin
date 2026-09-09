-- CreateTable
CREATE TABLE "Calendar" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "externalUrl" TEXT,
    "pickerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_filename_key" ON "Calendar"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_pickerId_key" ON "Calendar"("pickerId");
