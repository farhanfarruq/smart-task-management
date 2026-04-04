import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
}
