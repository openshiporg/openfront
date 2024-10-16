/*
  Warnings:

  - You are about to drop the column `attribute` on the `PriceRule` table. All the data in the column will be lost.
  - You are about to drop the `_PriceRule_priceSets` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `PriceRule` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `value` on the `PriceRule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PriceRuleTypeType" AS ENUM ('fixed', 'percentage');

-- DropForeignKey
ALTER TABLE "_PriceRule_priceSets" DROP CONSTRAINT "_PriceRule_priceSets_A_fkey";

-- DropForeignKey
ALTER TABLE "_PriceRule_priceSets" DROP CONSTRAINT "_PriceRule_priceSets_B_fkey";

-- AlterTable
ALTER TABLE "PriceRule" DROP COLUMN "attribute",
ADD COLUMN     "priceSet" TEXT,
ADD COLUMN     "priority" INTEGER DEFAULT 0,
ADD COLUMN     "ruleAttribute" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ruleValue" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "type" "PriceRuleTypeType" NOT NULL,
DROP COLUMN "value",
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "_PriceRule_priceSets";

-- CreateTable
CREATE TABLE "RuleType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "ruleAttribute" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PriceSet_ruleTypes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RuleType_ruleAttribute_key" ON "RuleType"("ruleAttribute");

-- CreateIndex
CREATE UNIQUE INDEX "_PriceSet_ruleTypes_AB_unique" ON "_PriceSet_ruleTypes"("A", "B");

-- CreateIndex
CREATE INDEX "_PriceSet_ruleTypes_B_index" ON "_PriceSet_ruleTypes"("B");

-- CreateIndex
CREATE INDEX "PriceRule_priceSet_idx" ON "PriceRule"("priceSet");

-- AddForeignKey
ALTER TABLE "PriceRule" ADD CONSTRAINT "PriceRule_priceSet_fkey" FOREIGN KEY ("priceSet") REFERENCES "PriceSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PriceSet_ruleTypes" ADD CONSTRAINT "_PriceSet_ruleTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "PriceSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PriceSet_ruleTypes" ADD CONSTRAINT "_PriceSet_ruleTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "RuleType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
