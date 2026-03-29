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
