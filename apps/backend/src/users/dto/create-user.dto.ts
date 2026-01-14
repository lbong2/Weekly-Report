import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { Role, Position } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'teamId must be a valid UUID'
  })
  @IsNotEmpty()
  teamId: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsEnum(Position)
  @IsOptional()
  position?: Position;

  @IsOptional()
  displayOrder?: number;
}
