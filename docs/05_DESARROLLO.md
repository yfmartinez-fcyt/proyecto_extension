# Desarrollo

```
Browser (React)
   ↓ /api (Vite proxy → :4000)
Express routes → controllers → utils (SQL pg)
   ↓
PostgreSQL
```

- Lógica de negocio: `backend/src/utils/proyectoService.js`, `directorService.js`
- Constantes de estado/acción: `backend/src/utils/constants.js`
- Frontend: páginas en `frontend/src/pages`, `AuthContext`, `services/api.js`

No hay ORM: SQL directo con `pg`. Esquema en `schema.sql`.
