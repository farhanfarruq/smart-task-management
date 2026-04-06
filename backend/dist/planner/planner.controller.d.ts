import { PlannerService } from './planner.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class PlannerController {
    private plannerService;
    private prisma;
    constructor(plannerService: PlannerService, prisma: PrismaService);
    rebalance(req: any): Promise<{
        message: string;
    }>;
    getSchedule(req: any, start?: string, end?: string): Promise<{
        blocks: ({
            task: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                description: string | null;
                status: import(".prisma/client").$Enums.TaskStatus;
                title: string;
                priority: import(".prisma/client").$Enums.TaskPriority;
                assigneeId: string | null;
                reviewerId: string | null;
                estimatedMinutes: number | null;
                deadline: Date | null;
                createdById: string;
                blockedReason: string | null;
                actualMinutes: number;
                startedAt: Date | null;
                completedAt: Date | null;
                position: number;
                importance: number;
                urgencyScore: number;
                flexibility: import(".prisma/client").$Enums.FlexibilityLevel;
                isAutoScheduled: boolean;
                preferredTime: Date | null;
                latestStartAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            taskId: string;
            startAt: Date;
            endAt: Date;
            source: import(".prisma/client").$Enums.SchedulingSource;
            confidence: number;
            isLocked: boolean;
        })[];
        events: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
            title: string;
            startAt: Date;
            endAt: Date;
            location: string | null;
            isBusy: boolean;
            externalId: string | null;
        }[];
    }>;
    createEvent(req: any, dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        title: string;
        startAt: Date;
        endAt: Date;
        location: string | null;
        isBusy: boolean;
        externalId: string | null;
    }>;
    getProfile(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        workHours: import("@prisma/client/runtime/library").JsonValue | null;
        focusWindows: import("@prisma/client/runtime/library").JsonValue | null;
        maxMeetingsPerDay: number | null;
        chunkingPreference: number;
    }>;
    updateProfile(req: any, dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        workHours: import("@prisma/client/runtime/library").JsonValue | null;
        focusWindows: import("@prisma/client/runtime/library").JsonValue | null;
        maxMeetingsPerDay: number | null;
        chunkingPreference: number;
    }>;
}
