import { IsNotEmpty, IsInt, IsDateString, IsString, IsEnum, IsOptional } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class CreateWeeklyReportDto {
  @IsString()
  @IsNotEmpty()
  teamId: string;

  @IsInt()
  @IsNotEmpty()
  year: number;

  @IsInt()
  @IsNotEmpty()
  weekNumber: number;

  @IsDateString()
  @IsNotEmpty()
  weekStart: string;

  @IsDateString()
  @IsNotEmpty()
  weekEnd: string;

  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;
}
