"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PlannerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
let PlannerService = PlannerService_1 = class PlannerService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PlannerService_1.name);
    }
    calculateUrgencyScore(task) {
        let score = 0;
        score += (task.importance || 1) * 6;
        const priorityMap = {
            [client_1.TaskPriority.LOW]: 5,
            [client_1.TaskPriority.MEDIUM]: 10,
            [client_1.TaskPriority.HIGH]: 20,
            [client_1.TaskPriority.URGENT]: 40,
        };
        score += priorityMap[task.priority] || 10;
        if (task.deadline) {
            const now = new Date();
            const deadline = new Date(task.deadline);
            const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (hoursLeft < 0)
                score += 100;
            else if (hoursLeft < 24)
                score += 50;
            else if (hoursLeft < 72)
                score += 20;
        }
        return score;
    }
    async scheduleTask(taskId, userId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { scheduledBlocks: true },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.status === client_1.TaskStatus.DONE)
            return;
        const duration = task.estimatedMinutes || 60;
        const profile = await this.prisma.userPlannerProfile.findUnique({
            where: { userId },
        });
        const workStart = 9;
        const workEnd = 17;
        let searchDate = new Date();
        if (task.preferredTime && (0, date_fns_1.isAfter)(new Date(task.preferredTime), searchDate)) {
            searchDate = new Date(task.preferredTime);
        }
        let foundSlot = null;
        let daysSearched = 0;
        while (!foundSlot && daysSearched < 14) {
            const dayStart = (0, date_fns_1.setMinutes)((0, date_fns_1.setHours)(searchDate, workStart), 0);
            const dayEnd = (0, date_fns_1.setMinutes)((0, date_fns_1.setHours)(searchDate, workEnd), 0);
            const [blocks, events] = await Promise.all([
                this.prisma.scheduledTaskBlock.findMany({
                    where: {
                        userId,
                        startAt: { gte: (0, date_fns_1.startOfDay)(searchDate) },
                        endAt: { lte: (0, date_fns_1.endOfDay)(searchDate) },
                    },
                }),
                this.prisma.calendarEvent.findMany({
                    where: {
                        userId,
                        isBusy: true,
                        startAt: { gte: (0, date_fns_1.startOfDay)(searchDate) },
                        endAt: { lte: (0, date_fns_1.endOfDay)(searchDate) },
                    },
                }),
            ]);
            const busyPeriods = [
                ...blocks.map(b => ({ start: b.startAt, end: b.endAt })),
                ...events.map(e => ({ start: e.startAt, end: e.endAt })),
            ].sort((a, b) => a.start.getTime() - b.start.getTime());
            let currentTime = (0, date_fns_1.isAfter)(new Date(), dayStart) ? new Date() : dayStart;
            const minutes = currentTime.getMinutes();
            currentTime = (0, date_fns_1.setMinutes)(currentTime, minutes + (15 - (minutes % 15)));
            for (const busy of busyPeriods) {
                if ((0, date_fns_1.isBefore)(currentTime, busy.start)) {
                    const gapMinutes = (busy.start.getTime() - currentTime.getTime()) / (1000 * 60);
                    if (gapMinutes >= duration) {
                        foundSlot = { start: currentTime, end: (0, date_fns_1.addMinutes)(currentTime, duration) };
                        break;
                    }
                }
                if ((0, date_fns_1.isAfter)(busy.end, currentTime)) {
                    currentTime = busy.end;
                }
            }
            if (!foundSlot && (0, date_fns_1.isBefore)((0, date_fns_1.addMinutes)(currentTime, duration), dayEnd)) {
                foundSlot = { start: currentTime, end: (0, date_fns_1.addMinutes)(currentTime, duration) };
            }
            if (!foundSlot) {
                searchDate = (0, date_fns_1.addDays)(searchDate, 1);
                daysSearched++;
            }
        }
        if (foundSlot) {
            await this.prisma.scheduledTaskBlock.deleteMany({
                where: { taskId, source: client_1.SchedulingSource.AUTO, isLocked: false },
            });
            return this.prisma.scheduledTaskBlock.create({
                data: {
                    taskId,
                    userId,
                    startAt: foundSlot.start,
                    endAt: foundSlot.end,
                    source: client_1.SchedulingSource.AUTO,
                },
            });
        }
        else {
            this.logger.warn(`Could not find a slot for task ${taskId} within 2 weeks`);
            await this.prisma.riskAlert.create({
                data: {
                    projectId: task.projectId,
                    level: 'WARNING',
                    message: `Scheduling impossible: No free slot found for task "${task.title}"`,
                },
            });
        }
    }
    async rebalanceSchedule(userId) {
        this.logger.log(`Rebalancing schedule for user ${userId}`);
        const tasks = await this.prisma.task.findMany({
            where: {
                assigneeId: userId,
                status: { not: client_1.TaskStatus.DONE },
                isAutoScheduled: true,
            },
        });
        const sortedTasks = tasks
            .map(t => ({ ...t, urgency: this.calculateUrgencyScore(t) }))
            .sort((a, b) => b.urgency - a.urgency);
        await this.prisma.scheduledTaskBlock.deleteMany({
            where: { userId, source: client_1.SchedulingSource.AUTO, isLocked: false },
        });
        for (const task of sortedTasks) {
            await this.scheduleTask(task.id, userId);
        }
        return { message: 'Schedule rebalanced successfully' };
    }
};
exports.PlannerService = PlannerService;
exports.PlannerService = PlannerService = PlannerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlannerService);
//# sourceMappingURL=planner.service.js.map