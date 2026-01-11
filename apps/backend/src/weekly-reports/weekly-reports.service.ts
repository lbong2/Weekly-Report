import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeeklyReportDto } from './dto/create-weekly-report.dto';
import { UpdateWeeklyReportDto } from './dto/update-weekly-report.dto';
import { IssuesService } from '../issues/issues.service';

@Injectable()
export class WeeklyReportsService {
  constructor(
    private prisma: PrismaService,
    private issuesService: IssuesService,
  ) { }

  async create(createWeeklyReportDto: CreateWeeklyReportDto) {
    const { teamId, year, weekNumber } = createWeeklyReportDto;

    // 팀 존재 체크
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // 중복 체크 (같은 팀의 같은 주차)
    const existing = await this.prisma.weeklyReport.findUnique({
      where: {
        teamId_year_weekNumber: {
          teamId,
          year,
          weekNumber,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Weekly report already exists for this team and week',
      );
    }

    // 활성 이슈 조회 및 Task 자동 생성 준비
    const activeIssues = await this.issuesService.findActiveByTeam(teamId);

    // 이슈 기반 Task 데이터 매핑
    const tasksToCreate = await Promise.all(
      activeIssues.map(async (issue, index) => {
        // 해당 이슈의 가장 최근 Task 조회 (지난 주 데이터)
        const latestTask = await this.prisma.task.findFirst({
          where: { issueId: issue.id },
          orderBy: { createdAt: 'desc' },
        });

        return {
          chainId: issue.chainId,
          title: issue.title,
          purpose: issue.purpose,
          startDate: issue.startDate,
          endDate: issue.endDate,
          // 지난 주 차주 계획 → 이번 주 금주 실적으로 복사
          totalCount: latestTask?.nextTotalCount || 0,
          completedCount: latestTask?.nextCompletedCount || 0,
          progress: latestTask?.nextProgress || 0,
          thisWeekContent: latestTask?.nextWeekContent || '',
          // Carry over cumulative stats to Next Week Plan
          nextTotalCount: latestTask?.nextTotalCount || issue.totalCount,
          nextCompletedCount: latestTask?.nextCompletedCount || issue.completedCount,
          nextProgress: latestTask?.nextProgress || issue.progress,
          nextWeekContent: '',
          showNextWeekAchievement: true,
          showThisWeekAchievement: true,
          issueId: issue.id,
          displayOrder: index, // Simple ordering
          assignees: {
            create: issue.assignees.map((a) => ({ userId: a.userId })),
          },
        };
      }),
    );

    return this.prisma.weeklyReport.create({
      data: {
        ...createWeeklyReportDto,
        weekStart: new Date(createWeeklyReportDto.weekStart),
        weekEnd: new Date(createWeeklyReportDto.weekEnd),
        tasks: {
          create: tasksToCreate
        }
      },
      include: {
        team: true,
      },
    });
  }

  async findAll(teamId?: string, year?: number) {
    return this.prisma.weeklyReport.findMany({
      where: {
        ...(teamId && { teamId }),
        ...(year && { year }),
      },
      include: {
        team: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.weeklyReport.findUnique({
      where: { id },
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
                    email: true,
                  },
                },
              },
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

    return report;
  }

  async update(id: string, updateWeeklyReportDto: UpdateWeeklyReportDto) {
    // 존재 체크
    const existing = await this.prisma.weeklyReport.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Weekly report not found');
    }

    return this.prisma.weeklyReport.update({
      where: { id },
      data: {
        ...updateWeeklyReportDto,
        ...(updateWeeklyReportDto.weekStart && {
          weekStart: new Date(updateWeeklyReportDto.weekStart),
        }),
        ...(updateWeeklyReportDto.weekEnd && {
          weekEnd: new Date(updateWeeklyReportDto.weekEnd),
        }),
      },
      include: {
        team: true,
      },
    });
  }

  async remove(id: string) {
    // 존재 체크
    const report = await this.prisma.weeklyReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Weekly report not found');
    }

    // Cascade 삭제로 tasks는 함께 삭제됨
    await this.prisma.weeklyReport.delete({
      where: { id },
    });

    return { message: 'Weekly report deleted successfully' };
  }
}
