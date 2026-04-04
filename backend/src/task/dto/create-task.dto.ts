import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}