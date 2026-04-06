import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLabelDto } from './dto/create-label.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { LogTimeDto } from './dto/log-time.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  create(@Request() req: any, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(req.user.userId, createTaskDto);
  }

  @Get('me')
  findMine(@Request() req: any) {
    return this.taskService.findMyTasks(req.user.userId);
  }

  @Get('project/:projectId/labels')
  getLabels(@Param('projectId') projectId: string, @Request() req: any) {
    return this.taskService.getProjectLabels(projectId, req.user.userId, req.user.role === Role.ADMIN);
  }

  @Post('project/:projectId/labels')
  createLabel(@Param('projectId') projectId: string, @Body() dto: CreateLabelDto, @Request() req: any) {
    return this.taskService.createLabel(projectId, req.user.userId, req.user.role === Role.ADMIN, dto);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.taskService.findProjectTasks(
      projectId,
      req.user.userId,
      req.user.role === Role.ADMIN,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string, @Request() req: any) {
    return this.taskService.getTaskComments(id, req.user.userId, req.user.role === Role.ADMIN);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() dto: CreateCommentDto, @Request() req: any) {
    return this.taskService.addComment(id, req.user.userId, dto, req.user.role === Role.ADMIN);
  }

  @Get(':id/subtasks')
  getSubtasks(@Param('id') id: string, @Request() req: any) {
    return this.taskService.getSubtasks(id, req.user.userId, req.user.role === Role.ADMIN);
  }

  @Post(':id/subtasks')
  createSubtask(@Param('id') id: string, @Body() dto: CreateSubtaskDto, @Request() req: any) {
    return this.taskService.createSubtask(id, req.user.userId, dto, req.user.role === Role.ADMIN);
  }

  @Patch(':id/subtasks/:subtaskId')
  toggleSubtask(@Param('id') id: string, @Param('subtaskId') subtaskId: string, @Body('completed') completed: boolean, @Request() req: any) {
    return this.taskService.toggleSubtask(id, subtaskId, req.user.userId, Boolean(completed), req.user.role === Role.ADMIN);
  }

  @Post(':id/time-entries')
  logTime(@Param('id') id: string, @Body() dto: LogTimeDto, @Request() req: any) {
    return this.taskService.logTime(id, req.user.userId, dto, req.user.role === Role.ADMIN);
  }

  @Post(':id/labels/:labelId')
  attachLabel(@Param('id') id: string, @Param('labelId') labelId: string, @Request() req: any) {
    return this.taskService.attachLabel(id, labelId, req.user.userId, req.user.role === Role.ADMIN);
  }

  @Delete(':id/labels/:labelId')
  detachLabel(@Param('id') id: string, @Param('labelId') labelId: string, @Request() req: any) {
    return this.taskService.detachLabel(id, labelId, req.user.userId, req.user.role === Role.ADMIN);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req: any) {
    return this.taskService.updateTask(id, req.user.userId, updateTaskDto, req.user.role === Role.ADMIN);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.taskService.deleteTask(id, req.user.userId, req.user.role === Role.ADMIN);
  }
}
