import { IsEmail, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  name?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}