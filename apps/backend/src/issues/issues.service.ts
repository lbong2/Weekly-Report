import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssueStatus } from '@prisma/client';

@Injectable()
export class IssuesService {
    constructor(private prisma: PrismaService) { }

    async create(teamId: string, createIssueDto: CreateIssueDto) {
        const { assigneeIds, ...data } = createIssueDto;
        return this.prisma.issue.create({
            data: {
                ...data, // Assignees logic handled in create
                teamId,
                assignees: assigneeIds?.length ? {
                    create: assigneeIds.map(userId => ({ userId }))
                } : undefined
            },
            include: { assignees: true }
        });
    }

    async findAll(teamId: string) {
        return this.prisma.issue.findMany({
            where: { teamId },
            include: {
                chain: true,
                assignees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                position: true,
                                role: true,
                            }
                        }
                    }
                }
            },
            orderBy: [
                {
                    chain: {
                        displayOrder: 'asc',
                    },
                },
                {
                    createdAt: 'desc',
                },
            ],
        });
    }

    async findActiveByTeam(teamId: string) {
        return this.prisma.issue.findMany({
            where: {
                teamId,
                status: IssueStatus.IN_PROGRESS
            },
            include: {
                chain: true,
                assignees: true
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.issue.findUnique({
            where: { id },
            include: { assignees: true }
        });
    }

    async update(id: string, updateIssueDto: UpdateIssueDto) {
        const { assigneeIds, ...data } = updateIssueDto;

        // Handle assignee update strictly if provided
        if (assigneeIds !== undefined) {
            await this.prisma.issueAssignee.deleteMany({ where: { issueId: id } });
        }

        return this.prisma.issue.update({
            where: { id },
            data: {
                ...data,
                assignees: assigneeIds ? {
                    create: assigneeIds.map(userId => ({ userId }))
                } : undefined
            },
            include: { assignees: true }
        });
    }

    async remove(id: string) {
        return this.prisma.issue.delete({ where: { id } });
    }
}
