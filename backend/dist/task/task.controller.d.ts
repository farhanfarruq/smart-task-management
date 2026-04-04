import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TaskController {
    private taskService;
    constructor(taskService: TaskService);
    create(req: any, createTaskDto: CreateTaskDto): Promise<{
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
    findByProject(projectId: string, req: any, page?: string, limit?: string): Promise<{
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
    update(id: string, updateTaskDto: UpdateTaskDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
