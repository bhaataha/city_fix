import {
  Controller, Post, Delete, Param, UseGuards,
  UseInterceptors, UploadedFiles, BadRequestException,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CurrentUser, TenantId } from '../../common/decorators';

@ApiTags('Uploads')
@Controller(':tenant/uploads')
export class UploadsController {
  constructor(
    private uploadsService: UploadsService,
    private prisma: PrismaService,
  ) {}

  @Post('issues/:issueId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload photos to an issue report' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp|heic|heif)$/)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadIssuePhotos(
    @TenantId() tenantId: string,
    @Param('issueId') issueId: string,
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Verify issue exists and belongs to tenant
    const issue = await this.prisma.issueReport.findFirst({
      where: { id: issueId, tenantId },
    });
    if (!issue) {
      throw new BadRequestException('Issue not found');
    }

    // Get tenant slug for path
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true },
    });

    const results = await Promise.all(
      files.map(async (file) => {
        const uploaded = await this.uploadsService.uploadFile(
          file,
          tenant?.slug || 'unknown',
          'issues',
        );

        // Create attachment record
        const attachment = await this.prisma.issueAttachment.create({
          data: {
            issueId,
            fileName: uploaded.fileName,
            fileUrl: uploaded.url,
            fileSize: uploaded.fileSize,
            mimeType: uploaded.mimeType,
            type: 'IMAGE',
            uploadedById: user.id,
          },
        });

        return attachment;
      }),
    );

    return { success: true, data: results };
  }

  @Post('general')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a general file (e.g. claim documents)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    }),
  )
  async uploadGeneral(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true },
    });

    const results = await Promise.all(
      files.map((file) =>
        this.uploadsService.uploadFile(file, tenant?.slug || 'unknown', 'general'),
      ),
    );

    return { success: true, data: results };
  }

  @Delete('issues/:issueId/:attachmentId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an issue attachment' })
  @HttpCode(HttpStatus.OK)
  async deleteAttachment(
    @TenantId() tenantId: string,
    @Param('issueId') issueId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    const attachment = await this.prisma.issueAttachment.findFirst({
      where: { id: attachmentId, issueId },
      include: { issue: { select: { tenantId: true } } },
    });

    if (!attachment || attachment.issue.tenantId !== tenantId) {
      throw new BadRequestException('Attachment not found');
    }

    await this.uploadsService.deleteFile(attachment.fileUrl);
    await this.prisma.issueAttachment.delete({ where: { id: attachmentId } });

    return { success: true };
  }
}
