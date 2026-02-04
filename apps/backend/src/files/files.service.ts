import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFileDto } from './dto/update-file.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async create(
    file: Express.Multer.File,
    weeklyReportId: string,
    uploaderId: string,
    taskId?: string,
    description?: string,
  ) {
    // 주간보고서 존재 확인
    const report = await this.prisma.weeklyReport.findUnique({
      where: { id: weeklyReportId },
    });

    if (!report) {
      throw new NotFoundException('Weekly report not found');
    }

    // Task 존재 확인 (taskId가 있는 경우)
    if (taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }
    }

    // 상대 경로 계산 (uploads 폴더 기준)
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    // uploads/ 접두사를 제거하고 년/월/파일명만 저장
    let relativePath = file.path.replace(uploadDir, '').replace(/^[\/\\]/, '');
    // 만약 uploads/로 시작하면 제거
    relativePath = relativePath.replace(/^uploads[\/\\]/, '');

    return this.prisma.file.create({
      data: {
        weeklyReportId,
        taskId: taskId || null,
        uploaderId,
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: relativePath,
        description,
      },
      include: {
        uploader: {
          select: { id: true, name: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async findByWeeklyReport(weeklyReportId: string) {
    return this.prisma.file.findMany({
      where: { weeklyReportId },
      include: {
        uploader: {
          select: { id: true, name: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTask(taskId: string) {
    return this.prisma.file.findMany({
      where: { taskId },
      include: {
        uploader: {
          select: { id: true, name: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { id: true, name: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async update(id: string, updateFileDto: UpdateFileDto) {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return this.prisma.file.update({
      where: { id },
      data: updateFileDto,
      include: {
        uploader: {
          select: { id: true, name: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async remove(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // 물리적 파일 삭제
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, file.path);

    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Failed to delete physical file:', err);
    }

    await this.prisma.file.delete({
      where: { id },
    });

    return { message: 'File deleted successfully' };
  }

  getFilePath(file: { path: string }): string {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    return path.join(uploadDir, file.path);
  }
}
