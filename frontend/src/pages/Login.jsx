import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {

  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identificador: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {

      await login(form);

      navigate('/');

    } catch (err) {

      setError(err.message || 'No se pudo iniciar sesión');

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="auth-page">

      <div className="auth-card">


        <div className="auth-header">

          <div className="auth-icon">
            <i className="bi bi-mortarboard-fill"></i>
          </div>


          <h1>
            Bienvenido/a
          </h1>


          <p>
            Ingresa para gestionar tus proyectos de extensión.
          </p>


        </div>




        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >


          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}



          <label>
            Email o usuario

            <input
              type="text"
              name="identificador"
              value={form.identificador}
              onChange={handleChange}
              placeholder="correo@ejemplo.com o usuario"
              required
            />

          </label>



          <label>

            Contraseña

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

          </label>



          <div className="auth-actions">

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >

              {loading
                ? 'Ingresando...'
                : 'Iniciar sesión'
              }

            </button>


            <Link
              to="/"
              className="auth-btn-secondary"
            >
              Volver al inicio
            </Link>


          </div>


        </form>




        <p className="auth-footer">

          ¿No tienes cuenta?{' '}

          <Link to="/register">
            Regístrate
          </Link>

        </p>


      </div>


    </div>

  );
}