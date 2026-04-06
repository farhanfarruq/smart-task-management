import { ProjectStatus } from '@prisma/client';
export declare class CreateProjectDto {
    name: string;
    description?: string;
    status?: ProjectStatus;
    startDate?: string;
    dueDate?: string;
    color?: string;
    icon?: string;
    health?: number;
}
