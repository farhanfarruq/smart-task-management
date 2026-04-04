import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
export declare class ProjectService {
    private prisma;
    private activityLogService;
    constructor(prisma: PrismaService, activityLogService: ActivityLogService);
    createProject(userId: string, dto: CreateProjectDto): Promise<{
        owner: {
            email: string;
            id: string;
            createdAt: Date;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            updatedAt: Date;
        };
        members: {
            email: string;
            id: string;
            createdAt: Date;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }>;
    findAllForAdmin(page?: number, limit?: number): Promise<{
        data: ({
            owner: {
                email: string;
                id: string;
                name: string | null;
            };
            members: {
                email: string;
                id: string;
                name: string | null;
            }[];
            tasks: {
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
            }[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            ownerId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findUserProjects(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            owner: {
                email: string;
                id: string;
                name: string | null;
            };
            members: {
                email: string;
                id: string;
                name: string | null;
            }[];
            tasks: {
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
            }[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            ownerId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(projectId: string, userId: string, isAdmin: boolean): Promise<{
        owner: {
            email: string;
            id: string;
            createdAt: Date;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            updatedAt: Date;
        };
        members: {
            email: string;
            id: string;
            createdAt: Date;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            updatedAt: Date;
        }[];
        tasks: ({
            assignee: {
                email: string;
                id: string;
                createdAt: Date;
                name: string | null;
                role: import(".prisma/client").$Enums.Role;
                updatedAt: Date;
            } | null;
            createdBy: {
                email: string;
                id: string;
                createdAt: Date;
                name: string | null;
                role: import(".prisma/client").$Enums.Role;
                updatedAt: Date;
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
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }>;
    inviteUser(dto: InviteUserDto, inviterId: string): Promise<{
        message: string;
    }>;
    updateProject(projectId: string, dto: Partial<CreateProjectDto>, userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }>;
    deleteProject(projectId: string, userId: string): Promise<{
        message: string;
    }>;
}
