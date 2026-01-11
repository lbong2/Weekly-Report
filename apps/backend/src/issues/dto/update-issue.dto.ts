import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, IsArray } from 'class-validator';
import { IssueStatus } from '@prisma/client';

export class UpdateIssueDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    chainId?: string;

    @IsOptional()
    @IsString()
    purpose?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsNumber()
    totalCount?: number;

    @IsOptional()
    @IsNumber()
    completedCount?: number;

    @IsOptional()
    @IsNumber()
    progress?: number;

    @IsOptional()
    @IsEnum(IssueStatus)
    status?: IssueStatus;

    @IsOptional()
    @IsArray()
    assigneeIds?: string[];
}
