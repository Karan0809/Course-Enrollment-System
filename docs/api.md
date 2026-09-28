# Course Enrollment System API

## 1. Overview

The API serves the Course Enrollment System web application. It is a REST API built with Node.js, Express, TypeScript, MongoDB, and Mongoose. The default local server is `http://localhost:4000`; set `PORT` to change it. API routes use the `/api` prefix except `GET /` and `GET /health`.

Protected routes use a JWT bearer token. Responses are JSON. The API does not provide pagination.

## 2. Authentication

Register a public Student at `POST /api/auth/register` or sign in at `POST /api/auth/login`. Both return a JWT in `data.token`; send it on protected requests as `Authorization: Bearer <token>`. The server looks up the current account for each request and checks its active state and database role. Missing, invalid, expired, deleted-user, or inactive-user tokens are rejected with `401`. A valid token with an insufficient role is rejected with `403`. JWT lifetime is configured by `JWT_EXPIRES_IN` (default `7d`); the signing secret is `JWT_SECRET` and must not be shared.

Password hashes are stored with bcrypt and are never returned. Public registration always creates a Student; a submitted `role` cannot elevate the account.

## 3. Roles

| Role | Implemented access |
|---|---|
| Admin | User management, dashboard summary, all course management, and admin enrollment views. |
| Teacher | Assigned courses, permitted edits to owned courses, and student roster for owned courses. |
| Student | Published active course catalogue and own enrollments; may enroll in published active courses. |
| Public | Health/root endpoints, registration/login, and published active course reads. |

## 4. Standard responses

Success responses use `{ "success": true, "message": "...", "data": ... }`. Errors use `{ "success": false, "message": "...", "data": {} }`; there is no `errors` property. Collection endpoints return arrays inside `data` or an object containing an array, as specified below. User responses omit password hashes.

Common status codes: `200` successful read/update/delete, `201` created, `400` malformed input/ID/filter or validation failure, `401` missing/invalid/expired/inactive authentication, `403` role or ownership denial, `404` missing or intentionally hidden resource, `409` duplicate email/enrollment, and `500` unexpected server error. Error messages describe the failure; server errors do not expose stack traces.

## 5. Endpoint reference

Unless specified otherwise, JSON request bodies require `Content-Type: application/json`. Path parameter `:id` and `:courseId` are MongoDB ObjectIds. All examples use the default local base URL.

### Authentication

| Method and path | Access | Input and behavior | Success |
|---|---|---|---|
| `POST /api/auth/register` | Public | JSON `{ "name": "Riya Student", "email": "riya@example.test", "password": "Student123" }`. Name, valid email, and password (minimum 6 characters) are required. Always assigns `student`; duplicate email is `409`. | `201`, `data: { token, user }` |
| `POST /api/auth/login` | Public | JSON `{ "email": "riya@example.test", "password": "Student123" }`. Email must be valid; missing fields/invalid email are `400`; invalid credentials or inactive account are `401`. | `200`, `data: { token, user }` |
| `GET /api/auth/me` | Any active authenticated role | Bearer token required. Deleted/inactive account or invalid/missing token is `401`. | `200`, `data` is the safe authenticated profile (`id`, `name`, `email`, `role`, `isActive`). |

Login response example:

```json
{"success":true,"message":"Login successful","data":{"token":"<jwt>","user":{"id":"<userId>","name":"Riya Student","email":"riya@example.test","role":"student","isActive":true}}}
```

### Admin - Users

Both `/api/admin/users` and the compatibility alias `/api/users` expose the same Admin-only handlers. User summary fields are `_id`, `name`, `email`, `role`, `isActive`, `createdAt`, and `updatedAt`; password hashes are never serialized.

