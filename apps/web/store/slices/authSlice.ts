import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserRole } from '@course-enrollment-system/contracts';

export type AuthUser = {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  hydrationError: string | null;
};

const initialState: AuthState = {
  token: null,
  user: null,
  status: 'unknown',
  hydrationError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    restoreToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.user = null;
      state.status = 'unknown';
      state.hydrationError = null;
    },
    setSession(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = 'authenticated';
      state.hydrationError = null;
    },
    setCurrentUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = 'authenticated';
      state.hydrationError = null;
    },
    setUnauthenticated(state) {
      state.token = null;
      state.user = null;
      state.status = 'unauthenticated';
      state.hydrationError = null;
    },
    setHydrationError(state, action: PayloadAction<string>) {
      state.hydrationError = action.payload;
    },
  },
});

export const {
  restoreToken,
  setSession,
  setCurrentUser,
  setUnauthenticated,
  setHydrationError,
} = authSlice.actions;

export default authSlice.reducer;