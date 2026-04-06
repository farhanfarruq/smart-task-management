import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, SchedulingSource, FlexibilityLevel, TaskPriority } from '@prisma/client';
import { addMinutes, isAfter, isBefore, startOfDay, endOfDay, addDays, setHours, setMinutes } from 'date-fns';

@Injectable()
export class PlannerService {
  private readonly logger = new Logger(PlannerService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculates a heuristic urgency score for a task.
   * Higher score = higher priority for the scheduling engine.
   */
  calculateUrgencyScore(task: any): number {
    let score = 0;

    // 1. Importance (1-5) - Weight: 30%
    score += (task.importance || 1) * 6;

    // 2. Priority Enum - Weight: 30%
    const priorityMap: Record<TaskPriority, number> = {
      [TaskPriority.LOW]: 5,
      [TaskPriority.MEDIUM]: 10,
      [TaskPriority.HIGH]: 20,
      [TaskPriority.URGENT]: 40,
    };
    score += priorityMap[task.priority as TaskPriority] || 10;

    // 3. Proximity to Deadline - Weight: 40%
    if (task.deadline) {
      const now = new Date();
      const deadline = new Date(task.deadline);
      const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursLeft < 0) score += 100; // Overdue
      else if (hoursLeft < 24) score += 50; // Due within a day
      else if (hoursLeft < 72) score += 20; // Due within 3 days
    }

    return score;
  }

  /**
   * Main engine to find a slot and schedule a task.
   */
  async scheduleTask(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { scheduledBlocks: true },
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.status === TaskStatus.DONE) return;

    const duration = task.estimatedMinutes || 60;
    const profile = await this.prisma.userPlannerProfile.findUnique({
      where: { userId },
    });

    // Default work hours: 09:00 - 17:00
    const workStart = 9;
    const workEnd = 17;

    let searchDate = new Date();
    if (task.preferredTime && isAfter(new Date(task.preferredTime), searchDate)) {
      searchDate = new Date(task.preferredTime);
    }

    // Simple search for the next available slot
    let foundSlot: { start: Date; end: Date } | null = null;
    let daysSearched = 0;

    while (!foundSlot && daysSearched < 14) { // Look ahead up to 2 weeks
      const dayStart = setMinutes(setHours(searchDate, workStart), 0);
      const dayEnd = setMinutes(setHours(searchDate, workEnd), 0);

      // Get all existing blocks/events for this day
      const [blocks, events] = await Promise.all([
        this.prisma.scheduledTaskBlock.findMany({
          where: {
            userId,
            startAt: { gte: startOfDay(searchDate) },
            endAt: { lte: endOfDay(searchDate) },
          },
        }),
        this.prisma.calendarEvent.findMany({
          where: {
            userId,
            isBusy: true,
            startAt: { gte: startOfDay(searchDate) },
            endAt: { lte: endOfDay(searchDate) },
          },
        }),
      ]);

      // Combine and sort busy periods
      const busyPeriods = [
        ...blocks.map(b => ({ start: b.startAt, end: b.endAt })),
        ...events.map(e => ({ start: e.startAt, end: e.endAt })),
      ].sort((a, b) => a.start.getTime() - b.start.getTime());

      // Try to find a gap
      let currentTime = isAfter(new Date(), dayStart) ? new Date() : dayStart;
      // Round to next 15/30 min for cleaner schedule
      const minutes = currentTime.getMinutes();
      currentTime = setMinutes(currentTime, minutes + (15 - (minutes % 15)));

      for (const busy of busyPeriods) {
        if (isBefore(currentTime, busy.start)) {
          const gapMinutes = (busy.start.getTime() - currentTime.getTime()) / (1000 * 60);
          if (gapMinutes >= duration) {
            foundSlot = { start: currentTime, end: addMinutes(currentTime, duration) };
            break;
          }
        }
        if (isAfter(busy.end, currentTime)) {
          currentTime = busy.end;
        }
      }

      // Check if there's space after the last busy period
      if (!foundSlot && isBefore(addMinutes(currentTime, duration), dayEnd)) {
        foundSlot = { start: currentTime, end: addMinutes(currentTime, duration) };
      }

      if (!foundSlot) {
        searchDate = addDays(searchDate, 1);
        daysSearched++;
      }
    }

    if (foundSlot) {
      // Clear existing auto-scheduled blocks for this task
      await this.prisma.scheduledTaskBlock.deleteMany({
        where: { taskId, source: SchedulingSource.AUTO, isLocked: false },
      });

      return this.prisma.scheduledTaskBlock.create({
        data: {
          taskId,
          userId,
          startAt: foundSlot.start,
          endAt: foundSlot.end,
          source: SchedulingSource.AUTO,
        },
      });
    } else {
      this.logger.warn(`Could not find a slot for task ${taskId} within 2 weeks`);
      // Create a Risk Alert
      await this.prisma.riskAlert.create({
        data: {
          projectId: task.projectId,
          level: 'WARNING',
          message: `Scheduling impossible: No free slot found for task "${task.title}"`,
        },
      });
    }
  }

  /**
   * Re-plans the entire day/week for a user.
   */
  async rebalanceSchedule(userId: string) {
    this.logger.log(`Rebalancing schedule for user ${userId}`);
    
    // 1. Fetch all active tasks assigned to user that should be auto-scheduled
    const tasks = await this.prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: TaskStatus.DONE },
        isAutoScheduled: true,
      },
    });

    // 2. Sort by urgency score
    const sortedTasks = tasks
      .map(t => ({ ...t, urgency: this.calculateUrgencyScore(t) }))
      .sort((a, b) => b.urgency - a.urgency);

    // 3. Clear all non-locked auto blocks
    await this.prisma.scheduledTaskBlock.deleteMany({
      where: { userId, source: SchedulingSource.AUTO, isLocked: false },
    });

    // 4. Re-schedule each one
    for (const task of sortedTasks) {
      await this.scheduleTask(task.id, userId);
    }

    return { message: 'Schedule rebalanced successfully' };
  }
}
