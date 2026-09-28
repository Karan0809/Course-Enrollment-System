'use client';

import Link from 'next/link';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../../lib/api/errorMessage';
import { useListCoursesQuery } from '../../../store/api';

export default function CoursesPage() {
  const query = useListCoursesQuery();
  if (query.isLoading) return <LoadingState label="Loading the course catalogue" />;
  if (query.error) return <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  if (!query.data?.length) return <section className="page-intro"><span className="eyebrow">Course catalogue</span><h1>Find your next subject.</h1><EmptyState title="No courses available yet" description="Published, active courses will appear here." /></section>;
  return <section className="page-intro max-w-none"><span className="eyebrow">Course catalogue</span><h1>Find your next subject.</h1><div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{query.data.map((course) => <article className="flex flex-col rounded border border-slate-200 bg-white p-6" key={course._id}><div className="flex items-start justify-between gap-3"><h2 className="font-serif text-2xl text-emerald-950">{course.title}</h2><span className="shrink-0 rounded-full bg-lime-100 px-3 py-1 text-xs capitalize text-emerald-900">{course.level}</span></div><p className="mt-3 line-clamp-4 flex-1 text-sm leading-6 text-slate-600">{course.description}</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600"><span>{course.duration} hours</span><span>{course.isFree ? 'Free' : course.price}</span></div><Link className="button button-secondary mt-5 self-start" href={`/courses/${course._id}`}>View course</Link></article>)}</div></section>;
}
