import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async createLog(dto: CreateLogDto) {
    return this.prisma.activityLog.create({
      data: {
        userId: dto.userId,
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId,
        projectId: dto.projectId,
        taskId: dto.taskId,
        details: dto.details || {},
      },
    });
  }

  async getProjectActivityLogs(projectId: string) {
    return this.prisma.activityLog.findMany({
      where: {
        OR: [{ projectId }, { entityType: 'PROJECT', entityId: projectId }],
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getUserActivityLogs(userId: string) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
