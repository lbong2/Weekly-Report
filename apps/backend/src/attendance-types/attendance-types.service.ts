import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceTypeDto } from './dto/create-attendance-type.dto';
import { UpdateAttendanceTypeDto } from './dto/update-attendance-type.dto';

@Injectable()
export class AttendanceTypesService {
  constructor(private prisma: PrismaService) {}

  async create(createAttendanceTypeDto: CreateAttendanceTypeDto) {
    // 코드 중복 체크
    const existingType = await this.prisma.attendanceType.findUnique({
      where: { code: createAttendanceTypeDto.code },
    });

    if (existingType) {
      throw new ConflictException('Attendance type code already exists');
    }

    return this.prisma.attendanceType.create({
      data: createAttendanceTypeDto,
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.attendanceType.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const attendanceType = await this.prisma.attendanceType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!attendanceType) {
      throw new NotFoundException('Attendance type not found');
    }

    return attendanceType;
  }

  async update(id: string, updateAttendanceTypeDto: UpdateAttendanceTypeDto) {
    // 존재 체크
    const existingType = await this.prisma.attendanceType.findUnique({
      where: { id },
    });

    if (!existingType) {
      throw new NotFoundException('Attendance type not found');
    }

    // 코드 변경 시 중복 체크
    if (
      updateAttendanceTypeDto.code &&
      updateAttendanceTypeDto.code !== existingType.code
    ) {
      const codeExists = await this.prisma.attendanceType.findUnique({
        where: { code: updateAttendanceTypeDto.code },
      });

      if (codeExists) {
        throw new ConflictException('Attendance type code already exists');
      }
    }

    return this.prisma.attendanceType.update({
      where: { id },
      data: updateAttendanceTypeDto,
    });
  }

  async remove(id: string) {
    // 존재 체크
    const attendanceType = await this.prisma.attendanceType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!attendanceType) {
      throw new NotFoundException('Attendance type not found');
    }

    // 연결된 출결 기록이 있으면 삭제 불가
    if (attendanceType._count.attendances > 0) {
      throw new ConflictException(
        '연결된 출결 기록이 있어 삭제할 수 없습니다.',
      );
    }

    await this.prisma.attendanceType.delete({
      where: { id },
    });

    return { message: 'Attendance type deleted successfully' };
  }
}
