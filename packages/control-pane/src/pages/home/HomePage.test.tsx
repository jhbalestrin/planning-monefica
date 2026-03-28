import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { store } from '../../state/store';
import { HomePage } from './HomePage';

vi.mock('./api/healthApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/healthApi')>();
  return {
    ...actual,
    useGetHealthQuery: vi.fn(() => ({
      data: {
        status: 'ok',
        timestamp: '2026-01-01T00:00:00.000Z',
      },
      error: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
    })),
  };
});

describe('HomePage (home module)', () => {
  it('renders title', () => {
    const router = createMemoryRouter([{ path: '/', element: <HomePage /> }], {
      initialEntries: ['/'],
    });
    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );
    expect(screen.getByRole('heading', { name: /Control Pane/i })).toBeInTheDocument();
  });
});
