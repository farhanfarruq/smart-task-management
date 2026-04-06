import { NotificationService } from './notification.service';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    getMyNotifications(req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        targetUrl: string | null;
        isRead: boolean;
    }[]>;
    markAsRead(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        targetUrl: string | null;
        isRead: boolean;
    }>;
    markAllAsRead(req: any): Promise<{
        message: string;
    }>;
}
