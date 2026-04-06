import { Controller, Get, Post, Body, Request, UseGuards, Query } from '@nestjs/common';
import { PlannerService } from './planner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, endOfDay } from 'date-fns';

@Controller('planner')
@UseGuards(JwtAuthGuard)
export class PlannerController {
  constructor(
    private plannerService: PlannerService,
    private prisma: PrismaService,
  ) {}

  @Post('rebalance')
  async rebalance(@Request() req: any) {
    return this.plannerService.rebalanceSchedule(req.user.userId);
  }

  @Get('schedule')
  async getSchedule(
    @Request() req: any,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startDate = start ? new Date(start) : startOfDay(new Date());
    const endDate = end ? new Date(end) : endOfDay(new Date());

    const [blocks, events] = await Promise.all([
      this.prisma.scheduledTaskBlock.findMany({
        where: {
          userId: req.user.userId,
          startAt: { gte: startDate, lte: endDate },
        },
        include: { task: true },
      }),
      this.prisma.calendarEvent.findMany({
        where: {
          userId: req.user.userId,
          startAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    return { blocks, events };
  }

  @Post('events')
  async createEvent(@Request() req: any, @Body() dto: any) {
    return this.prisma.calendarEvent.create({
      data: {
        userId: req.user.userId,
        title: dto.title,
        description: dto.description,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        isBusy: dto.isBusy ?? true,
        location: dto.location,
      },
    });
  }

  @Get('profile')
  async getProfile(@Request() req: any) {
    let profile = await this.prisma.userPlannerProfile.findUnique({
      where: { userId: req.user.userId },
    });
    
    if (!profile) {
      profile = await this.prisma.userPlannerProfile.create({
        data: { userId: req.user.userId },
      });
    }
    return profile;
  }

  @Post('profile')
  async updateProfile(@Request() req: any, @Body() dto: any) {
    return this.prisma.userPlannerProfile.upsert({
      where: { userId: req.user.userId },
      update: {
        workHours: dto.workHours,
        focusWindows: dto.focusWindows,
        maxMeetingsPerDay: dto.maxMeetingsPerDay,
        chunkingPreference: dto.chunkingPreference,
      },
      create: {
        userId: req.user.userId,
        workHours: dto.workHours,
        focusWindows: dto.focusWindows,
        maxMeetingsPerDay: dto.maxMeetingsPerDay,
        chunkingPreference: dto.chunkingPreference,
      },
    });
  }
}
