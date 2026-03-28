import { Injectable } from '@nestjs/common';
import { formatISO } from 'date-fns';
import type { HealthResponseDto } from './health.interface';

@Injectable()
export class HealthService {
  getStatus(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: formatISO(new Date()),
    };
  }
}
