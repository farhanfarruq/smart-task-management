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
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const notification_service_1 = require("../notification/notification.service");
let ProjectService = class ProjectService {
    constructor(prisma, activityLogService, notificationService) {
        this.prisma = prisma;
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
    }
    buildProjectPayload(dto) {
        return {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.status !== undefined ? { status: dto.status } : {}),
            ...(dto.startDate !== undefined ? { startDate: dto.startDate ? new Date(dto.startDate) : null } : {}),
            ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null } : {}),
            ...(dto.color !== undefined ? { color: dto.color } : {}),
            ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
            ...(dto.health !== undefined ? { health: dto.health } : {}),
        };
    }
    async ensureTemplates() {
        const total = await this.prisma.projectTemplate.count();
        if (total > 0) {
            return;
        }
        await this.prisma.projectTemplate.createMany({
            data: [
                {
                    name: 'software-sprint',
                    description: 'Sprint template for product or engineering teams.',
                    color: '#2563eb',
                    icon: 'rocket',
                },
                {
                    name: 'marketing-campaign',
                    description: 'Campaign planning and execution template.',
                    color: '#10b981',
                    icon: 'megaphone',
                },
                {
                    name: 'client-delivery',
                    description: 'Client project delivery checklist template.',
                    color: '#f59e0b',
                    icon: 'briefcase',
                },
            ],
        });
        const templates = await this.prisma.projectTemplate.findMany();
        const findTemplate = (name) => templates.find((template) => template.name === name);
        await this.prisma.templateTask.createMany({
            data: [
                { templateId: findTemplate('software-sprint').id, title: 'Backlog grooming', order: 1, priority: 'MEDIUM', status: 'BACKLOG' },
                { templateId: findTemplate('software-sprint').id, title: 'Implementation', order: 2, priority: 'HIGH', status: 'TODO' },
                { templateId: findTemplate('software-sprint').id, title: 'QA and review', order: 3, priority: 'HIGH', status: 'IN_REVIEW' },
                { templateId: findTemplate('marketing-campaign').id, title: 'Campaign brief', order: 1, priority: 'MEDIUM', status: 'TODO' },
                { templateId: findTemplate('marketing-campaign').id, title: 'Content production', order: 2, priority: 'HIGH', status: 'IN_PROGRESS' },
                { templateId: findTemplate('marketing-campaign').id, title: 'Launch and monitor', order: 3, priority: 'URGENT', status: 'TODO' },
                { templateId: findTemplate('client-delivery').id, title: 'Kickoff meeting', order: 1, priority: 'MEDIUM', status: 'TODO' },
                { templateId: findTemplate('client-delivery').id, title: 'Delivery milestone', order: 2, priority: 'HIGH', status: 'IN_PROGRESS' },
                { templateId: findTemplate('client-delivery').id, title: 'Final handoff', order: 3, priority: 'URGENT', status: 'IN_REVIEW' },
            ],
        });
    }
    getProjectInclude() {
        return {
            owner: { select: { id: true, email: true, name: true, role: true, createdAt: true } },
            members: { select: { id: true, email: true, name: true, role: true, createdAt: true } },
            invitations: { orderBy: { createdAt: 'desc' }, take: 10 },
            tasks: {
                include: {
                    assignee: { select: { id: true, email: true, name: true } },
                    createdBy: { select: { id: true, email: true, name: true } },
                    reviewer: { select: { id: true, email: true, name: true } },
                    comments: { select: { id: true } },
                },
            },
        };
    }
    decorateProject(project) {
        const tasks = project.tasks ?? [];
        const totalTasks = tasks.length;
        const doneTasks = tasks.filter((task) => task.status === client_1.TaskStatus.DONE).length;
        const overdueTasks = tasks.filter((task) => task.deadline && task.status !== client_1.TaskStatus.DONE && task.deadline < new Date()).length;
        return {
            ...project,
            progress: totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100),
            overdueTasks,
        };
    }
    async ensureProjectAccess(projectId, userId, isAdmin) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const isMember = project.members.some((member) => member.id === userId);
        if (!isAdmin && !isMember && project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return project;
    }
    async createProject(userId, dto) {
        const project = await this.prisma.project.create({
            data: {
                name: dto.name,
                ...this.buildProjectPayload(dto),
                status: dto.status ?? client_1.ProjectStatus.ACTIVE,
                ownerId: userId,
                members: {
                    connect: { id: userId },
                },
            },
            include: this.getProjectInclude(),
        });
        await this.activityLogService.createLog({
            userId,
            action: 'CREATE_PROJECT',
            entityType: 'PROJECT',
            entityId: project.id,
            projectId: project.id,
            details: { projectName: project.name, status: project.status },
        });
        return this.decorateProject(project);
    }
    async getTemplates() {
        await this.ensureTemplates();
        return this.prisma.projectTemplate.findMany({
            include: {
                tasks: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findAllForAdmin(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.project.findMany({
                skip,
                take: limit,
                include: this.getProjectInclude(),
                orderBy: { updatedAt: 'desc' },
            }),
            this.prisma.project.count(),
        ]);
        return {
            data: data.map((project) => this.decorateProject(project)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
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
                take: limit,
                include: this.getProjectInclude(),
                orderBy: { updatedAt: 'desc' },
            }),
            this.prisma.project.count({ where }),
        ]);
        return {
            data: data.map((project) => this.decorateProject(project)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(projectId, userId, isAdmin) {
        await this.ensureProjectAccess(projectId, userId, isAdmin);
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: this.getProjectInclude(),
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return this.decorateProject(project);
    }
    async inviteUser(dto, inviterId) {
        const project = await this.prisma.project.findUnique({
            where: { id: dto.projectId },
            include: { members: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.ownerId !== inviterId) {
            throw new common_1.ForbiddenException('Only project owner can invite users');
        }
        const userToInvite = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!userToInvite) {
            throw new common_1.NotFoundException('User with this email not found');
        }
        const alreadyMember = project.members.some((member) => member.id === userToInvite.id);
        if (alreadyMember) {
            throw new common_1.ForbiddenException('User is already a member');
        }
        const pendingInvitation = await this.prisma.projectInvitation.findFirst({
            where: { projectId: dto.projectId, email: dto.email, status: client_1.InvitationStatus.PENDING },
        });
        if (pendingInvitation) {
            throw new common_1.ForbiddenException('Invitation is already pending');
        }
        const invitation = await this.prisma.projectInvitation.create({
            data: {
                projectId: dto.projectId,
                email: dto.email,
            },
        });
        await this.notificationService.createNotification({
            userId: userToInvite.id,
            type: client_1.NotificationType.PROJECT_INVITATION,
            title: `Invitation to ${project.name}`,
            message: `You were invited to join ${project.name}.`,
            targetUrl: '/projects',
        });
        await this.activityLogService.createLog({
            userId: inviterId,
            action: 'INVITE_USER',
            entityType: 'PROJECT',
            entityId: project.id,
            projectId: project.id,
            details: { invitedEmail: dto.email, invitationId: invitation.id },
        });
        return invitation;
    }
    async getMyInvitations(email) {
        return this.prisma.projectInvitation.findMany({
            where: { email, status: client_1.InvitationStatus.PENDING },
            include: {
                project: {
                    include: {
                        owner: { select: { id: true, email: true, name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getSavedViews(projectId, userId, isAdmin) {
        await this.ensureProjectAccess(projectId, userId, isAdmin);
        return this.prisma.savedView.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createSavedView(projectId, userId, isAdmin, dto) {
        await this.ensureProjectAccess(projectId, userId, isAdmin);
        const savedView = await this.prisma.savedView.create({
            data: {
                projectId,
                name: dto.name,
                filters: dto.filters,
            },
        });
        await this.activityLogService.createLog({
            userId,
            action: 'CREATE_SAVED_VIEW',
            entityType: 'PROJECT',
            entityId: projectId,
            projectId,
            details: { viewName: dto.name },
        });
        return savedView;
    }
    async getRecurringTasks(projectId, userId, isAdmin) {
        await this.ensureProjectAccess(projectId, userId, isAdmin);
        return this.prisma.recurringTaskRule.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createRecurringTask(projectId, userId, isAdmin, dto) {
        const project = await this.ensureProjectAccess(projectId, userId, isAdmin);
        if (!isAdmin && project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only owner or admin can create recurring rules');
        }
        const rule = await this.prisma.recurringTaskRule.create({
            data: {
                projectId,
                title: dto.title,
                description: dto.description,
                priority: dto.priority ?? 'MEDIUM',
                frequency: dto.frequency,
                interval: dto.interval ?? 1,
                nextRunAt: new Date(dto.nextRunAt),
                assigneeId: dto.assigneeId,
                reviewerId: dto.reviewerId,
                estimatedMinutes: dto.estimatedMinutes,
            },
        });
        await this.activityLogService.createLog({
            userId,
            action: 'CREATE_RECURRING_TASK_RULE',
            entityType: 'PROJECT',
            entityId: projectId,
            projectId,
            details: { title: dto.title, frequency: dto.frequency },
        });
        return rule;
    }
    async applyTemplate(projectId, userId, templateName) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only owner can apply template');
        }
        await this.ensureTemplates();
        const template = await this.prisma.projectTemplate.findUnique({
            where: { name: templateName },
            include: { tasks: { orderBy: { order: 'asc' } } },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        const currentTaskCount = await this.prisma.task.count({ where: { projectId } });
        const createdTasks = await this.prisma.$transaction(template.tasks.map((templateTask, index) => this.prisma.task.create({
            data: {
                title: templateTask.title,
                description: templateTask.description,
                priority: templateTask.priority,
                status: templateTask.status,
                estimatedMinutes: templateTask.estimatedMinutes,
                position: currentTaskCount + index,
                projectId,
                createdById: userId,
            },
        })));
        await this.activityLogService.createLog({
            userId,
            action: 'APPLY_TEMPLATE',
            entityType: 'PROJECT',
            entityId: projectId,
            projectId,
            details: { templateName, tasksCreated: createdTasks.length },
        });
        return { message: `Template ${templateName} applied`, createdTasks: createdTasks.length };
    }
    getNextRecurringDate(date, interval, frequency) {
        const next = new Date(date);
        if (frequency === 'DAILY')
            next.setDate(next.getDate() + interval);
        if (frequency === 'WEEKLY')
            next.setDate(next.getDate() + interval * 7);
        if (frequency === 'MONTHLY')
            next.setMonth(next.getMonth() + interval);
        return next;
    }
    async runRecurringTasks(projectId, userId, isAdmin) {
        const project = await this.ensureProjectAccess(projectId, userId, isAdmin);
        if (!isAdmin && project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only owner or admin can trigger recurring tasks');
        }
        const now = new Date();
        const dueRules = await this.prisma.recurringTaskRule.findMany({
            where: {
                projectId,
                isActive: true,
                nextRunAt: { lte: now },
            },
        });
        const created = [];
        for (const rule of dueRules) {
            const task = await this.prisma.task.create({
                data: {
                    title: rule.title,
                    description: rule.description,
                    priority: rule.priority,
                    status: 'TODO',
                    assigneeId: rule.assigneeId,
                    reviewerId: rule.reviewerId,
                    estimatedMinutes: rule.estimatedMinutes,
                    projectId,
                    createdById: userId,
                },
            });
            created.push(task);
            await this.prisma.recurringTaskRule.update({
                where: { id: rule.id },
                data: {
                    nextRunAt: this.getNextRecurringDate(rule.nextRunAt, rule.interval, rule.frequency),
                },
            });
        }
        await this.activityLogService.createLog({
            userId,
            action: 'RUN_RECURRING_TASKS',
            entityType: 'PROJECT',
            entityId: projectId,
            projectId,
            details: { created: created.length },
        });
        return { message: 'Recurring tasks processed', created: created.length };
    }
    async respondToInvitation(invitationId, userId, email, accept) {
        const invitation = await this.prisma.projectInvitation.findUnique({
            where: { id: invitationId },
            include: { project: true },
        });
        if (!invitation || invitation.email !== email) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.status !== client_1.InvitationStatus.PENDING) {
            throw new common_1.ForbiddenException('Invitation already processed');
        }
        const status = accept ? client_1.InvitationStatus.ACCEPTED : client_1.InvitationStatus.DECLINED;
        await this.prisma.$transaction(async (tx) => {
            await tx.projectInvitation.update({
                where: { id: invitationId },
                data: { status, respondedAt: new Date() },
            });
            if (accept) {
                await tx.project.update({
                    where: { id: invitation.projectId },
                    data: {
                        members: {
                            connect: { id: userId },
                        },
                    },
                });
            }
        });
        await this.activityLogService.createLog({
            userId,
            action: accept ? 'ACCEPT_PROJECT_INVITATION' : 'DECLINE_PROJECT_INVITATION',
            entityType: 'PROJECT',
            entityId: invitation.projectId,
            projectId: invitation.projectId,
            details: { invitationId },
        });
        return { message: accept ? 'Invitation accepted' : 'Invitation declined' };
    }
    async updateProject(projectId, dto, userId) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only owner can update project');
        }
        const updatedProject = await this.prisma.project.update({
            where: { id: projectId },
            data: this.buildProjectPayload(dto),
            include: this.getProjectInclude(),
        });
        await this.activityLogService.createLog({
            userId,
            action: 'UPDATE_PROJECT',
            entityType: 'PROJECT',
            entityId: projectId,
            projectId,
            details: { changes: dto },
        });
        return this.decorateProject(updatedProject);
    }
    async getProjectWorkload(projectId, userId, isAdmin) {
        await this.ensureProjectAccess(projectId, userId, isAdmin);
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        assignedTasks: {
                            where: { projectId },
                            select: { id: true, status: true, priority: true, deadline: true },
                        },
                    },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project.members.map((member) => {
            const assignedTasks = member.assignedTasks;
            const overdue = assignedTasks.filter((task) => task.deadline && task.status !== client_1.TaskStatus.DONE && task.deadline < new Date()).length;
            const urgent = assignedTasks.filter((task) => task.priority === 'URGENT').length;
            return {
                id: member.id,
                name: member.name,
                email: member.email,
                totalTasks: assignedTasks.length,
                inProgress: assignedTasks.filter((task) => task.status === client_1.TaskStatus.IN_PROGRESS).length,
                review: assignedTasks.filter((task) => task.status === client_1.TaskStatus.IN_REVIEW).length,
                overdue,
                urgent,
            };
        });
    }
    async getProjectReport(projectId, userId, isAdmin) {
        await this.ensureProjectAccess(projectId, userId, isAdmin);
        const [project, tasks, timeEntries] = await Promise.all([
            this.prisma.project.findUnique({
                where: { id: projectId },
                include: { members: { select: { id: true, name: true, email: true } } },
            }),
            this.prisma.task.findMany({
                where: { projectId },
                include: {
                    assignee: { select: { id: true, name: true, email: true } },
                    subtasks: true,
                    labels: { include: { label: true } },
                    timeEntries: true,
                },
            }),
            this.prisma.timeEntry.findMany({
                where: { task: { projectId } },
            }),
        ]);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const byStatus = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] ?? 0) + 1;
            return acc;
        }, {});
        const byPriority = tasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] ?? 0) + 1;
            return acc;
        }, {});
        const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.minutes, 0);
        const completed = tasks.filter((task) => task.status === 'DONE').length;
        const overdue = tasks.filter((task) => task.deadline && task.status !== 'DONE' && task.deadline < new Date()).length;
        return {
            project: {
                id: project.id,
                name: project.name,
                dueDate: project.dueDate,
            },
            summary: {
                totalTasks: tasks.length,
                completedTasks: completed,
                overdueTasks: overdue,
                progress: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100),
                totalTrackedMinutes: totalMinutes,
            },
            byStatus,
            byPriority,
            topContributors: project.members.map((member) => ({
                id: member.id,
                name: member.name,
                email: member.email,
                trackedMinutes: timeEntries
                    .filter((entry) => entry.userId === member.id)
                    .reduce((sum, entry) => sum + entry.minutes, 0),
                assignedTasks: tasks.filter((task) => task.assigneeId === member.id).length,
            })),
        };
    }
    async deleteProject(projectId, userId) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only owner can delete project');
        }
        await this.prisma.$transaction([
            this.prisma.notification.deleteMany({
                where: { targetUrl: { contains: `/projects/${projectId}` } },
            }),
            this.prisma.comment.deleteMany({ where: { task: { projectId } } }),
            this.prisma.projectInvitation.deleteMany({ where: { projectId } }),
            this.prisma.task.deleteMany({ where: { projectId } }),
            this.prisma.projectMilestone.deleteMany({ where: { projectId } }),
            this.prisma.project.delete({ where: { id: projectId } }),
        ]);
        return { message: 'Project deleted successfully' };
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_log_service_1.ActivityLogService,
        notification_service_1.NotificationService])
], ProjectService);
//# sourceMappingURL=project.service.js.map