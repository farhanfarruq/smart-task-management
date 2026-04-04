import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post()
  create(@Request() req: any, @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(req.user.userId, createProjectDto);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    if (req.user.role === Role.ADMIN) {
      return this.projectService.findAllForAdmin(Number(page), Number(limit));
    }
    return this.projectService.findUserProjects(req.user.userId, Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.projectService.findOne(id, req.user.userId, isAdmin);
  }

  @Post('invite')
  inviteUser(@Body() inviteDto: InviteUserDto, @Request() req: any) {
    return this.projectService.inviteUser(inviteDto, req.user.userId);
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