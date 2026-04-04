import { TaskStatus } from '@prisma/client';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    deadline?: string;
    assigneeId?: string;
}
