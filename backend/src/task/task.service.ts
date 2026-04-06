import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationService } from '../notification/notification.service';
import { PlannerService } from '../planner/planner.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLabelDto } from './dto/create-label.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { LogTimeDto } from './dto/log-time.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private activityLogService: ActivityLogService,
    private notificationService: NotificationService,
    private plannerService: PlannerService,
  ) {}

  private getTaskInclude() {
    return {
      assignee: { select: { id: true, email: true, name: true } },
      createdBy: { select: { id: true, email: true, name: true } },
      reviewer: { select: { id: true, email: true, name: true } },
      comments: {
        include: {
          author: { select: { id: true, email: true, name: true } },
        },
        orderBy: { createdAt: 'asc' as const },
      },
      labels: {
        include: {
          label: true,
        },
      },
      subtasks: true,
      timeEntries: true,
      scheduledBlocks: true,
      project: {
        select: {
          id: true,
          name: true,
          ownerId: true,
          members: { select: { id: true, email: true, name: true } },
        },
      },
    };
  }

  private buildTaskPayload(dto: Partial<CreateTaskDto | UpdateTaskDto>) {
    const nextStatus = dto.status;
    const completedAt = nextStatus ? (nextStatus === TaskStatus.DONE ? new Date() : null) : undefined;
    const startedAt =
      nextStatus === TaskStatus.IN_PROGRESS && !('startedAt' in dto) ? new Date() : undefined;

    return {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.status !== undefined ? { status: dto.status, completedAt, startedAt } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.deadline !== undefined ? { deadline: dto.deadline ? new Date(dto.deadline) : null } : {}),
      ...(dto.assigneeId !== undefined ? { assigneeId: dto.assigneeId ?? null } : {}),
      ...(dto.reviewerId !== undefined ? { reviewerId: dto.reviewerId ?? null } : {}),
      ...(dto.blockedReason !== undefined ? { blockedReason: dto.blockedReason || null } : {}),
      ...(dto.estimatedMinutes !== undefined ? { estimatedMinutes: dto.estimatedMinutes } : {}),
      ...(dto.importance !== undefined ? { importance: dto.importance } : {}),
      ...(dto.flexibility !== undefined ? { flexibility: dto.flexibility } : {}),
      ...(dto.isAutoScheduled !== undefined ? { isAutoScheduled: dto.isAutoScheduled } : {}),
      ...(dto.preferredTime !== undefined ? { preferredTime: dto.preferredTime ? new Date(dto.preferredTime) : null } : {}),
      ...(dto.latestStartAt !== undefined ? { latestStartAt: dto.latestStartAt ? new Date(dto.latestStartAt) : null } : {}),
    };
  }

  private async checkProjectAccess(projectId: string, userId: string, isAdmin: boolean) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
      include: { members: { select: { id: true } } },
    });

    if (!project && !isAdmin) {
      throw new ForbiddenException('No access to this project');
    }

    return project;
  }

  private async validateProjectMember(projectId: string, userId?: string | null) {
    if (!userId) {
      return;
    }

    const member = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
      select: { id: true },
    });

    if (!member) {
      throw new ForbiddenException('Selected user must be a project member');
    }
  }

  async createTask(userId: string, dto: CreateTaskDto) {
    await this.checkProjectAccess(dto.projectId, userId, false);
    await Promise.all([
      this.validateProjectMember(dto.projectId, dto.assigneeId),
      this.validateProjectMember(dto.projectId, dto.reviewerId),
    ]);

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        ...this.buildTaskPayload(dto),
        status: dto.status ?? TaskStatus.TODO,
        priority: dto.priority ?? TaskPriority.MEDIUM,
        projectId: dto.projectId,
        createdById: userId,
      },
      include: this.getTaskInclude(),
    });

    await this.activityLogService.createLog({
      userId,
      action: 'CREATE_TASK',
      entityType: 'TASK',
      entityId: task.id,
      projectId: dto.projectId,
      taskId: task.id,
      details: { taskTitle: task.title, priority: task.priority, status: task.status },
    });

    if (task.assigneeId && task.assigneeId !== userId) {
      await this.notificationService.createNotification({
        userId: task.assigneeId,
        type: NotificationType.TASK_ASSIGNED,
        title: `New task assigned: ${task.title}`,
        message: `You have been assigned to ${task.title}.`,
        targetUrl: `/projects/${dto.projectId}/tasks`,
      });
    }

    if (task.isAutoScheduled && task.assigneeId) {
      await this.plannerService.scheduleTask(task.id, task.assigneeId);
    }

    return task;
  }

  async findProjectTasks(projectId: string, userId: string, isAdmin: boolean, page = 1, limit = 20) {
    await this.checkProjectAccess(projectId, userId, isAdmin);

    const skip = (page - 1) * limit;
    const where = { projectId };

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: this.getTaskInclude(),
        orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMyTasks(userId: string) {
    const today = new Date();
    const upcoming = new Date();
    upcoming.setDate(today.getDate() + 7);

    const [assigned, overdue, dueSoon] = await Promise.all([
      this.prisma.task.findMany({
        where: { assigneeId: userId },
        include: this.getTaskInclude(),
        orderBy: { updatedAt: 'desc' },
        take: 50,
      }),
      this.prisma.task.findMany({
        where: {
          assigneeId: userId,
          deadline: { lt: today },
          status: { not: TaskStatus.DONE },
        },
        include: this.getTaskInclude(),
        orderBy: { deadline: 'asc' },
      }),
      this.prisma.task.findMany({
        where: {
          assigneeId: userId,
          deadline: { gte: today, lte: upcoming },
          status: { not: TaskStatus.DONE },
        },
        include: this.getTaskInclude(),
        orderBy: { deadline: 'asc' },
      }),
    ]);

    return { assigned, overdue, dueSoon };
  }

  async getProjectLabels(projectId: string, userId: string, isAdmin: boolean) {
    await this.checkProjectAccess(projectId, userId, isAdmin);
    return this.prisma.label.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });
  }

  async createLabel(projectId: string, userId: string, isAdmin: boolean, dto: CreateLabelDto) {
    const project = await this.checkProjectAccess(projectId, userId, isAdmin);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const label = await this.prisma.label.create({
      data: {
        projectId,
        name: dto.name,
        color: dto.color,
      },
    });

    await this.activityLogService.createLog({
      userId,
      action: 'CREATE_LABEL',
      entityType: 'PROJECT',
      entityId: projectId,
      projectId,
      details: { labelName: dto.name },
    });

    return label;
  }

  async updateTask(taskId: string, userId: string, dto: UpdateTaskDto, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const hasAccess = isAdmin || task.project.ownerId === userId || task.assigneeId === userId || task.createdById === userId;
    if (!hasAccess) {
      throw new ForbiddenException('No permission to update this task');
    }

    await Promise.all([
      this.validateProjectMember(task.projectId, dto.assigneeId),
      this.validateProjectMember(task.projectId, dto.reviewerId),
    ]);

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: this.buildTaskPayload(dto),
      include: this.getTaskInclude(),
    });

    await this.activityLogService.createLog({
      userId,
      action: 'UPDATE_TASK',
      entityType: 'TASK',
      entityId: taskId,
      projectId: task.projectId,
      taskId,
      details: { changes: dto, previousStatus: task.status, nextStatus: updated.status },
    });

    if (dto.assigneeId && dto.assigneeId !== task.assigneeId && dto.assigneeId !== userId) {
      await this.notificationService.createNotification({
        userId: dto.assigneeId,
        type: NotificationType.TASK_ASSIGNED,
        title: `Task assigned: ${updated.title}`,
        message: `You are now responsible for ${updated.title}.`,
        targetUrl: `/projects/${task.projectId}/tasks`,
      });
    }

    if (dto.status && dto.status !== task.status && updated.assigneeId) {
      await this.notificationService.createNotification({
        userId: updated.assigneeId,
        type: NotificationType.STATUS_CHANGED,
        title: `Task status updated`,
        message: `${updated.title} moved to ${updated.status.replaceAll('_', ' ')}.`,
        targetUrl: `/projects/${task.projectId}/tasks`,
      });
    }

    if (updated.isAutoScheduled && updated.assigneeId) {
      await this.plannerService.scheduleTask(updated.id, updated.assigneeId);
    }

    return updated;
  }

  async addComment(taskId: string, userId: string, dto: CreateCommentDto, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const hasAccess =
      isAdmin ||
      task.project.ownerId === userId ||
      task.project.members.some((member) => member.id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('No access to this task');
    }

    const comment = await this.prisma.comment.create({
      data: {
        taskId,
        authorId: userId,
        content: dto.content,
      },
      include: {
        author: { select: { id: true, email: true, name: true } },
      },
    });

    await this.activityLogService.createLog({
      userId,
      action: 'ADD_COMMENT',
      entityType: 'TASK',
      entityId: taskId,
      projectId: task.projectId,
      taskId,
      details: { preview: dto.content.slice(0, 80) },
    });

    const recipients = new Set(
      [task.assigneeId, task.createdById, task.reviewerId].filter((id): id is string => Boolean(id && id !== userId)),
    );
    for (const recipient of recipients) {
      await this.notificationService.createNotification({
        userId: recipient,
        type: NotificationType.TASK_COMMENT,
        title: `New comment on ${task.title}`,
        message: dto.content,
        targetUrl: `/projects/${task.projectId}/tasks`,
      });
    }

    return comment;
  }

  async getSubtasks(taskId: string, userId: string, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const hasAccess = isAdmin || task.project.ownerId === userId || task.project.members.some((member) => member.id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('No access to this task');
    }
    return this.prisma.subtask.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createSubtask(taskId: string, userId: string, dto: CreateSubtaskDto, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const hasAccess = isAdmin || task.project.ownerId === userId || task.project.members.some((member) => member.id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('No access to this task');
    }
    const subtask = await this.prisma.subtask.create({
      data: { taskId, title: dto.title },
    });
    await this.activityLogService.createLog({
      userId,
      action: 'CREATE_SUBTASK',
      entityType: 'TASK',
      entityId: taskId,
      projectId: task.projectId,
      taskId,
      details: { title: dto.title },
    });
    return subtask;
  }

  async toggleSubtask(taskId: string, subtaskId: string, userId: string, completed: boolean, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const hasAccess = isAdmin || task.project.ownerId === userId || task.project.members.some((member) => member.id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('No access to this task');
    }
    const updated = await this.prisma.subtask.update({
      where: { id: subtaskId },
      data: { completed },
    });
    await this.activityLogService.createLog({
      userId,
      action: completed ? 'COMPLETE_SUBTASK' : 'REOPEN_SUBTASK',
      entityType: 'TASK',
      entityId: taskId,
      projectId: task.projectId,
      taskId,
      details: { subtaskId },
    });
    return updated;
  }

  async logTime(taskId: string, userId: string, dto: LogTimeDto, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const hasAccess = isAdmin || task.project.ownerId === userId || task.project.members.some((member) => member.id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('No access to this task');
    }

    const [entry] = await this.prisma.$transaction([
      this.prisma.timeEntry.create({
        data: {
          taskId,
          userId,
          minutes: dto.minutes,
          note: dto.note,
        },
      }),
      this.prisma.task.update({
        where: { id: taskId },
        data: {
          actualMinutes: (task.actualMinutes ?? 0) + dto.minutes,
        },
      }),
    ]);

    await this.activityLogService.createLog({
      userId,
      action: 'LOG_TIME',
      entityType: 'TASK',
      entityId: taskId,
      projectId: task.projectId,
      taskId,
      details: { minutes: dto.minutes },
    });

    return entry;
  }

  async attachLabel(taskId: string, labelId: string, userId: string, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const hasAccess = isAdmin || task.project.ownerId === userId || task.project.members.some((member) => member.id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('No access to this task');
    }
    const label = await this.prisma.label.findFirst({
      where: { id: labelId, projectId: task.projectId },
    });
    if (!label) {
      throw new NotFoundException('Label not found');
    }
    await this.prisma.taskLabel.upsert({
      where: { taskId_labelId: { taskId, labelId } },
      update: {},
      create: { taskId, labelId },
    });
    return { message: 'Label attached' };
  }

  async detachLabel(taskId: string, labelId: string, userId: string, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const hasAccess = isAdmin || task.project.ownerId === userId || task.project.members.some((member) => member.id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('No access to this task');
    }
    await this.prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
    return { message: 'Label detached' };
  }

  async getTaskComments(taskId: string, userId: string, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const hasAccess =
      isAdmin ||
      task.project.ownerId === userId ||
      task.project.members.some((member) => member.id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('No access to this task');
    }

    return this.prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteTask(taskId: string, userId: string, isAdmin: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const hasAccess = isAdmin || task.project.ownerId === userId;
    if (!hasAccess) {
      throw new ForbiddenException('Only admin or project owner can delete tasks');
    }

    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({ where: { taskId } }),
      this.prisma.task.delete({ where: { id: taskId } }),
    ]);

    await this.activityLogService.createLog({
      userId,
      action: 'DELETE_TASK',
      entityType: 'TASK',
      entityId: taskId,
      projectId: task.projectId,
      taskId,
      details: { taskTitle: task.title },
    });

    return { message: 'Task deleted successfully' };
  }
}
