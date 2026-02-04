import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

// 한글 파일명 디코딩 (Multer가 Latin-1로 잘못 디코딩하는 문제 해결)
const decodeFileName = (filename: string): string => {
  try {
    // Latin-1로 인코딩된 문자열을 Buffer로 변환 후 UTF-8로 디코딩
    return Buffer.from(filename, 'latin1').toString('utf8');
  } catch {
    return filename;
  }
};

// Multer 저장소 설정
const storage = diskStorage({
  destination: (req, file, cb) => {
    // 파일명 디코딩
    file.originalname = decodeFileName(file.originalname);

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uploadPath = path.join(uploadDir, String(year), month);

    // 디렉토리가 없으면 생성
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('weeklyReportId') weeklyReportId: string,
    @Body('taskId') taskId: string | undefined,
    @Body('description') description: string | undefined,
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.create(file, weeklyReportId, user.id, taskId, description);
  }

  @Get()
  findAll(
    @Query('weeklyReportId') weeklyReportId?: string,
    @Query('taskId') taskId?: string,
  ) {
    if (taskId) {
      return this.filesService.findByTask(taskId);
    }
    return this.filesService.findByWeeklyReport(weeklyReportId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Public()
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const file = await this.filesService.findOne(id);
    const filePath = this.filesService.getFilePath(file);

    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // 한글 파일명 처리를 위한 인코딩
    const encodedFilename = encodeURIComponent(file.originalName);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
      'Content-Length': file.size,
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(id);
  }
}
