import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { CourseForm } from '../CourseForm';

export default function NewAdminCoursePage() { return <ProtectedRoute roles={['admin']}><section className="page-intro"><span className="eyebrow">Administration</span><h1>Create course</h1><CourseForm /></section></ProtectedRoute>; }
