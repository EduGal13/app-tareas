-- Ejecutar en DBeaver (Alt + X) conectado a la base de Render
CREATE TABLE IF NOT EXISTS tareas (
  id         SERIAL PRIMARY KEY,
  titulo     VARCHAR(200) NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT FALSE,
  creada_en  TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO tareas (titulo) VALUES ('Mi primera tarea desde DBeaver');

-- Consultas útiles
-- SELECT * FROM tareas ORDER BY id DESC;
-- DELETE FROM tareas WHERE id = 1;
