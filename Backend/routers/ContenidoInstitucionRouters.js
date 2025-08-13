const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL para contenido institucional');
});

// Obtener contenido
router.get('/', (req, res) => {
  db.query('SELECT * FROM contenido_institucional', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Actualizar contenido
router.put('/:tipo', (req, res) => {
  const { tipo } = req.params;
  const { contenido } = req.body;

  if (!contenido || typeof contenido !== 'string') {
    return res.status(400).json({ error: 'Contenido inválido' });
  }

  db.query(
    'UPDATE contenido_institucional SET contenido = ? WHERE tipo = ?',
    [contenido, tipo],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tipo de contenido no encontrado' });
      }

      res.json({ message: 'Contenido actualizado correctamente' });
    }
  );
});

module.exports = router;
