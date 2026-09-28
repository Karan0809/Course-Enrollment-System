import dotenv from 'dotenv';
import type { SignOptions } from 'jsonwebtoken';

dotenv.config();

const configuredJwtSecret = process.env.JWT_SECRET?.trim();
if (
  !configuredJwtSecret
  || configuredJwtSecret.length < 32
  || configuredJwtSecret === 'change-me-to-a-strong-secret'
  || configuredJwtSecret.startsWith('replace-with-')
) {
  throw new Error('Set JWT_SECRET to a private random value with at least 32 characters.');
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  mongodbUri: process.env.MONGODB_URI ?? '',
  jwtSecret: configuredJwtSecret,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
};
