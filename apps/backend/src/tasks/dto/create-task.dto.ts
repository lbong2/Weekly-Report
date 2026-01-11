import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateTaskDto {
  @IsUUID()
  @IsNotEmpty()
  weeklyReportId: string;

  @IsUUID()
  @IsNotEmpty()
  chainId: string;

  @IsUUID()
  @IsOptional()
  issueId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalCount?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  completedCount?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @IsBoolean()
  @IsOptional()
  showThisWeekAchievement?: boolean;

  @IsString()
  @IsOptional()
  thisWeekContent?: string;

  @IsString()
  @IsOptional()
  nextWeekContent?: string;

  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  nextTotalCount?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  nextCompletedCount?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  nextProgress?: number;

  @IsBoolean()
  @IsOptional()
  showNextWeekAchievement?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assigneeIds?: string[];
}
