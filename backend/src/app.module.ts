import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { PrismaModule } from './prisma/prisma.module';

import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';

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
  ],
})

export class AppModule {}