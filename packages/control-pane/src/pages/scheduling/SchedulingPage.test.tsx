import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { store } from '../../state/store';
import { SchedulingPage } from './SchedulingPage';

vi.mock('./api/schedulingApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/schedulingApi')>();
  return {
    ...actual,
    useGetMyCalendarQuery: vi.fn(() => ({
      data: {
        fromUtc: '2026-01-01T00:00:00.000Z',
        toUtc: '2026-01-08T00:00:00.000Z',
        availability: [
          {
            id: 'a1',
            tenantId: '507f1f77bcf86cd799439011',
            consultantId: '507f1f77bcf86cd799439012',
            startUtc: '2026-01-02T10:00:00.000Z',
            endUtc: '2026-01-02T12:00:00.000Z',
          },
        ],
        bookings: [],
      },
      error: undefined,
      isLoading: false,
      isFetching: false,
    })),
  };
});

describe('SchedulingPage', () => {
  it('renders scheduling heading and availability section', () => {
    const router = createMemoryRouter(
      [{ path: '/scheduling', element: <SchedulingPage /> }],
      { initialEntries: ['/scheduling'] },
    );
    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );
    expect(screen.getByRole('heading', { name: /Scheduling/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Availability/i })).toBeInTheDocument();
  });
});
