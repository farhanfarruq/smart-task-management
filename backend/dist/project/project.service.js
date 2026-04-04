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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const activity_log_service_1 = require("../activity-log/activity-log.service");
let ProjectService = class ProjectService {
    constructor(prisma, activityLogService) {
        this.prisma = prisma;
        this.activityLogService = activityLogService;
    }
    async createProject(userId, dto) {
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
    async findAllForAdmin(page = 1, limit = 10) {
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
    async findUserProjects(userId, page = 1, limit = 10) {
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
    async findOne(projectId, userId, isAdmin) {
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
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const isMember = project.members.some(m => m.id === userId);
        if (!isAdmin && !isMember && project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return project;
    }
    async inviteUser(dto, inviterId) {
        const project = await this.prisma.project.findUnique({
            where: { id: dto.projectId },
            include: { members: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.ownerId !== inviterId) {
            throw new common_1.ForbiddenException('Only project owner can invite users');
        }
        const userToInvite = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!userToInvite) {
            throw new common_1.NotFoundException('User with this email not found');
        }
        const alreadyMember = project.members.some(m => m.id === userToInvite.id);
        if (alreadyMember) {
            throw new common_1.ForbiddenException('User is already a member');
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
    async updateProject(projectId, dto, userId) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only owner can update project');
        }
        return this.prisma.project.update({
            where: { id: projectId },
            data: dto,
        });
    }
    async deleteProject(projectId, userId) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only owner can delete project');
        }
        await this.prisma.project.delete({ where: { id: projectId } });
        return { message: 'Project deleted successfully' };
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_log_service_1.ActivityLogService])
], ProjectService);
//# sourceMappingURL=project.service.js.map