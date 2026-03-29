import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SchedulingConsultantController } from './scheduling-consultant.controller';

@Module({
  imports: [AuthModule],
  controllers: [SchedulingConsultantController],
})
export class SchedulingModule {}
