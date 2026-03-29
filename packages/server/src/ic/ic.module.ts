import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EligibilityModule } from '../eligibility/eligibility.module';
import { IcController } from './ic.controller';

@Module({
  imports: [AuthModule, EligibilityModule],
  controllers: [IcController],
})
export class IcModule {}
