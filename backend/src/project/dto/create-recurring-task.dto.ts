import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { RecurringFrequency, TaskPriority } from '@prisma/client';

export class CreateRecurringTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(RecurringFrequency)
  frequency: RecurringFrequency;

  @IsInt()
  @Min(1)
  @IsOptional()
  interval?: number;

  @IsDateString()
  nextRunAt: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsUUID()
  @IsOptional()
  reviewerId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedMinutes?: number;
}
