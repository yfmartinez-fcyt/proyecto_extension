import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { formatDate } from '../utils/format';

function Field({ label, value, className = '' }) {
  return (
    <div className={`dir-field ${className}`.trim()}>
      <div className="dir-field-label">{label}</div>
      <div className="dir-field-value">{value || '—'}</div>
    </div>
  );
}

export default function DirectorRevision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .directorRevision(id)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
  }, [id]);

  const accion = async (tipo) => {
    if ((tipo === 'rechazar' || tipo === 'observar') && !comentario.trim()) {
      setError('Debe escribir un comentario institucional para rechazar u observar.');
      return;
    }
    const mensajes = {
      aprobar: '¿Confirma la APROBACIÓN de este proyecto?',
      observar: '¿Registrar OBSERVACIONES? El proponente podrá corregir y reenviar.',
      rechazar: '¿Confirma el RECHAZO del proyecto?',
    };
    if (!window.confirm(mensajes[tipo] || '¿Confirmar acción?')) return;

    setLoading(true);
    setError('');
    try {
      await api.directorAccion(id, { accion: tipo, comentario });
      navigate('/director');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (error && !data) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <p className="text-muted">Cargando…</p>;

  const f = data.formulario || {};
  const cronograma = data.cronograma || [];
  const historial = data.historial || [];

  return (
    <div className="dir-page">
      <div className="dir-detail-header">
        <div>
          <Link to="/director" className="btn btn-link text-decoration-none ps-0 mb-2">
            <i className="bi bi-arrow-left" /> Volver a la bandeja
          </Link>
          <h1 className="h3 fw-bold dir-detail-title">{data.titulo}</h1>
          <p className="text-muted mb-0">
            Estado: <strong>{data.estado_etiqueta || data.estado}</strong>
            {data.fecha_envio ? ` · Enviado: ${formatDate(data.fecha_envio)}` : ''}
          </p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <section className="dir-section">
            <h2>
              <i className="bi bi-person-vcard me-2" />
              Proponente
            </h2>
            <div className="row">
              <div className="col-md-6">
                <Field label="Nombre" value={data.proponente_nombre} />
              </div>
              <div className="col-md-6">
                <Field label="Correo" value={data.proponente_correo} />
              </div>
              <div className="col-md-6">
                <Field label="Tipo" value={data.proponente_tipo} />
              </div>
              {data.cuenta ? (
                <div className="col-md-6">
                  <Field label="Cuenta en plataforma" value={data.cuenta} />
                </div>
              ) : null}
              <div className="col-md-6">
                <Field label="Teléfono" value={f.telefono_proponente} />
              </div>
              {f.docente_responsable ? (
                <div className="col-md-6">
                  <Field label="Docente responsable" value={f.docente_responsable} />
                </div>
              ) : null}
            </div>
          </section>

          <section className="dir-section">
            <h2>
              <i className="bi bi-diagram-3 me-2" />
              Clasificación y unidades
            </h2>
            <Field label="Línea de acción" value={data.linea} />
            <Field label="Sublínea" value={data.sublinea} />
            {(data.unidades || []).length > 0 && (
              <Field label="Unidades académicas" value={(data.unidades || []).join(', ')} />
            )}
            <div className="row">
              <div className="col-md-4">
                <Field label="Carrera" value={f.carrera} />
              </div>
              <div className="col-md-4">
                <Field label="Curso" value={f.curso} />
              </div>
              <div className="col-md-4">
                <Field label="Horas asignadas" value={f.horas} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <Field label="Fecha inicio" value={f.fecha_inicio} />
              </div>
              <div className="col-md-4">
                <Field label="Fecha fin" value={f.fecha_fin} />
              </div>
              <div className="col-md-4">
                <Field label="Hora" value={f.hora} />
              </div>
            </div>
          </section>

          <section className="dir-section">
            <h2>
              <i className="bi bi-file-text me-2" />
              Contenido de la propuesta
            </h2>
            <Field label="Organizaciones involucradas" value={f.organizaciones} />
            <Field label="Fundamentación" value={f.fundamentacion} />
            <Field label="Objetivos" value={f.objetivos} />
            <Field label="Metodología" value={f.metodologia} />
            <Field label="Metas" value={f.metas} />
            <Field label="Resultados esperados" value={f.resultados} />
            <Field label="Recursos humanos" value={f.recursos_humanos} />
            <Field label="Proponente de la actividad" value={f.proponente} />
            <Field label="Beneficiarios" value={f.beneficiarios} />
            <Field label="Localización" value={f.localizacion} />
            <Field label="Presupuesto" value={data.presupuesto || f.presupuesto} />
          </section>

          {cronograma.length > 0 && (
            <section className="dir-section">
              <h2>
                <i className="bi bi-calendar-week me-2" />
                Cronograma
              </h2>
              <div className="dir-table-wrap">
                <div className="table-responsive">
                  <table className="table dir-table dir-cronograma-table mb-0">
                    <thead>
                      <tr>
                        <th>Actividad</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Días</th>
                        <th>Horas ext.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cronograma.map((fila, i) => (
                        <tr key={i}>
                          <td>{fila.actividad}</td>
                          <td>{fila.fecha_inicio || '—'}</td>
                          <td>{fila.fecha_fin || '—'}</td>
                          <td>{fila.dias ?? '—'}</td>
                          <td>{fila.horas ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {historial.length > 0 && (
            <section className="dir-section">
              <h2>
                <i className="bi bi-clock-history me-2" />
                Historial de revisiones anteriores
              </h2>
              {historial.map((h) => (
                <div className="dir-historial-item" key={h.id}>
                  <strong>{h.accion_etiqueta}</strong>
                  <span className="text-muted"> — {formatDate(h.fecha)}</span>
                  {h.director ? (
                    <>
                      <br />
                      <small>Por: {h.director}</small>
                    </>
                  ) : null}
                  {h.comentario ? <p className="mb-0 mt-1 small">{h.comentario}</p> : null}
                  <small className="text-muted">
                    Estado: {h.estado_anterior} → {h.estado_nuevo_etiqueta || h.estado_nuevo}
                  </small>
                </div>
              ))}
            </section>
          )}
        </div>

        <div className="col-lg-4">
          <aside className="dir-actions-panel">
            <h2>
              <i className="bi bi-check2-square me-2" />
              Dictamen institucional
            </h2>
            <p className="small text-muted mb-3">
              Su decisión quedará registrada y el proponente verá el resultado en «Mis proyectos».
            </p>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <label htmlFor="comentario" className="form-label fw-semibold">
              Comentario institucional
            </label>
            <textarea
              id="comentario"
              className="form-control mb-3"
              rows={5}
              placeholder="Obligatorio al rechazar u observar. Opcional al aprobar."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />

            <button
              type="button"
              className="btn dir-action-btn dir-btn-aprobar"
              disabled={loading}
              onClick={() => accion('aprobar')}
            >
              <i className="bi bi-check-circle me-1" /> Aprobar proyecto
            </button>
            <button
              type="button"
              className="btn dir-action-btn dir-btn-observar"
              disabled={loading}
              onClick={() => accion('observar')}
            >
              <i className="bi bi-chat-left-text me-1" /> Observar (sugerencias)
            </button>
            <button
              type="button"
              className="btn dir-action-btn dir-btn-rechazar"
              disabled={loading}
              onClick={() => accion('rechazar')}
            >
              <i className="bi bi-x-circle me-1" /> Rechazar proyecto
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
