import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { EmployeeBookableSlotDto } from '@planning-monefica/shared-types';
import { bookingStatePresentation } from '@planning-monefica/shared-types';
import {
  useCancelBookingMutation,
  useCreateBookingMutation,
  useGetBookableSlotsQuery,
  useGetMyBookingsQuery,
  weekRangeUtc,
} from '../api/schedulingApi';
import { messageForBenefitFetchError } from '../i18n/benefitPtBr';
import {
  bookingConfirmationLinePtBr,
  bookingStateChipPtBr,
  messageForSchedulingErrorCode,
} from '../i18n/schedulingPtBr';
import {
  PLANNING_MIN_TOUCH_TARGET,
  PLANNING_MOBILE_RADIUS,
  PLANNING_MOBILE_SPACING,
  PLANNING_MOBILE_TYPE,
} from '../constants/theme';

const tenantId = process.env.EXPO_PUBLIC_TENANT_ID ?? '';

function extractErrorCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'data' in err) {
    const d = (err as { data?: { code?: string } }).data;
    return d?.code;
  }
  return undefined;
}

export function PlanningSessionsCard() {
  const skip = !tenantId;
  const range = useMemo(() => weekRangeUtc(), []);
  const [lastBooked, setLastBooked] = useState<string | null>(null);

  const slotsQ = useGetBookableSlotsQuery(
    { tenantId, fromUtc: range.fromUtc, toUtc: range.toUtc },
    { skip },
  );
  const bookingsQ = useGetMyBookingsQuery({ tenantId }, { skip });
  const [createBooking, createState] = useCreateBookingMutation();
  const [cancelBooking, cancelState] = useCancelBookingMutation();

  if (!tenantId) {
    return null;
  }

  if (slotsQ.isLoading || slotsQ.isFetching || bookingsQ.isLoading || bookingsQ.isFetching) {
    return (
      <View style={styles.card} accessibilityLabel="Carregando agendamentos">
        <ActivityIndicator />
        <Text style={styles.muted}>Carregando horários e sessões…</Text>
      </View>
    );
  }

  if (slotsQ.isError || bookingsQ.isError) {
    const err = slotsQ.error ?? bookingsQ.error;
    return (
      <View style={[styles.card, styles.cardError]} accessibilityRole="alert">
        <Text style={styles.title}>Agendamento</Text>
        <Text style={styles.body}>{messageForBenefitFetchError(err)}</Text>
      </View>
    );
  }

  const onPickSlot = (slot: EmployeeBookableSlotDto) => {
    const idem = `expo-${Date.now()}-${slot.consultantId}-${slot.startUtc}`;
    void createBooking({
      tenantId,
      consultantId: slot.consultantId,
      slotStartUtc: slot.startUtc,
      slotEndUtc: slot.endUtc,
      idempotencyKey: idem,
    })
      .unwrap()
      .then((b) => {
        const line = bookingConfirmationLinePtBr(b.slotStartUtc, b.slotEndUtc);
        setLastBooked(line);
        Alert.alert('Confirmado', `${line}\n\nRevise em Minhas sessões.`);
      })
      .catch((e) => {
        const code = extractErrorCode(e);
        Alert.alert('Não reservado', messageForSchedulingErrorCode(code));
      });
  };

  const onCancel = (bookingId: string) => {
    void cancelBooking({ tenantId, bookingId })
      .unwrap()
      .then(() => {
        Alert.alert('Cancelada', 'O horário foi liberado para outros.');
      })
      .catch((e) => {
        const code = extractErrorCode(e);
        Alert.alert('Cancelamento', messageForSchedulingErrorCode(code));
      });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Minhas sessões</Text>
      {lastBooked ? (
        <Text style={styles.confirmBanner} accessibilityLiveRegion="polite">
          {lastBooked}
        </Text>
      ) : null}
      <Text style={styles.sectionLabel}>Horários disponíveis (UTC)</Text>
      <FlatList
        data={slotsQ.data ?? []}
        keyExtractor={(item) => `${item.consultantId}-${item.startUtc}`}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.muted}>Nenhum horário nesta semana.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.slotRow}
            onPress={() => onPickSlot(item)}
            disabled={createState.isLoading}
            accessibilityRole="button"
            accessibilityLabel="Reservar horário"
          >
            <Text style={styles.slotText}>
              {item.startUtc.slice(0, 16)} — {item.endUtc.slice(0, 16)}
            </Text>
            <Text style={styles.slotMeta}>Consultor {item.consultantId.slice(-6)}</Text>
          </Pressable>
        )}
      />
      <Text style={[styles.sectionLabel, { marginTop: PLANNING_MOBILE_SPACING.md }]}>
        Suas reservas
      </Text>
      <FlatList
        data={bookingsQ.data ?? []}
        keyExtractor={(b) => b.id}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.muted}>Nenhuma sessão ainda.</Text>}
        renderItem={({ item }) => {
          const badgeColors = bookingStatePresentation(item.state);
          return (
            <View style={styles.bookingRow}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: badgeColors.backgroundColor },
                ]}
              >
                <Text style={[styles.badgeText, { color: badgeColors.color }]}>
                  {bookingStateChipPtBr[item.state]}
                </Text>
              </View>
              <Text style={styles.body}>
                {item.slotStartUtc.slice(0, 16)} → {item.slotEndUtc.slice(0, 16)} UTC
              </Text>
              {item.awaitingAssignment && item.state === 'confirmed' ? (
                <Text style={styles.pendingAdvisor}>Aguardando o consultor assumir a sessão.</Text>
              ) : null}
              {item.state === 'confirmed' ? (
                <Pressable
                  onPress={() => onCancel(item.id)}
                  disabled={cancelState.isLoading}
                  accessibilityRole="button"
                  style={styles.cancelHit}
                >
                  <Text style={styles.link}>Cancelar</Text>
                </Pressable>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    padding: PLANNING_MOBILE_SPACING.lg,
    borderRadius: PLANNING_MOBILE_RADIUS.card,
    backgroundColor: '#f0f4fa',
    marginTop: PLANNING_MOBILE_SPACING.md,
    gap: PLANNING_MOBILE_SPACING.sm,
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
  sectionLabel: {
    ...PLANNING_MOBILE_TYPE.section,
    color: '#333',
    marginTop: PLANNING_MOBILE_SPACING.xs,
  },
  body: { ...PLANNING_MOBILE_TYPE.bodySmall, color: '#333' },
  muted: { ...PLANNING_MOBILE_TYPE.meta, color: '#666' },
  slotRow: {
    minHeight: PLANNING_MIN_TOUCH_TARGET,
    paddingVertical: PLANNING_MOBILE_SPACING.sm,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  slotText: { fontSize: 15, fontWeight: '600', color: '#1a2744' },
  slotMeta: { fontSize: 12, color: '#555', marginTop: 2 },
  bookingRow: { marginTop: 10, gap: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { ...PLANNING_MOBILE_TYPE.chip, fontSize: 11 },
  pendingAdvisor: { fontSize: 12, color: '#856404', fontStyle: 'italic' },
  link: { ...PLANNING_MOBILE_TYPE.link, color: '#0d6efd' },
  cancelHit: {
    minHeight: PLANNING_MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: PLANNING_MOBILE_SPACING.xs,
  },
  confirmBanner: {
    ...PLANNING_MOBILE_TYPE.bodySmall,
    color: '#0f5132',
    backgroundColor: '#d1e7dd',
    padding: PLANNING_MOBILE_SPACING.sm,
    borderRadius: PLANNING_MOBILE_RADIUS.banner,
  },
});
