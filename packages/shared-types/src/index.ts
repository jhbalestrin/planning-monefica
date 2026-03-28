/**
 * Shared API contracts (DTOs, enums). Server and clients should align on these shapes.
 */
export interface HealthResponseDto {
  status: string;
  timestamp: string;
}
