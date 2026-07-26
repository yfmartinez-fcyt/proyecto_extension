-- Esquema limpio — Proyectos de Extensión (React + Express + PostgreSQL)
-- Idempotente: CREATE IF NOT EXISTS
-- Una sola tabla de gente: usuarios (login + datos del proponente)

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  username VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(80) NOT NULL DEFAULT '',
  apellido VARCHAR(80) NOT NULL DEFAULT '',
  rol VARCHAR(30) NOT NULL DEFAULT 'alumno'
    CHECK (rol IN ('alumno', 'docente', 'director_extension', 'admin')),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lineas_accion (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS sublineas (
  id SERIAL PRIMARY KEY,
  linea_id INTEGER NOT NULL REFERENCES lineas_accion(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS facultades (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS actividades (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS proyectos (
  id SERIAL PRIMARY KEY,
  denominacion VARCHAR(255) NOT NULL DEFAULT '',
  sublinea_id INTEGER REFERENCES sublineas(id) ON DELETE SET NULL,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  hora_inicio VARCHAR(20) NOT NULL DEFAULT '',
  horas_asignadas INTEGER,
  involucrados TEXT NOT NULL DEFAULT '',
  fundamentacion TEXT NOT NULL DEFAULT '',
  obj_general VARCHAR(255) NOT NULL DEFAULT '',
  objetivos_especificos TEXT NOT NULL DEFAULT '',
  metodologia TEXT NOT NULL DEFAULT '',
  metas TEXT NOT NULL DEFAULT '',
  resultados TEXT NOT NULL DEFAULT '',
  recursos_humanos TEXT NOT NULL DEFAULT '',
  telefono_proponente VARCHAR(40) NOT NULL DEFAULT '',
  docente_responsable VARCHAR(120) NOT NULL DEFAULT '',
  beneficiarios TEXT NOT NULL DEFAULT '',
  localizacion TEXT NOT NULL DEFAULT '',
  estado VARCHAR(45) NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'pendiente', 'aprobado', 'sugerencias', 'rechazado')),
  curso VARCHAR(80) NOT NULL DEFAULT '',
  carrera_texto VARCHAR(120) NOT NULL DEFAULT '',
  proponente_actividad VARCHAR(255) NOT NULL DEFAULT '',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proyecto_unidades_academicas (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS cronograma (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  actividad_id INTEGER REFERENCES actividades(id) ON DELETE SET NULL,
  fecha_inicio DATE,
  cantidad_dias INTEGER,
  hora_texto VARCHAR(10) NOT NULL DEFAULT '',
  fecha_fin DATE,
  horas_extension INTEGER
);

CREATE TABLE IF NOT EXISTS presupuestos (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL DEFAULT '',
  cantidad INTEGER DEFAULT 1,
  unidad VARCHAR(45) NOT NULL DEFAULT 'texto',
  recursos VARCHAR(45) NOT NULL DEFAULT 'formulario',
  total VARCHAR(45) NOT NULL DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS proyecto_revisiones (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  director_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(30) NOT NULL CHECK (accion IN ('aprobar', 'rechazar', 'observar')),
  comentario TEXT NOT NULL DEFAULT '',
  estado_anterior VARCHAR(45) NOT NULL DEFAULT '',
  estado_nuevo VARCHAR(45) NOT NULL DEFAULT '',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS informes (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  semestre VARCHAR(45) NOT NULL DEFAULT '',
  tema TEXT NOT NULL DEFAULT '',
  fecha_inicio DATE,
  fecha_fin DATE,
  tiempo_duracion VARCHAR(45) NOT NULL DEFAULT '',
  medios_utilizados TEXT NOT NULL DEFAULT '',
  descripcion TEXT NOT NULL DEFAULT '',
  logros_obtenidos TEXT NOT NULL DEFAULT '',
  dificultades TEXT NOT NULL DEFAULT '',
  modalidad VARCHAR(45) NOT NULL DEFAULT '',
  recomendaciones TEXT NOT NULL DEFAULT '',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidencias (
  id SERIAL PRIMARY KEY,
  informe_id INTEGER NOT NULL REFERENCES informes(id) ON DELETE CASCADE,
  tipo_archivo VARCHAR(45) NOT NULL DEFAULT '',
  nombre_archivo VARCHAR(255) NOT NULL DEFAULT '',
  ruta_archivo VARCHAR(255) NOT NULL DEFAULT '',
  fecha_subida TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets_soporte (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre VARCHAR(120) NOT NULL DEFAULT '',
  email VARCHAR(120) NOT NULL DEFAULT '',
  asunto VARCHAR(200) NOT NULL DEFAULT '',
  mensaje TEXT NOT NULL DEFAULT '',
  estado VARCHAR(30) NOT NULL DEFAULT 'abierto',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proyectos_usuario ON proyectos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_sublineas_linea ON sublineas(linea_id);
CREATE INDEX IF NOT EXISTS idx_refresh_usuario ON refresh_tokens(usuario_id);

-- Catálogo mínimo
INSERT INTO lineas_accion (nombre) VALUES
  ('Ambiente'),
  ('Comunidad'),
  ('Desarrollo Tecnológico')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO sublineas (linea_id, nombre)
SELECT l.id, s.nombre
FROM lineas_accion l
JOIN (VALUES
  ('Ambiente', 'Educación ambiental, producción de servicios sustentables, sostenidos y sostenibles'),
  ('Ambiente', 'Preservación de recursos naturales'),
  ('Comunidad', 'Vinculación de la extensión universitaria con la Academia, la investigación y el bienestar estudiantil'),
  ('Comunidad', 'Prácticas socioeducativas, aprendizaje servicios o proyectos sociales estudiantiles'),
  ('Desarrollo Tecnológico', 'Proyectos de innovación'),
  ('Desarrollo Tecnológico', 'Investigación aplicada y resolución de problemas')
) AS s(linea, nombre) ON l.nombre = s.linea
WHERE NOT EXISTS (
  SELECT 1 FROM sublineas x WHERE x.linea_id = l.id AND x.nombre = s.nombre
);

INSERT INTO facultades (nombre) VALUES
  ('Facultad de Ciencias y Tecnologías'),
  ('Facultad Ciencias de la Producción'),
  ('Facultad de Ciencias de la Salud'),
  ('Facultad de Ciencias Médicas'),
  ('Facultad de Odontología'),
  ('Facultad de Ciencias Económicas'),
  ('Facultad de Ciencias Sociales, Políticas y Humanidades'),
  ('Escuela Superior de Artes y Desarrollo de Talentos')
ON CONFLICT (nombre) DO NOTHING;
