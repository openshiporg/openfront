-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "logoColor" TEXT NOT NULL DEFAULT '#2b7fff',
ADD COLUMN     "logoIcon" TEXT NOT NULL DEFAULT '<svg width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_238_1296)"><path fillRule="evenodd" clipRule="evenodd" d="M100 0H0L100 100H0L100 200H200L100 100H200L100 0Z" fill="currentColor" /></g><defs><clipPath id="clip0_238_1296"><rect width="200" height="200" fill="white" /></clipPath></defs></svg>';
