import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateSavedViewDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  filters: Record<string, unknown>;
}
