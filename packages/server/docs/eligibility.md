# Eligibility (Epic 3)

**Collections:** `employee_eligibility` (unique `tenantId` + `userId`), `eligibility_audit_events` (ELIG-FR5 / ELIG-NFR2).

**HR APIs** (Bearer + `hr-admin` + `hr_admin` + path `tenantId` = JWT `tenantId`): see `packages/server/docs/auth.md` route table; list `GET .../eligibility`, collaborators picker `GET .../eligibility/collaborators?excludeEligible=true`, `POST .../eligibility`, `DELETE .../eligibility/:userId`.

**Cross-module rule:** Eligibility owns its schemas; tenant user validation goes through `TenantUserLookupService` in `auth` (no eligibility imports of `tenant-user.schema`).
