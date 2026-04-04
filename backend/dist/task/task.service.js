"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const client_1 = require("@prisma/client");
let TaskService = class TaskService {
    constructor(prisma, activityLogService) {
        this.prisma = prisma;
        this.activityLogService = activityLogService;
    }
    async checkProjectAccess(projectId, userId, isAdmin) {
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
            throw new common_1.ForbiddenException('No access to this project');
        }
        return true;
    }
    async createTask(userId, dto) {
        await this.checkProjectAccess(dto.projectId, userId, false);
        const task = await this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                status: dto.status || client_1.TaskStatus.TODO,
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
    async findProjectTasks(projectId, userId, isAdmin, page = 1, limit = 20) {
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
    async updateTask(taskId, userId, dto, isAdmin) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const hasAccess = isAdmin || task.project.ownerId === userId || task.assigneeId === userId;
        if (!hasAccess) {
            throw new common_1.ForbiddenException('No permission to update this task');
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
    async deleteTask(taskId, userId, isAdmin) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const hasAccess = isAdmin || task.project.ownerId === userId;
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Only admin or project owner can delete tasks');
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
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_log_service_1.ActivityLogService])
], TaskService);
//# sourceMappingURL=task.service.js.map