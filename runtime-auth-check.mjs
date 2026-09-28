import process from 'node:process';

const base = 'http://127.0.0.1:4000';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: response.status, body: data, text };
}

async function main() {
  const email = `runtime_${Date.now()}@example.com`;
  const password = 'Secret123';

  console.log('=== REGISTER_VALID ===');
  const registerValid = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Runtime User', email, password }),
  });
  console.log(registerValid.status, JSON.stringify(registerValid.body));

  console.log('=== REGISTER_INVALID ===');
  const invalidRegister = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'bad-email', password: 'x' }),
  });
  console.log(invalidRegister.status, JSON.stringify(invalidRegister.body));

  console.log('=== REGISTER_DUPLICATE ===');
  const duplicateRegister = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Another User', email, password: 'Secret123' }),
  });
  console.log(duplicateRegister.status, JSON.stringify(duplicateRegister.body));

  console.log('=== REGISTER_ROLE_ESCALATION ===');
  const escalationEmail = `role_${Date.now()}@example.com`;
  const escalation = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Escalation Attempt', email: escalationEmail, password: 'Secret123', role: 'admin' }),
  });
  console.log(escalation.status, JSON.stringify(escalation.body));

  console.log('=== LOGIN_VALID ===');
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  console.log(login.status, JSON.stringify(login.body));
  const token = login.body?.data?.token;

  console.log('=== LOGIN_INVALID ===');
  const invalidLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'WrongPassword' }),
  });
  console.log(invalidLogin.status, JSON.stringify(invalidLogin.body));

  console.log('=== ME_VALID ===');
  const me = await request('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  console.log(me.status, JSON.stringify(me.body));

  console.log('=== ME_MISSING_TOKEN ===');
  const meMissing = await request('/api/auth/me');
  console.log(meMissing.status, JSON.stringify(meMissing.body));

  console.log('=== ME_INVALID_TOKEN ===');
  const meInvalid = await request('/api/auth/me', {
    headers: { Authorization: 'Bearer invalid.token.value' },
  });
  console.log(meInvalid.status, JSON.stringify(meInvalid.body));

  console.log('=== INACTIVE_LOGIN ===');
  const { default: mongoose } = await import('mongoose');
  const { env } = await import('./apps/api/src/config/env.js');
  const { User } = await import('./apps/api/src/modules/users/user.model.js');
  const inactiveEmail = `inactive_${Date.now()}@example.com`;
  await mongoose.connect(env.mongodbUri);
  const inactiveUser = await User.create({
    name: 'Inactive User',
    email: inactiveEmail,
    passwordHash: '$2a$12$gw5vMW/RB1ZmndVv2A3bIO1gyiRz4j8aQ84Ub2oGb1b7Ao7B1M0Nu',
    role: 'student',
    isActive: true,
  });
  await User.findByIdAndUpdate(inactiveUser._id, { isActive: false }, { new: true });
  const inactiveLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: inactiveEmail, password: 'Secret123' }),
  });
  console.log('DB_INACTIVE_SET', inactiveUser._id.toString());
  console.log(inactiveLogin.status, JSON.stringify(inactiveLogin.body));
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('RUNTIME_CHECK_ERROR', error);
  process.exit(1);
});
