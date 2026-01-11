-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "next_completed_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "next_progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "next_total_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "show_next_week_achievement" BOOLEAN NOT NULL DEFAULT true;
