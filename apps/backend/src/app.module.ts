import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { ChainsModule } from './chains/chains.module';
import { AttendanceTypesModule } from './attendance-types/attendance-types.module';
import { WeeklyReportsModule } from './weekly-reports/weekly-reports.module';
import { TasksModule } from './tasks/tasks.module';
import { AttendancesModule } from './attendances/attendances.module';
import { IssuesModule } from './issues/issues.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    ChainsModule,
    AttendanceTypesModule,
    WeeklyReportsModule,
    TasksModule,
    AttendancesModule,
    IssuesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
