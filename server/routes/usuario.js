const express = require('express');
const Usuario = require('../models/usuario');

// Encriptar la contraseña
const bcrypt = require('bcrypt');

const app = express();

const saltRounds = 10;


app.get('/usuario', function(req, res) {
    res.render('usuarios');
});

app.post('/usuario', (req, res) => {
    // Para utilizar body necesito importar body-parser y configurarlo
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, saltRounds),
        role: body.role
    });

    // usuarioDB -> El usuario devuelto al grabar en MongoDB
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuario/:id', function(req, res) {
    res.json('put Usuario');
});

app.delete('/usuario', function(req, res) {
    res.json('delete Usuario');
});

module.exports = app;