import { useMemo } from 'react';
import { useGetHealthQuery } from '../api/healthApi';
import { HomeView } from '../components/HomeView';

const DEFAULT_API_ERROR =
  'Could not reach API. Is the server running on port 5555?';

export function HomeContainer() {
  const { data, error, isLoading, isFetching, isError } = useGetHealthQuery();

  const errorMessage = useMemo(() => {
    if (!isError) {
      return null;
    }
    if (
      error &&
      typeof error === 'object' &&
      'data' in error &&
      error.data &&
      typeof error.data === 'object' &&
      'message' in error.data &&
      typeof (error.data as { message: unknown }).message === 'string'
    ) {
      return (error.data as { message: string }).message;
    }
    return DEFAULT_API_ERROR;
  }, [isError, error]);

  return (
    <HomeView
      loading={isLoading || isFetching}
      errorMessage={errorMessage}
      health={data ?? null}
    />
  );
}
