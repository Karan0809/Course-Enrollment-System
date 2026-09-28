import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { UserForm } from '../UserForm';

export default function NewAdminUserPage() { return <ProtectedRoute roles={['admin']}><section className="page-intro"><span className="eyebrow">Administration</span><h1>Create user</h1><UserForm /></section></ProtectedRoute>; }
