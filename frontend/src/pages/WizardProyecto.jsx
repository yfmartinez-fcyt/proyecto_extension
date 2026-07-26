import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toDateInputValue } from '../utils/dates';
import '../styles/nuevo_proyecto.css';

const STEP_META = [
  { icon: 'bi-person-fill', label: 'Datos del Proponente' },
  { icon: 'bi-folder2-open', label: 'Datos del Proyecto' },
  { icon: 'bi-clipboard-check', label: 'Actividad' },
  { icon: 'bi-check-lg', label: 'Confirmación' },
];

const CRONOGRAMA_DEFAULTS = [
  'Llenado de formulario',
  'Solicitar aprobación a Decanato',
  'Elaboración del programa de actividad',
  'Conformación del equipo de trabajo',
  'Participación y cobertura en el día del evento',
  'Acreditación de horas de extensión universitaria',
  'Período de reclamo y/o ajustes en acreditación',
];

const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{2,80}$/;
const REGEX_DOCENTE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{5,100}$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^(\+5959\d{8}|5959\d{8}|09\d{8})$/;

const emptyForm = () => {
  const base = {
    nombre_proponente: '',
    apellido_proponente: '',
    correo_proponente: '',
    telefono_proponente: '',
    estudiante_proponente: 'Sí',
    docente_responsable: '',
    linea_id: '',
    sublinea_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    hora: '',
    horas: '',
    unidad_academica_ids: [],
    carrera: '',
    curso: '',
    organizaciones: '',
    fundamentacion: '',
    objetivos: '',
    metodologia: '',
    metas: '',
    resultados: '',
    recursos_humanos: '',
    proponente: '',
    beneficiarios: '',
    localizacion: '',
    presupuesto: '',
    declaracion_revision: false,
  };
  for (let i = 1; i <= 7; i += 1) {
    base[`cronograma_actividad_${i}`] = CRONOGRAMA_DEFAULTS[i - 1] || '';
    base[`cronograma_inicio_${i}`] = '';
    base[`cronograma_dias_${i}`] = '';
    base[`cronograma_hora_${i}`] = '';
    base[`cronograma_fin_${i}`] = '';
    base[`cronograma_credito_${i}`] = '';
  }
  return base;
};

function normalizeFormDates(data) {
  const next = { ...data };
  next.fecha_inicio = toDateInputValue(data.fecha_inicio);
  next.fecha_fin = toDateInputValue(data.fecha_fin);
  for (let i = 1; i <= 7; i += 1) {
    next[`cronograma_inicio_${i}`] = toDateInputValue(data[`cronograma_inicio_${i}`]);
    next[`cronograma_fin_${i}`] = toDateInputValue(data[`cronograma_fin_${i}`]);
  }
  return next;
}

function FieldError({ message }) {
  return <small className="error-message">{message || ''}</small>;
}

function invalidClass(base, hasError) {
  return `${base}${hasError ? ' is-invalid' : ''}`;
}

