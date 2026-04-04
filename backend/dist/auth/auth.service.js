"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const mailer_1 = require("@nestjs-modules/mailer");
const crypto_1 = require("crypto");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, mailerService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async requestOtp(dto) {
        const { email } = dto;
        const code = (0, crypto_1.randomInt)(100000, 999999).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + Number(process.env.OTP_EXPIRY_MINUTES || 5));
        await this.prisma.otp.create({
            data: {
                email,
                code,
                expiresAt,
            },
        });
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Your Smart Task Management Login OTP',
                html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Login Verification</h2>
            <p>Your one-time password is:</p>
            <h1 style="color: #4F46E5; letter-spacing: 5px;">${code}</h1>
            <p>This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
          </div>
        `,
            });
            this.logger.log(`OTP email sent securely to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send OTP to ${email}: ${error.message}`);
            console.log(`[Development Fallback] OTP for ${email}: ${code}`);
        }
        return { message: 'OTP sent successfully', expiresIn: process.env.OTP_EXPIRY_MINUTES || 5 };
    }
    async verifyOtp(dto) {
        const { email, code } = dto;
        const otpRecord = await this.prisma.otp.findFirst({
            where: {
                email,
                code,
                used: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!otpRecord) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        await this.prisma.otp.update({
            where: { id: otpRecord.id },
            data: { used: true },
        });
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0],
                    role: 'USER',
                },
            });
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user)
                throw new common_1.UnauthorizedException();
            const newPayload = { sub: user.id, email: user.email, role: user.role };
            const accessToken = this.jwtService.sign(newPayload, {
                secret: process.env.JWT_SECRET,
                expiresIn: '15m',
            });
            return { accessToken };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mailer_1.MailerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map