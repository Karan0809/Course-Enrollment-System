import app from './src/app.ts';
import { connectDatabase } from './src/config/database.ts';
import { User } from './src/modules/users/user.model.ts';
import { hashPassword } from './src/modules/auth/auth.utils.ts';
import jwt from 'jsonwebtoken';
import { env } from './src/config/env.ts';

const adminEmail = 'adminmod5_' + Date.now() + '@example.com';
const teacherEmail = 'teachermod5_' + Date.now() + '@example.com';
const studentEmail = 'studentmod5_' + Date.now() + '@example.com';

await connectDatabase();
await User.deleteMany({ email: { $in: [adminEmail, teacherEmail, studentEmail] } });

const adminDoc = await User.create({
  name: 'Admin Mod5',
  email: adminEmail,
  passwordHash: await hashPassword('Secret123'),
  role: 'admin',
  isActive: true,
});
const teacherDoc = await User.create({
  name: 'Teacher Mod5',
  email: teacherEmail,
  passwordHash: await hashPassword('Secret123'),
  role: 'teacher',
  isActive: true,
});
const studentDoc = await User.create({
  name: 'Student Mod5',
  email: studentEmail,
  passwordHash: await hashPassword('Secret123'),
  role: 'student',
  isActive: true,
});

const adminToken = jwt.sign({ sub: adminDoc._id.toString(), email: adminDoc.email, role: adminDoc.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const teacherToken = jwt.sign({ sub: teacherDoc._id.toString(), email: teacherDoc.email, role: teacherDoc.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const studentToken = jwt.sign({ sub: studentDoc._id.toString(), email: studentDoc.email, role: studentDoc.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const server = app.listen(4102, '127.0.0.1', async () => {
  try {
    const adminHeaders = { Authorization: 'Bearer ' + adminToken };
    const teacherHeaders = { Authorization: 'Bearer ' + teacherToken };
    const studentHeaders = { Authorization: 'Bearer ' + studentToken };

    const createRes = await fetch('http://127.0.0.1:4102/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({
        name: 'New Admin User',
        email: 'newadmin_' + Date.now() + '@example.com',
        password: 'Secret123',
        role: 'admin',
        isActive: true,
      }),
    });
    const createJson = await createRes.json();

    const listRes = await fetch('http://127.0.0.1:4102/api/users', { headers: adminHeaders });
    const listJson = await listRes.json();

    const targetId = String(createJson.data?._id ?? adminDoc._id);

    const getRes = await fetch('http://127.0.0.1:4102/api/users/' + targetId, { headers: adminHeaders });
    const getJson = await getRes.json();

    const updateRes = await fetch('http://127.0.0.1:4102/api/users/' + targetId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({ name: 'Updated User', role: 'teacher' }),
    });
    const updateJson = await updateRes.json();

    const statusRes = await fetch('http://127.0.0.1:4102/api/users/' + targetId + '/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({ isActive: false }),
    });
    const statusJson = await statusRes.json();

    const forbiddenRes = await fetch('http://127.0.0.1:4102/api/users', { headers: teacherHeaders });
    const forbiddenJson = await forbiddenRes.json();

    const studentRes = await fetch('http://127.0.0.1:4102/api/users', { headers: studentHeaders });
    const studentJson = await studentRes.json();

    console.log(JSON.stringify([
      { name: 'create', status: createRes.status, body: createJson },
      { name: 'list', status: listRes.status, body: listJson },
      { name: 'get', status: getRes.status, body: getJson },
      { name: 'update', status: updateRes.status, body: updateJson },
      { name: 'status', status: statusRes.status, body: statusJson },
      { name: 'teacher-forbidden', status: forbiddenRes.status, body: forbiddenJson },
      { name: 'student-forbidden', status: studentRes.status, body: studentJson },
    ], null, 2));
  } finally {
    server.close();
  }
});
