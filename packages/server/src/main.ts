import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

function corsOriginOption(env: string): boolean | string[] {
  const raw = process.env.CORS_ORIGINS;
  if (env === 'development' && !raw) {
    return true;
  }
  if (!raw) {
    return false;
  }
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

async function bootstrap(): Promise<void> {
  const env = process.env.ENV ?? 'development';
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (env === 'production' || env === 'staging') {
    app.set('trust proxy', 1);
  }

  app.use(helmet());
  app.enableCors({
    origin: corsOriginOption(env),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const port = Number(process.env.PORT ?? 5555);
  await app.listen(port);
}

void bootstrap();
