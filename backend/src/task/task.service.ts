import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private activityLogService: ActivityLogService,
  ) {}

  private async checkProjectAccess(projectId: string, userId: string, isAdmin: boolean) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { id: userId } } },
        ],
      },
    });
    
    if (!project && !isAdmin) {
      throw new ForbiddenException('No access to this project');
    }
    return true;
  }

  async createTask(userId: string, dto: CreateTaskDto) {
    await this.checkProjectAccess(dto.projectId, userId, false);
    
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status || TaskStatus.TODO,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        assigneeId: dto.assigneeId,
        projectId: dto.projectId,
        createdById: userId,
      },
      include: {
        assignee: true,
        project: true,
      },
    });
    
    await this.activityLogService.createLog({
      userId,
      action: 'CREATE_TASK',
      entityType: 'TASK',
      entityId: task.id,
      details: { taskTitle: task.title, projectId: dto.projectId },
    });
    
    return task;
  }

  async findProjectTasks(projectId: string, userId: string, isAdmin: boolean, page: number = 1, limit: number = 20) {
    await this.checkProjectAccess(projectId, userId, isAdmin);
    
    const skip = (page - 1) * limit;
    const where = { projectId };
    
    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          assignee: { select: { id: true, email: true, name: true } },
          createdBy: { select: { id: true, email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
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

  async updateTask(taskId: string, userId: string, dto: UpdateTaskDto, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    
    if (!task) throw new NotFoundException('Task not found');
    
    const hasAccess = isAdmin || task.project.ownerId === userId || task.assigneeId === userId;
    if (!hasAccess) {
      throw new ForbiddenException('No permission to update this task');
    }
    
    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        assigneeId: dto.assigneeId,
      },
      include: { assignee: true, project: true },
    });
    
    await this.activityLogService.createLog({
      userId,
      action: 'UPDATE_TASK',
      entityType: 'TASK',
      entityId: taskId,
      details: { changes: dto },
    });
    
    return updated;
  }

  async deleteTask(taskId: string, userId: string, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    
    if (!task) throw new NotFoundException('Task not found');
    
    const hasAccess = isAdmin || task.project.ownerId === userId;
    if (!hasAccess) {
      throw new ForbiddenException('Only admin or project owner can delete tasks');
    }
    
    await this.prisma.task.delete({ where: { id: taskId } });
    
    await this.activityLogService.createLog({
      userId,
      action: 'DELETE_TASK',
      entityType: 'TASK',
      entityId: taskId,
      details: { taskTitle: task.title },
    });
    
    return { message: 'Task deleted successfully' };
  }
}