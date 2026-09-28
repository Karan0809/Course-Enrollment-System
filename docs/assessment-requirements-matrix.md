# Assessment Requirements Matrix

This matrix records the final assessment audit. “Browser” means interactive browser verification; HTTP page responses do not count as browser verification.

| Requirement | Implementation | Runtime verification | Browser verification | Status / notes |
|---|---|---|---|---|
| Student registration | `POST /api/auth/register`, `apps/web/app/(public)/register/` | Mongo workflow: `201`, bcrypt hash, safe response, duplicate `409` | Blocked: no usable browser automation | COMPLETE (API); PARTIAL (interactive UI) |
| Login, JWT, `/me`, invalid/inactive tokens | `apps/api/src/modules/auth/`, `apps/web/store/`, `Providers` | Mongo workflow: login, `/me`, invalid token, inactive user | Blocked | COMPLETE (API); PARTIAL (refresh/logout UI) |
| Public role escalation prevention | `auth.service.ts` always creates `student` | Registration with `role=admin` returned Student | Blocked | COMPLETE (API) |
| Admin user create/list/get/update/deactivate | `/api/admin/users`, `apps/web/app/admin/users/` | Mongo workflow: Teacher/Admin/Student create, list/get/update, duplicate conflicts, deactivate/login rejection, safe fields | Blocked | COMPLETE (API); PARTIAL (interactive UI) |
| Admin course create/assign/status/delete | `/api/courses`, `apps/web/app/admin/courses/` | Mongo workflow: create, active Teacher assignment, publish, delete, invalid assignment and validation | Blocked | COMPLETE (API); PARTIAL (interactive UI) |
| Teacher assigned list/detail/edit and ownership | `/api/teacher/courses`, `course.service.ts`, `apps/web/app/teacher/courses/` | Mongo workflow: list/detail, permitted edit, reassign denied, cross-Teacher access denied | Blocked | COMPLETE (API); PARTIAL (interactive UI) |
| Public/Student catalogue and detail | `/api/courses`, `apps/web/app/(public)/courses/` | Mongo workflow: published active visible; draft/archived/inactive excluded and details return `404` | Blocked | COMPLETE (API); PARTIAL (interactive UI) |
| Student enrollment and own list | `/api/courses/:id/enroll`, `/api/students/me/enrollments` | Mongo workflow: enroll, duplicate `409`, role denials, only own records, distinct students/courses | Blocked | COMPLETE (API); PARTIAL (interactive UI) |
| Teacher roster tenant isolation | `/api/teacher/courses/:id/students` | Mongo workflow: both owners see own students; cross-course, Student, Admin denied; safe fields | Blocked | COMPLETE (API); PARTIAL (interactive UI) |
| Admin enrollment visibility | `/api/admin/enrollments`, `apps/web/app/admin/enrollments/` | Mongo workflow: all test courses visible; Student/Teacher denied; safe fields/status | Blocked | COMPLETE (API); PARTIAL (interactive UI) |
| `/login`, `/register`, `/courses`, `/courses/:id` | `apps/web/app/(public)/` | Next production route generation; HTTP routes previously returned `200` | Blocked; HTTP is not a browser test | PARTIAL |
| `/admin`, `/admin/users`, `/admin/users/new`, `/admin/users/:id/edit` | `apps/web/app/admin/` | Next production route generation | Blocked | PARTIAL |
| `/admin/courses`, `/admin/courses/new`, `/admin/courses/:id/edit`, `/admin/enrollments` | `apps/web/app/admin/` | Next production route generation; HTTP probe previously returned `200` for enrollments | Blocked | PARTIAL |
| `/teacher/courses`, `/teacher/courses/:id`, `/teacher/courses/:id/students` | `apps/web/app/teacher/courses/` | Next production route generation; HTTP probe previously returned `200` for roster page | Blocked | PARTIAL |
| `/student/my-courses` | `apps/web/app/student/my-courses/` | Next production route generation | Blocked | PARTIAL |
| Loading, empty, error, field validation, confirmation | Shared UI states and page/forms | Static inspection of route components and actions | Blocked | PARTIAL (static evidence only) |
| Responsive navigation, cards, tables, and forms | Tailwind classes and `apps/web/app/globals.css` | Static inspection; mobile header now wraps and tables scroll | Blocked | PARTIAL (static evidence only) |
| User/Course/Enrollment schemas and unique index | API Mongoose models | `verifyDatabaseSetup()` passed against MongoDB | Not applicable | COMPLETE |
| Demo seed data and guarded command | `apps/api/src/seed.ts`, API `seed` script | Seed created/checked records against MongoDB; temporary fixtures were cleaned | Not applicable | COMPLETE |
| README, setup, and API reference | `README.md`, `docs/api.md` | Routes/fields checked against current handlers | Not applicable | COMPLETE |
| JWT configuration guard | `apps/api/src/config/env.ts` | Missing and example placeholder secrets were rejected; configured secret accepted | Not applicable | COMPLETE |
| API production build/start | API TypeScript config and package scripts | Build emitted `dist/server.js`; compiled server connected to MongoDB and `/health` returned `200` | Not applicable | COMPLETE |
| Typecheck, lint, production builds, DB index check | root workspace scripts, API `db:check` | Final workspace typecheck/lint/build and live Mongo index verification passed | Not applicable | COMPLETE |

## Status definitions

- **COMPLETE**: implementation exists and the relevant runtime behavior was verified. It does not imply browser verification.
- **PARTIAL**: implementation exists but required runtime coverage is incomplete.
- **BLOCKED**: verification cannot be performed in the available environment.
- **MISSING**: a required implementation or documentation item is absent.

