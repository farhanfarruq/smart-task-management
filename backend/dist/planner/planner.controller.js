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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerController = void 0;
const common_1 = require("@nestjs/common");
const planner_service_1 = require("./planner.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let PlannerController = class PlannerController {
    constructor(plannerService, prisma) {
        this.plannerService = plannerService;
        this.prisma = prisma;
    }
    async rebalance(req) {
        return this.plannerService.rebalanceSchedule(req.user.userId);
    }
    async getSchedule(req, start, end) {
        const startDate = start ? new Date(start) : (0, date_fns_1.startOfDay)(new Date());
        const endDate = end ? new Date(end) : (0, date_fns_1.endOfDay)(new Date());
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
    async createEvent(req, dto) {
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
    async getProfile(req) {
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
    async updateProfile(req, dto) {
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
};
exports.PlannerController = PlannerController;
__decorate([
    (0, common_1.Post)('rebalance'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlannerController.prototype, "rebalance", null);
__decorate([
    (0, common_1.Get)('schedule'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PlannerController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlannerController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlannerController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlannerController.prototype, "updateProfile", null);
exports.PlannerController = PlannerController = __decorate([
    (0, common_1.Controller)('planner'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [planner_service_1.PlannerService,
        prisma_service_1.PrismaService])
], PlannerController);
//# sourceMappingURL=planner.controller.js.map