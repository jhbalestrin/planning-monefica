import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { store } from '../../state/store';
import { SchedulingQueuePage } from './SchedulingQueuePage';

vi.mock('./api/schedulingQueueApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/schedulingQueueApi')>();
  return {
    ...actual,
    useGetAssignmentQueueQuery: vi.fn(() => ({
      data: [],
      error: undefined,
      isLoading: false,
      isFetching: false,
    })),
    useGetOpenAssignedBookingsQuery: vi.fn(() => ({
      data: [],
      error: undefined,
      isLoading: false,
      isFetching: false,
    })),
    useAssignBookingMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useCloseBookingMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  };
});

describe('SchedulingQueuePage', () => {
  it('renders queue heading (UX-DR8)', () => {
    const router = createMemoryRouter(
      [{ path: '/scheduling/queue', element: <SchedulingQueuePage /> }],
      { initialEntries: ['/scheduling/queue'] },
    );
    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );
    expect(screen.getByRole('heading', { name: /Fila de atribuição/i })).toBeInTheDocument();
    expect(screen.getByText(/Aguardando Assumir/i)).toBeInTheDocument();
  });
});
