'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { CourseLevel, CourseStatus } from '@course-enrollment-system/contracts';
import type { CourseSummary } from '../../../types/api';
import { getApiErrorMessage } from '../../../lib/api/errorMessage';
import { useCreateCourseMutation, useListAdminUsersQuery, useUpdateCourseMutation } from '../../../store/api';

export function CourseForm({ course }: { course?: CourseSummary }) {
  const router = useRouter();
  const teachersQuery = useListAdminUsersQuery({ role: 'teacher', isActive: 'true' });
  const [create, createState] = useCreateCourseMutation();
  const [update, updateState] = useUpdateCourseMutation();
  const busy = createState.isLoading || updateState.isLoading;
  const [title, setTitle] = useState(course?.title ?? '');
  const [description, setDescription] = useState(course?.description ?? '');
  const [teacherId, setTeacherId] = useState(course?.teacherId ?? '');
  const [price, setPrice] = useState(String(course?.price ?? 0));
  const [isFree, setIsFree] = useState(course?.isFree ?? true);
  const [duration, setDuration] = useState(String(course?.duration ?? ''));
  const [level, setLevel] = useState<CourseLevel>(course?.level ?? 'beginner');
  const [status, setStatus] = useState<CourseStatus>(course?.status ?? 'draft');
  const [isActive, setIsActive] = useState(course?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    const numericPrice = Number(price);
    const numericDuration = Number(duration);
    if (!title.trim()) next.title = 'Title is required.';
    if (!description.trim()) next.description = 'Description is required.';
    if (!teacherId) next.teacherId = 'Assign an active teacher.';
    if (!Number.isFinite(numericPrice) || numericPrice < 0) next.price = 'Price must be zero or greater.';
    if (isFree && numericPrice !== 0) next.price = 'Free courses must have a price of 0.';
    if (!duration || !Number.isFinite(numericDuration) || numericDuration <= 0) next.duration = 'Duration must be a positive number.';
    setErrors(next); setApiError(''); setMessage('');
    if (Object.keys(next).length || teachersQuery.isLoading || !teachersQuery.data?.some((teacher) => teacher._id === teacherId)) {
      if (!next.teacherId && !teachersQuery.data?.some((teacher) => teacher._id === teacherId)) setErrors({ ...next, teacherId: 'Choose an active teacher.' });
      return;
    }
    const body = { title: title.trim(), description: description.trim(), teacherId, price: numericPrice, isFree, duration: numericDuration, level, status, ...(course ? { isActive } : {}) };
    try {
      if (course) await update({ id: course._id, body }).unwrap();
      else await create(body).unwrap();
      setMessage(course ? 'Course updated successfully. Returning to courses…' : 'Course created successfully. Returning to courses…');
      window.setTimeout(() => router.push('/admin/courses'), 650);
    } catch (error) { setApiError(getApiErrorMessage(error)); }
  };

  const textField = (id: string, label: string, value: string, change: (value: string) => void, type = 'text') => <label className="field" key={id}>{label}<input aria-invalid={!!errors[id]} type={type} value={value} onChange={(event) => change(event.target.value)} />{errors[id] ? <span className="field-error">{errors[id]}</span> : null}</label>;

  return <form className="mt-7 max-w-2xl rounded border border-slate-200 bg-white p-6" noValidate onSubmit={(event) => void submit(event)}>
    {apiError ? <p className="form-error" role="alert">{apiError}</p> : null}{message ? <p className="mb-4 text-sm text-emerald-800" role="status">{message}</p> : null}
    {textField('title', 'Title', title, setTitle)}
    <label className="field">Description<textarea aria-invalid={!!errors.description} className="min-h-28 rounded border border-slate-300 bg-white p-3 font-normal" value={description} onChange={(event) => setDescription(event.target.value)} />{errors.description ? <span className="field-error">{errors.description}</span> : null}</label>
    <label className="field">Teacher<select aria-invalid={!!errors.teacherId} className="h-11 rounded border border-slate-300 bg-white px-3" value={teacherId} onChange={(event) => setTeacherId(event.target.value)}><option value="">{teachersQuery.isLoading ? 'Loading active teachers…' : 'Select a teacher'}</option>{teachersQuery.data?.map((teacher) => <option key={teacher._id} value={teacher._id}>{teacher.name} ({teacher.email})</option>)}</select>{errors.teacherId ? <span className="field-error">{errors.teacherId}</span> : null}{teachersQuery.error ? <span className="field-error">{getApiErrorMessage(teachersQuery.error)}</span> : null}{!teachersQuery.isLoading && teachersQuery.data?.length === 0 ? <span className="field-error">No active teachers are available. Create or activate a teacher before adding a course.</span> : null}</label>
    <label className="field">Pricing<select className="h-11 rounded border border-slate-300 bg-white px-3" value={isFree ? 'free' : 'paid'} onChange={(event) => { const free = event.target.value === 'free'; setIsFree(free); if (free) setPrice('0'); }}><option value="free">Free</option><option value="paid">Paid</option></select></label>
    {textField('price', 'Price', price, setPrice, 'number')}{errors.price ? <span className="field-error">{errors.price}</span> : null}
    {textField('duration', 'Duration (hours)', duration, setDuration, 'number')}
    <label className="field">Level<select className="h-11 rounded border border-slate-300 bg-white px-3" value={level} onChange={(event) => setLevel(event.target.value as CourseLevel)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
    <label className="field">Status<select className="h-11 rounded border border-slate-300 bg-white px-3" value={status} onChange={(event) => setStatus(event.target.value as CourseStatus)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
    {course ? <label className="field flex-row items-center"><input checked={isActive} onChange={(event) => setIsActive(event.target.checked)} type="checkbox" /> Active course</label> : null}
    <div className="mt-6 flex gap-3"><button className="button button-primary" disabled={busy || teachersQuery.isLoading || !teachersQuery.data?.length} type="submit">{busy ? 'Saving…' : course ? 'Save course' : 'Create course'}</button><button className="button button-secondary" disabled={busy} onClick={() => router.push('/admin/courses')} type="button">Cancel</button></div>
  </form>;
}
