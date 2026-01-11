-- CreateEnum
CREATE TYPE "Position" AS ENUM ('STAFF', 'MANAGER', 'TEAM_LEAD');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "position" "Position" NOT NULL DEFAULT 'STAFF';
