# Base de datos

Fuente única: [`backend/database/schema.sql`](../backend/database/schema.sql).

Aplicación idempotente vía `backend/ensure_db.js` (`npm run setup:db`).

## Tablas principales

- `usuarios`, `refresh_tokens` — autenticación JWT y datos del proponente
- `lineas_accion`, `sublineas`, `facultades`, `actividades` — catálogo
- `proyectos` + unidades, cronograma, presupuestos, revisiones (proponente vía `usuario_id`)
- `informes`, `evidencias`
- `tickets_soporte`

## Estados de proyecto

`borrador` → `pendiente` → `aprobado` | `sugerencias` | `rechazado`

Esquema **nuevo y vacío** (sin migración de datos antiguos).
