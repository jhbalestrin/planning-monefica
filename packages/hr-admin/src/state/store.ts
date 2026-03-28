import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Add feature slices as the app grows
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