| Method and path (prefix `/api/admin/users`) | Input / behavior | Success |
|---|---|---|
| `POST /` | `{ "name", "email", "password", "role", "isActive"? }`. Name/email/password/role required; valid email; password minimum 6 chars; role is `admin`, `teacher`, or `student`; optional `isActive` must be boolean. Duplicate email `409`. | `201`, `data` safe user summary |
| `GET /` | Optional query `role=admin|teacher|student`, `isActive=true|false`, `email=<filter>`. Returns matching users. | `200`, `data: [userSummary, ...]` |
| `GET /:id` | Returns one user. Invalid ObjectId `400`, absent user `404`. | `200`, `data: userSummary` |
| `PATCH /:id` | Partial JSON fields `name`, `email`, `password`, `role`, `isActive`. Supplied values are validated; password minimum 6 and re-hashed; duplicate email `409`. | `200`, `data: userSummary` |
| `PATCH /:id/status` | JSON `{ "isActive": true }`; boolean required. | `200`, `data: userSummary` |
| `DELETE /:id` | Soft-deactivates the account (`isActive=false`); it does not physically remove the user. | `200`, `data: userSummary` |

All require `Authorization: Bearer <adminToken>`. Invalid IDs return `400`; missing users return `404`; wrong role returns `403`. Inactive accounts cannot log in or use protected routes.

### Admin - Dashboard

| Method and path | Access | Input / success |
|---|---|---|
| `GET /api/admin/dashboard/summary` | Admin | No body. `200`, `data: { "teachers": number, "students": number, "courses": number, "enrollments": number }`. |

### Courses

Course summary fields are `_id`, `title`, `description`, `teacherId`, `price`, `isFree`, `duration`, `level`, `status`, `isActive`, `createdAt`, and `updatedAt`. Levels are `beginner`, `intermediate`, `advanced`; statuses are `draft`, `published`, `archived`.

| Method and path | Access | Input / behavior | Success |
|---|---|---|---|
| `GET /api/courses` | Public or any role | Optional filters: `status`, `level`, `isActive=true|false`, `teacherId=<ObjectId>`. Invalid values/IDs return `400`. Public/Student see only published active courses, regardless of requested visibility filters. Teacher sees assigned courses; Admin sees all courses and may filter. A Teacher's `teacherId` filter is constrained to their own ID. | `200`, `data: [courseSummary, ...]` |
| `GET /api/courses/:id` | Public or any role | Public/Student can read only published active courses (unavailable courses return `404`). Teacher can read only an assigned course (`403` otherwise); Admin can read any existing course. | `200`, `data: courseSummary` |
| `POST /api/courses` | Admin | JSON `{ "title", "description", "teacherId", "price", "isFree", "duration", "level", "status"?, "isActive"? }`. Teacher must be a valid, active Teacher. Price is nonnegative; duration positive; free course requires price `0`; level/status must be enumerated values; status defaults to `draft` and `isActive` is optional boolean. | `201`, `data: courseSummary` |
| `PATCH /api/courses/:id` | Admin or assigned Teacher | Partial course fields. Admin can update title, description, teacherId, price, isFree, duration, level, status, isActive. Teacher can update title, description, price, isFree, duration, level only; teacherId reassignment, status, and isActive changes are rejected (`400`). Same field validation applies. | `200`, `data: courseSummary` |
| `PATCH /api/courses/:id/status` | Admin | JSON `{ "status": "published" }`; status must be `draft`, `published`, or `archived`. | `200`, `data: courseSummary` |
| `DELETE /api/courses/:id` | Admin | Physically deletes the course document. Enrollment documents are not cascaded and can remain with a missing course relation. | `200`, `data: {}` |

Admin-only routes return `403` to other roles. Invalid IDs return `400`; missing courses return `404`. Course creation rejects missing/non-Teacher assignment (and rejects an inactive Teacher). Public/Student cannot distinguish an unpublished/inactive existing course from a missing one through `GET /:id` (`404`).

### Student

| Method and path | Access | Input / behavior | Success |
|---|---|---|---|
| `POST /api/courses/:id/enroll` | Student | No body; student identity is taken from the token. Course must exist, be published, and be active. Invalid ID `400`, missing course `404`, unavailable course `400`, duplicate enrollment `409`. | `201`, `data: { "enrollment": { "id", "studentId", "courseId", "status": "active", "enrolledAt" } }` |
| `GET /api/students/me/enrollments` | Student | No input. Returns only the authenticated student's records and safe course details; missing/deleted course relation is `null`. | `200`, `data: { "enrollments": [...] }` |

