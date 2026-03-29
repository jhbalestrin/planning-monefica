import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useMemo } from 'react';
import { useGetMyCalendarQuery } from '../api/schedulingApi';
import { rangeLabelText, rollingWeekRangeUtc } from '../calendarRange';
import { SchedulingView } from '../components/SchedulingView';

function errorToMessage(err: unknown): string | null {
  if (!err) {
    return null;
  }
  const e = err as FetchBaseQueryError;
  if (typeof e.status === 'number') {
    return `Could not load scheduling data (HTTP ${e.status}). Sign in may be required.`;
  }
  return 'Could not load scheduling data.';
}

export function SchedulingContainer() {
  const range = useMemo(() => rollingWeekRangeUtc(), []);
  const { data, isLoading, isFetching, error } = useGetMyCalendarQuery(range);

  return (
    <SchedulingView
      loading={isLoading || isFetching}
      errorMessage={errorToMessage(error)}
      summary={data ?? null}
      rangeLabel={rangeLabelText(range)}
    />
  );
}
