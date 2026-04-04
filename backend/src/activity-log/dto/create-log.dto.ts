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

  @IsObject()
  @IsOptional()
  details?: any;
}