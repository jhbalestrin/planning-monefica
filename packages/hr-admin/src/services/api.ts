import axios from 'axios';
import type { HealthResponseDto } from '@planning-monefica/shared-types';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
});

export async function fetchHealth(): Promise<HealthResponseDto> {
  const { data } = await client.get<HealthResponseDto>('/api/v1/health');
  return data;
}
