import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async requestOtp(dto: RequestOtpDto) {
    const { email } = dto;
    
    // Generate 6 digit OTP
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + Number(process.env.OTP_EXPIRY_MINUTES || 5));
    
    // Save OTP to database
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
    } catch (error: any) {
      this.logger.error(`Failed to send OTP to ${email}: ${error.message}`);
      // In development/test if sending fails we'll log it to console as fallback so the dev can still login
      console.log(`[Development Fallback] OTP for ${email}: ${code}`);
    }
    
    return { message: 'OTP sent successfully', expiresIn: process.env.OTP_EXPIRY_MINUTES || 5 };
  }

  async verifyOtp(dto: VerifyOtpDto) {
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
      throw new BadRequestException('Invalid or expired OTP');
    }
    
    // Mark OTP as used
    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });
    
    // Find or create user
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
    
    // Generate tokens
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

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      
      if (!user) throw new UnauthorizedException();
      
      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      });
      
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}