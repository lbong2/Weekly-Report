import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { AttendanceCategory } from '@prisma/client';

export class UpdateAttendanceTypeDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(AttendanceCategory)
  @IsOptional()
  category?: AttendanceCategory;

  @IsBoolean()
  @IsOptional()
  isLongTerm?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
