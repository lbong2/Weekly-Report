import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { Role, Position } from '@prisma/client';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'teamId must be a valid UUID'
  })
  @IsOptional()
  teamId?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsEnum(Position)
  @IsOptional()
  position?: Position;

  @IsOptional()
  displayOrder?: number;
}
