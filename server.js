const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const db = require('./database');

app.use(express.json());

app.use(session({
    secret: 'crud-secret',
    resave: false,
    saveUninitialized: false
}));

app.use(express.static('public'));

// ================= INDEX =================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================= REGISTRO =================
app.post('/registro', (req, res) => {
    const { email, password } = req.body;

    db.run(
        'INSERT INTO usuarios (email, password) VALUES (?, ?)',
        [email, password],
        (err) => {
            if (err) {
                return res.status(500).json({
                    error: 'Usuario ya existe'
                });
            }

            res.json({
                mensaje: 'Usuario registrado'
            });
        }
    );
});

// ================= LOGIN =================
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(
        'SELECT * FROM usuarios WHERE email = ? AND password = ?',
        [email, password],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!row) {
                return res.status(401).json({
                    error: 'Usuario no encontrado'
                });
            }

            // GUARDAR SESION
            req.session.usuario = row.id;

            res.json({
                mensaje: 'Login correcto'
            });
        }
    );
});

// ================= MIDDLEWARE =================
function verificarSesion(req, res, next) {

    if (!req.session.usuario) {
        return res.status(401).json({
            error: 'Debes iniciar sesión'
        });
    }

    next();
}

// ================= TAREAS =================

// VER TAREAS
app.get('/tareas', verificarSesion, (req, res) => {

    db.all('SELECT * FROM tareas', [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});

// CREAR TAREA
app.post('/tareas', verificarSesion, (req, res) => {

    const { titulo, estado } = req.body;

    db.run(
        'INSERT INTO tareas (titulo, estado) VALUES (?, ?)',
        [titulo, estado],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                id: this.lastID
            });
        }
    );
});

// ACTUALIZAR
app.put('/tareas/:id', verificarSesion, (req, res) => {

    const { id } = req.params;
    const { titulo, estado } = req.body;

    db.run(
        'UPDATE tareas SET titulo=?, estado=? WHERE id=?',
        [titulo, estado, id],
        (err) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                mensaje: 'Tarea actualizada'
            });
        }
    );
});

// ELIMINAR
app.delete('/tareas/:id', verificarSesion, (req, res) => {

    db.run(
        'DELETE FROM tareas WHERE id=?',
        req.params.id,
        (err) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                mensaje: 'Tarea eliminada'
            });
        }
    );
});

// ================= SERVIDOR =================
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});