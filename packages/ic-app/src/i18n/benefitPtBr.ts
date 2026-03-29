import type { BenefitEligibilityStatus } from '@planning-monefica/shared-types';
import { BenefitErrorCodes } from '@planning-monefica/shared-types';

/** UX-DR1 / UX-DR5 — short status copy for home card. */
export const benefitStatusLabelPtBr: Record<BenefitEligibilityStatus, string> = {
  eligible: 'Você está elegível ao benefício de planejamento financeiro.',
  not_eligible:
    'Você ainda não está na lista de elegíveis. Fale com o RH da sua empresa.',
  pending: 'Conclua a configuração da sua senha (convite) para continuar.',
};

/** UX-DR2 — map server `code` to user-facing pt-BR. */
export const benefitErrorMessagePtBr: Record<string, string> = {
  [BenefitErrorCodes.NOT_ELIGIBLE]:
    'Sem acesso ao benefício no momento. Em caso de dúvida, contate o RH.',
  [BenefitErrorCodes.ACCOUNT_INACTIVE]:
    'Conta inativa. Entre em contato com o RH se precisar de acesso.',
  [BenefitErrorCodes.ONBOARDING_PENDING]:
    'Finalize a configuração da sua senha antes de usar o benefício.',
  default: 'Não foi possível carregar o status. Verifique a conexão e tente de novo.',
};

export function messageForBenefitFetchError(err: unknown): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { code?: string } }).data;
    const code = data?.code;
    if (code && benefitErrorMessagePtBr[code]) {
      return benefitErrorMessagePtBr[code];
    }
  }
  return benefitErrorMessagePtBr.default;
}

/** Chip/badge label (UX-DR6). */
export const benefitStatusChipPtBr: Record<BenefitEligibilityStatus, string> = {
  eligible: 'Elegível',
  not_eligible: 'Não elegível',
  pending: 'Pendente',
};
