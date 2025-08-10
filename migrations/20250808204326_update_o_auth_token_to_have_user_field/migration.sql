/*
  Warnings:

  - You are about to drop the column `userId` on the `OAuthToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OAuthToken" DROP COLUMN "userId",
ADD COLUMN     "user" TEXT;

-- CreateIndex
CREATE INDEX "OAuthToken_user_idx" ON "OAuthToken"("user");

-- AddForeignKey
ALTER TABLE "OAuthToken" ADD CONSTRAINT "OAuthToken_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
