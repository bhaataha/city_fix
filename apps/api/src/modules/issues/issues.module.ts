import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { TenantMiddleware } from '../../common/middleware/tenant.middleware';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { IssuesGateway } from './issues.gateway';

@Module({
  imports: [MailModule, NotificationsModule],
  controllers: [IssuesController],
  providers: [IssuesService, IssuesGateway],
  exports: [IssuesService, IssuesGateway],
})
export class IssuesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(IssuesController);
  }
}
