import { PrismaService } from '../prisma/prisma.service';
export declare class PlannerService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateUrgencyScore(task: any): number;
    scheduleTask(taskId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        taskId: string;
        startAt: Date;
        endAt: Date;
        source: import(".prisma/client").$Enums.SchedulingSource;
        confidence: number;
        isLocked: boolean;
    } | undefined>;
    rebalanceSchedule(userId: string): Promise<{
        message: string;
    }>;
}
