import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import {
  benefitEligibilityStatusPresentation,
  statusSemanticToChipColors,
} from '@planning-monefica/shared-types';
import { useGetSelfEligibilityQuery } from '../api/eligibilitySelfApi';
import {
  benefitStatusChipPtBr,
  benefitStatusLabelPtBr,
  messageForBenefitFetchError,
} from '../i18n/benefitPtBr';
import {
  PLANNING_MOBILE_RADIUS,
  PLANNING_MOBILE_SPACING,
  PLANNING_MOBILE_TYPE,
} from '../constants/theme';

const tenantId = process.env.EXPO_PUBLIC_TENANT_ID ?? '';

export function BenefitStatusCard() {
  const skip = !tenantId;
  const { data, isLoading, isError, isFetching, error } =
    useGetSelfEligibilityQuery({ tenantId }, { skip });

  if (!tenantId) {
    return (
      <View style={styles.cardMuted}>
        <Text style={styles.help}>
          Defina EXPO_PUBLIC_TENANT_ID e EXPO_PUBLIC_DEV_ACCESS_TOKEN (ou
          configure o cliente) para exibir o status do benefício.
        </Text>
      </View>
    );
  }

  if (isLoading || isFetching) {
    return (
      <View style={styles.card} accessibilityLabel="Carregando status do benefício">
        <ActivityIndicator />
        <Text style={styles.muted}>Carregando…</Text>
      </View>
    );
  }

  if (isError || !data) {
    const errChip = statusSemanticToChipColors('danger');
    return (
      <View style={[styles.card, styles.cardError]} accessibilityRole="alert">
        <View
          style={[styles.chipShell, { backgroundColor: errChip.backgroundColor }]}
        >
          <Text style={[styles.chipText, { color: errChip.color }]}>Erro</Text>
        </View>
        <Text style={styles.body}>{messageForBenefitFetchError(error)}</Text>
      </View>
    );
  }

  const chipColors = benefitEligibilityStatusPresentation(data.status);

  return (
    <View style={styles.card} accessibilityLabel="Status do benefício">
      <View
        style={[
          styles.chipShell,
          { backgroundColor: chipColors.backgroundColor },
        ]}
      >
        <Text style={[styles.chipText, { color: chipColors.color }]}>
          {benefitStatusChipPtBr[data.status]}
        </Text>
      </View>
      <Text style={styles.title}>Benefício de planejamento</Text>
      <Text style={styles.body}>{benefitStatusLabelPtBr[data.status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    padding: PLANNING_MOBILE_SPACING.lg,
    borderRadius: PLANNING_MOBILE_RADIUS.card,
    backgroundColor: '#f8f9fb',
    marginTop: PLANNING_MOBILE_SPACING.md,
    gap: PLANNING_MOBILE_SPACING.sm,
  },
  cardMuted: {
    width: '100%',
    maxWidth: 400,
    padding: PLANNING_MOBILE_SPACING.md,
    marginTop: PLANNING_MOBILE_SPACING.md,
  },
  cardError: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#f5c2c7',
  },
  title: {
    ...PLANNING_MOBILE_TYPE.title,
    color: '#1a1a1a',
  },
  body: {
    ...PLANNING_MOBILE_TYPE.body,
    color: '#333',
  },
  muted: {
    ...PLANNING_MOBILE_TYPE.meta,
    color: '#666',
    marginTop: PLANNING_MOBILE_SPACING.sm,
    textAlign: 'center',
  },
  help: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  chipShell: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: PLANNING_MOBILE_RADIUS.chip,
  },
  chipText: {
    ...PLANNING_MOBILE_TYPE.chip,
  },
});
