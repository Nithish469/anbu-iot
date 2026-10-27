-- CreateTable
CREATE TABLE IF NOT EXISTS "holidays" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "holidays_date_key" ON "holidays"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "holidays_date_idx" ON "holidays"("date");
