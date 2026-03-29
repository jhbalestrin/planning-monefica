/**
 * Shared API contracts (DTOs, enums). Server and clients should align on these shapes.
 */
export * from './auth';
export * from './eligibility';
export * from './planningUxTokens';
export * from './scheduling';
export * from './statusPresentation';

export interface HealthResponseDto {
  status: string;
  timestamp: string;
}
