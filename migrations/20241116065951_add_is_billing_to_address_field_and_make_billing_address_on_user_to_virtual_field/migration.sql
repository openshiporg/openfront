/*
  Warnings:

  - You are about to drop the column `billingAddress` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "isBilling" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "billingAddress";
