const express = require('express');
const app = express();
const db = require('./database');

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Servidor de tareas funcionando');
});



app.get('/tareas', (req, res) => {
    db.all('SELECT * FROM tareas', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});



app.post('/tareas', (req, res) => {
    const { titulo, estado } = req.body;

    db.run(
        'INSERT INTO tareas (titulo, estado) VALUES (?, ?)',
        [titulo, estado],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({
                    mensaje: 'Tarea creada',
                    id: this.lastID
                });
            }
        }
    );
});



app.put('/tareas/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, estado } = req.body;

    db.run(
        'UPDATE tareas SET titulo = ?, estado = ? WHERE id = ?',
        [titulo, estado, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ mensaje: 'Tarea actualizada' });
            }
        }
    );
});



app.delete('/tareas/:id', (req, res) => {
    const { id } = req.params;

    db.run(
        'DELETE FROM tareas WHERE id = ?',
        id,
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ mensaje: 'Tarea eliminada' });
            }
        }
    );
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});