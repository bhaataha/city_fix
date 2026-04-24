import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt.guard';
import { CurrentUser } from '../../common/decorators';
import { GeoResolverService } from '../../common/geo/geo-resolver.service';
import { IssuesService } from './issues.service';

class CreatePublicIssueDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  /** Free-text category label — auto-resolved/created on the resolved tenant */
  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  urgency?: string;

  @IsOptional()
  @IsBoolean()
  isImmediateDanger?: boolean;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

/**
 * Public, civic-first endpoints — no `:tenant` URL prefix.
 * The responsible municipality is resolved automatically from coordinates.
 */
@ApiTags('Public Issues')
@Controller('issues')
export class PublicIssuesController {
  constructor(
    private issuesService: IssuesService,
    private geoResolver: GeoResolverService,
  ) {}

  /** Global cross-tenant feed for the public map / civic timeline. */
  @Get()
  @ApiOperation({ summary: 'Global civic feed (cross-tenant)' })
  async list(
    @Query('north') north?: string,
    @Query('south') south?: string,
    @Query('east') east?: string,
    @Query('west') west?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('orphans') orphans?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const bbox = north && south && east && west
      ? { north: +north, south: +south, east: +east, west: +west }
      : undefined;

    const data = await this.issuesService.findPublicFeed({
      bbox,
      status,
      categoryName: category,
      onlyOrphans: orphans === 'true',
      page: page ? +page : undefined,
      perPage: perPage ? +perPage : undefined,
    });
    return { success: true, ...data };
  }

  /** Resolve which municipality is responsible for a given coordinate, before reporting. */
  @Get('resolve')
  @ApiOperation({ summary: 'Resolve responsible municipality for coordinates' })
  async resolve(@Query('lat') lat: string, @Query('lng') lng: string) {
    if (!lat || !lng) throw new BadRequestException('lat and lng required');
    const resolved = await this.geoResolver.resolve(+lat, +lng);
    return { success: true, data: resolved };
  }

  /**
   * Create a citizen report from anywhere in the country.
   * Authentication is optional — anonymous reports are allowed but get
   * `isAnonymous=true` regardless of `dto.isAnonymous`.
   */
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report an issue (auto-routed by location)' })
  async create(@CurrentUser() user: any, @Body() dto: CreatePublicIssueDto) {
    const result = await this.issuesService.create(null, {
      ...dto,
      reporterId: user?.id,
      isAnonymous: !user || dto.isAnonymous === true,
    });
    return { success: true, data: result };
  }

  // ─── CIVIC ENGAGEMENT ─────────────────────────────────

  @Post(':id/upvote')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '"I noticed it too" — upvote an issue' })
  async upvote(@Param('id') id: string, @CurrentUser() user: any) {
    return { success: true, data: await this.issuesService.upvote(id, user.id) };
  }

  @Delete(':id/upvote')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove your upvote' })
  async removeUpvote(@Param('id') id: string, @CurrentUser() user: any) {
    return { success: true, data: await this.issuesService.removeUpvote(id, user.id) };
  }

  @Post(':id/follow')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow an issue for status-change notifications' })
  async follow(@Param('id') id: string, @CurrentUser() user: any) {
    return { success: true, data: await this.issuesService.follow(id, user.id) };
  }

  @Delete(':id/follow')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow an issue' })
  async unfollow(@Param('id') id: string, @CurrentUser() user: any) {
    return { success: true, data: await this.issuesService.unfollow(id, user.id) };
  }

  @Get(':id/engagement')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Whether the current user has upvoted/followed' })
  async engagement(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user) return { success: true, data: { upvoted: false, following: false } };
    return { success: true, data: await this.issuesService.getEngagementStateForUser(id, user.id) };
  }
}
