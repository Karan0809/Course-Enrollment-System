'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '../../../../../components/auth/ProtectedRoute';
import { ErrorState } from '../../../../../components/ui/ErrorState';
import { LoadingState } from '../../../../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../../../../lib/api/errorMessage';
import { useGetCourseQuery } from '../../../../../store/api';
import { CourseForm } from '../../CourseForm';

function EditCourse() {
  const params = useParams<{ id: string }>();
  const query = useGetCourseQuery(params.id);
  if (query.isLoading) return <LoadingState label="Loading course" />;
  if (query.error || !query.data) return <ErrorState title="Unable to load course" message={getApiErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  return <section className="page-intro"><span className="eyebrow">Administration</span><h1>Edit course</h1><CourseForm course={query.data} /></section>;
}
export default function EditAdminCoursePage() { return <ProtectedRoute roles={['admin']}><EditCourse /></ProtectedRoute>; }
