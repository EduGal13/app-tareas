# App de tareas

Aplicación básica con Node.js + Express + PostgreSQL, lista para publicar en Render.

## Ejecutar en local

```bash
npm install
npm start
```

Abre http://localhost:3000

Sin `DATABASE_URL` las tareas se guardan en memoria. Para usar PostgreSQL copia `.env.example` como `.env` y llena tus datos.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `DB_SSL` | `true` para la URL externa (local/DBeaver), `false` para la URL interna en Render |
| `PORT` | Puerto (Render lo define solo) |

## Render

- Build Command: `npm install`
- Start Command: `npm start`
