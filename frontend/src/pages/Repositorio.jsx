import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatDateShort } from '../utils/format';
import '../styles/repositorio_proyectos.css';

export default function Repositorio() {
  const [q, setQ] = useState('');
  const [queryApplied, setQueryApplied] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (query = '') => {
    setLoading(true);
    setError('');
    api
      .repositorio(query)
      .then((r) => {
        setItems(r.data || []);
        setQueryApplied(query);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load('');
  }, []);

  return (
    <div className="repositorio-page">
      <section className="page-header mb-4">
        <div className="header-content">
          <h1 className="page-title">Proyectos Aprobados</h1>
          <p className="page-subtitle mb-0">Lista de proyectos aprobados por la institución</p>
        </div>
      </section>

      <section className="search-section mb-4">
        <div className="content-card">
          <form
            className="row g-2"
            onSubmit={(e) => {
              e.preventDefault();
              load(q.trim());
            }}
          >
            <div className="col-md-8">
              <input
                type="text"
                className="form-control custom-input"
                placeholder="Buscar por nombre o fecha..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <button className="btn btn-primary flex-fill" type="submit">
                Buscar
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setQ('');
                  load('');
                }}
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="results-section">
        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <p className="text-muted">Cargando…</p>}

        {!loading && items.length > 0 && (
          <>
            {queryApplied ? (
              <p className="results-info">
                Resultados para: <strong>&quot;{queryApplied}&quot;</strong>
              </p>
            ) : null}
            <div className="row g-4">
              {items.map((p) => (
                <div className="col-12" key={p.id}>
                  <Link to={`/proyectos/detalle/${p.id}`} className="project-link">
                    <div className="content-card project-card">
                      <span className="badge bg-primary-soft">Proyecto aprobado</span>
                      <h3 className="project-title">{p.denominacion || 'Sin título'}</h3>
                      <p className="project-date">
                        <i className="bi bi-calendar" /> {formatDateShort(p.actualizado_en)}
                      </p>
                      <p className="project-summary">
                        {[p.linea, p.sublinea].filter(Boolean).join(' · ') ||
                          p.beneficiarios ||
                          'Proyecto de extensión aprobado.'}
                      </p>
                      <span className="project-link-text">Ver más →</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !items.length && !error && (
          <div className="content-card text-center empty-state">
            <p className="empty-text">No se encontraron proyectos</p>
            {queryApplied ? (
              <p className="empty-subtext">Intenta con otro nombre o fecha</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
