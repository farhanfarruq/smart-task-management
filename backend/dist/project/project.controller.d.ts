import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteUserDto } from './dto/invite-user.dto';
export declare class ProjectController {
    private projectService;
    constructor(projectService: ProjectService);
    create(req: any, createProjectDto: CreateProjectDto): Promise<{
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
    findAll(req: any, page?: string, limit?: string): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    inviteUser(inviteDto: InviteUserDto, req: any): Promise<{
        message: string;
    }>;
    update(id: string, updateDto: Partial<CreateProjectDto>, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
