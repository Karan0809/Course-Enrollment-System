'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { ErrorState } from '../../../../components/ui/ErrorState';
import { LoadingState } from '../../../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../../../lib/api/errorMessage';
import { useGetCourseQuery } from '../../../../store/api';
import { useAppSelector } from '../../../../store/hooks';
import { TeacherCourseForm } from './TeacherCourseForm';

function AssignedCourseDetail() {
  const params = useParams<{ id: string }>();
  const query = useGetCourseQuery(params.id);
  const teacher = useAppSelector((state) => state.auth.user);
  if (query.isLoading) return <LoadingState label="Loading course" />;
  if (query.error || !query.data) return <ErrorState title="Unable to load course" message={getApiErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  const course = query.data;
  return <section className="page-intro"><Link className="text-link" href="/teacher/courses">← Assigned courses</Link><div className="mt-6"><span className="eyebrow">Assigned course</span><h1>{course.title}</h1></div><dl className="mt-6 grid max-w-2xl grid-cols-2 gap-4 rounded border border-slate-200 bg-white p-6 text-sm"><div><dt className="text-slate-500">Teacher</dt><dd className="mt-1">{teacher?.name ?? 'You'}</dd></div><div><dt className="text-slate-500">Level</dt><dd className="mt-1 capitalize">{course.level}</dd></div><div><dt className="text-slate-500">Duration</dt><dd className="mt-1">{course.duration} hours</dd></div><div><dt className="text-slate-500">Price</dt><dd className="mt-1">{course.isFree ? 'Free' : course.price}</dd></div><div><dt className="text-slate-500">Status</dt><dd className="mt-1 capitalize">{course.status}</dd></div><div><dt className="text-slate-500">Availability</dt><dd className="mt-1">{course.isActive ? 'Active' : 'Inactive'}</dd></div></dl><div className="mt-6"><Link className="button button-secondary" href={`/teacher/courses/${course._id}/students`}>View enrolled students</Link></div><TeacherCourseForm course={course} /></section>;
}
export default function TeacherCoursePage() { return <ProtectedRoute roles={['teacher']}><AssignedCourseDetail /></ProtectedRoute>; }
