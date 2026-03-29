import { Injectable, Logger } from '@nestjs/common';

export type AuthAuditEvent =
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.password.change'
  | 'auth.password.reset_requested'
  | 'auth.password.reset_completed'
  | 'auth.refresh'
  | 'auth.logout';

@Injectable()
export class AuthAuditService {
  private readonly logger = new Logger(AuthAuditService.name);

  log(
    event: AuthAuditEvent,
    correlationId: string | undefined,
    payload: Record<string, unknown>,
  ): void {
    const line = JSON.stringify({
      event,
      correlationId: correlationId ?? null,
      ts: new Date().toISOString(),
      ...payload,
    });
    this.logger.log(line);
  }
}
