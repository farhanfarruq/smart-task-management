import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  create(@Request() req: any, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(req.user.userId, createTaskDto);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.taskService.findProjectTasks(projectId, req.user.userId, isAdmin, Number(page), Number(limit));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req: any) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.taskService.updateTask(id, req.user.userId, updateTaskDto, isAdmin);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.taskService.deleteTask(id, req.user.userId, isAdmin);
  }
}