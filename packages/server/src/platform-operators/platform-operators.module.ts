import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PlatformOperatorsController } from './platform-operators.controller';
import { PlatformOperatorsService } from './platform-operators.service';

@Module({
  imports: [AuthModule],
  controllers: [PlatformOperatorsController],
  providers: [PlatformOperatorsService],
})
export class PlatformOperatorsModule {}
