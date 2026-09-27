import mongoose from 'mongoose';
import { User } from './users/user.model.js';
import { Course } from './courses/course.model.js';
import { Enrollment } from './enrollments/enrollment.model.js';

export async function verifyDatabaseSetup(): Promise<void> {
  const connectionState = mongoose.connection.readyState;

  if (connectionState !== 1) {
    throw new Error(`MongoDB connection is not ready. Current state: ${connectionState}`);
  }

  const models = [User, Course, Enrollment];

  for (const model of models) {
    if (!model.modelName) {
      throw new Error(`Model registration failed for ${String(model)}`);
    }
  }

  const indexes = await Enrollment.collection.indexes();
  const hasUniqueCompoundIndex = indexes.some(
    (index: { key?: Record<string, unknown>; unique?: boolean }) => {
      const keys = Object.keys(index.key ?? {});
      return keys.includes('studentId') && keys.includes('courseId') && index.unique === true;
    },
  );

  if (!hasUniqueCompoundIndex) {
    throw new Error('Enrollment unique compound index is missing.');
  }
}
