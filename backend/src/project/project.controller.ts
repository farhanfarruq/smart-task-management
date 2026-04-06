import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApplyTemplateDto } from './dto/apply-template.dto';
import { CreateRecurringTaskDto } from './dto/create-recurring-task.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateSavedViewDto } from './dto/create-saved-view.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { ProjectService } from './project.service';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post()
  create(@Request() req: any, @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(req.user.userId, createProjectDto);
  }

  @Get('templates')
  getTemplates() {
    return this.projectService.getTemplates();
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    if (req.user.role === Role.ADMIN) {
      return this.projectService.findAllForAdmin(Number(page), Number(limit));
    }
    return this.projectService.findUserProjects(req.user.userId, Number(page), Number(limit));
  }

  @Get('invitations/me')
  getMyInvitations(@Request() req: any) {
    return this.projectService.getMyInvitations(req.user.email);
  }

  @Post('invitations/:id/respond')
  respondToInvitation(@Param('id') id: string, @Body('accept') accept: boolean, @Request() req: any) {
    return this.projectService.respondToInvitation(id, req.user.userId, req.user.email, Boolean(accept));
  }

  @Get(':id/workload')
  getWorkload(@Param('id') id: string, @Request() req: any) {
    return this.projectService.getProjectWorkload(id, req.user.userId, req.user.role === Role.ADMIN);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.projectService.findOne(id, req.user.userId, req.user.role === Role.ADMIN);
  }

  @Post('invite')
  inviteUser(@Body() inviteDto: InviteUserDto, @Request() req: any) {
    return this.projectService.inviteUser(inviteDto, req.user.userId);
  }

  @Get(':id/saved-views')
  getSavedViews(@Param('id') id: string, @Request() req: any) {
    return this.projectService.getSavedViews(id, req.user.userId, req.user.role === Role.ADMIN);
  }

  @Post(':id/saved-views')
  createSavedView(@Param('id') id: string, @Body() dto: CreateSavedViewDto, @Request() req: any) {
    return this.projectService.createSavedView(id, req.user.userId, req.user.role === Role.ADMIN, dto);
  }

  @Get(':id/recurring-tasks')
  getRecurringTasks(@Param('id') id: string, @Request() req: any) {
    return this.projectService.getRecurringTasks(id, req.user.userId, req.user.role === Role.ADMIN);
  }

  @Post(':id/recurring-tasks')
  createRecurringTask(@Param('id') id: string, @Body() dto: CreateRecurringTaskDto, @Request() req: any) {
    return this.projectService.createRecurringTask(id, req.user.userId, req.user.role === Role.ADMIN, dto);
  }

  @Post(':id/apply-template')
  applyTemplate(@Param('id') id: string, @Body() dto: ApplyTemplateDto, @Request() req: any) {
    return this.projectService.applyTemplate(id, req.user.userId, dto.templateName);
  }

  @Post(':id/recurring-tasks/run')
  runRecurringTasks(@Param('id') id: string, @Request() req: any) {
    return this.projectService.runRecurringTasks(id, req.user.userId, req.user.role === Role.ADMIN);
  }

  @Get(':id/reports/summary')
  getReportSummary(@Param('id') id: string, @Request() req: any) {
    return this.projectService.getProjectReport(id, req.user.userId, req.user.role === Role.ADMIN);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateProjectDto>, @Request() req: any) {
    return this.projectService.updateProject(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.projectService.deleteProject(id, req.user.userId);
  }
}
