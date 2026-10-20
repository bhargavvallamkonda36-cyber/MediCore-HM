import { Global, Module } from '@nestjs/common';
import { RolesGuard } from './roles.guard.js';

@Global()
@Module({
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class GuardsModule {}
