import { TaskPriority, TaskStatus, FlexibilityLevel } from '@prisma/client';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    deadline?: string;
    assigneeId?: string;
    reviewerId?: string;
    blockedReason?: string;
    estimatedMinutes?: number;
    importance?: number;
    flexibility?: FlexibilityLevel;
    isAutoScheduled?: boolean;
    preferredTime?: string;
    latestStartAt?: string;
}
