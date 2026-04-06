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
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const create_label_dto_1 = require("./dto/create-label.dto");
const create_subtask_dto_1 = require("./dto/create-subtask.dto");
const create_task_dto_1 = require("./dto/create-task.dto");
const log_time_dto_1 = require("./dto/log-time.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const task_service_1 = require("./task.service");
let TaskController = class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
    }
    create(req, createTaskDto) {
        return this.taskService.createTask(req.user.userId, createTaskDto);
    }
    findMine(req) {
        return this.taskService.findMyTasks(req.user.userId);
    }
    getLabels(projectId, req) {
        return this.taskService.getProjectLabels(projectId, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
    createLabel(projectId, dto, req) {
        return this.taskService.createLabel(projectId, req.user.userId, req.user.role === client_1.Role.ADMIN, dto);
    }
    findByProject(projectId, req, page = '1', limit = '20') {
        return this.taskService.findProjectTasks(projectId, req.user.userId, req.user.role === client_1.Role.ADMIN, Number(page), Number(limit));
    }
    getComments(id, req) {
        return this.taskService.getTaskComments(id, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
    addComment(id, dto, req) {
        return this.taskService.addComment(id, req.user.userId, dto, req.user.role === client_1.Role.ADMIN);
    }
    getSubtasks(id, req) {
        return this.taskService.getSubtasks(id, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
    createSubtask(id, dto, req) {
        return this.taskService.createSubtask(id, req.user.userId, dto, req.user.role === client_1.Role.ADMIN);
    }
    toggleSubtask(id, subtaskId, completed, req) {
        return this.taskService.toggleSubtask(id, subtaskId, req.user.userId, Boolean(completed), req.user.role === client_1.Role.ADMIN);
    }
    logTime(id, dto, req) {
        return this.taskService.logTime(id, req.user.userId, dto, req.user.role === client_1.Role.ADMIN);
    }
    attachLabel(id, labelId, req) {
        return this.taskService.attachLabel(id, labelId, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
    detachLabel(id, labelId, req) {
        return this.taskService.detachLabel(id, labelId, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
    update(id, updateTaskDto, req) {
        return this.taskService.updateTask(id, req.user.userId, updateTaskDto, req.user.role === client_1.Role.ADMIN);
    }
    remove(id, req) {
        return this.taskService.deleteTask(id, req.user.userId, req.user.role === client_1.Role.ADMIN);
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('project/:projectId/labels'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "getLabels", null);
__decorate([
    (0, common_1.Post)('project/:projectId/labels'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_label_dto_1.CreateLabelDto, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "createLabel", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "findByProject", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_comment_dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(':id/subtasks'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "getSubtasks", null);
__decorate([
    (0, common_1.Post)(':id/subtasks'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_subtask_dto_1.CreateSubtaskDto, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "createSubtask", null);
__decorate([
    (0, common_1.Patch)(':id/subtasks/:subtaskId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('subtaskId')),
    __param(2, (0, common_1.Body)('completed')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "toggleSubtask", null);
__decorate([
    (0, common_1.Post)(':id/time-entries'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, log_time_dto_1.LogTimeDto, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "logTime", null);
__decorate([
    (0, common_1.Post)(':id/labels/:labelId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('labelId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "attachLabel", null);
__decorate([
    (0, common_1.Delete)(':id/labels/:labelId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('labelId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "detachLabel", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_task_dto_1.UpdateTaskDto, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "remove", null);
exports.TaskController = TaskController = __decorate([
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
//# sourceMappingURL=task.controller.js.map