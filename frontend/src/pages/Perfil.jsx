import { useAuth } from '../context/AuthContext';
import '../styles/inicio.css';

export default function Perfil() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="app-content-page">
      <section className="page-header mb-4">
        <h1 className="page-title">Mi perfil</h1>
        <p className="page-subtitle">Estás en la página de Mi perfil</p>
      </section>

      <div className="content-card">
        {isAuthenticated ? (
          <>
            <p>
              Estás logueado como:{' '}
              <strong>
                {user?.nombre} {user?.apellido}
              </strong>
            </p>
            <p>
              Usuario: <strong>{user?.username}</strong>
            </p>
            <p>
              Email: <strong>{user?.email}</strong>
            </p>
            <p className="mb-0">
              Rol: <strong>{user?.rol}</strong>
            </p>
          </>
        ) : (
          <p className="mb-0">No has iniciado sesión.</p>
        )}
      </div>
    </div>
  );
}
