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
    // 코드 중복 체크
    const existingChain = await this.prisma.chain.findUnique({
      where: { code: createChainDto.code },
    });

    if (existingChain) {
      throw new ConflictException('Chain code already exists');
    }

    return this.prisma.chain.create({
      data: createChainDto,
    });
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
      },
    });

    if (!chain) {
      throw new NotFoundException('Chain not found');
    }

    return chain;
  }

  async update(id: string, updateChainDto: UpdateChainDto) {
    // 체인 존재 체크
    const existingChain = await this.prisma.chain.findUnique({
      where: { id },
    });

    if (!existingChain) {
      throw new NotFoundException('Chain not found');
    }

    // 코드 변경 시 중복 체크
    if (updateChainDto.code && updateChainDto.code !== existingChain.code) {
      const codeExists = await this.prisma.chain.findUnique({
        where: { code: updateChainDto.code },
      });

      if (codeExists) {
        throw new ConflictException('Chain code already exists');
      }
    }

    return this.prisma.chain.update({
      where: { id },
      data: updateChainDto,
    });
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
