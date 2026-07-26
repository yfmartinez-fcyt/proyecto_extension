# API REST

Base: `/api` — JSON `{ success, data|message }`. Auth: `Authorization: Bearer <accessToken>`. Refresh en cookie httpOnly.

| Método | Ruta | Auth |
|--------|------|------|
| POST | `/auth/login` | — |
| POST | `/auth/refresh` | cookie |
| POST | `/auth/logout` | cookie |
| GET | `/auth/me` | JWT |
| GET | `/catalogo` | — |
| GET | `/proyectos/repositorio` | — |
| GET | `/proyectos/repositorio/:id` | — |
| GET | `/proyectos/mios` | proponente |
| POST/PUT | `/proyectos` `/proyectos/:id` | proponente |
| DELETE | `/proyectos/:id` | proponente |
| GET | `/director` | director |
| GET | `/director/revision/:id` | director |
| POST | `/director/revision/:id/accion` | director |
| POST | `/soporte` | opcional |
| POST | `/informes` | proponente (multipart) |
| GET/POST | `/usuarios` | admin |
