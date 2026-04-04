import { TaskStatus } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    deadline?: string;
    assigneeId?: string;
    projectId: string;
}
