import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { IssuesController } from './issues.controller';
import { PublicIssuesController } from './public-issues.controller';
import { IssuesService } from './issues.service';
import { TenantMiddleware } from '../../common/middleware/tenant.middleware';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { IssuesGateway } from './issues.gateway';

@Module({
  imports: [MailModule, NotificationsModule],
  controllers: [IssuesController, PublicIssuesController],
  providers: [IssuesService, IssuesGateway],
  exports: [IssuesService, IssuesGateway],
})
export class IssuesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Tenant middleware applies only to the tenant-scoped controller.
    // PublicIssuesController has no `:tenant` segment and resolves geographically.
    consumer.apply(TenantMiddleware).forRoutes(IssuesController);
  }
}
