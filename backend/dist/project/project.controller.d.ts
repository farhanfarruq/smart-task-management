import { ApplyTemplateDto } from './dto/apply-template.dto';
import { CreateRecurringTaskDto } from './dto/create-recurring-task.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateSavedViewDto } from './dto/create-saved-view.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { ProjectService } from './project.service';
export declare class ProjectController {
    private projectService;
    constructor(projectService: ProjectService);
    create(req: any, createProjectDto: CreateProjectDto): Promise<{
        progress: number;
        overdueTasks: number;
        tasks?: Array<{
            status: import(".prisma/client").TaskStatus;
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
    findAll(req: any, page?: string, limit?: string): Promise<{
        data: {
            progress: number;
            overdueTasks: number;
            tasks?: Array<{
                status: import(".prisma/client").TaskStatus;
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
    getMyInvitations(req: any): Promise<({
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
    respondToInvitation(id: string, accept: boolean, req: any): Promise<{
        message: string;
    }>;
    getWorkload(id: string, req: any): Promise<{
        id: string;
        name: string | null;
        email: string;
        totalTasks: number;
        inProgress: number;
        review: number;
        overdue: number;
        urgent: number;
    }[]>;
    findOne(id: string, req: any): Promise<{
        progress: number;
        overdueTasks: number;
        tasks?: Array<{
            status: import(".prisma/client").TaskStatus;
            deadline: Date | null;
        }>;
    }>;
    inviteUser(inviteDto: InviteUserDto, req: any): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        projectId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        respondedAt: Date | null;
    }>;
    getSavedViews(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        projectId: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    createSavedView(id: string, dto: CreateSavedViewDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        projectId: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getRecurringTasks(id: string, req: any): Promise<{
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
    createRecurringTask(id: string, dto: CreateRecurringTaskDto, req: any): Promise<{
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
    applyTemplate(id: string, dto: ApplyTemplateDto, req: any): Promise<{
        message: string;
        createdTasks: number;
    }>;
    runRecurringTasks(id: string, req: any): Promise<{
        message: string;
        created: number;
    }>;
    getReportSummary(id: string, req: any): Promise<{
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
    update(id: string, updateDto: Partial<CreateProjectDto>, req: any): Promise<{
        progress: number;
        overdueTasks: number;
        tasks?: Array<{
            status: import(".prisma/client").TaskStatus;
            deadline: Date | null;
        }>;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
