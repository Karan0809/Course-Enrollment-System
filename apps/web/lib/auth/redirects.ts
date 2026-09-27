import type { UserRole } from '@course-enrollment-system/contracts';

export const roleDashboardPath: Record<UserRole, string> = {
  admin: '/admin',
  teacher: '/teacher/courses',
  student: '/courses',
};

export function getRoleRedirect(role: UserRole): string {
  return roleDashboardPath[role];
}