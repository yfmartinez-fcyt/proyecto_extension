import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login({ identificador, password });
      if (data.user.rol === 'director_extension') navigate('/director');
      else navigate('/proyectos/mis-proyectos');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Iniciar sesión</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="identificador" className="form-label">
                    Email o usuario
                  </label>
                  <input
                    id="identificador"
                    className="form-control"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Ingresando…' : 'Entrar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
