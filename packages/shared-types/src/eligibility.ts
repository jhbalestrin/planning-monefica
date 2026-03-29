/** Employee-facing benefit eligibility (ELIG-FR6, UX-DR6). */
export type BenefitEligibilityStatus = 'eligible' | 'not_eligible' | 'pending';

export interface EligibilitySelfStatusDto {
  status: BenefitEligibilityStatus;
}

/**
 * Benefit API denials — stable codes for ic-app pt-BR mapping (ELIG-FR7/8, ELIG-NFR3/6, UX-DR2).
 */
export const BenefitErrorCodes = {
  NOT_ELIGIBLE: 'BENEFIT_NOT_ELIGIBLE',
  ACCOUNT_INACTIVE: 'BENEFIT_ACCOUNT_INACTIVE',
  ONBOARDING_PENDING: 'BENEFIT_ONBOARDING_PENDING',
} as const;

export type BenefitErrorCode =
  (typeof BenefitErrorCodes)[keyof typeof BenefitErrorCodes];

/** HR eligibility list row (ELIG-FR1). */
export interface EligibilityListItemDto {
  userId: string;
  email: string;
  updatedAt: string;
  updatedBySub: string;
}

/** Collaborator picker option (tenant-scoped). */
export interface EligibilityCollaboratorOptionDto {
  userId: string;
  email: string;
}

export interface EligibilityMarkRequestDto {
  userId: string;
}
