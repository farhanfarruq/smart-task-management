import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    findAll(): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<{
        email: string;
        id: string;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        updatedAt: Date;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
