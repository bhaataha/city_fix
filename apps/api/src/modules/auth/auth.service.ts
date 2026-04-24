import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  async register(tenantId: string, dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    // Email is now globally unique — one identity that can report anywhere.
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        passwordHash,
        role: 'RESIDENT',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, tenantId);

    return { user, ...tokens };
  }

  async login(tenantId: string, email: string, password: string) {
    // Login is global — `tenantId` from the URL is informational only
    // (kept for backward compat with the existing /:tenant/auth/login route).
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, tenantId);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET', 'refresh-secret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, tenantId: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email, user.role, user.tenantId);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string, role: string, tenantId: string) {
    const payload = { sub: userId, email, role, tenantId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET', 'refresh-secret'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Request password reset
   */
  async forgotPassword(dto: ForgotPasswordDto, tenantId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const successMessage = { message: 'אם הכתובת קיימת במערכת, נשלח אליה קישור לאיפוס.' };

    if (!user) {
      // Return same message to prevent email enumeration
      return successMessage;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    // Generate short-lived reset token (15 mins)
    const resetToken = this.jwt.sign(
      { sub: user.id, email: user.email, purpose: 'RESET_PASSWORD' },
      { expiresIn: '15m' },
    );

    await this.mailService.sendPasswordResetEmail(user.email, resetToken, tenant?.name || 'CityFix');

    return successMessage;
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_SECRET', 'secret'),
      });
      if (payload.purpose !== 'RESET_PASSWORD') throw new Error();

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash },
      });

      return { message: 'הסיסמה עודכנה בהצלחה' };
    } catch {
      throw new UnauthorizedException('קישור לא תקף או שפג תוקפו');
    }
  }
}
