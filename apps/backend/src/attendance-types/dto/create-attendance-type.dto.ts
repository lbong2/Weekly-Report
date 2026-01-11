import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { AttendanceCategory } from '@prisma/client';

export class CreateAttendanceTypeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AttendanceCategory)
  @IsNotEmpty()
  category: AttendanceCategory;

  @IsBoolean()
  @IsOptional()
  isLongTerm?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
