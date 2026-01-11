import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendancesService {
  constructor(private prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    // 사용자 존재 체크
    const user = await this.prisma.user.findUnique({
      where: { id: createAttendanceDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 출결 유형 존재 체크
    const type = await this.prisma.attendanceType.findUnique({
      where: { id: createAttendanceDto.typeId },
    });

    if (!type) {
      throw new NotFoundException('Attendance type not found');
    }

    return this.prisma.attendance.create({
      data: {
        user: {
          connect: { id: createAttendanceDto.userId },
        },
        type: {
          connect: { id: createAttendanceDto.typeId },
        },
        content: createAttendanceDto.content,
        location: createAttendanceDto.location,
        remarks: createAttendanceDto.remarks,
        startDate: new Date(createAttendanceDto.startDate),
        endDate: new Date(createAttendanceDto.endDate),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        type: true,
      },
    });
  }

  async findAll(params: { teamId: string; startDate?: string; endDate?: string }) {
    const { teamId, startDate, endDate } = params;
    const filters: any = {
      user: { teamId },
    };

    if (startDate && endDate) {
      filters.AND = [
        { startDate: { lte: new Date(endDate) } },
        { endDate: { gte: new Date(startDate) } },
      ];
    } else if (startDate) {
      filters.endDate = { gte: new Date(startDate) };
    } else if (endDate) {
      filters.startDate = { lte: new Date(endDate) };
    }

    return this.prisma.attendance.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        type: true,
      },
      orderBy: [{ type: { category: 'asc' } }, { startDate: 'asc' }],
    });
  }

  async findOne(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            team: true,
          },
        },
        type: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    // 존재 체크
    const existing = await this.prisma.attendance.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Attendance not found');
    }

    // 사용자 변경 시 존재 체크
    if (updateAttendanceDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateAttendanceDto.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    // 출결 유형 변경 시 존재 체크
    if (updateAttendanceDto.typeId) {
      const type = await this.prisma.attendanceType.findUnique({
        where: { id: updateAttendanceDto.typeId },
      });

      if (!type) {
        throw new NotFoundException('Attendance type not found');
      }
    }

    const updateData: Record<string, unknown> = {
      content: updateAttendanceDto.content,
      location: updateAttendanceDto.location,
      remarks: updateAttendanceDto.remarks,
      ...(updateAttendanceDto.startDate && {
        startDate: new Date(updateAttendanceDto.startDate),
      }),
      ...(updateAttendanceDto.endDate && {
        endDate: new Date(updateAttendanceDto.endDate),
      }),
    };

    if (updateAttendanceDto.userId) {
      updateData.user = { connect: { id: updateAttendanceDto.userId } };
    }

    if (updateAttendanceDto.typeId) {
      updateData.type = { connect: { id: updateAttendanceDto.typeId } };
    }

    return this.prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        type: true,
      },
    });
  }

  async remove(id: string) {
    // 존재 체크
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    await this.prisma.attendance.delete({
      where: { id },
    });

    return { message: 'Attendance deleted successfully' };
  }
}
