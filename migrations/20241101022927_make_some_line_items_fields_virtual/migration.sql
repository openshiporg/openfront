/*
  Warnings:

  - You are about to drop the column `description` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `LineItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LineItem" DROP COLUMN "description",
DROP COLUMN "thumbnail",
DROP COLUMN "title",
DROP COLUMN "unitPrice";
