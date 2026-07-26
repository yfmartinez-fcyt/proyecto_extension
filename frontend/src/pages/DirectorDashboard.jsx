import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatDate } from '../utils/format';

export default function DirectorDashboard() {
  const [data, setData] = useState({ total_pendientes: 0, proyectos: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .directorDashboard()
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
  }, []);

  const total = data.total_pendientes || 0;
  const proyectos = data.proyectos || [];

  return (
    <div className="dir-page">
      <header className="dir-hero">
        <h1>
          <i className="bi bi-inbox-fill me-2" />
          Bandeja de revisión
        </h1>
        <p>
          Propuestas enviadas por proponentes (alumnos y docentes) pendientes de su dictamen
          institucional.
        </p>
        <span className="dir-stat">
          <i className="bi bi-hourglass-split" />
          {total} pendiente{total === 1 ? '' : 's'}
        </span>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dir-table-wrap">
        {proyectos.length > 0 ? (
          <div className="table-responsive">
            <table className="table dir-table mb-0">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Proponente</th>
                  <th>Línea / sublínea</th>
                  <th>Enviado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.denominacion || 'Sin título'}</strong>
                      {p.carrera ? (
                        <>
                          <br />
                          <small className="text-muted">{p.carrera}</small>
                        </>
                      ) : null}
                    </td>
                    <td>
                      {p.proponente || '—'}
                      {p.proponente_correo ? (
                        <>
                          <br />
                          <small className="text-muted">{p.proponente_correo}</small>
                        </>
                      ) : null}
                    </td>
                    <td>
                      {p.linea ? (
                        <>
                          <small>{p.linea}</small>
                          <br />
                        </>
                      ) : null}
                      {p.sublinea || '—'}
                    </td>
                    <td>{formatDate(p.actualizado_en)}</td>
                    <td className="text-end">
                      <Link to={`/director/revision/${p.id}`} className="btn btn-sm dir-btn-review">
                        <i className="bi bi-clipboard-check me-1" />
                        Revisar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && (
            <div className="dir-empty">
              <i className="bi bi-check2-circle display-4 text-success mb-3 d-block" />
              <p className="mb-0">No hay proyectos pendientes de revisión en este momento.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
