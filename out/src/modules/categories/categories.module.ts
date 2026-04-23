import { Module, MiddlewareConsumer } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { TenantMiddleware } from '../../common/middleware/tenant.middleware';

@Module({
  controllers: [CategoriesController],
})
export class CategoriesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(CategoriesController);
  }
}
