import { Module } from '@nestjs/common';
import { AdoptionController } from './adoption.controller';
import { AdoptionService } from './adoption.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AdoptionController],
  providers: [AdoptionService],
  exports: [AdoptionService],
})
export class AdoptionModule {}
