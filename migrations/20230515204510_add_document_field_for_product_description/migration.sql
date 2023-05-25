-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "fullDescription" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]';
