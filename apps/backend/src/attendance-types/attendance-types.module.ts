import { Module } from '@nestjs/common';
import { AttendanceTypesService } from './attendance-types.service';
import { AttendanceTypesController } from './attendance-types.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceTypesController],
  providers: [AttendanceTypesService],
  exports: [AttendanceTypesService],
})
export class AttendanceTypesModule {}
