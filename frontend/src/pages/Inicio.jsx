import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import '../styles/inicio.css';

/**
 * Mismo contexto provisional que apps/core/views.py (Django),
 * para que el panel se vea igual a las capturas institucionales.
 */
const INICIO_DEMO = {
  total_aprobados: 193,
  aprobados_anio: 41,
  lineas_labels: [
    'Bienestar social y cultural',
    'Ambiente',
    'Comunidad',
    'Desarrollo tecnológico',
    'Economía',
    'Transversales',
  ],
  lineas_data: [41, 30, 26, 27, 34, 35],
  sublineas: {
    'Bienestar social y cultural': {
      labels: [
        'Inclusión Social y Promoción del Derecho',
        'Prevención de enfermedades',
        'Promoción y servicios de la Salud',
        'Promoción cultural y deportiva; formación cultural y desarrollo profesional',
      ],
      data: [7, 15, 8, 11],
    },
    Ambiente: {
      labels: [
        'Educación Ambiental, producción de servicios sustentables, sostenidos y sostenibles',
        'Preservación de recursos naturales',
      ],
      data: [10, 20],
    },
    Comunidad: {
      labels: [
        'Vinculación de la Extensión Universitaria con la Academia, la Investigación y el Bienestar Estudiantil para programas o proyectos',
        'Prácticas socioeducativas, aprendizaje, servicios o proyectos sociales estudiantiles',
      ],
      data: [12, 14],
    },
    'Desarrollo tecnológico': {
      labels: [
        'Proyectos de Innovación',
        'Investigación aplicada y resolución de problemas',
        'Transferencias científicas y tecnológicas',
      ],
      data: [9, 8, 10],
    },
    Economía: {
      labels: [
        'Indicadores socioeconómicos para contribuir con las políticas públicas',
        'Generación del crecimiento económico a través de la innovación y el emprendedorismo',
      ],
      data: [19, 15],
    },
    Transversales: {
      labels: ['Servicio Técnico Profesional', 'Espacio de intercambio de saberes', 'Casos excepcionales'],
      data: [15, 15, 5],
    },
  },
};

/** Igual que static/js/inicio.js */
function wrapLabel(text, maxLength = 30) {
  const words = String(text || '').split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxLength) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
    if (lines.length === 2) break;
  }

  if (lines.length < 2 && currentLine) {
    lines.push(currentLine);
  }

  if (words.join(' ').length > lines.join(' ').length) {
    lines[1] = `${lines[1] || ''}...`;
  }

  return lines;
}

function buildFromItems(items, catalogoLineas) {
  const lineasCount = {};
  const subMap = {};

  catalogoLineas.forEach((l) => {
    lineasCount[l.nombre] = 0;
    subMap[l.nombre] = {
      labels: (l.sublineas || []).map((s) => s.nombre),
      data: (l.sublineas || []).map(() => 0),
    };
  });

  items.forEach((p) => {
    const linea = p.linea || 'Sin línea';
    const sub = p.sublinea || 'Sin sublínea';
    lineasCount[linea] = (lineasCount[linea] || 0) + 1;
    if (!subMap[linea]) subMap[linea] = { labels: [], data: [] };
    const idx = subMap[linea].labels.indexOf(sub);
    if (idx === -1) {
      subMap[linea].labels.push(sub);
      subMap[linea].data.push(1);
    } else {
      subMap[linea].data[idx] += 1;
    }
  });

  const year = new Date().getFullYear();
  const labels = Object.keys(lineasCount);
  return {
    total_aprobados: items.length,
    aprobados_anio: items.filter(
      (p) => p.actualizado_en && new Date(p.actualizado_en).getFullYear() === year
    ).length,
    lineas_labels: labels,
    lineas_data: labels.map((l) => lineasCount[l]),
    sublineas: subMap,
  };
}

/** Misma animación de carga que Chart.js en Django (barras / doughnut). */
const CHART_ANIMATION = {
  duration: 1200,
  easing: 'easeOutQuart',
};

