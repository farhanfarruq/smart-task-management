import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  taskId?: string;

  @IsObject()
  @IsOptional()
  details?: any;
}
