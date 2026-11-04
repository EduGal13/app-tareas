// server.js — Servidor Express con API de tareas
require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000; // Render envía PORT automáticamente

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Conexión a la base de datos ----------
// Si hay DATABASE_URL se usa PostgreSQL; si no, se guardan las tareas en memoria.
let pool = null;
let memoria = [];
let siguienteId = 1;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
  console.log('Modo: PostgreSQL');
} else {
  console.log('Modo: memoria (sin DATABASE_URL)');
}

async function crearTabla() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tareas (
      id         SERIAL PRIMARY KEY,
      titulo     VARCHAR(200) NOT NULL,
      completada BOOLEAN NOT NULL DEFAULT FALSE,
      creada_en  TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

// ---------- Rutas de la API ----------

// Listar tareas
app.get('/api/tareas', async (req, res) => {
  try {
    if (!pool) return res.json(memoria);
    const { rows } = await pool.query('SELECT * FROM tareas ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las tareas' });
  }
});

// Crear tarea
app.post('/api/tareas', async (req, res) => {
  const titulo = (req.body.titulo || '').trim();
  if (!titulo) return res.status(400).json({ error: 'Escribe un título para la tarea' });
  try {
    if (!pool) {
      const tarea = { id: siguienteId++, titulo, completada: false, creada_en: new Date() };
      memoria.unshift(tarea);
      return res.status(201).json(tarea);
    }
    const { rows } = await pool.query(
      'INSERT INTO tareas (titulo) VALUES ($1) RETURNING *',
      [titulo]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo guardar la tarea' });
  }
});

// Marcar / desmarcar como completada
app.put('/api/tareas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const completada = Boolean(req.body.completada);
  try {
    if (!pool) {
      const tarea = memoria.find(t => t.id === id);
      if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
      tarea.completada = completada;
      return res.json(tarea);
    }
    const { rows } = await pool.query(
      'UPDATE tareas SET completada = $1 WHERE id = $2 RETURNING *',
      [completada, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo actualizar la tarea' });
  }
});

// Eliminar tarea
app.delete('/api/tareas/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    if (!pool) {
      memoria = memoria.filter(t => t.id !== id);
      return res.status(204).end();
    }
    await pool.query('DELETE FROM tareas WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo eliminar la tarea' });
  }
});

// ---------- Arranque ----------
crearTabla()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err.message);
    process.exit(1);
  });
