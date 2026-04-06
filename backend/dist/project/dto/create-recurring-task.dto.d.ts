import { RecurringFrequency, TaskPriority } from '@prisma/client';
export declare class CreateRecurringTaskDto {
    title: string;
    description?: string;
    priority?: TaskPriority;
    frequency: RecurringFrequency;
    interval?: number;
    nextRunAt: string;
    assigneeId?: string;
    reviewerId?: string;
    estimatedMinutes?: number;
}
