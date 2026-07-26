# Instalación

## Requisitos

- Node.js 20+ LTS
- PostgreSQL 15+

## Pasos

```powershell
cd proyecto_extension
copy backend\.env.example backend\.env
# Editar DB_PASSWORD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

npm run install-all
npm run setup:db
npm run seed --prefix backend
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000/api/health

En producción:

```powershell
npm run start:prod
```

El backend sirve el build de `frontend/dist` cuando `NODE_ENV=production`.
