'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAppSelector } from '../../store/hooks';
import { LogoutButton } from './LogoutButton';

export function AppShell({ children }: { children: ReactNode }) {
  const { status, user } = useAppSelector((state) => state.auth);

  return (
    <div className="app-frame min-h-screen">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Course Enrollment home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>Course<span className="brand-accent">room</span></span>
        </Link>
        <nav className="header-nav" aria-label="Main navigation">
          <Link href="/courses">Courses</Link>
          {status === 'authenticated' && user ? (
            <div className="account-nav">
              <span className="account-label">{user.name}<small>{user.role}</small></span>
              <LogoutButton />
            </div>
          ) : status === 'unauthenticated' ? (
            <>
              <Link href="/login">Sign in</Link>
              <Link className="header-join" href="/register">Create account</Link>
            </>
          ) : null}
        </nav>
      </header>
      <main className="main-content">{children}</main>
      <footer className="site-footer">
        <span>COURSES · PEOPLE · PROGRESS</span>
        <span>Course Enrollment System</span>
      </footer>
    </div>
  );
}