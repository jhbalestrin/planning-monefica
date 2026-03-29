import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const fromHeader =
      req.header('x-request-id') ?? req.header('x-correlation-id');
    const correlationId = fromHeader?.trim() || randomUUID();
    (req as Request & { correlationId: string }).correlationId =
      correlationId;
    res.setHeader('X-Request-Id', correlationId);
    next();
  }
}
