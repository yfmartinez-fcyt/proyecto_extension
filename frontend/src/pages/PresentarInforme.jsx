import { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/inicio.css';

export default function PresentarInforme() {
  const [proyectos, setProyectos] = useState([]);
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    proyecto_id: '',
    semestre: '',
    tema: '',
    fecha_inicio: '',
    fecha_fin: '',
    tiempo_duracion: '',
    medios_utilizados: '',
    descripcion: '',
    logros_obtenidos: '',
    dificultades: '',
    modalidad: '',
    recomendaciones: '',
  });

  useEffect(() => {
    api
      .proyectosAprobados()
      .then((r) => setProyectos(r.data || []))
      .catch((e) => setError(e.message));
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      [...files].forEach((file) => fd.append('evidencias', file));
      const r = await api.presentarInforme(fd);
      setMsg(r.message);
      setForm((f) => ({
        ...f,
        tema: '',
        descripcion: '',
        logros_obtenidos: '',
        dificultades: '',
        recomendaciones: '',
      }));
      setFiles([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-content-page">
      <section className="page-header mb-4">
        <h1 className="page-title">Presentar informe</h1>
        <p className="page-subtitle mb-0">
          Adjuntá y enviá informes de avance o cierre vinculados a proyectos aprobados.
        </p>
      </section>

      {msg && <div className="alert alert-success custom-alert">{msg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <section className="content-card">
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Proyecto</label>
            <select
              className="form-select custom-select"
              name="proyecto_id"
              value={form.proyecto_id}
              onChange={onChange}
              required
            >
              <option value="">Seleccionar…</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.denominacion}
                </option>
              ))}
            </select>
            {!proyectos.length && (
              <div className="form-text">No tenés proyectos aprobados todavía.</div>
            )}
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Semestre</label>
              <input
                className="form-control custom-input"
                name="semestre"
                value={form.semestre}
                onChange={onChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Modalidad</label>
              <input
                className="form-control custom-input"
                name="modalidad"
                value={form.modalidad}
                onChange={onChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Tema</label>
              <input
                className="form-control custom-input"
                name="tema"
                value={form.tema}
                onChange={onChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Fecha inicio</label>
              <input
                type="date"
                className="form-control custom-input"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={onChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Fecha fin</label>
              <input
                type="date"
                className="form-control custom-input"
                name="fecha_fin"
                value={form.fecha_fin}
                onChange={onChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Duración</label>
              <input
                className="form-control custom-input"
                name="tiempo_duracion"
                value={form.tiempo_duracion}
                onChange={onChange}
              />
            </div>
            {[
              ['medios_utilizados', 'Medios utilizados'],
              ['descripcion', 'Descripción'],
              ['logros_obtenidos', 'Logros'],
              ['dificultades', 'Dificultades'],
              ['recomendaciones', 'Recomendaciones'],
            ].map(([name, label]) => (
              <div className="col-12" key={name}>
                <label className="form-label">{label}</label>
                <textarea
                  className="form-control custom-input"
                  rows={3}
                  name={name}
                  value={form[name]}
                  onChange={onChange}
                />
              </div>
            ))}
            <div className="col-12">
              <label className="form-label">Evidencias</label>
              <input
                type="file"
                className="form-control custom-input"
                multiple
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>
          </div>

          <button className="btn btn-primary mt-3" disabled={loading || !proyectos.length}>
            {loading ? 'Enviando…' : 'Presentar informe'}
          </button>
        </form>
      </section>
    </div>
  );
}
