-- DropIndex
DROP INDEX "User_customerToken_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "customerToken" DROP NOT NULL,
ALTER COLUMN "customerToken" DROP DEFAULT;
