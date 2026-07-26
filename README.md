# Sistema de Proyectos de Extensión

Plataforma **full stack** (React + Express + PostgreSQL) para solicitar, revisar y consultar proyectos de extensión universitaria.

## Stack

| Capa | Tecnología | Puerto |
|------|------------|--------|
| Frontend | React 19 + Vite | `5173` |
| Backend | Express + JWT | `4000` |
| Base de datos | PostgreSQL | `5432` |

## Inicio rápido

1. Instalar **Node.js LTS** y **PostgreSQL 15+**
2. Copiar `backend/.env.example` → `backend/.env` y editar `DB_PASSWORD` + secrets JWT
3. Instalar y arrancar:

```powershell
cd proyecto_extension
npm run install-all
npm run setup:db
npm run seed --prefix backend
npm run dev
```

Abrir: [http://localhost:5173](http://localhost:5173)

### Usuarios demo (contraseña `demo123`)

| Usuario | Rol |
|---------|-----|
| `alumno` | alumno |
| `docente` | docente |
| `director` | director_extension |
| `admin` | admin |

## Estructura

```
proyecto_extension/
├── backend/          # API Express + PostgreSQL
│   ├── database/schema.sql
│   ├── ensure_db.js
│   └── src/
├── frontend/         # React + Vite
├── docs/
└── package.json      # npm run dev (ambos)
```

## Funcionalidades

- Login JWT (email o username) con roles
- Wizard de solicitud (borrador / enviar)
- Mis proyectos (editar / eliminar según estado)
- Portal del director (aprobar / rechazar / observar)
- Repositorio público de aprobados
- Informes con evidencias
- Tickets de soporte técnico

## Documentación

Ver [docs/README.md](docs/README.md).
