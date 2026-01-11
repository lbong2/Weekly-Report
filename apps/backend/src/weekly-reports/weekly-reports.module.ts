import { Module } from '@nestjs/common';
import { WeeklyReportsService } from './weekly-reports.service';
import { WeeklyReportsController } from './weekly-reports.controller';
import { PptExportService } from './ppt-export.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { IssuesModule } from '../issues/issues.module';

@Module({
  imports: [PrismaModule, AuthModule, IssuesModule],
  controllers: [WeeklyReportsController],
  providers: [WeeklyReportsService, PptExportService],
  exports: [WeeklyReportsService],
})
export class WeeklyReportsModule { }
