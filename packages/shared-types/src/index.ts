/**
 * Shared API contracts (DTOs, enums). Server and clients should align on these shapes.
 */
export * from './auth';
export * from './eligibility';

export interface HealthResponseDto {
  status: string;
  timestamp: string;
}
