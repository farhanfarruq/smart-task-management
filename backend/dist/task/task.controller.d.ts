import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLabelDto } from './dto/create-label.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { LogTimeDto } from './dto/log-time.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';
export declare class TaskController {
    private taskService;
    constructor(taskService: TaskService);
    create(req: any, createTaskDto: CreateTaskDto): Promise<{
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
    findMine(req: any): Promise<{
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
    getLabels(projectId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        projectId: string;
        color: string;
    }[]>;
    createLabel(projectId: string, dto: CreateLabelDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        projectId: string;
        color: string;
    }>;
    findByProject(projectId: string, req: any, page?: string, limit?: string): Promise<{
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
    getComments(id: string, req: any): Promise<({
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
    addComment(id: string, dto: CreateCommentDto, req: any): Promise<{
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
    getSubtasks(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        taskId: string;
        title: string;
        completed: boolean;
    }[]>;
    createSubtask(id: string, dto: CreateSubtaskDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        taskId: string;
        title: string;
        completed: boolean;
    }>;
    toggleSubtask(id: string, subtaskId: string, completed: boolean, req: any): Promise<{
        id: string;
        createdAt: Date;
        taskId: string;
        title: string;
        completed: boolean;
    }>;
    logTime(id: string, dto: LogTimeDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        taskId: string;
        minutes: number;
        note: string | null;
    }>;
    attachLabel(id: string, labelId: string, req: any): Promise<{
        message: string;
    }>;
    detachLabel(id: string, labelId: string, req: any): Promise<{
        message: string;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
