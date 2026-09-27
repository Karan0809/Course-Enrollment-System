import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<typeof mongoose> {
  if (!env.mongodbUri) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }

  try {
    await mongoose.connect(env.mongodbUri);
    console.log('MongoDB connected successfully.');
    return mongoose;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown MongoDB connection error';
    throw new Error(`MongoDB connection failed: ${message}`);
  }
}
