import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatDateShort } from '../utils/format';
import '../styles/mis_proyectos.css';

const BADGE_LABEL = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  sugerencias: 'Sugerencias',
  borrador: 'Borrador',
  rechazado: 'Rechazado',
  editable: 'Editable',
};

function badgeClass(estado) {
  const map = {
    pendiente: 'mp-pendiente',
    aprobado: 'mp-aprobado',
    sugerencias: 'mp-sugerencias',
    borrador: 'mp-borrador',
    rechazado: 'mp-rechazado',
  };
  return `mp-badge ${map[estado] || 'mp-borrador'}`;
}

export default function MisProyectos() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .misProyectos()
      .then((r) => setItems(r.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return;
    try {
      await api.eliminarProyecto(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="mp-page">
      <header className="mp-header">
        <h1 className="mp-title">Mis Proyectos</h1>
        <p className="mp-subtitle">
          Consulta el estado de tus proyectos y realiza acciones según corresponda.
        </p>
        <Link to="/proyectos/nuevo" className="btn btn-primary mp-btn-new">
          <i className="bi bi-plus-lg" aria-hidden="true" />
          Nuevo proyecto
        </Link>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p className="text-muted">Cargando…</p>}

      {!loading && !items.length && (
        <div className="mp-empty card shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-folder2-open mp-empty__icon" aria-hidden="true" />
            <p className="mb-3 text-muted">Aún no tiene proyectos registrados.</p>
            <Link to="/proyectos/nuevo" className="btn btn-primary">
              Crear primer proyecto
            </Link>
          </div>
        </div>
      )}

      {!!items.length && (
        <ul className="mp-list" role="list">
          {items.map((p) => (
            <li className="mp-card" key={p.id}>
              <div className="mp-card__top">
                <h2 className="mp-card__title">{p.denominacion || `Proyecto #${p.id}`}</h2>
                <span className={badgeClass(p.estado)}>
                  {BADGE_LABEL[p.estado] || p.estado_etiqueta || p.estado}
                </span>
              </div>

              {(p.fecha_inicio || p.actualizado_en) && (
                <p className="mp-card__meta">
                  <i className="bi bi-calendar3" aria-hidden="true" />
                  Inicio: {formatDateShort(p.fecha_inicio || p.actualizado_en)}
                </p>
              )}

              {p.ultima_revision?.comentario && (
                <p className="mp-card__meta mp-card__feedback">
                  <i className="bi bi-chat-square-text" aria-hidden="true" />
                  <strong> Dictamen del director:</strong> {p.ultima_revision.comentario}
                </p>
              )}

              <div className="mp-card__actions">
                {p.estado === 'aprobado' ? (
                  <Link
                    to="/informes/presentar"
                    className="btn btn-sm mp-btn-primary w-100 w-sm-auto"
                  >
                    <i className="bi bi-file-earmark-text" aria-hidden="true" />
                    Presentar informe
                  </Link>
                ) : p.editable ? (
                  <>
                    <Link
                      to={`/proyectos/editar/${p.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bi bi-pencil-square" aria-hidden="true" />
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(p.id)}
                    >
                      <i className="bi bi-trash" aria-hidden="true" />
                      Eliminar
                    </button>
                  </>
                ) : p.estado === 'rechazado' ? (
                  <span className="text-muted small">Sin acciones disponibles</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
