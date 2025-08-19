/*
  Warnings:

  - Added the required column `tokenSecret` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApiKeyStatusType" AS ENUM ('active', 'inactive', 'revoked');

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "scopes" JSONB DEFAULT '[]',
ADD COLUMN     "status" "ApiKeyStatusType" DEFAULT 'active',
ADD COLUMN     "tokenPreview" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tokenSecret" TEXT NOT NULL,
ADD COLUMN     "usageCount" JSONB DEFAULT '{"total":0,"daily":{}}';
