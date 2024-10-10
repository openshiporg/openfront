/*
  Warnings:

  - You are about to drop the column `customer` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `customer` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `customer` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `customer` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Customer_customerGroups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_customer_fkey";

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_customer_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_customer_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customer_fkey";

-- DropForeignKey
ALTER TABLE "_Customer_customerGroups" DROP CONSTRAINT "_Customer_customerGroups_A_fkey";

-- DropForeignKey
ALTER TABLE "_Customer_customerGroups" DROP CONSTRAINT "_Customer_customerGroups_B_fkey";

-- DropIndex
DROP INDEX "Address_customer_idx";

-- DropIndex
DROP INDEX "Cart_customer_idx";

-- DropIndex
DROP INDEX "Notification_customer_idx";

-- DropIndex
DROP INDEX "Order_customer_idx";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "customer",
ADD COLUMN     "user" TEXT;

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "customer",
ADD COLUMN     "user" TEXT;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "customer",
ADD COLUMN     "user" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customer",
ADD COLUMN     "user" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "billingAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "hasAccount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "_Customer_customerGroups";

-- CreateTable
CREATE TABLE "_CustomerGroup_users" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CustomerGroup_users_AB_unique" ON "_CustomerGroup_users"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomerGroup_users_B_index" ON "_CustomerGroup_users"("B");

-- CreateIndex
CREATE INDEX "Address_user_idx" ON "Address"("user");

-- CreateIndex
CREATE INDEX "Cart_user_idx" ON "Cart"("user");

-- CreateIndex
CREATE INDEX "Notification_user_idx" ON "Notification"("user");

-- CreateIndex
CREATE INDEX "Order_user_idx" ON "Order"("user");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerGroup_users" ADD CONSTRAINT "_CustomerGroup_users_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerGroup_users" ADD CONSTRAINT "_CustomerGroup_users_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
