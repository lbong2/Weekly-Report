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
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { WeeklyReportsService } from './weekly-reports.service';
import { PptExportService } from './ppt-export.service';
import { CreateWeeklyReportDto } from './dto/create-weekly-report.dto';
import { UpdateWeeklyReportDto } from './dto/update-weekly-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('weekly-reports')
@UseGuards(JwtAuthGuard)
export class WeeklyReportsController {
  constructor(
    private readonly weeklyReportsService: WeeklyReportsService,
    private readonly pptExportService: PptExportService,
  ) {}

  @Post()
  create(@Body() createWeeklyReportDto: CreateWeeklyReportDto) {
    return this.weeklyReportsService.create(createWeeklyReportDto);
  }

  @Get()
  findAll(@Query('teamId') teamId?: string, @Query('year') year?: string) {
    return this.weeklyReportsService.findAll(
      teamId,
      year ? parseInt(year) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weeklyReportsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWeeklyReportDto: UpdateWeeklyReportDto,
  ) {
    return this.weeklyReportsService.update(id, updateWeeklyReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weeklyReportsService.remove(id);
  }

  @Get(':id/export/pptx')
  async exportPptx(@Param('id') id: string, @Res() res: Response) {
    // PPT 생성
    const pptxBuffer = await this.pptExportService.exportToPptx(id);

    // 파일명 생성
    const report = await this.weeklyReportsService.findOne(id);
    const filename = `주간보고_${report.team.name}_${report.year}년_${report.weekNumber}주차.pptx`;
    const encodedFilename = encodeURIComponent(filename);

    // 응답 헤더 설정
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      'Content-Length': pptxBuffer.length,
    });

    // 파일 전송
    res.end(pptxBuffer);
  }
}
