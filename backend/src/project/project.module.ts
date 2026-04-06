import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [ActivityLogModule, NotificationModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
