import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name || dto.email.split('@')[0],
        role: dto.role || Role.USER,
      },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, jobTitle: true, department: true, bio: true, createdAt: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, jobTitle: true, department: true, bio: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, jobTitle: true, department: true, bio: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto, currentUserId: string, currentUserRole: Role) {
    if (currentUserRole !== Role.ADMIN && dto.role) {
      throw new ForbiddenException('Only admin can change role');
    }

    if (currentUserRole !== Role.ADMIN && id !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, jobTitle: true, department: true, bio: true, updatedAt: true },
    });
  }

  async deleteUser(id: string, currentUserRole: Role) {
    if (currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admin can delete users');
    }
    
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
