import { PrismaService } from '../prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';
export declare class ActivityLogService {
    private prisma;
    constructor(prisma: PrismaService);
    createLog(dto: CreateLogDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        projectId: string | null;
        taskId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getProjectActivityLogs(projectId: string): Promise<({
        user: {
            email: string;
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        projectId: string | null;
        taskId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getUserActivityLogs(userId: string): Promise<({
        user: {
            email: string;
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        projectId: string | null;
        taskId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
}
