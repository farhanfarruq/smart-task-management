import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogController {
  constructor(private activityLogService: ActivityLogService) {}

  @Get('project/:projectId')
  getProjectLogs(@Param('projectId') projectId: string) {
    return this.activityLogService.getProjectActivityLogs(projectId);
  }

  @Get('me')
  getMyLogs(@Request() req: any) {
    return this.activityLogService.getUserActivityLogs(req.user.userId);
  }
}
