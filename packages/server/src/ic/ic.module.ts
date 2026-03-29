import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IcController } from './ic.controller';

@Module({
  imports: [AuthModule],
  controllers: [IcController],
})
export class IcModule {}
