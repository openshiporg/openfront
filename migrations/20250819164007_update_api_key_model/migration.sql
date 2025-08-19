-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "restrictedToIPs" JSONB DEFAULT '[]';
