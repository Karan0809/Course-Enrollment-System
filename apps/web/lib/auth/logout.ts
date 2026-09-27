import type { AppDispatch } from '../../store';
import { apiSlice } from '../../store/api';
import { setUnauthenticated } from '../../store/slices/authSlice';
import { clearPersistedAccessToken } from './storage';

export function clearClientSession(dispatch: AppDispatch): void {
  clearPersistedAccessToken();
  dispatch(setUnauthenticated());
  dispatch(apiSlice.util.resetApiState());
}