import { configureStore } from '@reduxjs/toolkit';
import { eligibilitySelfApi } from '../api/eligibilitySelfApi';
import { schedulingApi } from '../api/schedulingApi';

export const store = configureStore({
  reducer: {
    [eligibilitySelfApi.reducerPath]: eligibilitySelfApi.reducer,
    [schedulingApi.reducerPath]: schedulingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(eligibilitySelfApi.middleware, schedulingApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
