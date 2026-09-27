import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ApiSuccess, AuthResponseData, CourseSummary, CurrentUserResponse, LoginRequest, RegisterRequest } from '../types/api';
import type { AuthUser } from './slices/authSlice';
import { clearPersistedAccessToken, persistAccessToken } from '../lib/auth/storage';
import { setCurrentUser, setSession, setUnauthenticated } from './slices/authSlice';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl ? `${apiBaseUrl.replace(/\/$/, '')}/api/` : '/api/',
  prepareHeaders: (headers, { getState }) => {
    const authState = (getState() as { auth?: { token?: string | null } }).auth;
    if (authState?.token) headers.set('Authorization', `Bearer ${authState.token}`);
    return headers;
  },
});

const baseQueryWithSession: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const isCredentialRequest = api.endpoint === 'login' || api.endpoint === 'register';

  if (result.error?.status === 401 && !isCredentialRequest) {
    clearPersistedAccessToken();
    api.dispatch(setUnauthenticated());
    api.dispatch(apiSlice.util.resetApiState());
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithSession,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponseData, LoginRequest>({
      query: (body) => ({ url: 'auth/login', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<AuthResponseData>) => response.data,
      async onQueryStarted(_request, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          persistAccessToken(data.token);
          dispatch(setSession(data));
        } catch {
          // The form presents the RTK Query error to the user.
        }
      },
    }),
    register: builder.mutation<AuthResponseData, RegisterRequest>({
      query: (body) => ({ url: 'auth/register', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<AuthResponseData>) => response.data,
      async onQueryStarted(_request, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          persistAccessToken(data.token);
          dispatch(setSession(data));
        } catch {
          // The form presents the RTK Query error to the user.
        }
      },
    }),
    getCurrentUser: builder.query<AuthUser, void>({
      query: () => 'auth/me',
      transformResponse: (response: CurrentUserResponse) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUser(data));
        } catch {
          // Session invalidation is handled by the shared base query.
        }
      },
    }),
    listCourses: builder.query<CourseSummary[], void>({
      query: () => 'courses',
      transformResponse: (response: ApiSuccess<CourseSummary[]>) => response.data,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useListCoursesQuery,
} = apiSlice;
