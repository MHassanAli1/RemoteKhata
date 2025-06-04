-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "ZoneName" TEXT NOT NULL,
    "KhdaName" TEXT NOT NULL,
    "KulAmdan" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "KulAkhrajat" BIGINT NOT NULL,
    "SaafiAmdan" BIGINT NOT NULL,
    "Exercise" BIGINT NOT NULL,
    "KulMaizan" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Synced" BOOLEAN NOT NULL DEFAULT false,
    "SyncedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trolly" (
    "id" SERIAL NOT NULL,
    "total" INTEGER NOT NULL,
    "StartingNum" BIGINT NOT NULL,
    "EndingNum" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "Trolly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Akhrajat" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "Akhrajat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trolly" ADD CONSTRAINT "Trolly_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Akhrajat" ADD CONSTRAINT "Akhrajat_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
