import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(dto: CreateUserDto): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        name: string | null;
        avatarUrl: string | null;
        jobTitle: string | null;
        department: string | null;
        bio: string | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    findAll(): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        name: string | null;
        avatarUrl: string | null;
        jobTitle: string | null;
        department: string | null;
        bio: string | null;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        name: string | null;
        avatarUrl: string | null;
        jobTitle: string | null;
        department: string | null;
        bio: string | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    updateUser(id: string, dto: UpdateUserDto, currentUserId: string, currentUserRole: Role): Promise<{
        email: string;
        id: string;
        name: string | null;
        avatarUrl: string | null;
        jobTitle: string | null;
        department: string | null;
        bio: string | null;
        role: import(".prisma/client").$Enums.Role;
        updatedAt: Date;
    }>;
    deleteUser(id: string, currentUserRole: Role): Promise<{
        message: string;
    }>;
}
