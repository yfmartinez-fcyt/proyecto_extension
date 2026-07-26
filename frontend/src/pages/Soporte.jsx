import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/soporte_tecnico.css';

export default function Soporte() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nombre: user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : '',
    email: user?.email || '',
    asunto: 'Consulta de soporte',
    mensaje: '',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!msg) return undefined;
    const t = setTimeout(() => setMsg(''), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');
    try {
      const r = await api.soporte(form);
      setMsg(r.message || 'Consulta enviada correctamente.');
      setForm((f) => ({ ...f, mensaje: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soporte-page">
      <section className="page-header mb-4">
        <div className="header-content">
          <h1 className="page-title">Centro de Soporte</h1>
          <p className="page-subtitle mb-0">
            Estamos aquí para ayudarte con cualquier problema del sistema
          </p>
        </div>
      </section>

      {msg && <div className="alert alert-success custom-alert auto-hide">{msg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <section className="mb-4">
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="content-card h-100">
              <h3 className="section-title mb-3">Contáctanos</h3>
              <form onSubmit={onSubmit}>
                <input
                  type="text"
                  name="nombre"
                  className="form-control custom-input mb-3"
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={onChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  className="form-control custom-input mb-3"
                  placeholder="Correo"
                  value={form.email}
                  onChange={onChange}
                  required
                />
                <textarea
                  name="mensaje"
                  className="form-control custom-input mb-3"
                  rows={5}
                  placeholder="Describe tu problema..."
                  value={form.mensaje}
                  onChange={onChange}
                  required
                />
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Enviando…' : 'Enviar consulta'}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="content-card h-100">
              <h3 className="section-title mb-3">Información</h3>
              <p className="text-muted">
                Nuestro equipo está disponible para ayudarte con cualquier inconveniente relacionado
                con el sistema.
              </p>
              <ul className="info-list">
                <li>
                  <i className="bi bi-envelope" /> soporte@extension.com
                </li>
                <li>
                  <i className="bi bi-telephone" /> +595 984 123 456
                </li>
                <li>
                  <i className="bi bi-clock" /> Lunes a Viernes (08:00 - 17:00)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="content-card">
          <h3 className="section-title mb-3">Preguntas Frecuentes</h3>
          <div className="faq-item">
            <h5>¿Cómo crear un proyecto?</h5>
            <p>Ve al menú lateral y selecciona &quot;Crear Proyecto&quot;.</p>
          </div>
          <div className="faq-item">
            <h5>¿Cómo ver proyectos aprobados?</h5>
            <p>En el apartado &quot;Proyectos&quot; / Repositorio.</p>
          </div>
          <div className="faq-item">
            <h5>¿A quién contactar?</h5>
            <p>Puedes usar el formulario o enviar un email.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