Enrollment list entries contain `id`, `studentId`, `courseId`, `status`, `enrolledAt`, `createdAt`, `updatedAt`, and `course` (`null` or safe course summary: `id`, `title`, `description`, `teacherId`, `price`, `isFree`, `duration`, `level`, `status`, `isActive`). Enrollment status values are `active` and `cancelled`; no cancellation endpoint is implemented. A unique student/course index prevents duplicate records, including concurrent attempts.

### Teacher

| Method and path | Access | Input / behavior | Success |
|---|---|---|---|
| `GET /api/teacher/courses` | Teacher | No input. Lists courses assigned to the authenticated Teacher. | `200`, `data: [courseSummary, ...]` |
| `GET /api/teacher/courses/:id/students` | Teacher who owns course | Invalid ID `400`, missing course `404`, another Teacher's course `403`. Returns enrollment status/date and safe student profile. | `200`, `data: { "enrollments": [{ "enrollmentId", "status", "enrolledAt", "student": { "id", "name", "email", "role", "isActive" } }] }` |

Both endpoints require a bearer token. Admin is not granted access to the teacher-specific roster route.

### Admin - Enrollments

| Method and path | Access | Query / success |
|---|---|---|
| `GET /api/admin/enrollments` | Admin | Optional `courseId`, `studentId` (ObjectIds), and `status=active|cancelled`; invalid values return `400`. `200`, `data: { "enrollments": [...] }`. |

Each entry contains `id`, `status`, `enrolledAt`, `student` (safe student `{id,name,email,role,isActive}` or `null`), and `course` (`null` or `{id,title,teacher:{id,name,email}|null}`). Missing related documents are represented by `null`.

### Health and compatibility routes

| Method and path | Access | Behavior |
|---|---|---|
| `GET /` | Public | `200`, API welcome envelope. |
| `GET /health` | Public | `200`, static `{ "status": "healthy" }` in `data`; this is an API liveness response, not a database readiness check. |
| `POST /api/enrollments` | Student | Compatibility enrollment create. Body must be exactly `{ "courseId": "<ObjectId>" }`; extra fields are rejected. Same rules and response as `POST /api/courses/:id/enroll`. |
| `GET /api/enrollments/me` | Student | Compatibility route returning own enrollment summaries in `data.enrollments`. |
| `GET /api/enrollments/course/:courseId` | Teacher who owns course | Compatibility route returning course enrollment summaries; same `400`/`403`/`404` ownership behavior. |
| `GET /api/enrollments` | Admin | Compatibility route returning enrollment summaries. Optional `courseId`, `studentId`, `status=active|cancelled` filters. |

Admin user route aliases are documented in the Admin - Users section. Compatibility routes are retained in addition to the main assessment routes.

## 6. Data model summaries

- **User:** name, unique normalized email, bcrypt password hash, role (`admin|teacher|student`), `isActive`, timestamps. API serialization never exposes the hash.
- **Course:** title, description, Teacher reference, price/free flag, duration, level, status, active flag, timestamps.
- **Enrollment:** Student and Course references, status (`active|cancelled`), enrollment date, timestamps, unique compound index on Student plus Course. The API does not expose a cancellation operation.

## 7. Assessment endpoint mapping

| Assessment endpoint | Implementation |
|---|---|
| `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | Implemented |
| Admin user create/list/read/update/delete | Implemented at `/api/admin/users`; same routes also available at `/api/users` |
| Course create/list/read/update/delete | Implemented at `/api/courses` |
| `POST /api/courses/:id/enroll` | Implemented |
| `GET /api/students/me/enrollments` | Implemented |
| Teacher assigned courses and course students | Implemented |
| `GET /api/admin/enrollments` | Implemented |
| `GET /api/admin/dashboard/summary` | Implemented optional dashboard endpoint |
| `GET /health` | Implemented; liveness only, does not verify database connectivity |

Every endpoint listed in the assessment inventory is implemented. The additional user status PATCH and compatibility routes are documented above; no missing assessment endpoint is being represented as implemented.
