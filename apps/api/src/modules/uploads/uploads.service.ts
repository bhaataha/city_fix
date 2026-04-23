import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private config: ConfigService) {
    this.bucketName = this.config.get('MINIO_BUCKET', 'cityfix-uploads');

    this.minioClient = new Minio.Client({
      endPoint: this.config.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.config.get('MINIO_PORT', '9000'), 10),
      useSSL: this.config.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.config.get('MINIO_ACCESS_KEY', 'cityfix'),
      secretKey: this.config.get('MINIO_SECRET_KEY', 'cityfix_secret'),
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);
        // Set public read policy for the bucket
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        this.logger.log(`Bucket "${this.bucketName}" created with public-read policy`);
      } else {
        this.logger.log(`Bucket "${this.bucketName}" already exists`);
      }
    } catch (err) {
      this.logger.warn(`MinIO init skipped (not available): ${(err as Error).message}`);
    }
  }

  /**
   * Upload a file to MinIO and return the public URL.
   */
  async uploadFile(
    file: Express.Multer.File,
    tenantSlug: string,
    folder: string = 'issues',
  ): Promise<{ url: string; fileName: string; fileSize: number; mimeType: string }> {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectName = `${tenantSlug}/${folder}/${timestamp}-${safeName}`;

    await this.minioClient.putObject(
      this.bucketName,
      objectName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    const endpoint = this.config.get('MINIO_ENDPOINT', 'localhost');
    const port = this.config.get('MINIO_PORT', '9000');
    const useSSL = this.config.get('MINIO_USE_SSL', 'false') === 'true';
    const protocol = useSSL ? 'https' : 'http';
    const publicUrl = this.config.get(
      'MINIO_PUBLIC_URL',
      `${protocol}://${endpoint}:${port}`,
    );

    const url = `${publicUrl}/${this.bucketName}/${objectName}`;

    this.logger.log(`Uploaded: ${objectName} (${file.size} bytes)`);

    return {
      url,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Delete a file from MinIO.
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const bucketPrefix = `/${this.bucketName}/`;
      const idx = fileUrl.indexOf(bucketPrefix);
      if (idx === -1) return;

      const objectName = fileUrl.substring(idx + bucketPrefix.length);
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`Deleted: ${objectName}`);
    } catch (err) {
      this.logger.warn(`Failed to delete file: ${(err as Error).message}`);
    }
  }
}
