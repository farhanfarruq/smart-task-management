import { ActivityLogService } from './activity-log.service';
export declare class ActivityLogController {
    private activityLogService;
    constructor(activityLogService: ActivityLogService);
    getProjectLogs(projectId: string): Promise<({
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
    getMyLogs(req: any): Promise<({
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
