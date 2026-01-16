import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { IssueStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) { }

  async create(createTaskDto: CreateTaskDto) {
    const { assigneeIds, issueId, ...taskData } = createTaskDto;

    return this.prisma.$transaction(async (tx) => {
      // 주간보고서 존재 체크 및 팀 ID 확보
      const report = await tx.weeklyReport.findUnique({
        where: { id: taskData.weeklyReportId },
      });

      if (!report) {
        throw new NotFoundException('Weekly report not found');
      }

      // 체인 존재 체크
      const chain = await tx.chain.findUnique({
        where: { id: taskData.chainId },
      });

      if (!chain) {
        throw new NotFoundException('Chain not found');
      }

      // 진척률은 사용자가 입력한 값 그대로 사용
      const progress = taskData.progress ?? 0;

      // 이슈 ID 결정 (없으면 자동 생성)
      let finalIssueId = issueId;
      if (!finalIssueId) {
        // 이슈 생성
        const newIssue = await tx.issue.create({
          data: {
            teamId: report.teamId,
            chainId: taskData.chainId,
            title: taskData.title,
            status: IssueStatus.IN_PROGRESS,
            purpose: taskData.purpose,
            startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
            endDate: taskData.endDate ? new Date(taskData.endDate) : undefined,
            totalCount: taskData.totalCount ?? 0,
            completedCount: taskData.completedCount ?? 0,
            progress: progress,
            assignees: assigneeIds?.length ? {
              create: assigneeIds.map(userId => ({ userId }))
            } : undefined
          }
        });
        finalIssueId = newIssue.id;
      }

      // 업무 생성
      const task = await tx.task.create({
        data: {
          ...taskData,
          issueId: finalIssueId,
          progress,
          ...(taskData.startDate && {
            startDate: new Date(taskData.startDate),
          }),
          ...(taskData.endDate && {
            endDate: new Date(taskData.endDate),
          }),
          ...(assigneeIds &&
            assigneeIds.length > 0 && {
            assignees: {
              create: assigneeIds.map((userId) => ({
                userId,
              })),
            },
          }),
        },
        include: {
          chain: true,
          issue: true,
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
      });

      return task;
    });
  }

  async findAll(weeklyReportId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { weeklyReportId },
      include: {
        chain: true,
        issue: true,
        assignees: {
          include: {
            user: true,
          },
        },
      },
    });

    // 담당자의 displayOrder 기준으로 정렬
    // 여러 담당자가 있는 경우 가장 낮은 displayOrder 사용
    tasks.sort((a, b) => {
      const minOrderA =
        a.assignees.length > 0
          ? Math.min(...a.assignees.map((ass) => ass.user.displayOrder))
          : Infinity;
      const minOrderB =
        b.assignees.length > 0
          ? Math.min(...b.assignees.map((ass) => ass.user.displayOrder))
          : Infinity;

      return minOrderA - minOrderB;
    });

    // 비밀번호 제거
    return tasks.map(task => ({
      ...task,
      assignees: task.assignees.map(assignee => ({
        ...assignee,
        user: {
          id: assignee.user.id,
          name: assignee.user.name,
          email: assignee.user.email,
          displayOrder: assignee.user.displayOrder,
          position: assignee.user.position,
        },
      })),
    }));
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        chain: true,
        issue: true,
        weeklyReport: {
          include: {
            team: true,
          },
        },
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
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const { assigneeIds, ...taskData } = updateTaskDto;

    return this.prisma.$transaction(async (tx) => {
      // 존재 체크
      const existing = await tx.task.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Task not found');
      }

      // 체인 변경 시 존재 체크
      if (updateTaskDto.chainId) {
        const chain = await tx.chain.findUnique({
          where: { id: updateTaskDto.chainId },
        });

        if (!chain) {
          throw new NotFoundException('Chain not found');
        }
      }

      // 진척률은 사용자가 입력한 값 그대로 사용
      const progress = taskData.progress;
      const totalCount = taskData.totalCount ?? existing.totalCount;
      const completedCount =
        taskData.completedCount ?? existing.completedCount;

      // 담당자 업데이트 처리
      const assigneeUpdate =
        assigneeIds !== undefined
          ? {
            deleteMany: {},
            create: assigneeIds.map((userId) => ({
              userId,
            })),
          }
          : undefined;

      // 업무 업데이트
      const task = await tx.task.update({
        where: { id },
        data: {
          ...taskData,
          ...(progress !== undefined && { progress }),
          ...(taskData.startDate && {
            startDate: new Date(taskData.startDate),
          }),
          ...(taskData.endDate && {
            endDate: new Date(taskData.endDate),
          }),
          ...(assigneeUpdate && { assignees: assigneeUpdate }),
        },
        include: {
          chain: true,
          issue: true,
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
      });

      // 연결된 이슈가 있으면 이슈도 업데이트
      if (existing.issueId) {
        const issueUpdateData: any = {};

        // 제목 업데이트
        if (taskData.title !== undefined) {
          issueUpdateData.title = taskData.title;
        }

        // 목적 업데이트
        if (taskData.purpose !== undefined) {
          issueUpdateData.purpose = taskData.purpose;
        }

        // 체인 업데이트
        if (taskData.chainId !== undefined) {
          issueUpdateData.chainId = taskData.chainId;
        }

        // 날짜 변경 시 이슈 업데이트
        if (taskData.startDate !== undefined) {
          issueUpdateData.startDate = taskData.startDate ? new Date(taskData.startDate) : null;
        }
        if (taskData.endDate !== undefined) {
          issueUpdateData.endDate = taskData.endDate ? new Date(taskData.endDate) : null;
        }

        // 진척률/개수 업데이트 (taskData에 값이 있을 때만)
        if (taskData.totalCount !== undefined) {
          issueUpdateData.totalCount = totalCount;
        }
        if (taskData.completedCount !== undefined) {
          issueUpdateData.completedCount = completedCount;
        }
        if (taskData.totalCount !== undefined || taskData.completedCount !== undefined) {
          issueUpdateData.progress = progress;
        }

        // 담당자 업데이트
        const issueAssigneeUpdate = assigneeIds !== undefined
          ? {
            deleteMany: {},
            create: assigneeIds.map((userId) => ({ userId }))
          }
          : undefined;

        if (issueAssigneeUpdate) {
          issueUpdateData.assignees = issueAssigneeUpdate;
        }

        // 이슈 업데이트 (변경사항이 있을 경우에만)
        if (Object.keys(issueUpdateData).length > 0) {
          await tx.issue.update({
            where: { id: existing.issueId },
            data: issueUpdateData,
          });
        }
      }

      return task;
    });
  }

  async remove(id: string) {
    // 존재 체크
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Cascade 삭제로 assignees도 함께 삭제됨
    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully' };
  }
}
