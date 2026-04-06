import { Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateRecurringTaskDto } from './dto/create-recurring-task.dto';
import { CreateSavedViewDto } from './dto/create-saved-view.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { NotificationService } from '../notification/notification.service';
export declare class ProjectService {
    private prisma;
    private activityLogService;
    private notificationService;
    constructor(prisma: PrismaService, activityLogService: ActivityLogService, notificationService: NotificationService);
    private buildProjectPayload;
    private ensureTemplates;
    private getProjectInclude;
    private decorateProject;
    private ensureProjectAccess;
    createProject(userId: string, dto: CreateProjectDto): Promise<{
        progress: number;
        overdueTasks: number;
        tasks?: Array<{
            status: TaskStatus;
            deadline: Date | null;
        }>;
    }>;
    getTemplates(): Promise<({
        tasks: {
            id: string;
            description: string | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            title: string;
            priority: import(".prisma/client").$Enums.TaskPriority;
            estimatedMinutes: number | null;
            order: number;
            templateId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        color: string;
        icon: string;
    })[]>;
    findAllForAdmin(page?: number, limit?: number): Promise<{
        data: {
            progress: number;
            overdueTasks: number;
            tasks?: Array<{
                status: TaskStatus;
                deadline: Date | null;
            }>;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findUserProjects(userId: string, page?: number, limit?: number): Promise<{
        data: {
            progress: number;
            overdueTasks: number;
            tasks?: Array<{
                status: TaskStatus;
                deadline: Date | null;
            }>;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(projectId: string, userId: string, isAdmin: boolean): Promise<{
        progress: number;
        overdueTasks: number;
        tasks?: Array<{
            status: TaskStatus;
            deadline: Date | null;
        }>;
    }>;
    inviteUser(dto: InviteUserDto, inviterId: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        projectId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        respondedAt: Date | null;
    }>;
    getMyInvitations(email: string): Promise<({
        project: {
            owner: {
                email: string;
                id: string;
                name: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            status: import(".prisma/client").$Enums.ProjectStatus;
            startDate: Date | null;
            dueDate: Date | null;
            color: string;
            icon: string;
            health: number;
            ownerId: string;
            archivedAt: Date | null;
        };
    } & {
        email: string;
        id: string;
        createdAt: Date;
        projectId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        respondedAt: Date | null;
    })[]>;
    getSavedViews(projectId: string, userId: string, isAdmin: boolean): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        projectId: string;
        filters: Prisma.JsonValue;
    }[]>;
    createSavedView(projectId: string, userId: string, isAdmin: boolean, dto: CreateSavedViewDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        projectId: string;
        filters: Prisma.JsonValue;
    }>;
    getRecurringTasks(projectId: string, userId: string, isAdmin: boolean): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        description: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        frequency: import(".prisma/client").$Enums.RecurringFrequency;
        interval: number;
        nextRunAt: Date;
        assigneeId: string | null;
        reviewerId: string | null;
        estimatedMinutes: number | null;
        isActive: boolean;
    }[]>;
    createRecurringTask(projectId: string, userId: string, isAdmin: boolean, dto: CreateRecurringTaskDto): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        description: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        frequency: import(".prisma/client").$Enums.RecurringFrequency;
        interval: number;
        nextRunAt: Date;
        assigneeId: string | null;
        reviewerId: string | null;
        estimatedMinutes: number | null;
        isActive: boolean;
    }>;
    applyTemplate(projectId: string, userId: string, templateName: string): Promise<{
        message: string;
        createdTasks: number;
    }>;
    private getNextRecurringDate;
    runRecurringTasks(projectId: string, userId: string, isAdmin: boolean): Promise<{
        message: string;
        created: number;
    }>;
    respondToInvitation(invitationId: string, userId: string, email: string, accept: boolean): Promise<{
        message: string;
    }>;
    updateProject(projectId: string, dto: Partial<CreateProjectDto>, userId: string): Promise<{
        progress: number;
        overdueTasks: number;
        tasks?: Array<{
            status: TaskStatus;
            deadline: Date | null;
        }>;
    }>;
    getProjectWorkload(projectId: string, userId: string, isAdmin: boolean): Promise<{
        id: string;
        name: string | null;
        email: string;
        totalTasks: number;
        inProgress: number;
        review: number;
        overdue: number;
        urgent: number;
    }[]>;
    getProjectReport(projectId: string, userId: string, isAdmin: boolean): Promise<{
        project: {
            id: string;
            name: string;
            dueDate: Date | null;
        };
        summary: {
            totalTasks: number;
            completedTasks: number;
            overdueTasks: number;
            progress: number;
            totalTrackedMinutes: number;
        };
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        topContributors: {
            id: string;
            name: string | null;
            email: string;
            trackedMinutes: number;
            assignedTasks: number;
        }[];
    }>;
    deleteProject(projectId: string, userId: string): Promise<{
        message: string;
    }>;
}
