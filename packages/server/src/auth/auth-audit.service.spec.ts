import { Logger } from '@nestjs/common';
import { AuthAuditService } from './auth-audit.service';

describe('AuthAuditService', () => {
  it('emits one JSON line with event, correlationId, ts', () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const audit = new AuthAuditService();
    audit.log('auth.logout', 'corr-abc', { matched: 1 });
    const line = logSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(parsed.event).toBe('auth.logout');
    expect(parsed.correlationId).toBe('corr-abc');
    expect(parsed.matched).toBe(1);
    expect(typeof parsed.ts).toBe('string');
    logSpy.mockRestore();
  });
});
