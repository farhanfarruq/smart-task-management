import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
type NotificationPayload = {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    targetUrl?: string;
};
export declare class NotificationService {
    private prisma;
    constructor(prisma: PrismaService);
    createNotification(payload: NotificationPayload): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        targetUrl: string | null;
        isRead: boolean;
    }>;
    getMyNotifications(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        targetUrl: string | null;
        isRead: boolean;
    }[]>;
    markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        targetUrl: string | null;
        isRead: boolean;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
}
export {};
