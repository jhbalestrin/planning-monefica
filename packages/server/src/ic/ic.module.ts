import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EligibilityModule } from '../eligibility/eligibility.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { IcController } from './ic.controller';

@Module({
  imports: [AuthModule, EligibilityModule, SchedulingModule],
  controllers: [IcController],
})
export class IcModule {}
