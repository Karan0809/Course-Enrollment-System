import app from "./src/app.ts";
import { connectDatabase } from "./src/config/database.ts";
import { User } from "./src/modules/users/user.model.ts";

const adminEmail = `adminrbac_${Date.now()}@example.com`;
const teacherEmail = `teacherrbac_${Date.now()}@example.com`;
const studentEmail = `studentrbac_${Date.now()}@example.com`;

await connectDatabase();
await User.deleteMany({ email: { $in: [adminEmail, teacherEmail, studentEmail] } });

const adminUser = await User.create({
  name: "Admin RBAC", email: adminEmail, passwordHash: "hashed-admin", role: "admin", isActive: true,
});
const teacherUser = await User.create({
  name: "Teacher RBAC", email: teacherEmail, passwordHash: "hashed-teacher", role: "teacher", isActive: true,
});
const studentUser = await User.create({
  name: "Student RBAC", email: studentEmail, passwordHash: "hashed-student", role: "student", isActive: true,
});

const base = "http://127.0.0.1:4001";
const tokenMap = {
  admin: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OWRiY2E0ZmNlYjQ1Y2Q4YzNjY2JmY2QiLCJlbWFpbCI6ImFkbWlucmJhY18xNzkwNTM4NjA2MjEyQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzkwNTM4NjA2LCJleHAiOjE3OTExNDM0MDZ9.4TsVjPVZRB0l3yN4vKdYrsP7dQ8v0Pd_Dc0A6WlDRLw0",
  teacher: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OWRiY2EyNjBlM2Y5MjY1ZWM3MGQyNzAiLCJlbWFpbCI6InRlYWNoZXJyYmFjXzE3OTA1Mzg2MDQ0MTlAZXhhbXBsZS5jb20iLCJyb2wiOiJ0ZWFjaGVyIiwiaWF0IjoxNzkwNTM4NjA2LCJleHAiOjE3OTExNDM0MDZ9.ObgoRZ30QH3A5qvK3m8DinFAbM6Q0M2Vw2nX4tyT2jc",
  student: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OWRiY2EzNjUyYjM4N2M0YjAwYjA5YTAiLCJlbWFpbCI6InN0dWRlbnRyYmFjXzE3OTA1Mzg2MDExNTdAZXhhbXBsZS5jb20iLCJyb2wiOiJzdHVkZW50IiwiaWF0IjoxNzkwNTM4NjA2LCJleHAiOjE3OTExNDM0MDZ9.QGOPs1DzuS4wuwR4Q8Xtrmplixl-guuwS_p8FJrS4jo",
};

const routes = [
  { name: 'admin-only', token: tokenMap.admin, expected: 200 },
  { name: 'teacher-only', token: tokenMap.student, expected: 403 },
  { name: 'student-only', token: tokenMap.teacher, expected: 403 },
];

const server = app.listen(4001, '127.0.0.1', async () => {
  try {
    for (const route of routes) {
      const response = await fetch(base + '/api/auth/me', {
        headers: { Authorization: 'Bearer ' + route.token },
      });
      const data = await response.json();
      console.log(route.name, response.status, JSON.stringify(data));
    }
  } finally {
    server.close();
  }
});
