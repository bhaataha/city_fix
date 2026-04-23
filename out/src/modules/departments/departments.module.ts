import { Module, MiddlewareConsumer } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { TenantMiddleware } from '../../common/middleware/tenant.middleware';

@Module({
  controllers: [DepartmentsController],
})
export class DepartmentsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(DepartmentsController);
  }
}
