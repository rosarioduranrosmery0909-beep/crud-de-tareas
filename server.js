const express = require('express');
const path = require('path');
const app = express();
const db = require('./database');

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/registro', (req, res) => {
    const { email, password } = req.body;

    db.run(
        'INSERT INTO usuarios (email, password) VALUES (?, ?)',
        [email, password],
        (err) => {
            if (err) return res.status(500).json({ error: 'Usuario ya existe' });
            res.json({ mensaje: 'Usuario registrado' });
        }
    );
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(
        'SELECT * FROM usuarios WHERE email = ? AND password = ?',
        [email, password],
        (err, row) => {
            if (!row) return res.status(401).json({ error: 'Usuario no encontrado' });
            res.json({ mensaje: 'Login correcto' });
        }
    );
});

app.get('/tareas', (req, res) => {
    db.all('SELECT * FROM tareas', [], (err, rows) => {
        res.json(rows);
    });
});

app.post('/tareas', (req, res) => {
    const { titulo, estado } = req.body;

    db.run(
        'INSERT INTO tareas (titulo, estado) VALUES (?, ?)',
        [titulo, estado],
        function () {
            res.json({ id: this.lastID });
        }
    );
});

app.put('/tareas/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, estado } = req.body;

    db.run(
        'UPDATE tareas SET titulo=?, estado=? WHERE id=?',
        [titulo, estado, id]
    );
    res.json({});
});

app.delete('/tareas/:id', (req, res) => {
    db.run('DELETE FROM tareas WHERE id=?', req.params.id);
    res.json({});
});

app.get('/borrar-usuarios', (req, res) => {
    db.run('DELETE FROM usuarios');
    res.send('Usuarios borrados');
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});