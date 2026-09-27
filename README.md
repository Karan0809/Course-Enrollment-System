# Course Enrollment System

A monorepo for a course enrollment platform built with a Next.js frontend, an Express API, and a shared TypeScript contracts package.

## Project overview

This repository is the foundation for a full-stack application with:

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Redux Toolkit, RTK Query
- Backend: Express.js with TypeScript
- Shared contracts: Framework-independent TypeScript types
- Database: MongoDB + Mongoose (Module 2 foundation only)
- Authentication and RBAC are implemented in the backend as separate concerns

## Authentication vs authorization

- Authentication answers: “Who are you?”
- Authorization answers: “What are you allowed to do?”

The backend uses JWT-based authentication and a separate role-based authorization check based on the authenticated user loaded from the database.

Supported roles:

- admin
- teacher
- student

HTTP status semantics:

- 401 = unauthenticated or invalid authentication
- 403 = authenticated but forbidden by role permissions

## Repository structure

```text
course-enrollment-system/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── contracts/
├── package.json
├── tsconfig.base.json
├── .gitignore
├── README.md
└── .env.example (if added at root in future)
```

## Technology stack

- Node.js
- Next.js
- React
- TypeScript
- Tailwind CSS
- Redux Toolkit
- RTK Query
- Express.js
- MongoDB
- Mongoose

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- MongoDB instance running locally or at a reachable URI

## Installation

```bash
npm install
```

## Development commands

```bash
npm run dev
npm run dev:api
npm run build
npm run typecheck
npm run lint
```

## Environment setup

Create local environment files from the examples:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

Backend environment variables:

```bash
PORT=4000
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/course-enrollment-system
```

Frontend environment variables (`apps/web/.env.local`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

The API base URL is read centrally by the RTK Query client. Do not place backend secrets in `NEXT_PUBLIC_*` variables.

Set values as needed before running the applications.

## Frontend URL

- http://localhost:3000

## Backend URL

- http://localhost:4000

## Frontend foundation

The web app uses the existing Redux Toolkit store for client session state and RTK Query for backend data. The shared API client sends the current Bearer token when present, validates restored tokens through `GET /api/auth/me`, clears session/cache after protected API `401` responses, and treats `403` as an authorization error without logging out.

The JWT alone is persisted in browser `localStorage` so a page refresh can restore the session; browser storage is accessed only in client-side code and is not treated as secure storage. Login and student registration are available at `/login` and `/register`. Role destinations are centralized as admin `/admin`, teacher `/teacher/courses`, and student `/courses`; current destination pages are foundation placeholders, not completed dashboards or course workflows. Protected UI guards improve navigation but do not replace backend authorization.

Reusable loading, empty, error, and unauthorized states are under `apps/web/components/ui`. TypeScript API contracts follow the backend response shapes and shared role/course/enrollment types. No admin, teacher, or student business workflows are included in this frontend foundation module.

## Health endpoint

- GET http://localhost:4000/health

Expected response shape:

```json
{
  "success": true,
  "message": "API is running",
  "data": {
    "status": "healthy"
  }
}
```

## Database architecture overview

This module adds the persistence layer for the core domain models:

- User: admin, teacher, student roles
- Course: title, description, teacherId, duration, level, status
- Enrollment: studentId, courseId, status, enrolledAt

### Enrollment unique index

The Enrollment model includes a compound unique index on `(studentId, courseId)` to enforce integrity at the database layer.

### Enrollment APIs

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/enrollments` | Student |
| `GET` | `/api/enrollments/me` | Student |
| `GET` | `/api/enrollments` | Admin |
| `GET` | `/api/enrollments/course/:courseId` | Teacher assigned to that course |

Student enrollment requests accept `{ "courseId": "..." }`. The student identity is taken from the authenticated session, and the server always creates an `active` enrollment. Client-supplied `studentId` or `status` fields are rejected. A course must exist, be `published`, and be active. Repeated enrollment attempts, including attempts after a prior enrollment was cancelled, return `409`; the database unique index also prevents duplicates during concurrent requests.

Students can retrieve only their own enrollments through `/api/enrollments/me`. Admins can list all enrollments and filter by `studentId`, `courseId`, or `status` (`active` or `cancelled`). Teachers can retrieve enrollment records only for courses assigned to them; another teacher's course returns `403`.

Protected endpoints return `401` when authentication is missing, invalid, or belongs to an inactive account. Role and ownership violations return `403`; malformed IDs or filters return `400`; missing courses return `404`; duplicate enrollment conflicts return `409`.

Enrollment cancellation, payments, notifications, progress tracking, certificates, and frontend enrollment flows are not implemented by this API module.
