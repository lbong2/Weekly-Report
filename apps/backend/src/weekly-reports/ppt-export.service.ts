import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseMarkdownToBullets } from '../utils/markdown-parser';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pptxgen = require('pptxgenjs');

@Injectable()
export class PptExportService {
  constructor(private prisma: PrismaService) { }

  /**
   * 주간보고서를 PPT 파일로 내보내기
   */
  async exportToPptx(reportId: string): Promise<Buffer> {
    try {
      console.log('[PPT Export] Starting export for report:', reportId);

      // 주간보고서 데이터 조회
      const report = await this.prisma.weeklyReport.findUnique({
        where: { id: reportId },
        include: {
          team: true,
          tasks: {
            include: {
              chain: true,
              assignees: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      position: true,
                      displayOrder: true,
                    },
                  },
                },
                orderBy: {
                  user: {
                    displayOrder: 'asc',
                  },
                },
              },
              files: {
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });

      if (!report) {
        throw new NotFoundException('Weekly report not found');
      }

      console.log('[PPT Export] Report loaded:', {
        id: report.id,
        team: report.team?.name,
        tasksCount: report.tasks?.length || 0,
      });

      const nextWeekEnd = this.addDays(report.weekEnd, 7);
      const attendances = await this.prisma.attendance.findMany({
        where: {
          user: { teamId: report.teamId },
          AND: [
            { startDate: { lte: nextWeekEnd } },
            { endDate: { gte: report.weekStart } },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              position: true,
            },
          },
          type: true,
        },
        orderBy: [{ type: { category: 'asc' } }, { startDate: 'asc' }],
      });

      console.log('[PPT Export] Attendances loaded:', {
        attendancesCount: attendances.length,
      });

      // PPT 생성
      const pptx = new pptxgen();

      // 슬라이드 레이아웃 설정 (A4 용지: 210x297mm = 8.27x11.69 inch)
      pptx.defineLayout({ name: 'A4', width: 10.83, height: 7.5 });
      pptx.layout = 'A4';
      pptx.author = 'Weekly Report System';
      pptx.company = report.team.name;
      pptx.subject = `주간보고 ${report.year}년 ${report.weekNumber}주차`;

      console.log('[PPT Export] Creating task slides...');
      // 1. 업무 실적/계획 슬라이드 생성 (Task 2개당 1장)
      this.createTaskSlides(pptx, report);

      console.log('[PPT Export] Creating attendance slide...');
      // 2. 인원현황 슬라이드 생성 (팀당 1장)
      this.createAttendanceSlide(pptx, report, attendances);

      console.log('[PPT Export] Writing PPTX buffer...');
      // PPT를 Buffer로 변환
      const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });

      console.log('[PPT Export] Export completed successfully');
      return pptxBuffer as Buffer;
    } catch (error) {
      console.error('[PPT Export] Error:', error);
      throw error;
    }
  }

  /**
   * 업무 실적/계획 슬라이드 생성 (Task 2개당 1장)
   * 같은 담당자(displayOrder)의 Task만 같은 페이지에 배치
   */
  private createTaskSlides(pptx: any, report: any) {
    const tasks = report.tasks;

    // Task가 없으면 빈 슬라이드 1장 생성
    if (tasks.length === 0) {
      const slide = pptx.addSlide();
      this.addSlideHeader(slide, report);

      slide.addText('등록된 업무가 없습니다.', {
        x: 0.3,
        y: 3,
        w: 11,
        h: 1,
        fontSize: 16,
        fontFace: 'Noto Sans KR',
        color: '666666',
        align: 'center',
        valign: 'middle',
      });
      return;
    }

    // 주차 정보 (금주/차주)
    const weekStart = this.formatDate(report.weekStart);
    const weekEnd = this.formatDate(report.weekEnd);
    const nextWeekStart = this.addDays(report.weekStart, 7);
    const nextWeekEnd = this.addDays(report.weekEnd, 7);

    // Task를 담당자의 displayOrder별로 그룹화
    // 각 Task의 담당자 중 가장 작은 displayOrder를 사용
    const tasksByDisplayOrder = new Map<number, any[]>();
    tasks.forEach((task: any) => {
      // 담당자 중 가장 작은 displayOrder 찾기
      let minDisplayOrder = Number.MAX_SAFE_INTEGER;
      if (task.assignees && task.assignees.length > 0) {
        task.assignees.forEach((assignee: any) => {
          if (assignee.user.displayOrder < minDisplayOrder) {
            minDisplayOrder = assignee.user.displayOrder;
          }
        });
      } else {
        // 담당자가 없으면 Task의 displayOrder 사용
        minDisplayOrder = task.displayOrder;
      }

      if (!tasksByDisplayOrder.has(minDisplayOrder)) {
        tasksByDisplayOrder.set(minDisplayOrder, []);
      }
      tasksByDisplayOrder.get(minDisplayOrder)!.push(task);
    });

    // displayOrder 순서대로 정렬
    const sortedDisplayOrders = Array.from(tasksByDisplayOrder.keys()).sort((a, b) => a - b);

    // 각 displayOrder 그룹별로 슬라이드 생성
    sortedDisplayOrders.forEach((displayOrder) => {
      const groupTasks = tasksByDisplayOrder.get(displayOrder)!;

      // 해당 그룹의 Task를 2개씩 묶어서 슬라이드 생성
      for (let i = 0; i < groupTasks.length; i += 2) {
        const slide = pptx.addSlide();
        this.addSlideHeader(slide, report);

        // 테이블 데이터 생성 (2x3 그리드)
        const tableRows: any[] = [];

        // 헤더 행 (날짜)
        tableRows.push([
          {
            text: `금주 (${weekStart}~${weekEnd}) 실적`,
            options: {
              fill: { color: '4F81BD' },
              color: 'FFFFFF',
              fontSize: 12,
              fontFace: 'Noto Sans KR Medium',
              align: 'center',
              valign: 'middle',
            },
          },
          {
            text: `차주 (${this.formatDate(nextWeekStart)}~${this.formatDate(nextWeekEnd)}) 계획`,
            options: {
              fill: { color: '4F81BD' },
              color: 'FFFFFF',
              fontSize: 12,
              fontFace: 'Noto Sans KR Medium',
              align: 'center',
              valign: 'middle',
            },
          },
        ]);

        // 첫 번째 Task 행
        const task1 = groupTasks[i];
        tableRows.push(this.createTaskRow(task1));

        // 두 번째 Task 행 (있으면)
        if (i + 1 < groupTasks.length) {
          const task2 = groupTasks[i + 1];
          tableRows.push(this.createTaskRow(task2));
        } else {
          // 두 번째 Task가 없으면 빈 행 추가
          tableRows.push([
            { text: '', options: {} },
            { text: '', options: {} },
          ]);
        }

        // 테이블 추가
        slide.addTable(tableRows, {
          x: 0.42,
          y: 1.31,
          w: 10,
          colW: [5, 5],
          rowH: [0.43, 2.6, 2.6], // 헤더 작게, Task 행 크게 (총 4.35인치)
          border: { pt: 1, color: '000000' },
          fontSize: 12,
          fontFace: 'Noto Sans KR',
        });

        // 첨부파일 아이콘 이미지 추가 (파일이 있는 Task에만)
        const docsIconPath = path.join(process.cwd(), 'src/assets/docs.png');
        const baseUrl = process.env.FILE_DOWNLOAD_BASE_URL || 'http://localhost:4000/api/v1';

        // Task1 파일 아이콘 (좌하단: x=0.52, y=4.22-0.35=3.87)
        if (task1.files && task1.files.length > 0) {
          task1.files.forEach((file: any, fileIndex: number) => {
            const downloadUrl = `${baseUrl}/files/${file.id}/download`;
            slide.addImage({
              path: docsIconPath,
              x: 0.52 + (fileIndex * 0.35), // 아이콘 간격 0.35인치
              y: 4,
              w: 0.28,
              h: 0.28,
              hyperlink: { url: downloadUrl, tooltip: file.originalName },
            });
          });
        }

        // Task2 파일 아이콘 (좌하단: x=0.52, y=6.70-0.35=6.35)
        if (i + 1 < groupTasks.length) {
          const task2 = groupTasks[i + 1];
          if (task2.files && task2.files.length > 0) {
            task2.files.forEach((file: any, fileIndex: number) => {
              const downloadUrl = `${baseUrl}/files/${file.id}/download`;
              slide.addImage({
                path: docsIconPath,
                x: 0.52 + (fileIndex * 0.35),
                y: 6.6,
                w: 0.28,
                h: 0.28,
                hyperlink: { url: downloadUrl, tooltip: file.originalName },
              });
            });
          }
        }
      }
    });
  }

  /**
   * 슬라이드 헤더 추가 (제목, 로고, 파란색 배너)
   */
  private addSlideHeader(slide: any, report: any) {
    // 좌측 상단 제목
    slide.addText('운영시스템 개선', {
      x: 0.32,
      y: 0.16,
      w: 7.76,
      h: 0.45,
      fontSize: 20,
      fontFace: 'Noto Sans KR Medium',
      color: '5B4B8A',
    });

    // 우측 상단 로고 (이미지)
    const logoPath = path.join(process.cwd(), 'src/assets/logo.png');
    slide.addImage({
      path: logoPath,
      x: 9.07,
      y: 0.16,
      w: 1.38,
      h: 0.25,
    });

    // 파란색 헤더
    slide.addText(`${report.team.name} 개선/변경 [포항]`, {
      x: 0.42,
      y: 0.68,
      w: 10.03,
      h: 0.44,
      fontSize: 16,
      fontFace: 'Noto Sans KR Medium',
      color: 'FFFFFF',
      fill: { color: '769BFF' },
      align: 'left',
    });
  }

  /**
   * Task 행 데이터 생성
   */
  private createTaskRow(task: any): any[] {
    const assigneeNames = task.assignees
      .map((a: any) => this.formatUserNameWithPosition(a.user))
      .join(', ');
    const taskStartDate = task.startDate ? this.formatDate(task.startDate) : '-';
    const taskEndDate = task.endDate ? this.formatDate(task.endDate) : '-';

    // 금주 실적 내용 (text runs 배열 사용)
    const paraSpace = 2.88; // 단락 앞 간격
    const thisWeekTextRuns: any[] = [
      // 모듈명 [대괄호 포함] + 제목 (Medium)
      { text: `[${task.chain.name}] ${task.title}`, options: { fontSize: 12, fontFace: 'Noto Sans KR Medium', color: '000000', breakLine: true, paraSpaceBefore: paraSpace } },
      // 목적 라벨 (Medium)
      { text: '▪ 목적: ', options: { fontSize: 12, fontFace: 'Noto Sans KR Medium', color: '000000', paraSpaceBefore: paraSpace } },
      // 목적 내용 (일반)
      { text: `${task.purpose || '-'}`, options: { fontSize: 12, color: '000000', breakLine: true } },
      // 일정 라벨 (Medium)
      { text: '▪ 일정: ', options: { fontSize: 12, fontFace: 'Noto Sans KR Medium', color: '000000', paraSpaceBefore: paraSpace } },
      // 일정 내용 (일반)
      { text: `${taskStartDate} ~ ${taskEndDate}`, options: { fontSize: 12, color: '000000', breakLine: true } },
      // 담당자 라벨 (Medium)
      { text: '▪ 담당자: ', options: { fontSize: 12, fontFace: 'Noto Sans KR Medium', color: '000000', paraSpaceBefore: paraSpace } },
      // 담당자 내용 (일반)
      { text: `${assigneeNames}`, options: { fontSize: 12, color: '000000', breakLine: true } },
      // 수행실적 라벨 (Medium)
      { text: '▪ 수행실적: ', options: { fontSize: 12, fontFace: 'Noto Sans KR Medium', color: '000000', paraSpaceBefore: paraSpace } },
    ];

    // 금주 개발 실적 (옵션에 따라 표시)
    if (task.showThisWeekAchievement) {
      thisWeekTextRuns.push({
        text: ` [완료누계: ${task.completedCount || 0}, 총본수: ${task.totalCount || 0}, 진척률: ${task.progress || 0}%]`,
        options: { fontSize: 12, color: '000000', breakLine: true },
      });
    } else {
      thisWeekTextRuns.push({ text: '', options: { fontSize: 12, breakLine: true } });
    }

    if (task.thisWeekContent) {
      const bullets = parseMarkdownToBullets(task.thisWeekContent);
      const baseIndent = '      '; // 기본 indent 스페이스 6개
      bullets.forEach((bullet) => {
        const indent = '  '.repeat(bullet.level);
        const prefix = bullet.level === 0 ? '-' : '└';
        thisWeekTextRuns.push({
          text: `${baseIndent}${indent}${prefix} ${bullet.text}`,
          options: {
            fontSize: 12,
            color: '000000',
            breakLine: true,
            paraSpaceBefore: 2.88,
          },
        });
      });
    }

    // 첨부파일은 아이콘 이미지로 표시 (createTaskSlides에서 처리)

    // 차주 계획 내용 (text runs 배열 사용)
    // nextWeekContent가 비어있으면 빈칸으로 표시
    let nextWeekTextRuns: any[] = [];

    if (task.nextWeekContent && task.nextWeekContent.trim() !== '') {
      nextWeekTextRuns = [
        // 모듈명 [대괄호 포함] + 제목 (Medium)
        { text: `[${task.chain.name}] ${task.title}`, options: { fontSize: 12, fontFace: 'Noto Sans KR Medium', color: '000000', breakLine: true, paraSpaceBefore: paraSpace } },
        // 목적 라벨 (Medium)
        { text: '▪ 목적: ', options: { fontSize: 12, fontFace: 'Noto Sans KR Medium', color: '000000', paraSpaceBefore: paraSpace } },
        // 목적 내용 (일반)
        { text: `${task.purpose || '-'}`, options: { fontSize: 12, color: '000000', breakLine: true } },
        // 일정 라벨 (Medium)
        { text: '▪ 일정: ', options: { fontSize: 12, fontFace: 'Noto Sans KR Medium', color: '000000', paraSpaceBefore: paraSpace } },
        // 일정 내용 (일반)
        { text: `${taskStartDate} ~ ${taskEndDate}`, options: { fontSize: 12, color: '000000', breakLine: true } },
        // 담당자 라벨 (Medium)
        { text: '▪ 담당자: ', options: { fontSize: 12, fontFace: 'Noto Sans KR Medium', color: '000000', paraSpaceBefore: paraSpace } },
        // 담당자 내용 (일반)
        { text: `${assigneeNames}`, options: { fontSize: 12, color: '000000', breakLine: true } },
        // 수행계획 라벨 (Medium)
        { text: '▪ 수행계획: ', options: { fontSize: 12, fontFace: 'Noto Sans KR Medium', color: '000000', paraSpaceBefore: paraSpace } },
      ];

      // 차주 개발 실적 (옵션에 따라 표시)
      if (task.showNextWeekAchievement) {
        nextWeekTextRuns.push({
          text: ` [완료누계: ${task.nextCompletedCount || 0}, 총본수: ${task.nextTotalCount || 0}, 진척률: ${task.nextProgress || 0}%]`,
          options: { fontSize: 12, color: '000000', breakLine: true },
        });
      } else {
        nextWeekTextRuns.push({ text: '', options: { fontSize: 12, breakLine: true } });
      }

      const bullets = parseMarkdownToBullets(task.nextWeekContent);
      const baseIndent = '      '; // 기본 indent 스페이스 6개
      bullets.forEach((bullet) => {
        const indent = '  '.repeat(bullet.level);
        const prefix = bullet.level === 0 ? '-' : '└';
        nextWeekTextRuns.push({
          text: `${baseIndent}${indent}${prefix} ${bullet.text}`,
          options: {
            fontSize: 12,
            color: '000000',
            breakLine: true,
            paraSpaceBefore: 2.88,
          },
        });
      });
    } else {
      // nextWeekContent가 비어있으면 빈 배열 (빈칸)
      nextWeekTextRuns = [{ text: '', options: {} }];
    }

    return [
      {
        text: thisWeekTextRuns,
        options: {
          align: 'left',
          valign: 'top',
        },
      },
      {
        text: nextWeekTextRuns,
        options: {
          align: 'left',
          valign: 'top',
        },
      },
    ];
  }


  /**
   * 인원현황 슬라이드 생성 (팀당 1장)
   */
  private createAttendanceSlide(pptx: any, report: any, attendances: any[]) {
    const slide = pptx.addSlide();

    // 우측 상단 로고 (이미지)
    const logoPath = path.join(process.cwd(), 'src/assets/logo.png');
    slide.addImage({
      path: logoPath,
      x: 9.07,
      y: 0.16,
      w: 1.38,
      h: 0.25,
    });

    // 슬라이드 제목
    slide.addText(`인원현황 – ${report.team.name}`, {
      x: 0.32,
      y: 0.16,
      w: 7.76,
      h: 0.45,
      fontSize: 20,
      fontFace: 'Noto Sans KR Medium',
      color: '5B4B8A',
    });

    let yPos = 0.75;

    // 주간 날짜 정보 계산
    const weekStart = new Date(report.weekStart);
    const nextWeekStart = this.addDays(weekStart, 7);
    const nextWeekEnd = this.addDays(report.weekEnd, 7);
    const thisWeekDays = this.getWeekDays(weekStart);
    const nextWeekDays = this.getWeekDays(nextWeekStart);

    // 장기 출결자 계산
    const longTermCount = attendances.filter(
      (a: any) =>
        a.type.isLongTerm
        && this.isOverlappingRange(a.startDate, a.endDate, report.weekStart, report.weekEnd),
    ).length;
    const currentMembers = report.team.totalMembers - longTermCount;

    // ========== 컬럼 너비 설정 (인치 단위, 합계 약 9.6) ==========
    // 1. 인원현황: [구분, 팀명, 금주, 차주, 비고]
    const memberColW = [0.9, 0.9, 0.5, 0.5, 4.0];
    // 2. 교육/출장: [구분, 팀구분, 내용, 담당자, 실적(5), 계획(5), 비고]
    const tripColW = [0.9, 0.9, 2.6, 0.8, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 1.83];
    // 3. 휴가/훈련: [팀구분, 구분, 담당자, 계획(5), 비고]
    const leaveColW = [0.9, 3.5, 0.8, 0.3, 0.3, 0.3, 0.3, 0.3, 3.33];

    // ========== 1. 인원현황 ==========
    slide.addText('1.인원현황', {
      x: 0.32,
      y: yPos,
      w: 2,
      h: 0.22,
      fontSize: 16,
      fontFace: 'Noto Sans KR Medium',
      color: '1F4E78',
    });
    yPos += 0.25;

    // 인원현황 테이블 - 구분, 비고는 rowspan:2
    const memberTable: any[][] = [
      [
        { text: '구분', options: { ...this.getHdrStyle(), rowspan: 2 } },
        { text: report.team.name, options: this.getHdrStyle() },
        { text: '합계', options: { ...this.getHdrStyle(), colspan: 2 } },
        { text: '비고', options: { ...this.getHdrStyle(), rowspan: 2 } },
      ],
      [
        // 구분(rowspan) 자리 제외
        { text: 'MES', options: this.getHdrStyle() },
        { text: '금주', options: this.getHdrStyle() },
        { text: '차주', options: this.getHdrStyle() },
        // 비고(rowspan) 자리 제외
      ],
      [
        { text: '운영인력', options: this.getCellStyle({ align: 'center' }) },
        { text: String(currentMembers), options: this.getCellStyle({ align: 'center' }) },
        { text: String(currentMembers), options: this.getCellStyle({ align: 'center' }) },
        { text: String(currentMembers), options: this.getCellStyle({ align: 'center' }) },
        { text: '', options: this.getCellStyle() },
      ],
    ];

    slide.addTable(memberTable, {
      x: 0.42,
      y: yPos,
      w: 9.6,
      colW: memberColW,
      rowH: 0.2,
      border: { pt: 0.5, color: '000000' },
      fontFace: 'Noto Sans KR',
      fontSize: 10,
    });
    yPos += memberTable.length * 0.2 + 0.5;

    // ========== 2. 교육/출장 ==========
    const businessTrips = attendances.filter(
      (a: any) =>
        a.type.category === 'BUSINESS_TRIP'
        && (this.isOverlappingRange(a.startDate, a.endDate, report.weekStart, report.weekEnd)
          || this.isOverlappingRange(a.startDate, a.endDate, nextWeekStart, nextWeekEnd)),
    );

    const tripGroups = this.groupTripsByContent(
      businessTrips,
      thisWeekDays,
      nextWeekDays,
      report.weekStart,
      report.weekEnd,
      nextWeekStart,
      nextWeekEnd,
    );

    slide.addText('2. 교육/출장', {
      x: 0.32,
      y: yPos,
      w: 2,
      h: 0.22,
      fontSize: 16,
      fontFace: 'Noto Sans KR Medium',
      color: '1F4E78',
    });
    yPos += 0.25;

    // 교육/출장 테이블 - 구분,팀구분,내용,담당자,비고는 rowspan:3, 실적/계획은 colspan:5
    const tripTable: any[][] = [
      // 헤더 1행 (메인 헤더)
      [
        { text: '구분', options: { ...this.getHdrStyle(), rowspan: 3 } },
        { text: '팀구분', options: { ...this.getHdrStyle(), rowspan: 3 } },
        { text: '내용', options: { ...this.getHdrStyle(), rowspan: 3 } },
        { text: '담당자', options: { ...this.getHdrStyle(), rowspan: 3 } },
        { text: '실적', options: { ...this.getHdrStyle(), colspan: 5 } },
        { text: '계획', options: { ...this.getHdrStyle(), colspan: 5 } },
        { text: '비고', options: { ...this.getHdrStyle(), rowspan: 3 } },
      ],
      // 헤더 2행 (요일)
      [
        // rowspan 자리 제외
        { text: '월', options: this.getHdrStyle() },
        { text: '화', options: this.getHdrStyle() },
        { text: '수', options: this.getHdrStyle() },
        { text: '목', options: this.getHdrStyle() },
        { text: '금', options: this.getHdrStyle() },
        { text: '월', options: this.getHdrStyle() },
        { text: '화', options: this.getHdrStyle() },
        { text: '수', options: this.getHdrStyle() },
        { text: '목', options: this.getHdrStyle() },
        { text: '금', options: this.getHdrStyle() },
        // rowspan 자리 제외
      ],
      // 헤더 3행 (날짜)
      [
        // rowspan 자리 제외
        { text: thisWeekDays[0], options: this.getHdrStyle() },
        { text: thisWeekDays[1], options: this.getHdrStyle() },
        { text: thisWeekDays[2], options: this.getHdrStyle() },
        { text: thisWeekDays[3], options: this.getHdrStyle() },
        { text: thisWeekDays[4], options: this.getHdrStyle() },
        { text: nextWeekDays[0], options: this.getHdrStyle() },
        { text: nextWeekDays[1], options: this.getHdrStyle() },
        { text: nextWeekDays[2], options: this.getHdrStyle() },
        { text: nextWeekDays[3], options: this.getHdrStyle() },
        { text: nextWeekDays[4], options: this.getHdrStyle() },
        // rowspan 자리 제외
      ],
    ];

    // 출장/교육 데이터 추가 (최소 5개 행 보장)
    const minRows = 5;
    if (tripGroups.length > 0) {
      tripGroups.forEach((group: any, idx: number) => {
        tripTable.push(
          this.createTripDataRow(
            group,
            report.team.name,
            idx === 0,
            Math.max(tripGroups.length, minRows),
          ),
        );
      });
      // 부족한 행 채우기
      for (let i = tripGroups.length; i < minRows; i++) {
        tripTable.push(this.createEmptyTripRowWithoutCategory(report.team.name));
      }
    } else {
      // 빈 행 5개 추가 (첫 행에 rowspan:5)
      for (let i = 0; i < minRows; i++) {
        tripTable.push(i === 0
          ? this.createEmptyTripRow(report.team.name, minRows)
          : this.createEmptyTripRowWithoutCategory(report.team.name)
        );
      }
    }

    slide.addTable(tripTable, {
      x: 0.42,
      y: yPos,
      w: 9.6,
      colW: tripColW,
      rowH: 0.2,
      border: { pt: 0.5, color: '000000' },
      fontFace: 'Noto Sans KR',
      fontSize: 10,
    });
    yPos += tripTable.length * 0.2 + 0.75;

    // ========== 3. 휴가/훈련 ==========
    const leaves = attendances.filter(
      (a: any) => a.type.category === 'LEAVE',
    );
    const thisWeekLeaves = leaves.filter((att: any) =>
      this.isOverlappingRange(att.startDate, att.endDate, report.weekStart, report.weekEnd),
    );
    const nextWeekLeaves = leaves.filter((att: any) =>
      this.isOverlappingRange(att.startDate, att.endDate, nextWeekStart, nextWeekEnd),
    );

    slide.addText('3. 휴가/훈련', {
      x: 0.32,
      y: yPos,
      w: 2,
      h: 0.22,
      fontSize: 16,
      fontFace: 'Noto Sans KR Medium',
      color: '1F4E78',
    });
    yPos += 0.25;

    // 휴가 목록 텍스트 생성
    let leaveListText = '';
    if (thisWeekLeaves.length > 0) {
      leaveListText = thisWeekLeaves.map((att: any) => {
        const dateStr = this.formatShortDateRange(att.startDate, att.endDate);
        const leaveType = att.type?.name ? `${att.type.name} 휴가` : '';
        return `${this.formatUserNameWithPosition(att.user)}(${dateStr}, ${leaveType})`;
      }).join(', ');
    }

    // 휴가/훈련 테이블 - 팀구분,구분,담당자,비고는 rowspan:3, 계획은 colspan:5
    const leaveTable: any[][] = [
      // 헤더 1행
      [
        { text: '팀구분', options: { ...this.getHdrStyle(), rowspan: 3 } },
        { text: '구분', options: { ...this.getHdrStyle(), rowspan: 3 } },
        { text: '담당자', options: { ...this.getHdrStyle(), rowspan: 3 } },
        { text: '계획', options: { ...this.getHdrStyle(), colspan: 5 } },
        { text: '비고', options: { ...this.getHdrStyle(), rowspan: 3 } },
      ],
      // 헤더 2행 (요일)
      [
        // rowspan 자리 제외
        { text: '월', options: this.getHdrStyle() },
        { text: '화', options: this.getHdrStyle() },
        { text: '수', options: this.getHdrStyle() },
        { text: '목', options: this.getHdrStyle() },
        { text: '금', options: this.getHdrStyle() },
        // rowspan 자리 제외
      ],
      // 헤더 3행 (날짜)
      [
        // rowspan 자리 제외
        { text: nextWeekDays[0], options: this.getHdrStyle() },
        { text: nextWeekDays[1], options: this.getHdrStyle() },
        { text: nextWeekDays[2], options: this.getHdrStyle() },
        { text: nextWeekDays[3], options: this.getHdrStyle() },
        { text: nextWeekDays[4], options: this.getHdrStyle() },
        // rowspan 자리 제외
      ],
    ];

    // 휴가 목록 행 (없어도 빈 행 표시)
    leaveTable.push([
      { text: leaveListText || '', options: { ...this.getCellStyle(), colspan: 9 } },
    ]);

    // 팀 행 추가 (최소 5개 행 보장, 팀구분은 rowspan)
    const leaveMinRows = 5;
    const leaveRowCount = Math.max(leaveMinRows, Math.max(nextWeekLeaves.length, 1));
    const buildLeaveRow = (att?: any) => {
      const checks = att
        ? nextWeekDays.map((day) =>
          this.isDateInRange(day, new Date(att.startDate), new Date(att.endDate)),
        )
        : nextWeekDays.map(() => false);
      // content가 있으면 그것 사용 (예: refresh휴가(직책자)), 없으면 타입명 (예: 연차 휴가)
      const leaveType = att?.content
        ? att.content
        : (att?.type?.name ? `${att.type.name} 휴가` : '');
      return [
        { text: leaveType, options: this.getCellStyle({ align: 'center' }) },
        { text: att ? this.formatUserName(att.user) : '', options: this.getCellStyle({ align: 'center' }) },
        ...checks.map((checked) => ({
          text: '',
          options: checked ? this.getCheckStyle() : this.getCellStyle(),
        })),
        { text: att?.remarks || '', options: this.getCellStyle() },
      ];
    };

    leaveTable.push([
      { text: report.team.name, options: { ...this.getCellStyle({ align: 'center', valign: 'middle' }), rowspan: leaveRowCount } },
      ...buildLeaveRow(nextWeekLeaves[0]),
    ]);
    // 나머지 행 추가 (팀구분 제외)
    for (let i = 1; i < leaveRowCount; i++) {
      leaveTable.push(buildLeaveRow(nextWeekLeaves[i]));
    }

    slide.addTable(leaveTable, {
      x: 0.42,
      y: yPos,
      w: 9.6,
      colW: leaveColW,
      rowH: 0.2,
      border: { pt: 0.5, color: '000000' },
      fontFace: 'Noto Sans KR',
      fontSize: 10,
    });
  }

  /**
   * 출장/교육 데이터 행 생성
   */
  private createTripDataRow(
    trip: {
      content: string;
      userName: string;
      location?: string;
      thisWeekChecks: boolean[];
      nextWeekChecks: boolean[];
    },
    teamName: string,
    isFirst: boolean,
    totalCount: number,
  ): any[] {
    const row: any[] = [];

    // 구분, 팀구분 - 첫 행만 rowspan
    if (isFirst && totalCount > 1) {
      row.push({ text: '출장\n및\n교육', options: { ...this.getCellStyle({ align: 'center', valign: 'middle' }), rowspan: totalCount } });
      row.push({ text: teamName, options: { ...this.getCellStyle({ align: 'center', valign: 'middle' }), rowspan: totalCount } });
    } else if (isFirst) {
      row.push({ text: '출장\n및\n교육', options: this.getCellStyle({ align: 'center', valign: 'middle' }) });
      row.push({ text: teamName, options: this.getCellStyle({ align: 'center', valign: 'middle' }) });
    }
    // rowspan으로 병합되는 행에서는 해당 셀 제외 (isFirst가 false면 구분, 팀구분 셀 없음)
    row.push({ text: trip.content, options: this.getCellStyle() });
    row.push({ text: trip.userName, options: this.getCellStyle({ align: 'center' }) });

    // 실적 (금주)
    trip.thisWeekChecks.forEach((checked) => {
      row.push({ text: '', options: checked ? this.getCheckStyle() : this.getCellStyle() });
    });
    // 계획 (차주)
    trip.nextWeekChecks.forEach((checked) => {
      row.push({ text: '', options: checked ? this.getCheckStyle() : this.getCellStyle() });
    });

    row.push({ text: trip.location || '', options: this.getCellStyle({ align: 'center' }) });

    return row;
  }

  /**
   * 빈 출장/교육 행 (첫 행 - rowspan 포함)
   */
  private createEmptyTripRow(teamName: string, rowspanCount: number = 1): any[] {
    return [
      { text: '출장\n및\n교육', options: { ...this.getCellStyle({ align: 'center', valign: 'middle' }), rowspan: rowspanCount } },
      { text: teamName, options: { ...this.getCellStyle({ align: 'center', valign: 'middle' }), rowspan: rowspanCount } },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
    ];
  }

  /**
   * 빈 출장/교육 행 (구분 열 없음 - rowspan 병합용)
   */
  private createEmptyTripRowWithoutCategory(teamName: string): any[] {
    return [
      // 구분, 팀구분 열 제외 (rowspan으로 병합됨)
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
      { text: '', options: this.getCellStyle() },
    ];
  }

  private formatUserNameWithPosition(user: { name: string; position?: string }): string {
    const positionLabel = this.getPositionLabel(user.position);
    return positionLabel ? `${user.name} ${positionLabel}` : user.name;
  }

  private formatUserName(user: { name: string }): string {
    return user.name;
  }

  private getPositionLabel(position?: string): string {
    switch (position) {
      case 'TEAM_LEAD':
        return '팀장';
      case 'MANAGER':
        return '매니저';
      case 'STAFF':
        return '사원';
      default:
        return '';
    }
  }

  /**
   * 헤더 스타일
   */
  private getHdrStyle(options: any = {}): any {
    return {
      fill: { color: '4F81BD' },
      color: 'FFFFFF',
      fontSize: 10,
      fontFace: 'Noto Sans KR',
      align: 'center',
      valign: 'middle',
      margin: 0,
      ...options,
    };
  }

  /**
   * 데이터 셀 스타일
   */
  private getCellStyle(options: any = {}): any {
    return {
      fill: { color: 'FFFFFF' },
      color: '000000',
      fontSize: 10,
      fontFace: '맑은 고딕',
      align: 'left',
      valign: 'middle',
      ...options,
    };
  }

  /**
   * 체크 셀 스타일
   */
  private getCheckStyle(): any {
    return {
      fill: { color: '4F81BD' },
      color: '4F81BD',
      fontSize: 10,
      fontFace: 'Noto Sans KR',
      align: 'center',
      valign: 'middle',
    };
  }
  /**
   * 주간 날짜 배열 (월~금, DD 형식)
   */
  private getWeekDays(weekStart: Date): string[] {
    const days: string[] = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 5; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(String(day.getDate()).padStart(2, '0'));
    }
    return days;
  }

  /**
   * 날짜가 범위 내에 있는지
   */
  private isDateInRange(dayStr: string, startDate: Date, endDate: Date): boolean {
    const day = parseInt(dayStr, 10);
    const startDay = new Date(startDate).getDate();
    const endDay = new Date(endDate).getDate();
    return day >= startDay && day <= endDay;
  }

  private isOverlappingRange(
    startDate: Date,
    endDate: Date,
    rangeStart: Date,
    rangeEnd: Date,
  ): boolean {
    return new Date(startDate) <= new Date(rangeEnd) && new Date(endDate) >= new Date(rangeStart);
  }

  private groupTripsByContent(
    trips: any[],
    thisWeekDays: string[],
    nextWeekDays: string[],
    thisWeekStart: Date,
    thisWeekEnd: Date,
    nextWeekStart: Date,
    nextWeekEnd: Date,
  ) {
    const grouped = new Map<
      string,
      {
        content: string;
        userName: string;
        location?: string;
        thisWeekChecks: boolean[];
        nextWeekChecks: boolean[];
      }
    >();

    trips.forEach((att) => {
      const content = att.content || att.type.name;
      const key = `${att.user.id}-${content}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          content,
          userName: this.formatUserName(att.user),
          location: att.location || '',
          thisWeekChecks: thisWeekDays.map(() => false),
          nextWeekChecks: nextWeekDays.map(() => false),
        });
      }

      const group = grouped.get(key)!;
      if (!group.location && att.location) {
        group.location = att.location;
      }

      const startDate = new Date(att.startDate);
      const endDate = new Date(att.endDate);

      if (this.isOverlappingRange(startDate, endDate, thisWeekStart, thisWeekEnd)) {
        thisWeekDays.forEach((day, idx) => {
          if (this.isDateInRange(day, startDate, endDate)) {
            group.thisWeekChecks[idx] = true;
          }
        });
      }

      if (this.isOverlappingRange(startDate, endDate, nextWeekStart, nextWeekEnd)) {
        nextWeekDays.forEach((day, idx) => {
          if (this.isDateInRange(day, startDate, endDate)) {
            group.nextWeekChecks[idx] = true;
          }
        });
      }
    });

    return Array.from(grouped.values());
  }

  /**
   * 짧은 날짜 범위 포맷
   */
  private formatShortDateRange(startDate: Date, endDate: Date): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = `${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}`;
    const endStr = `${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getDate()).padStart(2, '0')}`;
    return startStr === endStr ? startStr : `${startStr}~${endStr}`;
  }

  /**
   * 날짜 포맷팅 (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * 날짜에 일수 더하기
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
