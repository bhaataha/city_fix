import { Global, Module } from '@nestjs/common';
import { GeoResolverService } from './geo-resolver.service';

@Global()
@Module({
  providers: [GeoResolverService],
  exports: [GeoResolverService],
})
export class GeoModule {}
