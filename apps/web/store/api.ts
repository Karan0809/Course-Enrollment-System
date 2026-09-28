import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { AdminDashboardSummary, AdminEnrollment, ApiSuccess, AuthResponseData, CourseSummary, CreateAdminUserRequest, CreateCourseRequest, CreateEnrollmentResponse, CurrentUserResponse, LoginRequest, RegisterRequest, StudentEnrollment, TeacherCourseStudent, UpdateAdminUserRequest, UpdateCourseRequest, UserSummary } from '../types/api';
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
      providesTags: ['Courses'],
    }),
    listAdminCourses: builder.query<CourseSummary[], void>({
      query: () => 'courses',
      transformResponse: (response: ApiSuccess<CourseSummary[]>) => response.data,
      providesTags: ['Courses'],
    }),
    getTeacherCourses: builder.query<CourseSummary[], void>({
      query: () => 'teacher/courses',
      transformResponse: (response: ApiSuccess<CourseSummary[]>) => response.data,
      providesTags: ['TeacherCourses'],
    }),
    getTeacherCourseStudents: builder.query<TeacherCourseStudent[], string>({
      query: (id) => `teacher/courses/${id}/students`,
      transformResponse: (response: ApiSuccess<{ enrollments: TeacherCourseStudent[] }>) => response.data.enrollments,
      providesTags: (_result, _error, id) => [{ type: 'TeacherCourseStudents', id }],
    }),
    getAdminEnrollments: builder.query<AdminEnrollment[], void>({
      query: () => 'admin/enrollments',
      transformResponse: (response: ApiSuccess<{ enrollments: AdminEnrollment[] }>) => response.data.enrollments,
      providesTags: ['AdminEnrollments'],
    }),
    getCourse: builder.query<CourseSummary, string>({
      query: (id) => `courses/${id}`,
      transformResponse: (response: ApiSuccess<CourseSummary>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Courses', id }],
    }),
    enrollInCourse: builder.mutation<CreateEnrollmentResponse, string>({
      query: (courseId) => ({ url: `courses/${courseId}/enroll`, method: 'POST' }),
      transformResponse: (response: ApiSuccess<CreateEnrollmentResponse>) => response.data,
      invalidatesTags: (_result, _error, courseId) => ['MyEnrollments', 'AdminEnrollments', { type: 'TeacherCourseStudents', id: courseId }],
    }),
    getMyEnrollments: builder.query<StudentEnrollment[], void>({
      query: () => 'students/me/enrollments',
      transformResponse: (response: ApiSuccess<{ enrollments: StudentEnrollment[] }>) => response.data.enrollments,
      providesTags: ['MyEnrollments'],
    }),
    createCourse: builder.mutation<CourseSummary, CreateCourseRequest>({
      query: (body) => ({ url: 'courses', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<CourseSummary>) => response.data,
      invalidatesTags: ['Courses'],
    }),
    updateCourse: builder.mutation<CourseSummary, { id: string; body: UpdateCourseRequest }>({
      query: ({ id, body }) => ({ url: `courses/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<CourseSummary>) => response.data,
      invalidatesTags: (_result, _error, { id }) => ['Courses', 'TeacherCourses', { type: 'Courses', id }],
    }),
    deleteCourse: builder.mutation<Record<string, never>, string>({
      query: (id) => ({ url: `courses/${id}`, method: 'DELETE' }),
      transformResponse: (response: ApiSuccess<Record<string, never>>) => response.data,
      invalidatesTags: (_result, _error, id) => ['Courses', { type: 'Courses', id }],
    }),
    getAdminDashboardSummary: builder.query<AdminDashboardSummary, void>({
      query: () => 'admin/dashboard/summary',
      transformResponse: (response: ApiSuccess<AdminDashboardSummary>) => response.data,
    }),
    listAdminUsers: builder.query<UserSummary[], { role?: string; isActive?: string }>({
      query: (params) => ({ url: 'admin/users', params }),
      transformResponse: (response: ApiSuccess<UserSummary[]>) => response.data,
      providesTags: ['AdminUsers'],
    }),
    getAdminUser: builder.query<UserSummary, string>({
      query: (id) => `admin/users/${id}`,
      transformResponse: (response: ApiSuccess<UserSummary>) => response.data,
    }),
    createAdminUser: builder.mutation<UserSummary, CreateAdminUserRequest>({
      query: (body) => ({ url: 'admin/users', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<UserSummary>) => response.data,
      invalidatesTags: ['AdminUsers'],
    }),
    updateAdminUser: builder.mutation<UserSummary, { id: string; body: UpdateAdminUserRequest }>({
      query: ({ id, body }) => ({ url: `admin/users/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<UserSummary>) => response.data,
      invalidatesTags: ['AdminUsers'],
    }),
    deactivateAdminUser: builder.mutation<UserSummary, string>({
      query: (id) => ({ url: `admin/users/${id}`, method: 'DELETE' }),
      transformResponse: (response: ApiSuccess<UserSummary>) => response.data,
      invalidatesTags: ['AdminUsers'],
    }),
  }),
  tagTypes: ['AdminUsers', 'Courses', 'TeacherCourses', 'MyEnrollments', 'TeacherCourseStudents', 'AdminEnrollments'],
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useListCoursesQuery,
  useListAdminCoursesQuery,
  useGetTeacherCoursesQuery,
  useGetTeacherCourseStudentsQuery,
  useGetAdminEnrollmentsQuery,
  useGetCourseQuery,
  useEnrollInCourseMutation,
  useGetMyEnrollmentsQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetAdminDashboardSummaryQuery,
  useListAdminUsersQuery,
  useGetAdminUserQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeactivateAdminUserMutation,
} = apiSlice;
