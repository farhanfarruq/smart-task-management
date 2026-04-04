import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private mailerService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, mailerService: MailerService);
    requestOtp(dto: RequestOtpDto): Promise<{
        message: string;
        expiresIn: string | number;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
}
