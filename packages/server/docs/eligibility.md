# Eligibility (Epic 3)

**Collections:** `employee_eligibility` (unique `tenantId` + `userId`), `eligibility_audit_events` (ELIG-FR5 / ELIG-NFR2).

**HR APIs** (Bearer + `hr-admin` + `hr_admin` + path `tenantId` = JWT `tenantId`): see `packages/server/docs/auth.md` route table; list `GET .../eligibility`, collaborators picker `GET .../eligibility/collaborators?excludeEligible=true`, `POST .../eligibility`, `DELETE .../eligibility/:userId`.

**IC collaborator (Epic 4):** same IC guard stack as `ic/tenants/:tenantId/ping`, then  
`GET .../ic/tenants/:tenantId/me/eligibility` → `EligibilitySelfStatusDto`;  
`GET .../ic/tenants/:tenantId/benefit/ping` → adds **`BenefitEligibilityGuard`** (active collaborator + eligibility row + no `passwordSetRequired`). Denials use **`BenefitErrorCodes`** in JSON (`BENEFIT_NOT_ELIGIBLE`, `BENEFIT_ACCOUNT_INACTIVE`, `BENEFIT_ONBOARDING_PENDING`).

**Cross-module rule:** Eligibility owns its schemas; tenant user validation goes through `TenantUserLookupService` in `auth` (no eligibility imports of `tenant-user.schema`).
