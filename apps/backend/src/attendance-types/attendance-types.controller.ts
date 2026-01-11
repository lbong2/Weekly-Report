import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AttendanceTypesService } from './attendance-types.service';
import { CreateAttendanceTypeDto } from './dto/create-attendance-type.dto';
import { UpdateAttendanceTypeDto } from './dto/update-attendance-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('attendance-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceTypesController {
  constructor(
    private readonly attendanceTypesService: AttendanceTypesService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createAttendanceTypeDto: CreateAttendanceTypeDto) {
    return this.attendanceTypesService.create(createAttendanceTypeDto);
  }

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.attendanceTypesService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateAttendanceTypeDto: UpdateAttendanceTypeDto,
  ) {
    return this.attendanceTypesService.update(id, updateAttendanceTypeDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.attendanceTypesService.remove(id);
  }
}
