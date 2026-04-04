import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private activityLogService: ActivityLogService,
  ) {}

  async createProject(userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
        members: {
          connect: { id: userId },
        },
      },
      include: {
        owner: true,
        members: true,
      },
    });
    
    await this.activityLogService.createLog({
      userId,
      action: 'CREATE_PROJECT',
      entityType: 'PROJECT',
      entityId: project.id,
      details: { projectName: project.name },
    });
    
    return project;
  }

  async findAllForAdmin(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        skip,
        take: Number(limit),
        include: {
          owner: { select: { id: true, email: true, name: true } },
          members: { select: { id: true, email: true, name: true } },
          tasks: true,
        },
      }),
      this.prisma.project.count(),
    ]);
    
    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async findUserProjects(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const where = {
      members: {
        some: { id: userId },
      },
    };
    
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          owner: { select: { id: true, email: true, name: true } },
          members: { select: { id: true, email: true, name: true } },
          tasks: true,
        },
      }),
      this.prisma.project.count({ where }),
    ]);
    
    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async findOne(projectId: string, userId: string, isAdmin: boolean) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
        members: true,
        tasks: {
          include: {
            assignee: true,
            createdBy: true,
          },
        },
      },
    });
    
    if (!project) throw new NotFoundException('Project not found');
    
    const isMember = project.members.some(m => m.id === userId);
    if (!isAdmin && !isMember && project.ownerId !== userId) {
      throw new ForbiddenException('Access denied to this project');
    }
    
    return project;
  }

  async inviteUser(dto: InviteUserDto, inviterId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { members: true },
    });
    
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== inviterId) {
      throw new ForbiddenException('Only project owner can invite users');
    }
    
    const userToInvite = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    
    if (!userToInvite) {
      throw new NotFoundException('User with this email not found');
    }
    
    const alreadyMember = project.members.some(m => m.id === userToInvite.id);
    if (alreadyMember) {
      throw new ForbiddenException('User is already a member');
    }
    
    await this.prisma.project.update({
      where: { id: dto.projectId },
      data: {
        members: {
          connect: { id: userToInvite.id },
        },
      },
    });
    
    await this.activityLogService.createLog({
      userId: inviterId,
      action: 'INVITE_USER',
      entityType: 'PROJECT',
      entityId: project.id,
      details: { invitedEmail: dto.email, projectName: project.name },
    });
    
    return { message: `User ${dto.email} added to project` };
  }

  async updateProject(projectId: string, dto: Partial<CreateProjectDto>, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only owner can update project');
    }
    
    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }

  async deleteProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only owner can delete project');
    }
    
    await this.prisma.project.delete({ where: { id: projectId } });
    return { message: 'Project deleted successfully' };
  }
}