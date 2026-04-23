import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { AuthService } from './auth.service';
import { TenantId } from '../../common/decorators';
import { ForgotPasswordDto } from './dto/auth.dto';

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

class RefreshDto {
  @IsString()
  refreshToken: string;
}

@ApiTags('Auth')
@Controller(':tenant/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new resident' })
  async register(@TenantId() tenantId: string, @Body() dto: RegisterDto) {
    const result = await this.authService.register(tenantId, dto);
    return { success: true, data: result };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@TenantId() tenantId: string, @Body() dto: LoginDto) {
    const result = await this.authService.login(tenantId, dto.email, dto.password);
    return { success: true, data: result };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshDto) {
    const result = await this.authService.refreshToken(dto.refreshToken);
    return { success: true, data: result };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@TenantId() tenantId: string, @Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto, tenantId);
    return { success: true, data: result };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() body: { token: string; password: string }) {
    const result = await this.authService.resetPassword(body.token, body.password);
    return { success: true, data: result };
  }
}
