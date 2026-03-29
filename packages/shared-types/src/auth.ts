/** Client surfaces (AUTH-FR3 / app matrix). */
export type AuthClientId = 'ic-app' | 'hr-admin' | 'control-pane';

/** Logical roles from PRD. */
export type AuthRole =
  | 'collaborator'
  | 'hr_admin'
  | 'platform_admin'
  | 'planning_consultant';

export type PrincipalType = 'tenant_user' | 'platform_user';

/** Stable API error codes for auth flows. */
export const AuthErrorCodes = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NOT_AUTHORIZED_FOR_CLIENT: 'NOT_AUTHORIZED_FOR_CLIENT',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  SIGN_IN_FAILED: 'SIGN_IN_FAILED',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVITE_INVALID: 'INVITE_INVALID',
  RESET_INVALID: 'RESET_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

export type AuthErrorCode =
  (typeof AuthErrorCodes)[keyof typeof AuthErrorCodes];

/** Access JWT payload (AD-AUTH-001 / AD-AUTH-002). */
export interface AccessTokenPayload {
  sub: string;
  roles: AuthRole[];
  tenantId?: string;
  aud: AuthClientId;
  principalType: PrincipalType;
  /** planning_consultant scope (AD-SCHED-001); omit for tenant users. */
  serveAllTenants?: boolean;
  tenantScope?: string[];
}

export interface AuthLoginRequestDto {
  email: string;
  password: string;
  clientId: AuthClientId;
}

export interface AuthTokenPairResponseDto {
  accessToken: string;
  accessExpiresInSec: number;
  refreshToken: string;
  refreshExpiresInSec: number;
  tokenType: 'Bearer';
}

export interface AuthRefreshRequestDto {
  refreshToken: string;
}

export interface AuthLogoutRequestDto {
  refreshToken: string;
}

export interface AuthChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface AuthRequestResetRequestDto {
  email: string;
  clientId: AuthClientId;
}

export interface AuthConfirmResetRequestDto {
  token: string;
  newPassword: string;
}

export interface AuthAcceptInviteRequestDto {
  token: string;
  newPassword: string;
}

export interface AuthMeResponseDto {
  sub: string;
  roles: AuthRole[];
  tenantId?: string;
  aud: AuthClientId;
  principalType: PrincipalType;
  serveAllTenants?: boolean;
  tenantScope?: string[];
}
