'use client';

import Link from 'next/link';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../../lib/api/errorMessage';
import { useGetTeacherCoursesQuery } from '../../../store/api';

function AssignedCourses() {
  const query = useGetTeacherCoursesQuery();
  if (query.isLoading) return <LoadingState label="Loading assigned courses" />;
  if (query.error) return <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  if (!query.data?.length) return <section className="page-intro"><span className="eyebrow">Teaching</span><h1>Assigned courses</h1><EmptyState title="No courses assigned" description="Courses assigned to you by an administrator will appear here." /></section>;
  return <section className="page-intro max-w-none"><span className="eyebrow">Teaching</span><h1>Assigned courses</h1><div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">{query.data.map((course) => <article className="rounded border border-slate-200 bg-white p-6" key={course._id}><div className="flex flex-wrap items-start justify-between gap-3"><h2 className="font-serif text-2xl text-emerald-950">{course.title}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-700">{course.status}</span></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{course.description}</p><dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Level</dt><dd className="mt-1 capitalize">{course.level}</dd></div><div><dt className="text-slate-500">Duration</dt><dd className="mt-1">{course.duration} hours</dd></div><div><dt className="text-slate-500">Price</dt><dd className="mt-1">{course.isFree ? 'Free' : course.price}</dd></div><div><dt className="text-slate-500">Availability</dt><dd className="mt-1">{course.isActive ? 'Active' : 'Inactive'}</dd></div></dl><Link className="button button-secondary mt-5" href={`/teacher/courses/${course._id}`}>View course</Link></article>)}</div></section>;
}
export default function TeacherCoursesPage() { return <ProtectedRoute roles={['teacher']}><AssignedCourses /></ProtectedRoute>; }
