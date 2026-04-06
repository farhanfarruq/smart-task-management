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
exports.ProjectController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const apply_template_dto_1 = require("./dto/apply-template.dto");
const create_recurring_task_dto_1 = require("./dto/create-recurring-task.dto");
const create_project_dto_1 = require("./dto/create-project.dto");
const create_saved_view_dto_1 = require("./dto/create-saved-view.dto");
const invite_user_dto_1 = require("./dto/invite-user.dto");
const project_service_1 = require("./project.service");
let ProjectController = class ProjectController {
    constructor(projectService) {
        this.projectService = projectService;
    }
    create(req, createProjectDto) {
        return this.projectService.createProject(req.user.userId, createProjectDto);
    }
    getTemplates() {
        return this.projectService.getTemplates();
    }
    async findAll(req, page = '1', limit = '10') {
        if (req.user.role === client_1.Role.ADMIN) {
            return this.projectService.findAllForAdmin(Number(page), Number(limit));
        }
        return this.projectService.findUserProjects(req.user.userId, Number(page), Number(limit));
    }
    getMyInvitations(req) {
        return this.projectService.getMyInvitations(req.user.email);
    }
    respondToInvitation(id, accept, req) {
        return this.projectService.respondToInvitation(id, req.user.userId, req.user.email, Boolean(accept));
    }
    getWorkload(id, req) {
        return this.projectService.getProjectWorkload(id, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
    findOne(id, req) {
        return this.projectService.findOne(id, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
    inviteUser(inviteDto, req) {
        return this.projectService.inviteUser(inviteDto, req.user.userId);
    }
    getSavedViews(id, req) {
        return this.projectService.getSavedViews(id, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
    createSavedView(id, dto, req) {
        return this.projectService.createSavedView(id, req.user.userId, req.user.role === client_1.Role.ADMIN, dto);
    }
    getRecurringTasks(id, req) {
        return this.projectService.getRecurringTasks(id, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
    createRecurringTask(id, dto, req) {
        return this.projectService.createRecurringTask(id, req.user.userId, req.user.role === client_1.Role.ADMIN, dto);
    }
    applyTemplate(id, dto, req) {
        return this.projectService.applyTemplate(id, req.user.userId, dto.templateName);
    }
    runRecurringTasks(id, req) {
        return this.projectService.runRecurringTasks(id, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
    getReportSummary(id, req) {
        return this.projectService.getProjectReport(id, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
    update(id, updateDto, req) {
        return this.projectService.updateProject(id, updateDto, req.user.userId);
    }
    remove(id, req) {
        return this.projectService.deleteProject(id, req.user.userId);
    }
};
exports.ProjectController = ProjectController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('invitations/me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "getMyInvitations", null);
__decorate([
    (0, common_1.Post)('invitations/:id/respond'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('accept')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "respondToInvitation", null);
__decorate([
    (0, common_1.Get)(':id/workload'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "getWorkload", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('invite'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invite_user_dto_1.InviteUserDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "inviteUser", null);
__decorate([
    (0, common_1.Get)(':id/saved-views'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "getSavedViews", null);
__decorate([
    (0, common_1.Post)(':id/saved-views'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_saved_view_dto_1.CreateSavedViewDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "createSavedView", null);
__decorate([
    (0, common_1.Get)(':id/recurring-tasks'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "getRecurringTasks", null);
__decorate([
    (0, common_1.Post)(':id/recurring-tasks'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_recurring_task_dto_1.CreateRecurringTaskDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "createRecurringTask", null);
__decorate([
    (0, common_1.Post)(':id/apply-template'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, apply_template_dto_1.ApplyTemplateDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "applyTemplate", null);
__decorate([
    (0, common_1.Post)(':id/recurring-tasks/run'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "runRecurringTasks", null);
__decorate([
    (0, common_1.Get)(':id/reports/summary'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "getReportSummary", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "remove", null);
exports.ProjectController = ProjectController = __decorate([
    (0, common_1.Controller)('projects'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [project_service_1.ProjectService])
], ProjectController);
//# sourceMappingURL=project.controller.js.map