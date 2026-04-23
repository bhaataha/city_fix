import { Module, MiddlewareConsumer } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { TenantMiddleware } from '../../common/middleware/tenant.middleware';
import { IssuesModule } from '../issues/issues.module';

@Module({
  imports: [IssuesModule],
  controllers: [DashboardController],
})
export class DashboardModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(DashboardController);
  }
}
