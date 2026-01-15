import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChainDto } from './dto/create-chain.dto';
import { UpdateChainDto } from './dto/update-chain.dto';

@Injectable()
export class ChainsService {
  constructor(private prisma: PrismaService) { }

  async create(createChainDto: CreateChainDto) {
    const { assigneeIds, ...chainData } = createChainDto;

    // 코드 중복 체크
    const existingChain = await this.prisma.chain.findUnique({
      where: { code: chainData.code },
    });

    if (existingChain) {
      throw new ConflictException('Chain code already exists');
    }

    const chain = await this.prisma.chain.create({
      data: chainData,
    });

    // 담당자 추가
    if (assigneeIds && assigneeIds.length > 0) {
      await this.prisma.chainAssignee.createMany({
        data: assigneeIds.map((userId) => ({
          chainId: chain.id,
          userId,
        })),
      });
    }

    return this.findOne(chain.id);
  }

  async findAll(includeInactive = false) {
    return this.prisma.chain.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                position: true,
                displayOrder: true,
              },
            },
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const chain = await this.prisma.chain.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                position: true,
                displayOrder: true,
              },
            },
          },
        },
      },
    });

    if (!chain) {
      throw new NotFoundException('Chain not found');
    }

    return chain;
  }

  async update(id: string, updateChainDto: UpdateChainDto) {
    const { assigneeIds, ...chainData } = updateChainDto;

    // 체인 존재 체크
    const existingChain = await this.prisma.chain.findUnique({
      where: { id },
    });

    if (!existingChain) {
      throw new NotFoundException('Chain not found');
    }

    // 코드 변경 시 중복 체크
    if (chainData.code && chainData.code !== existingChain.code) {
      const codeExists = await this.prisma.chain.findUnique({
        where: { code: chainData.code },
      });

      if (codeExists) {
        throw new ConflictException('Chain code already exists');
      }
    }

    // 체인 데이터 업데이트
    if (Object.keys(chainData).length > 0) {
      await this.prisma.chain.update({
        where: { id },
        data: chainData,
      });
    }

    // 담당자 업데이트 (전달된 경우에만)
    if (assigneeIds !== undefined) {
      // 기존 담당자 삭제
      await this.prisma.chainAssignee.deleteMany({
        where: { chainId: id },
      });

      // 새 담당자 추가
      if (assigneeIds.length > 0) {
        await this.prisma.chainAssignee.createMany({
          data: assigneeIds.map((userId) => ({
            chainId: id,
            userId,
          })),
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // 체인 존재 체크
    const chain = await this.prisma.chain.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!chain) {
      throw new NotFoundException('Chain not found');
    }

    // 체인에 연결된 업무가 있으면 삭제 불가
    if (chain._count.tasks > 0) {
      throw new ConflictException(
        '연결된 업무가 있어 모듈을 삭제할 수 없습니다.',
      );
    }

    await this.prisma.chain.delete({
      where: { id },
    });

    return { message: 'Chain deleted successfully' };
  }
}
