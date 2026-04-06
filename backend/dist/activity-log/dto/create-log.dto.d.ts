export declare class CreateLogDto {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    projectId?: string;
    taskId?: string;
    details?: any;
}
