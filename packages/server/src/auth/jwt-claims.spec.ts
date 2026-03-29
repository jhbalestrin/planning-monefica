import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import type { AccessTokenPayload } from '@planning-monefica/shared-types';

const SECRET = 'unit-test-jwt-secret-min-32-chars!!';

describe('Access JWT claims (Epic 2.1)', () => {
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: SECRET,
          signOptions: { expiresIn: 120 },
        }),
      ],
    }).compile();
    jwt = module.get(JwtService);
  });

  it('round-trips tenant collaborator payload', async () => {
    const payload: AccessTokenPayload = {
      sub: new Types.ObjectId().toString(),
      roles: ['collaborator'],
      tenantId: new Types.ObjectId().toString(),
      aud: 'ic-app',
      principalType: 'tenant_user',
    };
    const token = await jwt.signAsync({ ...payload });
    const decoded = await jwt.verifyAsync<AccessTokenPayload>(token, {
      secret: SECRET,
    });
    expect(decoded).toMatchObject(payload);
  });

  it('round-trips planning_consultant + AD-SCHED-001 scope hints', async () => {
    const payload: AccessTokenPayload = {
      sub: new Types.ObjectId().toString(),
      roles: ['planning_consultant'],
      aud: 'control-pane',
      principalType: 'platform_user',
      serveAllTenants: false,
      tenantScope: [new Types.ObjectId().toString()],
    };
    const token = await jwt.signAsync({ ...payload });
    const decoded = await jwt.verifyAsync<AccessTokenPayload>(token, {
      secret: SECRET,
    });
    expect(decoded).toMatchObject(payload);
  });
});
