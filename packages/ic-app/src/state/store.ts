import { configureStore } from '@reduxjs/toolkit';
import { eligibilitySelfApi } from '../api/eligibilitySelfApi';

export const store = configureStore({
  reducer: {
    [eligibilitySelfApi.reducerPath]: eligibilitySelfApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(eligibilitySelfApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
