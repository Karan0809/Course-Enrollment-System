'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getRoleRedirect } from '../../lib/auth/redirects';
import { getApiErrorMessage } from '../../lib/api/errorMessage';
import { useLoginMutation, useRegisterMutation } from '../../store/api';
import type { AuthResponseData } from '../../types/api';

type AuthMode = 'login' | 'register';
type FormValues = { name: string; email: string; password: string };

function validate(values: FormValues, mode: AuthMode): Partial<FormValues> {
  const errors: Partial<FormValues> = {};
  if (mode === 'register' && !values.name.trim()) errors.name = 'Enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!values.password) errors.password = 'Enter your password.';
  else if (values.password.length < 6) errors.password = 'Use at least 6 characters.';
  return errors;
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const [values, setValues] = useState<FormValues>({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<FormValues>>({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const isRegister = mode === 'register';
  const isSubmitting = loginState.isLoading || registerState.isLoading;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validate(values, mode);
    setFieldErrors(errors);
    setFormError('');
    setFormSuccess('');
    if (Object.keys(errors).length > 0) return;

    try {
      if (isRegister) {
        await register({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        }).unwrap();

        setFormSuccess('Account created successfully. Redirecting to login…');
        setTimeout(() => {
          router.replace('/login');
        }, 700);
        return;
      }

      const response: AuthResponseData = await login({
        email: values.email.trim(),
        password: values.password,
      }).unwrap();

      router.replace(getRoleRedirect(response.user.role));
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
    setFormSuccess('');
  }

  return (
    <section className="auth-layout">
      <div className="auth-aside">
        <span className="eyebrow">A place to keep learning</span>
        <h1>{isRegister ? 'Make room for what’s next.' : 'Good to have you back.'}</h1>
        <p>{isRegister ? 'Create your student account and pick up a new skill.' : 'Sign in to continue where your courses left off.'}</p>
        <div className="aside-rule"><span /> <span /> <span /></div>
        <span className="aside-note">LEARN AT YOUR OWN PACE</span>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-heading">
          <span className="eyebrow">{isRegister ? 'New here' : 'Your learning space'}</span>
          <h2>{isRegister ? 'Create account' : 'Sign in'}</h2>
          <p>{isRegister ? 'A few details, then you’re in.' : 'Use your account details to continue.'}</p>
        </div>
        <form onSubmit={submit} noValidate>
          {isRegister ? (
            <label className="field">
              <span>Name</span>
              <input autoComplete="name" value={values.name} onChange={(event) => update('name', event.target.value)} aria-invalid={Boolean(fieldErrors.name)} />
              {fieldErrors.name ? <small className="field-error">{fieldErrors.name}</small> : null}
            </label>
          ) : null}
          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="email" value={values.email} onChange={(event) => update('email', event.target.value)} aria-invalid={Boolean(fieldErrors.email)} />
            {fieldErrors.email ? <small className="field-error">{fieldErrors.email}</small> : null}
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} value={values.password} onChange={(event) => update('password', event.target.value)} aria-invalid={Boolean(fieldErrors.password)} />
            {fieldErrors.password ? <small className="field-error">{fieldErrors.password}</small> : null}
          </label>
          {formError ? <p className="form-error" role="alert">{formError}</p> : null}
          {formSuccess ? <p className="form-success" role="status">{formSuccess}</p> : null}
          <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : isRegister ? 'Create student account' : 'Sign in'}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New to Courseroom?'}{' '}
          <Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
        </p>
      </div>
    </section>
  );
}