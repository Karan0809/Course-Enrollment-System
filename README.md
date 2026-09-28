# Course Enrollment System

A full-stack course catalogue and enrollment application for Students, Teachers, and Admins. Admins manage users and courses, Teachers manage permitted content on assigned courses and view their rosters, and Students browse the active catalogue and manage their own enrollments.

## Technology

- Frontend: Next.js 14 App Router, React, TypeScript, Tailwind CSS
- Client state and API: Redux Toolkit and RTK Query
- Backend: Node.js, Express, TypeScript, REST
- Database: MongoDB and Mongoose
- Repository: npm workspaces monorepo

## Repository structure

```text
apps/api/       Express API, Mongoose models, seed and database checks
apps/web/       Next.js application and RTK Query client
packages/       shared TypeScript contracts
docs/           API reference and assessment verification matrix
```

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- A reachable MongoDB instance

## Install and configure

```sh
npm install
```

Copy `apps/api/.env.example` to `apps/api/.env` and `apps/web/.env.example` to `apps/web/.env.local`. Set `MONGODB_URI` to your development database, choose a private random `JWT_SECRET` of at least 32 characters, and configure `NEXT_PUBLIC_API_URL` to the API URL. The frontend variable is public by design and must never contain backend secrets. Keep real `.env` files out of version control.

Backend settings: `PORT`, `CORS_ORIGIN`, `MONGODB_URI`, `JWT_SECRET`, and `JWT_EXPIRES_IN`. `JWT_SECRET` is required in every environment, must be private and at least 32 characters, and the example placeholder is rejected at startup. Frontend setting: `NEXT_PUBLIC_API_URL`. Optional demo seed credentials are listed in the API environment example; the seed command requires all three demo identities.

## Run locally

Start MongoDB, then run each app in a separate terminal from the repository root:

```sh
npm run dev:api
npm run dev
```

The API defaults to `http://localhost:4000`; the web app defaults to `http://localhost:3000`. `GET /health` is an API liveness response; it does not check database readiness.

To run the compiled API, build the workspaces first and then start the API package:

```sh
npm run build
npm start --workspace @course-enrollment-system/api
```

## Demo data

The seed is explicit, development-only, and non-destructive: it creates missing demo identities, sample courses in draft/published/archived/inactive states, and one active enrollment. Existing records are reused and never have passwords or course fields overwritten. Set these values in `apps/api/.env` (use unique local credentials):

```dotenv
SEED_ADMIN_EMAIL=admin@example.test
SEED_ADMIN_PASSWORD=use-a-private-password
SEED_TEACHER_EMAIL=teacher@example.test
SEED_TEACHER_PASSWORD=use-a-private-password
SEED_STUDENT_EMAIL=student@example.test
SEED_STUDENT_PASSWORD=use-a-private-password
```

Run the seed only when you intend to add or reuse those demo records:

```sh
npm run seed --workspace @course-enrollment-system/api
```

The command requires `SEED_CONFIRM=YES` in the environment and refuses to run when `NODE_ENV=production`. It never prints credentials. It is idempotent for its seeded identities, course titles, and enrollment.

## Roles and application routes

- Public: `/login`, `/register`, `/courses`, `/courses/:id`
- Admin: `/admin`, `/admin/users`, `/admin/users/new`, `/admin/users/:id/edit`, `/admin/courses`, `/admin/courses/new`, `/admin/courses/:id/edit`, `/admin/enrollments`
- Teacher: `/teacher/courses`, `/teacher/courses/:id`, `/teacher/courses/:id/students`
- Student: `/student/my-courses`

Public registration always creates a Student. Admin-created accounts can use the Admin, Teacher, or Student role. Backend middleware enforces roles and course ownership; frontend route protection and role-aware navigation are additional UX safeguards. Login sends each role to its starting page. The client persists the JWT in local storage and validates it through `/api/auth/me` on refresh; logout clears the token and cached API state.

## API documentation and Postman

- API reference: [docs/api.md](docs/api.md)
- Postman collection: [Course-Enrollment-System.postman_collection.json](docs/postman/Course-Enrollment-System.postman_collection.json)
- Postman environment template: [Course-Enrollment-System.postman_environment.json](docs/postman/Course-Enrollment-System.postman_environment.json)

For local API work:

1. Start MongoDB and configure `apps/api/.env` from `apps/api/.env.example` (`PORT`, `CORS_ORIGIN`, `MONGODB_URI`, `JWT_SECRET`, and optional `JWT_EXPIRES_IN`). Use a private `JWT_SECRET` of at least 32 characters. Configure the three `SEED_*` email/password pairs only if you intend to run the demo seed.
2. From the repository root, start the backend with `npm run dev:api`. The default base URL is `http://localhost:4000`.
3. In Postman, import the collection JSON and the environment JSON, then select the imported environment. Set `baseUrl` if your API uses another address. The token and ID variables are filled by login and create request scripts; alternatively register a Student and log in.
4. To get role-specific access, log in as an active account and save the returned token to `adminToken`, `teacherToken`, or `studentToken` in the selected environment. Seed demo identities are optional; the explicit seed command and safeguards are described above.
5. Run the protected requests with the matching role token. The collection uses bearer authorization and Postman variables; it contains no real credentials or JWT secrets.

Success responses use `{ success, message, data }`; errors use `{ success: false, message, data: {} }`.

## Checks

```sh
npm run typecheck
npm run lint
npm run build
npm run db:check --workspace @course-enrollment-system/api
```

There is no configured standalone unit-test runner. Final assessment runtime/API checks are recorded in [docs/assessment-requirements-matrix.md](docs/assessment-requirements-matrix.md). API/database checks and production builds are distinct from interactive browser verification. This environment currently has no usable browser automation, so visual rendering, browser console, hydration, and interaction checks must remain marked **BLOCKED** unless performed in a browser-equipped environment.

## Database behavior

Enrollment records include `studentId`, `courseId`, `status`, `enrolledAt`, and Mongoose timestamps. A unique compound index prevents duplicate student/course records. Students can enroll only in published active courses; cancellation is not implemented. See the API reference for filtering, ownership, and error semantics.
