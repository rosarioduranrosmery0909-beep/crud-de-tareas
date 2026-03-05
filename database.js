const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('./tareas.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Conectado a SQLite');
    }
});


db.run(`
    CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        estado TEXT
    )
`);

module.exports = db;


db.run(`
    CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        estado TEXT
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )
`);