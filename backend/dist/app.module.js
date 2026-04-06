"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const throttler_1 = require("@nestjs/throttler");
const mailer_1 = require("@nestjs-modules/mailer");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const project_module_1 = require("./project/project.module");
const task_module_1 = require("./task/task.module");
const activity_log_module_1 = require("./activity-log/activity-log.module");
const prisma_module_1 = require("./prisma/prisma.module");
const planner_module_1 = require("./planner/planner.module");
const notification_module_1 = require("./notification/notification.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
            mailer_1.MailerModule.forRoot({
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
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            project_module_1.ProjectModule,
            task_module_1.TaskModule,
            activity_log_module_1.ActivityLogModule,
            notification_module_1.NotificationModule,
            planner_module_1.PlannerModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map