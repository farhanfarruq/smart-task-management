import { IsString, IsOptional, IsUUID, IsEnum, IsDateString, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { TaskPriority, TaskStatus, FlexibilityLevel } from '@prisma/client';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsUUID()
  @IsOptional()
  reviewerId?: string;

  @IsString()
  @IsOptional()
  blockedReason?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedMinutes?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  importance?: number;

  @IsEnum(FlexibilityLevel)
  @IsOptional()
  flexibility?: FlexibilityLevel;

  @IsBoolean()
  @IsOptional()
  isAutoScheduled?: boolean;

  @IsDateString()
  @IsOptional()
  preferredTime?: string;

  @IsDateString()
  @IsOptional()
  latestStartAt?: string;
}
