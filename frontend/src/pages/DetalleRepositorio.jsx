import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { formatDateShort } from '../utils/format';
import '../styles/detalle_repositorio.css';

export default function DetalleRepositorio() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .detalleRepositorio(id)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <p className="text-muted">Cargando…</p>;

  const f = data.formulario || {};
  const descripcion =
    data.fundamentacion ||
    f.fundamentacion ||
    f.objetivos ||
    data.beneficiarios ||
    'Sin descripción disponible.';

  return (
    <div className="detalle-page">
      <section className="content-card">
        <h1 className="detalle-title">{data.denominacion}</h1>
        <p className="detalle-date">
          <i className="bi bi-calendar" /> {formatDateShort(data.actualizado_en)}
        </p>
        <p className="detalle-description">{descripcion}</p>
        <Link to="/proyectos/repositorio" className="btn btn-outline-primary mt-3">
          ← Volver a proyectos
        </Link>
      </section>
    </div>
  );
}
