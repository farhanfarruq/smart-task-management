import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationService } from '../notification/notification.service';
import { PlannerService } from '../planner/planner.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLabelDto } from './dto/create-label.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { LogTimeDto } from './dto/log-time.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TaskService {
    private prisma;
    private activityLogService;
    private notificationService;
    private plannerService;
    constructor(prisma: PrismaService, activityLogService: ActivityLogService, notificationService: NotificationService, plannerService: PlannerService);
    private getTaskInclude;
    private buildTaskPayload;
    private checkProjectAccess;
    private validateProjectMember;
    createTask(userId: string, dto: CreateTaskDto): Promise<{
        project: {
            id: string;
            name: string;
            ownerId: string;
            members: {
                email: string;
                id: string;
                name: string | null;
            }[];
        };
        comments: ({
            author: {
                email: string;
                id: string;
                name: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taskId: string;
            authorId: string;
            content: string;
        })[];
        scheduledBlocks: {
            id: string;
            createdAt: Date;
            userId: string;
            taskId: string;
            startAt: Date;
            endAt: Date;
            source: import(".prisma/client").$Enums.SchedulingSource;
            confidence: number;
            isLocked: boolean;
        }[];
        labels: ({
            label: {
                id: string;
                createdAt: Date;
                name: string;
                projectId: string;
                color: string;
            };
        } & {
            taskId: string;
            labelId: string;
        })[];
        assignee: {
            email: string;
            id: string;
            name: string | null;
        } | null;
        createdBy: {
            email: string;
            id: string;
            name: string | null;
        };
        reviewer: {
            email: string;
            id: string;
            name: string | null;
        } | null;
        subtasks: {
            id: string;
            createdAt: Date;
            taskId: string;
            title: string;
            completed: boolean;
        }[];
        timeEntries: {
            id: string;
            createdAt: Date;
            userId: string;
            taskId: string;
            minutes: number;
            note: string | null;
        }[];
    } & {
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
    }>;
    findProjectTasks(projectId: string, userId: string, isAdmin: boolean, page?: number, limit?: number): Promise<{
        data: ({
            project: {
                id: string;
                name: string;
                ownerId: string;
                members: {
                    email: string;
                    id: string;
                    name: string | null;
                }[];
            };
            comments: ({
                author: {
                    email: string;
                    id: string;
                    name: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                taskId: string;
                authorId: string;
                content: string;
            })[];
            scheduledBlocks: {
                id: string;
                createdAt: Date;
                userId: string;
                taskId: string;
                startAt: Date;
                endAt: Date;
                source: import(".prisma/client").$Enums.SchedulingSource;
                confidence: number;
                isLocked: boolean;
            }[];
            labels: ({
                label: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    projectId: string;
                    color: string;
                };
            } & {
                taskId: string;
                labelId: string;
            })[];
            assignee: {
                email: string;
                id: string;
                name: string | null;
            } | null;
            createdBy: {
                email: string;
                id: string;
                name: string | null;
            };
            reviewer: {
                email: string;
                id: string;
                name: string | null;
            } | null;
            subtasks: {
                id: string;
                createdAt: Date;
                taskId: string;
                title: string;
                completed: boolean;
            }[];
            timeEntries: {
                id: string;
                createdAt: Date;
                userId: string;
                taskId: string;
                minutes: number;
                note: string | null;
            }[];
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findMyTasks(userId: string): Promise<{
        assigned: ({
            project: {
                id: string;
                name: string;
                ownerId: string;
                members: {
                    email: string;
                    id: string;
                    name: string | null;
                }[];
            };
            comments: ({
                author: {
                    email: string;
                    id: string;
                    name: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                taskId: string;
                authorId: string;
                content: string;
            })[];
            scheduledBlocks: {
                id: string;
                createdAt: Date;
                userId: string;
                taskId: string;
                startAt: Date;
                endAt: Date;
                source: import(".prisma/client").$Enums.SchedulingSource;
                confidence: number;
                isLocked: boolean;
            }[];
            labels: ({
                label: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    projectId: string;
                    color: string;
                };
            } & {
                taskId: string;
                labelId: string;
            })[];
            assignee: {
                email: string;
                id: string;
                name: string | null;
            } | null;
            createdBy: {
                email: string;
                id: string;
                name: string | null;
            };
            reviewer: {
                email: string;
                id: string;
                name: string | null;
            } | null;
            subtasks: {
                id: string;
                createdAt: Date;
                taskId: string;
                title: string;
                completed: boolean;
            }[];
            timeEntries: {
                id: string;
                createdAt: Date;
                userId: string;
                taskId: string;
                minutes: number;
                note: string | null;
            }[];
        } & {
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
        })[];
        overdue: ({
            project: {
                id: string;
                name: string;
                ownerId: string;
                members: {
                    email: string;
                    id: string;
                    name: string | null;
                }[];
            };
            comments: ({
                author: {
                    email: string;
                    id: string;
                    name: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                taskId: string;
                authorId: string;
                content: string;
            })[];
            scheduledBlocks: {
                id: string;
                createdAt: Date;
                userId: string;
                taskId: string;
                startAt: Date;
                endAt: Date;
                source: import(".prisma/client").$Enums.SchedulingSource;
                confidence: number;
                isLocked: boolean;
            }[];
            labels: ({
                label: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    projectId: string;
                    color: string;
                };
            } & {
                taskId: string;
                labelId: string;
            })[];
            assignee: {
                email: string;
                id: string;
                name: string | null;
            } | null;
            createdBy: {
                email: string;
                id: string;
                name: string | null;
            };
            reviewer: {
                email: string;
                id: string;
                name: string | null;
            } | null;
            subtasks: {
                id: string;
                createdAt: Date;
                taskId: string;
                title: string;
                completed: boolean;
            }[];
            timeEntries: {
                id: string;
                createdAt: Date;
                userId: string;
                taskId: string;
                minutes: number;
                note: string | null;
            }[];
        } & {
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
        })[];
        dueSoon: ({
            project: {
                id: string;
                name: string;
                ownerId: string;
                members: {
                    email: string;
                    id: string;
                    name: string | null;
                }[];
            };
            comments: ({
                author: {
                    email: string;
                    id: string;
                    name: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                taskId: string;
                authorId: string;
                content: string;
            })[];
            scheduledBlocks: {
                id: string;
                createdAt: Date;
                userId: string;
                taskId: string;
                startAt: Date;
                endAt: Date;
                source: import(".prisma/client").$Enums.SchedulingSource;
                confidence: number;
                isLocked: boolean;
            }[];
            labels: ({
                label: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    projectId: string;
                    color: string;
                };
            } & {
                taskId: string;
                labelId: string;
            })[];
            assignee: {
                email: string;
                id: string;
                name: string | null;
            } | null;
            createdBy: {
                email: string;
                id: string;
                name: string | null;
            };
            reviewer: {
                email: string;
                id: string;
                name: string | null;
            } | null;
            subtasks: {
                id: string;
                createdAt: Date;
                taskId: string;
                title: string;
                completed: boolean;
            }[];
            timeEntries: {
                id: string;
                createdAt: Date;
                userId: string;
                taskId: string;
                minutes: number;
                note: string | null;
            }[];
        } & {
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
        })[];
    }>;
    getProjectLabels(projectId: string, userId: string, isAdmin: boolean): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        projectId: string;
        color: string;
    }[]>;
    createLabel(projectId: string, userId: string, isAdmin: boolean, dto: CreateLabelDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        projectId: string;
        color: string;
    }>;
    updateTask(taskId: string, userId: string, dto: UpdateTaskDto, isAdmin: boolean): Promise<{
        project: {
            id: string;
            name: string;
            ownerId: string;
            members: {
                email: string;
                id: string;
                name: string | null;
            }[];
        };
        comments: ({
            author: {
                email: string;
                id: string;
                name: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taskId: string;
            authorId: string;
            content: string;
        })[];
        scheduledBlocks: {
            id: string;
            createdAt: Date;
            userId: string;
            taskId: string;
            startAt: Date;
            endAt: Date;
            source: import(".prisma/client").$Enums.SchedulingSource;
            confidence: number;
            isLocked: boolean;
        }[];
        labels: ({
            label: {
                id: string;
                createdAt: Date;
                name: string;
                projectId: string;
                color: string;
            };
        } & {
            taskId: string;
            labelId: string;
        })[];
        assignee: {
            email: string;
            id: string;
            name: string | null;
        } | null;
        createdBy: {
            email: string;
            id: string;
            name: string | null;
        };
        reviewer: {
            email: string;
            id: string;
            name: string | null;
        } | null;
        subtasks: {
            id: string;
            createdAt: Date;
            taskId: string;
            title: string;
            completed: boolean;
        }[];
        timeEntries: {
            id: string;
            createdAt: Date;
            userId: string;
            taskId: string;
            minutes: number;
            note: string | null;
        }[];
    } & {
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
    }>;
    addComment(taskId: string, userId: string, dto: CreateCommentDto, isAdmin: boolean): Promise<{
        author: {
            email: string;
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        authorId: string;
        content: string;
    }>;
    getSubtasks(taskId: string, userId: string, isAdmin: boolean): Promise<{
        id: string;
        createdAt: Date;
        taskId: string;
        title: string;
        completed: boolean;
    }[]>;
    createSubtask(taskId: string, userId: string, dto: CreateSubtaskDto, isAdmin: boolean): Promise<{
        id: string;
        createdAt: Date;
        taskId: string;
        title: string;
        completed: boolean;
    }>;
    toggleSubtask(taskId: string, subtaskId: string, userId: string, completed: boolean, isAdmin: boolean): Promise<{
        id: string;
        createdAt: Date;
        taskId: string;
        title: string;
        completed: boolean;
    }>;
    logTime(taskId: string, userId: string, dto: LogTimeDto, isAdmin: boolean): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        taskId: string;
        minutes: number;
        note: string | null;
    }>;
    attachLabel(taskId: string, labelId: string, userId: string, isAdmin: boolean): Promise<{
        message: string;
    }>;
    detachLabel(taskId: string, labelId: string, userId: string, isAdmin: boolean): Promise<{
        message: string;
    }>;
    getTaskComments(taskId: string, userId: string, isAdmin: boolean): Promise<({
        author: {
            email: string;
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        authorId: string;
        content: string;
    })[]>;
    deleteTask(taskId: string, userId: string, isAdmin: boolean): Promise<{
        message: string;
    }>;
}