export default function WizardProyecto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [catalogo, setCatalogo] = useState({ lineas: [], unidades: [] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const modo = id ? 'editar' : 'nuevo';

  useEffect(() => {
    api.catalogo().then((r) => setCatalogo(r.data)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!id) {
      setForm((f) => ({
        ...f,
        nombre_proponente: user?.nombre || f.nombre_proponente,
        apellido_proponente: user?.apellido || f.apellido_proponente,
        correo_proponente: user?.email || f.correo_proponente,
        estudiante_proponente: user?.rol === 'docente' ? 'No' : 'Sí',
      }));
      return;
    }
    api
      .proyecto(id)
      .then((r) => {
        if (!r.data.editable) {
          setError('Este proyecto ya no se puede editar');
          return;
        }
        setForm((prev) =>
          normalizeFormDates({ ...prev, ...r.data.formulario, declaracion_revision: false })
        );
      })
      .catch((e) => setError(e.message));
  }, [id, user]);

  const sublineas = useMemo(() => {
    const linea = catalogo.lineas.find((l) => String(l.id) === String(form.linea_id));
    return linea?.sublineas || [];
  }, [catalogo, form.linea_id]);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((errs) => {
      if (!errs[name]) return errs;
      const next = { ...errs };
      delete next[name];
      return next;
    });
  };

  const addUnidad = () => {
    setForm((f) => ({
      ...f,
      unidad_academica_ids: [...(f.unidad_academica_ids || []), ''],
    }));
  };

  const setUnidadAt = (index, value) => {
    setForm((f) => {
      const ids = [...(f.unidad_academica_ids || [])];
      ids[index] = value ? Number(value) : '';
      return { ...f, unidad_academica_ids: ids };
    });
    setFieldErrors((errs) => {
      if (!errs.unidad_academica_ids) return errs;
      const next = { ...errs };
      delete next.unidad_academica_ids;
      return next;
    });
  };

  const unidadSlots =
    (form.unidad_academica_ids || []).length > 0 ? form.unidad_academica_ids : [''];

  const validateStep = (stepIndex, { requireDeclaracion = false } = {}) => {
    const errs = {};
    const t = (v) => String(v || '').trim();

    if (stepIndex === 0) {
      if (!t(form.nombre_proponente)) errs.nombre_proponente = 'El nombre es obligatorio.';
      else if (!REGEX_NOMBRE.test(t(form.nombre_proponente))) {
        errs.nombre_proponente =
          'El nombre debe tener entre 2 y 80 caracteres, solo letras y espacios.';
      }

      if (!t(form.apellido_proponente)) errs.apellido_proponente = 'El apellido es obligatorio.';
      else if (!REGEX_NOMBRE.test(t(form.apellido_proponente))) {
        errs.apellido_proponente =
          'El apellido debe tener entre 2 y 80 caracteres, solo letras y espacios.';
      }

      if (!t(form.correo_proponente)) {
        errs.correo_proponente = 'El correo electrónico es obligatorio.';
      } else if (!REGEX_CORREO.test(t(form.correo_proponente))) {
        errs.correo_proponente = 'Ingrese un correo electrónico válido.';
      }

      if (!t(form.telefono_proponente)) errs.telefono_proponente = 'El teléfono es obligatorio.';
      else if (!REGEX_TELEFONO.test(t(form.telefono_proponente))) {
        errs.telefono_proponente =
          'Ingrese un teléfono válido. Ej: 0981123456, 595981123456 o +595981123456.';
      }

      if (!form.estudiante_proponente) {
        errs.estudiante_proponente = 'Debe seleccionar una opción.';
      }

      if (form.estudiante_proponente === 'Sí') {
        if (!t(form.docente_responsable)) {
          errs.docente_responsable = 'El nombre del docente responsable es obligatorio.';
        } else if (!REGEX_DOCENTE.test(t(form.docente_responsable))) {
          errs.docente_responsable =
            'El docente responsable debe tener entre 5 y 100 caracteres, solo letras y espacios.';
        }
      }
    }

    if (stepIndex === 1) {
      if (!form.linea_id) errs.linea_id = 'Debe seleccionar una línea de acción.';
      if (!form.sublinea_id) errs.sublinea_id = 'Debe seleccionar una sublínea.';

      if (!form.fecha_inicio) errs.fecha_inicio = 'La fecha de realización es obligatoria.';
      if (!form.fecha_fin) errs.fecha_fin = 'La fecha de finalización es obligatoria.';
      if (form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
        errs.fecha_fin = 'La fecha de finalización no puede ser anterior a la de inicio.';
      }

      if (!form.hora) errs.hora = 'La hora es obligatoria.';
      if (!t(form.horas)) errs.horas = 'Las horas asignadas son obligatorias.';
      else if (!/^\d+$/.test(t(form.horas)) || Number(form.horas) <= 0) {
        errs.horas = 'Ingrese un número entero positivo de horas.';
      }

      if (!(form.unidad_academica_ids || []).filter(Boolean).length) {
        errs.unidad_academica_ids = 'Debe seleccionar al menos una unidad académica.';
      }

      if (!t(form.organizaciones)) {
        errs.organizaciones = 'Las organizaciones involucradas son obligatorias.';
      }
      if (!t(form.fundamentacion)) errs.fundamentacion = 'La fundamentación es obligatoria.';
      if (!t(form.objetivos)) {
        errs.objetivos = 'Los objetivos generales y específicos son obligatorios.';
      }
      if (!t(form.metodologia)) {
        errs.metodologia = 'La metodología de implementación es obligatoria.';
      }
      if (!t(form.metas)) errs.metas = 'Las metas son obligatorias.';
      if (!t(form.resultados)) errs.resultados = 'Los resultados esperados son obligatorios.';
    }

    if (stepIndex === 2) {
      if (!t(form.recursos_humanos)) {
        errs.recursos_humanos = 'Los recursos humanos participantes son obligatorios.';
      }
      if (!t(form.beneficiarios)) {
        errs.beneficiarios = 'La identificación de beneficiarios es obligatoria.';
      }
      if (!t(form.localizacion)) errs.localizacion = 'Debe seleccionar una localización.';
      if (!t(form.presupuesto)) errs.presupuesto = 'El presupuesto es obligatorio.';
      if (!t(form.cronograma_actividad_1)) {
        errs.cronograma_actividad_1 = 'Cargue al menos la primera actividad del cronograma.';
      }
      if (requireDeclaracion && !form.declaracion_revision) {
        errs.declaracion_revision =
          'Debe confirmar que revisó los datos antes de enviar el proyecto.';
      }
    }

    if (stepIndex === 3 && requireDeclaracion && !form.declaracion_revision) {
      errs.declaracion_revision =
        'Debe confirmar que revisó los datos antes de enviar el proyecto.';
    }

    return errs;
  };

  const next = () => {
    const errs = validateStep(step);
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      setError('Revise los campos marcados en rojo.');
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, STEP_META.length - 1));
  };

  const save = async (accion) => {
    const requireDeclaracion = accion === 'enviar';
    for (let s = 0; s < 3; s += 1) {
      const errs = validateStep(s, { requireDeclaracion: s === 2 && requireDeclaracion });
      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        setStep(s);
        setError('Revise los campos marcados en rojo.');
        return;
      }
    }
    if (requireDeclaracion && !form.declaracion_revision) {
      setFieldErrors({
        declaracion_revision: 'Debe confirmar que revisó los datos antes de enviar el proyecto.',
      });
      setStep(3);
      setError('Debe aceptar la declaración para enviar.');
      return;
    }

    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      const normalized = normalizeFormDates(form);
      const payload = {
        ...normalized,
        unidad_academica_ids: (normalized.unidad_academica_ids || []).filter(Boolean).map(Number),
        accion,
      };
      await api.guardarProyecto(payload, id);
      navigate('/proyectos/mis-proyectos');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const fechaInicioShow = toDateInputValue(form.fecha_inicio) || form.fecha_inicio || '—';
  const fechaFinShow = toDateInputValue(form.fecha_fin) || form.fecha_fin || '—';

  return (
    <>
      <div className="nuevo-proyecto-page">
      <section className="hero-section">
        <h2 className="hero-title">
          {modo === 'editar' ? 'Editar proyecto' : 'Formulario de Proyecto'}
        </h2>
        <p className="hero-description">
          {modo === 'editar' ? (
            <>
              Actualice los datos de su propuesta.
              <br />
              <span className="edit-mode-badge">Modo edición — proyecto #{id}</span>
            </>
          ) : (
            <>
              Complete el formulario institucional de extensión.
              <br />
              Verifique los datos antes del envío para agilizar el proceso de revisión institucional.
            </>
          )}
        </p>
      </section>

      <div className="form-wrapper">
        <section className="wizard-shell">
          <header className="wizard-header">
            <p className="wizard-kicker">
              {modo === 'editar' ? 'Edición de propuesta' : 'Formulario institucional'}
            </p>
            <h3 className="wizard-title">
              {modo === 'editar'
                ? 'Actualizar programa, proyecto o actividad'
                : 'Registro de programa, proyecto o actividad'}
            </h3>
            <p className="wizard-subtitle">
              {modo === 'editar'
                ? 'Revise cada paso, guarde cambios o reenvíe cuando esté listo.'
                : 'Complete las etapas del formulario para remitir su propuesta de extensión.'}
            </p>

            <div className="wizard-steps" aria-label="Progreso del formulario">
              {STEP_META.map((s, i) => (
                <div
                  key={s.label}
                  className={`wizard-step${i === step ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}
                >
                  <span className="wizard-step-circle">
                    <i className={`bi ${s.icon}`} aria-hidden="true" />
                  </span>
                  <span className="wizard-step-label">{s.label}</span>
                </div>
              ))}
            </div>
          </header>

          {error && (
            <div className="wizard-alerta" role="alert">
              {error}
            </div>
          )}

          {step === 0 && (
            <main className="main-proponente wizard-panel is-active">
              <h2 className="section-heading">Datos del Proponente</h2>
              <div className="form-grid">
                <div>
                  <label className="form-label" htmlFor="nombre_proponente">
                    Nombre:
                  </label>
                  <input
                    className={invalidClass('form-input', fieldErrors.nombre_proponente)}
                    id="nombre_proponente"
                    value={form.nombre_proponente}
                    onChange={(e) => set('nombre_proponente', e.target.value)}
                  />
                  <FieldError message={fieldErrors.nombre_proponente} />
                </div>
                <div>
                  <label className="form-label" htmlFor="apellido_proponente">
                    Apellido:
                  </label>
                  <input
                    className={invalidClass('form-input', fieldErrors.apellido_proponente)}
                    id="apellido_proponente"
                    value={form.apellido_proponente}
                    onChange={(e) => set('apellido_proponente', e.target.value)}
                  />
                  <FieldError message={fieldErrors.apellido_proponente} />
                </div>
                <div>
                  <label className="form-label" htmlFor="correo_proponente">
                    Correo electrónico:
                  </label>
                  <input
                    className={invalidClass('form-input', fieldErrors.correo_proponente)}
                    id="correo_proponente"
                    value={form.correo_proponente}
                    onChange={(e) => set('correo_proponente', e.target.value)}
                  />
                  <FieldError message={fieldErrors.correo_proponente} />
                </div>
                <div>
                  <label className="form-label" htmlFor="telefono_proponente">
                    Teléfono:
                  </label>
                  <input
                    className={invalidClass('form-input', fieldErrors.telefono_proponente)}
                    id="telefono_proponente"
                    placeholder="0981123456"
                    value={form.telefono_proponente}
                    onChange={(e) => set('telefono_proponente', e.target.value)}
                  />
                  <FieldError message={fieldErrors.telefono_proponente} />
                </div>
                <div className="full-width">
                  <label className="form-label">¿Es estudiante?</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        checked={form.estudiante_proponente === 'Sí'}
                        onChange={() => set('estudiante_proponente', 'Sí')}
                      />
                      <span>Sí</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        checked={form.estudiante_proponente === 'No'}
                        onChange={() => set('estudiante_proponente', 'No')}
                      />
                      <span>No</span>
                    </label>
                  </div>
                  <FieldError message={fieldErrors.estudiante_proponente} />
                </div>
                {form.estudiante_proponente === 'Sí' && (
                  <div className="full-width" id="docente-responsable-campo">
                    <label className="form-label" htmlFor="docente_responsable">
                      Nombre del Docente Responsable:
                    </label>
                    <input
                      className={invalidClass('form-input', fieldErrors.docente_responsable)}
                      id="docente_responsable"
                      value={form.docente_responsable}
                      onChange={(e) => set('docente_responsable', e.target.value)}
                    />
                    <FieldError message={fieldErrors.docente_responsable} />
                  </div>
                )}
              </div>
              <div className="wizard-actions">
                <button type="button" className="wizard-btn wizard-btn-primary" onClick={next}>
                  Siguiente
                </button>
              </div>
            </main>
          )}

          {step === 1 && (
            <main className="main-proyecto wizard-panel is-active">
              <h2 className="section-heading">Formulario de Programa, Proyecto o Actividad</h2>
              <div className="form-grid">
                <div>
                  <label className="form-label" htmlFor="denominacion-select">
                    Denominación/Línea de acción:
                  </label>
                  <select
                    className={invalidClass('form-input', fieldErrors.linea_id)}
                    id="denominacion-select"
                    value={form.linea_id}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, linea_id: e.target.value, sublinea_id: '' }));
                      setFieldErrors((errs) => {
                        const nextErrs = { ...errs };
                        delete nextErrs.linea_id;
                        delete nextErrs.sublinea_id;
                        return nextErrs;
                      });
                    }}
                  >
                    <option value="">Seleccione una línea de acción</option>
                    {catalogo.lineas.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nombre}
                      </option>
                    ))}
                  </select>
                  <FieldError message={fieldErrors.linea_id} />
                  {form.linea_id ? (
                    <div style={{ marginTop: 10 }}>
                      <label className="form-label" htmlFor="sublinea-select">
                        Seleccione una sublínea:
                      </label>
                      <select
                        className={invalidClass('form-input', fieldErrors.sublinea_id)}
                        id="sublinea-select"
                        value={form.sublinea_id}
                        onChange={(e) => set('sublinea_id', e.target.value)}
                      >
                        <option value="">Seleccione una sublínea</option>
                        {sublineas.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre}
                          </option>
                        ))}
                      </select>
                      <FieldError message={fieldErrors.sublinea_id} />
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="form-label" htmlFor="fecha_inicio">
                    Fecha de realización:
                  </label>
                  <input
                    type="date"
                    className={invalidClass('form-input', fieldErrors.fecha_inicio)}
                    id="fecha_inicio"
                    value={toDateInputValue(form.fecha_inicio)}
                    onChange={(e) => set('fecha_inicio', e.target.value)}
                  />
                  <FieldError message={fieldErrors.fecha_inicio} />
                </div>
                <div>
                  <label className="form-label" htmlFor="fecha_fin">
                    Fecha de finalización:
                  </label>
                  <input
                    type="date"
                    className={invalidClass('form-input', fieldErrors.fecha_fin)}
                    id="fecha_fin"
                    value={toDateInputValue(form.fecha_fin)}
                    onChange={(e) => set('fecha_fin', e.target.value)}
                  />
                  <FieldError message={fieldErrors.fecha_fin} />
                </div>
                <div>
                  <label className="form-label" htmlFor="hora">
                    Hora:
                  </label>
                  <input
                    type="time"
                    className={invalidClass('form-input', fieldErrors.hora)}
                    id="hora"
                    value={form.hora}
                    onChange={(e) => set('hora', e.target.value)}
                  />
                  <FieldError message={fieldErrors.hora} />
                </div>
                <div>
                  <label className="form-label" htmlFor="horas">
                    Horas asignadas:
                  </label>
                  <input
                    type="number"
                    className={invalidClass('form-input', fieldErrors.horas)}
                    id="horas"
                    placeholder="Horas a ser computadas en la planilla"
                    value={form.horas}
                    onChange={(e) => set('horas', e.target.value)}
                  />
                  <FieldError message={fieldErrors.horas} />
                </div>

                <div id="unidades-academicas-container" className="full-width">
                  {unidadSlots.map((uid, index) => (
                    <div className="unidad-academica-group" key={`ua-${index}`}>
                      <label className="form-label" htmlFor={`unidad_academica_${index + 1}`}>
                        Unidad Académica:
                      </label>
                      <select
                        className={invalidClass(
                          'form-input unidad-academica-select',
                          fieldErrors.unidad_academica_ids
                        )}
                        id={`unidad_academica_${index + 1}`}
                        value={uid || ''}
                        onChange={(e) => setUnidadAt(index, e.target.value)}
                      >
                        <option value="">Seleccione una unidad académica</option>
                        {(catalogo.unidades || []).map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <FieldError message={fieldErrors.unidad_academica_ids} />
                </div>
                <div className="full-width">
                  <button type="button" id="agregar-unidad-btn" onClick={addUnidad}>
                    Agregar otra unidad académica
                  </button>
                </div>

                <div>
                  <label className="form-label" htmlFor="carrera">
                    Carrera:
                  </label>
                  <input
                    className="form-input"
                    id="carrera"
                    placeholder="Ingrese la carrera"
                    value={form.carrera}
                    onChange={(e) => set('carrera', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="curso">
                    Curso:
                  </label>
                  <input
                    className="form-input"
                    id="curso"
                    placeholder="Ingrese el curso"
                    value={form.curso}
                    onChange={(e) => set('curso', e.target.value)}
                  />
                </div>

                <div className="full-width">
                  <label className="form-label" htmlFor="organizaciones-textarea">
                    Organizaciones Involucradas:
                  </label>
                  <textarea
                    className={invalidClass('form-textarea', fieldErrors.organizaciones)}
                    id="organizaciones-textarea"
                    placeholder="Ingrese las organizaciones involucradas"
                    value={form.organizaciones}
                    onChange={(e) => set('organizaciones', e.target.value)}
                  />
                  <FieldError message={fieldErrors.organizaciones} />
                </div>
                <div className="full-width">
                  <label className="form-label" htmlFor="fundamentacion">
                    Fundamentación:
                  </label>
                  <textarea
                    className={invalidClass('form-textarea', fieldErrors.fundamentacion)}
                    id="fundamentacion"
                    value={form.fundamentacion}
                    onChange={(e) => set('fundamentacion', e.target.value)}
                  />
                  <FieldError message={fieldErrors.fundamentacion} />
                </div>
                <div className="full-width">
                  <label className="form-label" htmlFor="objetivos-textarea">
                    Objetivos generales y específicos:
                  </label>
                  <textarea
                    className={invalidClass('form-textarea', fieldErrors.objetivos)}
                    id="objetivos-textarea"
                    placeholder="Describa los objetivos generales y específicos"
                    value={form.objetivos}
                    onChange={(e) => set('objetivos', e.target.value)}
                  />
                  <FieldError message={fieldErrors.objetivos} />
                </div>
                <div className="full-width">
                  <label className="form-label" htmlFor="metodologia">
                    Metodología de Implementación:
                  </label>
                  <textarea
                    className={invalidClass('form-textarea', fieldErrors.metodologia)}
                    id="metodologia"
                    value={form.metodologia}
                    onChange={(e) => set('metodologia', e.target.value)}
                  />
                  <FieldError message={fieldErrors.metodologia} />
                </div>
                <div>
                  <label className="form-label" htmlFor="metas-textarea">
                    Metas:
                  </label>
                  <textarea
                    className={invalidClass('form-textarea', fieldErrors.metas)}
                    id="metas-textarea"
                    placeholder="Describa las metas del proyecto"
                    value={form.metas}
                    onChange={(e) => set('metas', e.target.value)}
                  />
                  <FieldError message={fieldErrors.metas} />
                </div>
                <div>
                  <label className="form-label" htmlFor="resultados">
                    Resultados esperados:
                  </label>
                  <textarea
                    className={invalidClass('form-textarea', fieldErrors.resultados)}
                    id="resultados"
                    value={form.resultados}
                    onChange={(e) => set('resultados', e.target.value)}
                  />
                  <FieldError message={fieldErrors.resultados} />
                </div>
              </div>
              <div className="wizard-actions">
                <button
                  type="button"
                  className="wizard-btn wizard-btn-secondary"
                  onClick={() => {
                    setFieldErrors({});
                    setError('');
                    setStep(0);
                  }}
                >
                  Anterior
                </button>
                <button type="button" className="wizard-btn wizard-btn-primary" onClick={next}>
                  Siguiente
                </button>
              </div>
            </main>
          )}

          {step === 2 && (
            <main className="main-proyecto wizard-panel is-active">
              <h2 className="section-heading">Indicadores de evaluación</h2>
              <div className="form-grid">
                <div>
                  <label className="form-label" htmlFor="recursos_humanos">
                    Recursos Humanos participantes:
                  </label>
                  <textarea
                    className={invalidClass('form-textarea', fieldErrors.recursos_humanos)}
                    id="recursos_humanos"
                    value={form.recursos_humanos}
                    onChange={(e) => set('recursos_humanos', e.target.value)}
                  />
                  <FieldError message={fieldErrors.recursos_humanos} />
                </div>
                <div>
                  <label className="form-label" htmlFor="proponente">
                    Proponente:
                  </label>
                  <input
                    className="form-input"
                    id="proponente"
                    value={form.proponente}
                    onChange={(e) => set('proponente', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="beneficiarios">
                    Identificación de Beneficiarios:
                  </label>
                  <textarea
                    className={invalidClass('form-textarea', fieldErrors.beneficiarios)}
                    id="beneficiarios"
                    value={form.beneficiarios}
                    onChange={(e) => set('beneficiarios', e.target.value)}
                  />
                  <FieldError message={fieldErrors.beneficiarios} />
                </div>
                <div>
                  <label className="form-label" htmlFor="localizacion">
                    Localización:
                  </label>
                  <select
                    className={invalidClass('form-input', fieldErrors.localizacion)}
                    id="localizacion"
                    value={form.localizacion}
                    onChange={(e) => set('localizacion', e.target.value)}
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Distrito">Distrito</option>
                    <option value="Ciudad-compañía-barrio">Ciudad-compañía-barrio</option>
                    <option value="Local">Local</option>
                  </select>
                  <FieldError message={fieldErrors.localizacion} />
                </div>
                <div className="full-width">
                  <label className="form-label" htmlFor="presupuesto">
                    Presupuesto:
                  </label>
                  <textarea
                    className={invalidClass('form-textarea', fieldErrors.presupuesto)}
                    id="presupuesto"
                    value={form.presupuesto}
                    onChange={(e) => set('presupuesto', e.target.value)}
                  />
                  <FieldError message={fieldErrors.presupuesto} />
                </div>

                <div className="full-width">
                  <label className="form-label cronograma-label">Cronograma:</label>
                  <div className="cronograma-wrap">
                    <table className="form-table cronograma-table">
                      <thead>
                        <tr>
                          <th>Actividad / Tarea*</th>
                          <th>Fecha de Inicio</th>
                          <th>Días</th>
                          <th>Hora</th>
                          <th>Fecha de Finalización</th>
                          <th>Horas/Crédito</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                          <tr className="cronograma-row" key={n}>
                            <td data-label="Actividad / Tarea">
                              <input
                                type="text"
                                className={invalidClass(
                                  'cronograma-input',
                                  n === 1 && fieldErrors.cronograma_actividad_1
                                )}
                                value={form[`cronograma_actividad_${n}`]}
                                onChange={(e) => set(`cronograma_actividad_${n}`, e.target.value)}
                              />
                            </td>
                            <td data-label="Fecha de inicio">
                              <input
                                type="date"
                                className="cronograma-input"
                                value={toDateInputValue(form[`cronograma_inicio_${n}`])}
                                onChange={(e) => set(`cronograma_inicio_${n}`, e.target.value)}
                              />
                            </td>
                            <td data-label="Días">
                              <input
                                type="number"
                                className="cronograma-input"
                                inputMode="numeric"
                                value={form[`cronograma_dias_${n}`]}
                                onChange={(e) => set(`cronograma_dias_${n}`, e.target.value)}
                              />
                            </td>
                            <td data-label="Hora">
                              <input
                                type="time"
                                className="cronograma-input"
                                value={form[`cronograma_hora_${n}`]}
                                onChange={(e) => set(`cronograma_hora_${n}`, e.target.value)}
                              />
                            </td>
                            <td data-label="Fecha de finalización">
                              <input
                                type="date"
                                className="cronograma-input"
                                value={toDateInputValue(form[`cronograma_fin_${n}`])}
                                onChange={(e) => set(`cronograma_fin_${n}`, e.target.value)}
                              />
                            </td>
                            <td data-label="Horas / crédito">
                              <input
                                type="number"
                                className="cronograma-input"
                                inputMode="numeric"
                                value={form[`cronograma_credito_${n}`]}
                                onChange={(e) => set(`cronograma_credito_${n}`, e.target.value)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <FieldError message={fieldErrors.cronograma_actividad_1} />
                </div>

                <div className="full-width submit-panel">
                  <label className="declaration-box">
                    <input
                      type="checkbox"
                      id="declaracion_revision"
                      checked={!!form.declaracion_revision}
                      onChange={(e) => set('declaracion_revision', e.target.checked)}
                    />
                    <span className="declaration-text">
                      He revisado los datos y confirmo que son correctos según los requerimientos de
                      la FCyT.
                    </span>
                  </label>
                  <FieldError message={fieldErrors.declaracion_revision} />
                  <div className="submit-actions">
                    <button
                      type="button"
                      className="wizard-btn wizard-btn-secondary"
                      disabled={saving}
                      onClick={() => save('borrador')}
                    >
                      {modo === 'editar' ? 'Guardar cambios' : 'Guardar borrador'}
                    </button>
                    <button
                      type="button"
                      className="submit-button"
                      disabled={saving}
                      onClick={() => save('enviar')}
                    >
                      {modo === 'editar' ? 'Reenviar para revisión' : 'Enviar proyecto'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="wizard-actions">
                <button
                  type="button"
                  className="wizard-btn wizard-btn-secondary"
                  onClick={() => {
                    setFieldErrors({});
                    setError('');
                    setStep(1);
                  }}
                >
                  Anterior
                </button>
                <button type="button" className="wizard-btn wizard-btn-primary" onClick={next}>
                  Siguiente
                </button>
              </div>
            </main>
          )}

          {step === 3 && (
            <main className="wizard-panel is-active">
              <h2 className="section-heading">Confirmación</h2>
              <div className="form-grid">
                <div className="full-width">
                  <p>
                    <strong>Proponente:</strong> {form.nombre_proponente} {form.apellido_proponente}
                  </p>
                  <p>
                    <strong>Correo:</strong> {form.correo_proponente}
                  </p>
                  <p>
                    <strong>Fechas:</strong> {fechaInicioShow} → {fechaFinShow}
                  </p>
                  <p>
                    <strong>Fundamentación:</strong>{' '}
                    {(form.fundamentacion || '').slice(0, 240)}
                    {(form.fundamentacion || '').length > 240 ? '…' : ''}
                  </p>
                </div>
                <div className="full-width submit-panel">
                  <label className="declaration-box">
                    <input
                      type="checkbox"
                      checked={!!form.declaracion_revision}
                      onChange={(e) => set('declaracion_revision', e.target.checked)}
                    />
                    <span className="declaration-text">
                      He revisado los datos y confirmo que son correctos según los requerimientos de
                      la FCyT.
                    </span>
                  </label>
                  <FieldError message={fieldErrors.declaracion_revision} />
                  <div className="submit-actions">
                    <button
                      type="button"
                      className="wizard-btn wizard-btn-secondary"
                      disabled={saving}
                      onClick={() => save('borrador')}
                    >
                      {modo === 'editar' ? 'Guardar cambios' : 'Guardar borrador'}
                    </button>
                    <button
                      type="button"
                      className="submit-button"
                      disabled={saving}
                      onClick={() => save('enviar')}
                    >
                      {modo === 'editar' ? 'Reenviar para revisión' : 'Enviar proyecto'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="wizard-actions">
                <button
                  type="button"
                  className="wizard-btn wizard-btn-secondary"
                  onClick={() => {
                    setFieldErrors({});
                    setError('');
                    setStep(2);
                  }}
                >
                  Anterior
                </button>
              </div>
            </main>
          )}
        </section>
      </div>
      </div>
    </>
  );
}
