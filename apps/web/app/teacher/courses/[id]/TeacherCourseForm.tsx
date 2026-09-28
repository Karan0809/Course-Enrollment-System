'use client';

import { useState, type FormEvent } from 'react';
import type { CourseLevel } from '@course-enrollment-system/contracts';
import type { CourseSummary, TeacherCourseUpdateRequest } from '../../../../types/api';
import { getApiErrorMessage } from '../../../../lib/api/errorMessage';
import { useUpdateCourseMutation } from '../../../../store/api';

export function TeacherCourseForm({ course }: { course: CourseSummary }) {
  const [update, mutation] = useUpdateCourseMutation();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [duration, setDuration] = useState(String(course.duration));
  const [level, setLevel] = useState<CourseLevel>(course.level);
  const [price, setPrice] = useState(String(course.price));
  const [isFree, setIsFree] = useState(course.isFree);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    const parsedDuration = Number(duration);
    const parsedPrice = Number(price);
    if (!title.trim()) next.title = 'Title is required.';
    if (!description.trim()) next.description = 'Description is required.';
    if (!duration || !Number.isFinite(parsedDuration) || parsedDuration <= 0) next.duration = 'Duration must be a positive number.';
    if (!price || !Number.isFinite(parsedPrice) || parsedPrice < 0) next.price = 'Price must be zero or greater.';
    if (isFree && parsedPrice !== 0) next.price = 'Free courses must have a price of 0.';
    setErrors(next); setApiError(''); setSuccess('');
    if (Object.keys(next).length) return;
    const body: TeacherCourseUpdateRequest = { title: title.trim(), description: description.trim(), duration: parsedDuration, level, price: parsedPrice, isFree };
    try {
      await update({ id: course._id, body }).unwrap();
      setSuccess('Course changes saved.');
    } catch (error) { setApiError(getApiErrorMessage(error)); }
  };
  return <form className="mt-7 max-w-2xl rounded border border-slate-200 bg-white p-6" noValidate onSubmit={(event) => void submit(event)}>
    {success ? <p className="mb-4 text-sm text-emerald-800" role="status">{success}</p> : null}{apiError ? <p className="form-error" role="alert">{apiError}</p> : null}
    <label className="field">Title<input aria-invalid={!!errors.title} value={title} onChange={(event) => setTitle(event.target.value)} />{errors.title ? <span className="field-error">{errors.title}</span> : null}</label>
    <label className="field">Description<textarea aria-invalid={!!errors.description} className="min-h-28 rounded border border-slate-300 bg-white p-3 font-normal" value={description} onChange={(event) => setDescription(event.target.value)} />{errors.description ? <span className="field-error">{errors.description}</span> : null}</label>
    <label className="field">Duration (hours)<input aria-invalid={!!errors.duration} min="0.1" step="any" type="number" value={duration} onChange={(event) => setDuration(event.target.value)} />{errors.duration ? <span className="field-error">{errors.duration}</span> : null}</label>
    <label className="field">Level<select className="h-11 rounded border border-slate-300 bg-white px-3" value={level} onChange={(event) => setLevel(event.target.value as CourseLevel)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
    <label className="field">Pricing<select className="h-11 rounded border border-slate-300 bg-white px-3" value={isFree ? 'free' : 'paid'} onChange={(event) => { const free = event.target.value === 'free'; setIsFree(free); if (free) setPrice('0'); }}><option value="free">Free</option><option value="paid">Paid</option></select></label>
    <label className="field">Price<input aria-invalid={!!errors.price} min="0" step="any" type="number" value={price} onChange={(event) => setPrice(event.target.value)} />{errors.price ? <span className="field-error">{errors.price}</span> : null}</label>
    <button className="button button-primary mt-4" disabled={mutation.isLoading} type="submit">{mutation.isLoading ? 'Saving…' : 'Save changes'}</button>
  </form>;
}
