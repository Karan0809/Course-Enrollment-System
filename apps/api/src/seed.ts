import { connectDatabase } from './config/database.js';
import { hashPassword } from './modules/auth/auth.utils.js';
import { Course } from './modules/courses/course.model.js';
import { Enrollment } from './modules/enrollments/enrollment.model.js';
import { User } from './modules/users/user.model.js';
import type { UserRole } from './modules/users/user.types.js';

type SeedIdentity = { name: string; email: string; password: string; role: UserRole };

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be set to run the explicit demo seed.`);
  return value;
}

function validateIdentity(identity: SeedIdentity): SeedIdentity {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email)) throw new Error(`Seed email for role ${identity.role} is invalid.`);
  if (identity.password.length < 6) throw new Error(`Seed password for role ${identity.role} must contain at least 6 characters.`);
  return { ...identity, email: identity.email.toLowerCase() };
}

async function findOrCreateUser(identity: SeedIdentity) {
  const existing = await User.findOne({ email: identity.email.toLowerCase() });
  if (existing) {
    if (existing.role !== identity.role) {
      throw new Error(`Seed identity ${identity.email} already exists with a different role.`);
    }
    if (!existing.isActive) {
      throw new Error(`Seed identity ${identity.email} is inactive. Activate it before using the demo workflow.`);
    }
    return existing;
  }

  return User.create({
    name: identity.name,
    email: identity.email,
    passwordHash: await hashPassword(identity.password),
    role: identity.role,
    isActive: true,
  });
}

async function findOrCreateCourse(input: {
  title: string;
  description: string;
  teacherId: string;
  price: number;
  isFree: boolean;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
}) {
  const existing = await Course.findOne({ title: input.title, teacherId: input.teacherId });
  if (existing) return existing;
  return Course.create(input);
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') throw new Error('Demo seed refuses to run with NODE_ENV=production.');
  if (process.env.SEED_CONFIRM !== 'YES') throw new Error('Set SEED_CONFIRM=YES to explicitly create demo data.');

  const identities: Record<'admin' | 'teacher' | 'student', SeedIdentity> = {
    admin: {
      name: process.env.SEED_ADMIN_NAME?.trim() || 'Demo Administrator',
      email: requiredEnv('SEED_ADMIN_EMAIL'),
      password: requiredEnv('SEED_ADMIN_PASSWORD'),
      role: 'admin',
    },
    teacher: {
      name: process.env.SEED_TEACHER_NAME?.trim() || 'Demo Teacher',
      email: requiredEnv('SEED_TEACHER_EMAIL'),
      password: requiredEnv('SEED_TEACHER_PASSWORD'),
      role: 'teacher',
    },
    student: {
      name: process.env.SEED_STUDENT_NAME?.trim() || 'Demo Student',
      email: requiredEnv('SEED_STUDENT_EMAIL'),
      password: requiredEnv('SEED_STUDENT_PASSWORD'),
      role: 'student',
    },
  };
  Object.values(identities).forEach(validateIdentity);

  await connectDatabase();
  try {
    const [, teacher, student] = await Promise.all([
      findOrCreateUser(identities.admin),
      findOrCreateUser(identities.teacher),
      findOrCreateUser(identities.student),
    ]);
    await Enrollment.init();
    const sampleCourses = [
      { title: 'Demo: Published Web Foundations', description: 'A paid active course for the enrollment workflow.', teacherId: teacher._id.toString(), price: 49, isFree: false, duration: 12, level: 'beginner' as const, status: 'published' as const, isActive: true },
      { title: 'Demo: Published Free Design', description: 'A free active course in the public catalogue.', teacherId: teacher._id.toString(), price: 0, isFree: true, duration: 8, level: 'beginner' as const, status: 'published' as const, isActive: true },
      { title: 'Demo: Draft Data Skills', description: 'A draft course hidden from students.', teacherId: teacher._id.toString(), price: 0, isFree: true, duration: 6, level: 'intermediate' as const, status: 'draft' as const, isActive: true },
      { title: 'Demo: Archived Product Strategy', description: 'An archived course hidden from students.', teacherId: teacher._id.toString(), price: 25, isFree: false, duration: 5, level: 'advanced' as const, status: 'archived' as const, isActive: true },
      { title: 'Demo: Inactive Published Writing', description: 'An inactive course hidden from students.', teacherId: teacher._id.toString(), price: 0, isFree: true, duration: 4, level: 'beginner' as const, status: 'published' as const, isActive: false },
    ];
    const courses = await Promise.all(sampleCourses.map(findOrCreateCourse));
    const featured = courses[0];
    if (!featured) throw new Error('Seed featured course was not created.');
    const existingEnrollment = await Enrollment.findOne({ studentId: student._id, courseId: featured._id });
    if (!existingEnrollment) {
      await Enrollment.create({ studentId: student._id, courseId: featured._id, status: 'active', enrolledAt: new Date() });
    }
    console.log(`Demo data is ready. Admin, Teacher, and Student identities were checked; ${courses.length} sample course records and one enrollment were checked.`);
    console.log('Credentials were read from SEED_* environment variables and are not printed. Existing records were not overwritten.');
  } finally {
    await import('mongoose').then(({ default: mongoose }) => mongoose.disconnect());
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Demo seed failed.');
  process.exitCode = 1;
});
