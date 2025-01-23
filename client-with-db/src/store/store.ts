import { configureStore } from "@reduxjs/toolkit";
import customerAuthReducer from "./slices/customerAuthSlice";

const store = configureStore({
  reducer: {
    customerAuth: customerAuthReducer,
    // ... other reducers
  },
});

// Export store type utilities
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store as default instead of named export
export default store;
