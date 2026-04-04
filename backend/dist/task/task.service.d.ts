import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
export declare class TaskService {
    private prisma;
    private activityLogService;
    constructor(prisma: PrismaService, activityLogService: ActivityLogService);
    private checkProjectAccess;
    createTask(userId: string, dto: CreateTaskDto): Promise<{
        project: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            ownerId: string;
        };
        assignee: {
            email: string;
            id: string;
            createdAt: Date;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        deadline: Date | null;
        assigneeId: string | null;
        createdById: string;
    }>;
    findProjectTasks(projectId: string, userId: string, isAdmin: boolean, page?: number, limit?: number): Promise<{
        data: ({
            assignee: {
                email: string;
                id: string;
                name: string | null;
            } | null;
            createdBy: {
                email: string;
                id: string;
                name: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            projectId: string;
            title: string;
            status: import(".prisma/client").$Enums.TaskStatus;
            deadline: Date | null;
            assigneeId: string | null;
            createdById: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateTask(taskId: string, userId: string, dto: UpdateTaskDto, isAdmin: boolean): Promise<{
        project: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            ownerId: string;
        };
        assignee: {
            email: string;
            id: string;
            createdAt: Date;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        deadline: Date | null;
        assigneeId: string | null;
        createdById: string;
    }>;
    deleteTask(taskId: string, userId: string, isAdmin: boolean): Promise<{
        message: string;
    }>;
}
