import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { NotificationModule } from '../notification/notification.module';
import { PlannerModule } from '../planner/planner.module';

@Module({
  imports: [ActivityLogModule, NotificationModule, PlannerModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