function observeOnce(element, onVisible) {
  if (!element || typeof IntersectionObserver === 'undefined') {
    onVisible();
    return () => {};
  }

  let done = false;
  const observer = new IntersectionObserver(
    (entries) => {
      if (done || !entries.some((e) => e.isIntersecting)) return;
      done = true;
      observer.disconnect();
      onVisible();
    },
    { threshold: 0.25, rootMargin: '0px 0px -40px 0px' }
  );

  observer.observe(element);
  return () => observer.disconnect();
}

export default function Inicio() {
  const [items, setItems] = useState([]);
  const [catalogoLineas, setCatalogoLineas] = useState([]);
  const [error, setError] = useState('');
  const [dataReady, setDataReady] = useState(false);
  const [lineaSel, setLineaSel] = useState(INICIO_DEMO.lineas_labels[0]);
  const lineasRef = useRef(null);
  const sublineasRef = useRef(null);
  const lineasWrapRef = useRef(null);
  const sublineasWrapRef = useRef(null);
  const lineasChart = useRef(null);
  const sublineasChart = useRef(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.repositorio(''), api.catalogo()])
      .then(([repo, cat]) => {
        if (cancelled) return;
        setItems(repo.data || []);
        setCatalogoLineas(cat.data?.lineas || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setDataReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const panel = useMemo(() => {
    // Con proyectos reales: datos vivos. Sin datos: mismo demo que Django.
    if (items.length > 0) return buildFromItems(items, catalogoLineas);
    return INICIO_DEMO;
  }, [items, catalogoLineas]);

  useEffect(() => {
    if (panel.lineas_labels.length && !panel.lineas_labels.includes(lineaSel)) {
      setLineaSel(panel.lineas_labels[0]);
    }
  }, [panel.lineas_labels, lineaSel]);

  useEffect(() => {
    if (!dataReady) return;
    const Chart = window.Chart;
    if (!Chart || !lineasRef.current) return;

    let cancelled = false;
    let raf = 0;
    const stopObserve = observeOnce(lineasWrapRef.current, () => {
      raf = requestAnimationFrame(() => {
        if (cancelled || !lineasRef.current) return;
        if (lineasChart.current) {
          lineasChart.current.destroy();
          lineasChart.current = null;
        }

        lineasChart.current = new Chart(lineasRef.current, {
          type: 'bar',
          data: {
            labels: panel.lineas_labels,
            datasets: [
              {
                label: 'Proyectos',
                data: panel.lineas_data,
                borderWidth: 1,
                borderRadius: 10,
              },
            ],
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: CHART_ANIMATION,
            animations: {
              x: { from: 0 },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title(chartItems) {
                    return chartItems[0]?.label || '';
                  },
                },
              },
            },
            scales: {
              x: { beginAtZero: true, ticks: { precision: 0 } },
              y: { ticks: { font: { size: 13 } } },
            },
          },
        });
      });
    });

    return () => {
      cancelled = true;
      stopObserve();
      cancelAnimationFrame(raf);
      if (lineasChart.current) {
        lineasChart.current.destroy();
        lineasChart.current = null;
      }
    };
  }, [dataReady, panel]);

  useEffect(() => {
    if (!dataReady) return;
    const Chart = window.Chart;
    if (!Chart || !sublineasRef.current) return;

    const info = panel.sublineas[lineaSel];
    if (!info) return;

    let cancelled = false;
    let raf = 0;

    const createDoughnut = () => {
      raf = requestAnimationFrame(() => {
        if (cancelled || !sublineasRef.current) return;
        if (sublineasChart.current) {
          sublineasChart.current.destroy();
          sublineasChart.current = null;
        }

        sublineasChart.current = new Chart(sublineasRef.current, {
          type: 'doughnut',
          data: {
            labels: info.labels,
            datasets: [
              {
                label: 'Proyectos',
                data: info.data,
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              ...CHART_ANIMATION,
              animateRotate: true,
              animateScale: true,
            },
            layout: { padding: { top: 10, bottom: 10 } },
            plugins: {
              legend: {
                position: 'bottom',
                align: 'start',
                labels: {
                  boxWidth: 14,
                  boxHeight: 14,
                  padding: 25,
                  font: { size: 11 },
                  textAlign: 'left',
                  generateLabels(chart) {
                    const original =
                      Chart.overrides?.doughnut?.plugins?.legend?.labels?.generateLabels?.(chart) ||
                      Chart.defaults.plugins.legend.labels.generateLabels(chart);
                    return original.map((item) => ({
                      ...item,
                      text: wrapLabel(chart.data.labels[item.index], 34),
                    }));
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label(context) {
                    return `${context.label || ''}: ${context.raw}`;
                  },
                },
              },
            },
          },
        });
      });
    };

    const stopObserve = observeOnce(sublineasWrapRef.current, createDoughnut);

    return () => {
      cancelled = true;
      stopObserve();
      cancelAnimationFrame(raf);
      if (sublineasChart.current) {
        sublineasChart.current.destroy();
        sublineasChart.current = null;
      }
    };
  }, [dataReady, lineaSel, panel]);

  return (
    <div className="inicio-page">
      <section className="hero-section mb-4">
        <div className="hero-content">
          <div>
            <h1 className="hero-title">Panel General de Extensión</h1>
            <p className="hero-subtitle mb-0">
              Consulta rápida de proyectos aprobados, distribución por líneas de acción e
              información institucional de la Dirección de Extensión.
            </p>
          </div>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="stats-section mb-4">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="metric-card">
              <div className="metric-icon">
                <i className="bi bi-folder-check" />
              </div>
              <div className="metric-body">
                <span className="metric-label">Proyectos aprobados en total</span>
                <h2 className="metric-value">{panel.total_aprobados}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="metric-card">
              <div className="metric-icon">
                <i className="bi bi-calendar-check" />
              </div>
              <div className="metric-body">
                <span className="metric-label">Proyectos aprobados este año</span>
                <h2 className="metric-value">{panel.aprobados_anio}</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="charts-section mb-4">
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="content-card h-100">
              <div className="card-header-custom">
                <div>
                  <h3 className="section-title mb-1">Proyectos por Línea de Acción</h3>
                  <p className="section-subtitle mb-0">
                    Distribución general de proyectos aprobados según la línea a la que pertenecen.
                  </p>
                </div>
              </div>
              <div className="chart-wrapper" ref={lineasWrapRef}>
                <canvas ref={lineasRef} id="lineasChart" />
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="content-card h-100">
              <div className="card-header-custom">
                <div>
                  <h3 className="section-title mb-1">Proyectos por Sublínea</h3>
                  <p className="section-subtitle mb-0">
                    Selecciona una línea para visualizar sus sublíneas asociadas.
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="lineaSelector" className="form-label section-label">
                  Seleccionar Línea de Acción
                </label>
                <select
                  id="lineaSelector"
                  className="form-select custom-select"
                  value={lineaSel}
                  onChange={(e) => setLineaSel(e.target.value)}
                >
                  {panel.lineas_labels.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="chart-wrapper small-chart" ref={sublineasWrapRef}>
                <canvas ref={sublineasRef} id="sublineasChart" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section mt-4">
        <div className="content-card contact-card">
          <div className="section-header mb-4">
            <h3 className="section-title text-center">Contáctanos</h3>
          </div>

          <div className="row g-4">
            <div className="col-12">
              <div className="row g-4">
                <div className="col-12 col-lg-3">
                  <div className="info-box">
                    <i className="bi bi-geo-alt info-icon" />
                    <h5>Dirección</h5>
                    <p>
                      Sargento Florentino Benítez
                      <br />
                      &amp; Padre Molas, 3300
                      <br />
                      Cnel. Oviedo - Paraguay
                    </p>
                  </div>
                </div>

                <div className="col-12 col-lg-3">
                  <div className="info-box">
                    <i className="bi bi-telephone info-icon" />
                    <h5>Llámanos</h5>
                    <p>+595 555 666 777</p>
                  </div>
                </div>

                <div className="col-12 col-lg-3">
                  <div className="info-box">
                    <i className="bi bi-envelope info-icon" />
                    <h5>Email</h5>
                    <p>ejemplo@fctunca.edu.py</p>
                  </div>
                </div>

                <div className="col-12 col-lg-3">
                  <div className="info-box">
                    <i className="bi bi-clock info-icon" />
                    <h5>Horario de Atención</h5>
                    <p>
                      Lunes a Viernes
                      <br />
                      07:00HS - 15:00HS
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
