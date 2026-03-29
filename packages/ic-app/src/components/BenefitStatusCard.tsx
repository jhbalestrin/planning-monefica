import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useGetSelfEligibilityQuery } from '../api/eligibilitySelfApi';
import {
  benefitStatusChipPtBr,
  benefitStatusLabelPtBr,
  messageForBenefitFetchError,
} from '../i18n/benefitPtBr';

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
    return (
      <View style={[styles.card, styles.cardError]} accessibilityRole="alert">
        <Text style={styles.chip}>Erro</Text>
        <Text style={styles.body}>{messageForBenefitFetchError(error)}</Text>
      </View>
    );
  }

  const chipColors =
    data.status === 'eligible'
      ? styles.chipEligible
      : data.status === 'pending'
        ? styles.chipPending
        : styles.chipNotEligible;

  return (
    <View style={styles.card} accessibilityLabel="Status do benefício">
      <View style={[styles.chip, chipColors]}>
        <Text style={styles.chipText}>{benefitStatusChipPtBr[data.status]}</Text>
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
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f8f9fb',
    marginTop: 16,
    gap: 10,
  },
  cardMuted: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
    marginTop: 16,
  },
  cardError: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#f5c2c7',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  muted: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  help: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  chipEligible: { backgroundColor: '#1b7f3a' },
  chipPending: { backgroundColor: '#b8860b' },
  chipNotEligible: { backgroundColor: '#6c757d' },
});
