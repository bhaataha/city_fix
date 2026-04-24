import { Controller, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './common/prisma/prisma.service';
import { seedDatabase } from '@cityfix/database';

@ApiTags('Development')
@Controller('dev')
export class DevController {
  constructor(private prisma: PrismaService) {}

  @Post('seed')
  @ApiOperation({ summary: 'Seed database (protected by x-seed-token header)' })
  async seed(@Headers('x-seed-token') token: string) {
    const validToken = process.env.DEV_SEED_TOKEN;
    if (!validToken || token !== validToken) {
      throw new UnauthorizedException('Invalid or missing seed token. Ensure DEV_SEED_TOKEN is set in the environment.');
    }

    try {
      // Execute the shared seed script using the API's Prisma instance
      await seedDatabase(this.prisma);
      return { success: true, message: 'Database seeded successfully' };
    } catch (error: any) {
      console.error('Seed error:', error);
      throw new Error(`Seeding failed: ${error.message}`);
    }
  }
}
