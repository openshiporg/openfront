/*
  Warnings:

  - You are about to drop the column `metadata` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userField]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BatchJobTypeType" AS ENUM ('PRODUCT_IMPORT', 'ORDER_EXPORT', 'INVENTORY_UPDATE', 'PRICE_UPDATE');

-- CreateEnum
CREATE TYPE "BatchJobStatusType" AS ENUM ('CREATED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "StockMovementTypeType" AS ENUM ('RECEIVE', 'REMOVE');

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "metadata",
ADD COLUMN     "team" TEXT,
ADD COLUMN     "userField" TEXT;

-- CreateTable
CREATE TABLE "UserField" (
    "id" TEXT NOT NULL,
    "lastLoginIp" TEXT NOT NULL DEFAULT '',
    "lastLoginUserAgent" TEXT NOT NULL DEFAULT '',
    "loginHistory" JSONB DEFAULT '[]',
    "preferences" JSONB DEFAULT '{"theme":"light","notifications":true,"emailNotifications":true}',
    "notes" TEXT NOT NULL DEFAULT '',
    "lastPasswordChange" TIMESTAMP(3),
    "failedLoginAttempts" JSONB DEFAULT '{"count":0,"lastAttempt":null,"lockedUntil":null}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchJob" (
    "id" TEXT NOT NULL,
    "type" "BatchJobTypeType" NOT NULL,
    "status" "BatchJobStatusType" NOT NULL DEFAULT 'CREATED',
    "context" JSONB DEFAULT '{}',
    "result" JSONB DEFAULT '{}',
    "error" TEXT NOT NULL DEFAULT '',
    "progress" INTEGER DEFAULT 0,
    "createdBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "leader" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "type" "StockMovementTypeType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "variant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BatchJob_createdBy_idx" ON "BatchJob"("createdBy");

-- CreateIndex
CREATE INDEX "Team_leader_idx" ON "Team"("leader");

-- CreateIndex
CREATE INDEX "StockMovement_variant_idx" ON "StockMovement"("variant");

-- CreateIndex
CREATE INDEX "ProductVariant_location_idx" ON "ProductVariant"("location");

-- CreateIndex
CREATE UNIQUE INDEX "User_userField_key" ON "User"("userField");

-- CreateIndex
CREATE INDEX "User_team_idx" ON "User"("team");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_team_fkey" FOREIGN KEY ("team") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userField_fkey" FOREIGN KEY ("userField") REFERENCES "UserField"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_location_fkey" FOREIGN KEY ("location") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchJob" ADD CONSTRAINT "BatchJob_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leader_fkey" FOREIGN KEY ("leader") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_variant_fkey" FOREIGN KEY ("variant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
