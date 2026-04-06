import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { PrismaModule } from './prisma/prisma.module';
import { PlannerModule } from './planner/planner.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'dummy@gmail.com',
          pass: process.env.EMAIL_PASS || 'dummy-password',
        },
      },
      defaults: {
        from: '"Smart Task Management" <noreply@smarttask.com>',
      },
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ProjectModule,
    TaskModule,
    ActivityLogModule,
    NotificationModule,
    PlannerModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class AppModule {}
