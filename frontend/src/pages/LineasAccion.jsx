import { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/inicio.css';

export default function LineasAccion() {
  const [lineas, setLineas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .catalogo()
      .then((r) => setLineas(r.data.lineas || []))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="app-content-page">
      <section className="page-header mb-4">
        <h1 className="page-title">Líneas de Acción</h1>
        <p className="page-subtitle">Estás en la página de Líneas de Acción</p>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      {lineas.length > 0 && (
        <div className="row g-4">
          {lineas.map((l) => (
            <div className="col-md-6" key={l.id}>
              <div className="content-card h-100">
                <h3 className="section-title mb-2">{l.nombre}</h3>
                <ul className="mb-0 ps-3">
                  {(l.sublineas || []).map((s) => (
                    <li key={s.id}>{s.nombre}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
