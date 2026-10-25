-- AlterTable
ALTER TABLE "OAuthApp" ADD COLUMN     "tokenEndpointAuthMethod" TEXT DEFAULT 'client_secret_post';

-- AlterTable
ALTER TABLE "OAuthToken" ADD COLUMN     "resource" TEXT NOT NULL DEFAULT '';
