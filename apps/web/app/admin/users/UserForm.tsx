'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { UserRole } from '@course-enrollment-system/contracts';
import type { UserSummary } from '../../../types/api';
import { getApiErrorMessage } from '../../../lib/api/errorMessage';
import { useCreateAdminUserMutation, useUpdateAdminUserMutation } from '../../../store/api';

export function UserForm({ user }: { user?: UserSummary }) {
  const router = useRouter();
  const [create, createState] = useCreateAdminUserMutation();
  const [update, updateState] = useUpdateAdminUserMutation();
  const busy = createState.isLoading || updateState.isLoading;
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'student');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!user && password.length < 6) next.password = 'Password must be at least 6 characters.';
    setErrors(next); setApiError('');
    if (Object.keys(next).length) return;
    try {
      if (user) await update({ id: user._id, body: { name: name.trim(), email: email.trim(), role, isActive } }).unwrap();
      else await create({ name: name.trim(), email: email.trim(), password, role }).unwrap();
      router.push('/admin/users');
    } catch (error) { setApiError(getApiErrorMessage(error)); }
  };
  const field = (key: string, label: string, value: string, setValue: (value: string) => void, type = 'text') => <label className="field" key={key}>{label}<input aria-invalid={!!errors[key]} autoComplete={key === 'password' ? 'new-password' : undefined} type={type} value={value} onChange={(e) => setValue(e.target.value)} />{errors[key] ? <span className="field-error">{errors[key]}</span> : null}</label>;
  return <form className="mt-7 max-w-xl rounded border border-slate-200 bg-white p-6" noValidate onSubmit={(e) => void submit(e)}>
    {apiError ? <p className="form-error" role="alert">{apiError}</p> : null}
    {field('name', 'Name', name, setName)}{field('email', 'Email', email, setEmail, 'email')}
    {!user ? field('password', 'Password (minimum 6 characters)', password, setPassword, 'password') : null}
    <label className="field">Role<select className="h-11 rounded border border-slate-300 bg-white px-3" value={role} onChange={(e) => setRole(e.target.value as UserRole)}><option value="admin">Admin</option><option value="teacher">Teacher</option><option value="student">Student</option></select></label>
    {user ? <label className="field flex-row items-center"><input checked={isActive} onChange={(e) => setIsActive(e.target.checked)} type="checkbox" /> Active account</label> : null}
    <div className="mt-6 flex gap-3"><button className="button button-primary" disabled={busy} type="submit">{busy ? 'Saving…' : user ? 'Save changes' : 'Create user'}</button><button className="button button-secondary" disabled={busy} onClick={() => router.push('/admin/users')} type="button">Cancel</button></div>
  </form>;
}
