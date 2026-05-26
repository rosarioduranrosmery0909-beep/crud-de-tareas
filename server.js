const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const db = require('./database');

app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'mi-clave-secreta-123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// ================= INDEX =================
app.get('/', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public', 'index.html')
    );
});

// ================= REGISTRO =================
app.post('/registro', (req, res) => {

    const { email, password } = req.body;

    db.run(
        'INSERT INTO usuarios (email, password) VALUES (?, ?)',
        [email, password],

        function(err) {

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

            req.session.user = {
                id: row.id,
                email: row.email
            };

            res.json({
                mensaje: 'Login correcto'
            });
        }
    );
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                error: 'Error al cerrar sesión'
            });
        }

        res.clearCookie('connect.sid');
        res.json({
            mensaje: 'Logout correcto'
        });
    });
});

// ================= PROTEGER RUTAS =================
function proteger(req, res, next) {

    if (!req.session.user) {

        return res.status(401).json({
            error: 'Debes iniciar sesión'
        });
    }

    next();
}

// ================= TAREAS =================

// VER TAREAS
app.get('/tareas', proteger, (req, res) => {

    db.all(
        'SELECT * FROM tareas',
        [],

        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});

// CREAR TAREA
app.post('/tareas', proteger, (req, res) => {

    const { titulo, estado } = req.body;

    db.run(
        'INSERT INTO tareas (titulo, estado) VALUES (?, ?)',
        [titulo, estado],

        function(err) {

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

// ACTUALIZAR TAREA
app.put('/tareas/:id', proteger, (req, res) => {

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

// ELIMINAR TAREA
app.delete('/tareas/:id', proteger, (req, res) => {

    const { id } = req.params;

    db.run(
        'DELETE FROM tareas WHERE id=?',
        [id],

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

// ================= BORRAR USUARIOS =================
app.get('/borrar-usuarios', (req, res) => {

    db.run(
        'DELETE FROM usuarios',

        (err) => {

            if (err) {

                return res.send(err.message);
            }

            res.send('Usuarios borrados');
        }
    );
});

// ================= SERVIDOR =================
app.listen(3000, () => {

    console.log(
        'Servidor corriendo en http://localhost:3000'
    );
});