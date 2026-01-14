import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    const { email, password, name, teamId, role, position, displayOrder } = createUserDto;

    // 이메일 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 팀 존재 체크
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    // displayOrder 자동 할당 (미지정 시)
    let finalDisplayOrder = displayOrder;
    if (displayOrder === undefined) {
      const maxUser = await this.prisma.user.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      finalDisplayOrder = (maxUser?.displayOrder ?? 0) + 1;
    }

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        teamId,
        role: role || 'USER',
        position: position || 'STAFF',
        displayOrder: finalDisplayOrder,
      },
      include: {
        team: true,
      },
    });

    // 비밀번호 제외하고 반환
    const { password: _, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        team: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    // 비밀번호 제외
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        team: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 비밀번호 제외
    const { password: _, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // 사용자 존재 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // 이메일 변경 시 중복 체크
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // 팀 변경 시 존재 체크
    if (updateUserDto.teamId) {
      const team = await this.prisma.team.findUnique({
        where: { id: updateUserDto.teamId },
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }
    }

    // 비밀번호 변경 시 해시
    let hashedPassword: string | undefined;
    if (updateUserDto.password) {
      hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    }

    // 업데이트 데이터 준비
    const updateData: any = { ...updateUserDto };

    // 비밀번호가 있으면 해시된 값으로, 없으면 필드 자체를 제거
    if (hashedPassword) {
      updateData.password = hashedPassword;
    } else {
      delete updateData.password;
    }

    // 사용자 업데이트
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        team: true,
      },
    });

    // 비밀번호 제외
    const { password: _, ...result } = user;
    return result;
  }

  async remove(id: string) {
    // 사용자 존재 체크
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
