import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class UpdateWeeklyReportDto {
  @IsDateString()
  @IsOptional()
  weekStart?: string;

  @IsDateString()
  @IsOptional()
  weekEnd?: string;

  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;
}
