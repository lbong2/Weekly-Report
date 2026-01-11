-- Drop foreign key and column linking attendances to weekly_reports
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_weekly_report_id_fkey";
ALTER TABLE "attendances" DROP COLUMN "weekly_report_id";
