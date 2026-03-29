/** Tenant scope for HR APIs: `VITE_TENANT_ID` or `localStorage.planning_monefica_hr_tenant_id`. */
export function resolveHrTenantId(): string {
  const fromEnv = import.meta.env.VITE_TENANT_ID;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim();
  }
  return localStorage.getItem('planning_monefica_hr_tenant_id')?.trim() ?? '';
}
