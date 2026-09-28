# API Reference

Base URL: `http://localhost:4000/api`. Protected endpoints require `Authorization: Bearer <JWT>`. All success payloads follow `{ "success": true, "message": "...", "data": ... }`; errors follow `{ "success": false, "message": "...", "data": {} }`.

Common errors: `400` invalid request or ID, `401` missing/invalid token or inactive account, `403` wrong role or failed course ownership, `404` missing or unavailable resource, `409` duplicate email/enrollment. Public course reads intentionally return `404` for unavailable courses. Server errors do not include stack traces.

## Authentication

| Method | Path | Access | Request | Success |
|---|---|---|---|---|
| POST | `/auth/register` | Public; always Student | `{ "name": string, "email": string, "password": string }` | `201`, `{ token, user }` |
| POST | `/auth/login` | Public | `{ "email": string, "password": string }` | `200`, `{ token, user }` |
| GET | `/auth/me` | Any authenticated role | Bearer token | `200`, safe authenticated user |

Passwords must contain at least six characters. Password hashes are stored using bcrypt and are never included in serialized users. Public registration does not accept a role assignment.

## Admin users

All routes are Admin-only. `/api/admin/users` and the existing `/api/users` alias use the same handlers.

| Method | Path | Request / behavior |
|---|---|---|
| POST | `/admin/users` | `{ name, email, password, role, isActive? }`; role is `admin`, `teacher`, or `student`; returns `201` safe user |
| GET | `/admin/users` | Optional `role`, `isActive=true|false`, `email` filters; returns safe users |
| GET | `/admin/users/:id` | Returns one safe user |
| PATCH | `/admin/users/:id` | Partial `name`, `email`, `password`, `role`, `isActive`; passwords are re-hashed |
| PATCH | `/admin/users/:id/status` | `{ "isActive": boolean }` |
| DELETE | `/admin/users/:id` | Deactivates the account; does not physically delete it |

Duplicate email on create/update returns `409`; invalid email, password, ID, or role returns `400`. Inactive accounts cannot authenticate.

## Courses

| Method | Path | Access | Request / behavior |
|---|---|---|---|
| GET | `/courses` | Public, Student, Teacher, Admin | Public/Student see published active courses; Teacher sees assigned courses; Admin can see all. Optional filters: `status`, `level`, `isActive`, `teacherId`, constrained by role. |
| GET | `/courses/:id` | Public, Student, Teacher, Admin | Public/Student get published active courses; Teacher must own the course; Admin can view any course. |
| POST | `/courses` | Admin | `{ title, description, teacherId, price, isFree, duration, level, status?, isActive? }`; assigned Teacher must exist and be active. Returns `201`. |
| PATCH | `/courses/:id` | Admin or owning Teacher | Admin may update course fields. Teacher may update `title`, `description`, `price`, `isFree`, `duration`, and `level` only. Teacher cannot reassign, publish/archive, or deactivate. |
| PATCH | `/courses/:id/status` | Admin | `{ "status": "draft" | "published" | "archived" }` |
| DELETE | `/courses/:id` | Admin | Deletes the course document; returns empty `data`. |

Levels are `beginner`, `intermediate`, and `advanced`. Prices must be nonnegative; free courses must have price `0`; duration must be positive. Admin may set `isActive` through course create/update. An invalid or inactive teacher assignment is rejected.

## Teacher courses and rosters

| Method | Path | Access | Behavior |
|---|---|---|---|
| GET | `/teacher/courses` | Teacher | Returns only courses assigned to the authenticated Teacher. |
| GET | `/teacher/courses/:id/students` | Owning Teacher | Returns that course's enrollments with `{ enrollmentId, status, enrolledAt, student: { id, name, email, role, isActive } }`. Ownership is checked by comparing `course.teacherId` to the authenticated user ID. |

Other Teachers, Students, and Admins cannot access the teacher-specific roster endpoint. Missing courses return `404`; another Teacher's course returns `403`.

## Student catalogue and enrollments

| Method | Path | Access | Request / behavior |
|---|---|---|---|
| POST | `/courses/:id/enroll` | Student | No body required. Student ID comes from JWT; course must be published and active. Returns `201` with enrollment summary. |
| GET | `/students/me/enrollments` | Student | Returns only the authenticated Student's enrollment details and safe course summary. |
| POST | `/enrollments` | Student (compatibility endpoint) | `{ "courseId": string }`; server derives student ID. Other fields are rejected. |
| GET | `/enrollments/me` | Student (compatibility endpoint) | Returns own enrollment summaries. |

Duplicate enrollment returns `409`, including concurrent duplicates rejected by the unique compound index. Draft, archived, inactive, or missing courses cannot be enrolled in. Enrollment status supports `active` and `cancelled`; this app does not expose a cancellation operation.

## Admin enrollment visibility

| Method | Path | Access | Query / response |
|---|---|---|---|
| GET | `/admin/enrollments` | Admin | Optional `courseId`, `studentId`, and `status` filters. Each record includes enrollment ID/status/date, safe Student details, course title, and safe Teacher name/email. |
| GET | `/admin/dashboard/summary` | Admin | Returns teacher, student, course, and enrollment totals. |
| GET | `/enrollments` | Admin (compatibility endpoint) | Returns enrollment summaries; supports the same enrollment filters. |
| GET | `/enrollments/course/:courseId` | Teacher assigned to course | Returns enrollment summaries after server-side ownership check. |

Admin enrollment details expose no password hashes, tokens, or authentication secrets. Missing related records are represented as `null` where the enrollment record remains.

