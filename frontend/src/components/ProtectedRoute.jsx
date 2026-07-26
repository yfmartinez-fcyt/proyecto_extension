import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 mb-0">Cargando sesión…</p>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) {
    if (user.rol === 'director_extension') return <Navigate to="/director" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

export function GuestRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }
  if (isAuthenticated) {
    if (user.rol === 'director_extension') return <Navigate to="/director" replace />;
    return <Navigate to="/proyectos/mis-proyectos" replace />;
  }
  return children;
}
