-- AlterTable
ALTER TABLE "MoneyAmount" ADD COLUMN     "priceSet" TEXT;

-- CreateTable
CREATE TABLE "PriceRule" (
    "id" TEXT NOT NULL,
    "attribute" TEXT NOT NULL DEFAULT '',
    "value" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSet" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MoneyAmount_priceRules" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PriceRule_priceSets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MoneyAmount_priceRules_AB_unique" ON "_MoneyAmount_priceRules"("A", "B");

-- CreateIndex
CREATE INDEX "_MoneyAmount_priceRules_B_index" ON "_MoneyAmount_priceRules"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PriceRule_priceSets_AB_unique" ON "_PriceRule_priceSets"("A", "B");

-- CreateIndex
CREATE INDEX "_PriceRule_priceSets_B_index" ON "_PriceRule_priceSets"("B");

-- CreateIndex
CREATE INDEX "MoneyAmount_priceSet_idx" ON "MoneyAmount"("priceSet");

-- AddForeignKey
ALTER TABLE "MoneyAmount" ADD CONSTRAINT "MoneyAmount_priceSet_fkey" FOREIGN KEY ("priceSet") REFERENCES "PriceSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MoneyAmount_priceRules" ADD CONSTRAINT "_MoneyAmount_priceRules_A_fkey" FOREIGN KEY ("A") REFERENCES "MoneyAmount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MoneyAmount_priceRules" ADD CONSTRAINT "_MoneyAmount_priceRules_B_fkey" FOREIGN KEY ("B") REFERENCES "PriceRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PriceRule_priceSets" ADD CONSTRAINT "_PriceRule_priceSets_A_fkey" FOREIGN KEY ("A") REFERENCES "PriceRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PriceRule_priceSets" ADD CONSTRAINT "_PriceRule_priceSets_B_fkey" FOREIGN KEY ("B") REFERENCES "PriceSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
