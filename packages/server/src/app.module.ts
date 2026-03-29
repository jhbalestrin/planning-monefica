import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';
import { HealthModule } from './health/health.module';
import { HrModule } from './hr/hr.module';
import { IcModule } from './ic/ic.module';
import { PlatformOperatorsModule } from './platform-operators/platform-operators.module';
import { SchedulingModule } from './scheduling/scheduling.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URL') ??
          'mongodb://127.0.0.1:27017/planning-monefica',
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    AuthModule,
    IcModule,
    HrModule,
    PlatformOperatorsModule,
    SchedulingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
